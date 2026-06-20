package com.smit.queuesystem.service.agent;

import com.smit.queuesystem.dto.AgentWorkspaceDto;
import com.smit.queuesystem.dto.BoardTokenDto;
import com.smit.queuesystem.dto.BookingResponseDto;
import com.smit.queuesystem.entity.AppUser;
import com.smit.queuesystem.entity.Counter;
import com.smit.queuesystem.entity.Token;
import com.smit.queuesystem.enums.TokenStatus;
import com.smit.queuesystem.mapper.QueueDtoMapper;
import com.smit.queuesystem.repository.CounterRepository;
import com.smit.queuesystem.repository.TokenRepository;
import com.smit.queuesystem.service.EmailNotificationService;
import com.smit.queuesystem.service.support.QueueFlowSupportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AgentQueueService {

    private final CounterRepository counterRepository;
    private final TokenRepository tokenRepository;
    private final EmailNotificationService emailNotificationService;
    private final QueueFlowSupportService queueFlowSupportService;
    private final QueueDtoMapper mapper;

    public AgentWorkspaceDto getAgentWorkspace(String username, Long requestedCounterId) {
        AppUser agent = queueFlowSupportService.getUser(username);
        Counter counter = queueFlowSupportService.resolveCounter(agent, requestedCounterId);
        Token currentToken = tokenRepository.findByCounterIdAndStatus(counter.getId(), TokenStatus.SERVING).stream()
                .findFirst()
                .orElse(null);
        List<BoardTokenDto> branchServing = tokenRepository.findTop10ByServiceQueueBranchIdAndStatusOrderByCalledAtDesc(counter.getBranch().getId(), TokenStatus.SERVING)
                .stream()
                .map(mapper::toBoardToken)
                .toList();
        List<BoardTokenDto> nextWaiting = queueFlowSupportService.findEligibleWaitingTokens(counter).stream()
                .limit(5)
                .map(mapper::toBoardToken)
                .toList();

        return new AgentWorkspaceDto(
                counter.getId(),
                counter.getName(),
                counter.getBranch().getName(),
                counter.getBranch().getOrganization().getName(),
                agent.getFullName(),
                agent.getEmail(),
                currentToken != null ? currentToken.getId() : null,
                currentToken != null ? currentToken.getTokenIdentifier() : null,
                currentToken != null ? currentToken.getServiceQueue().getName() : null,
                branchServing,
                nextWaiting
        );
    }

    @Transactional
    public BookingResponseDto callNextToken(Long counterId, String agentUsername) {
        AppUser agent = queueFlowSupportService.getUser(agentUsername);
        Counter counter = queueFlowSupportService.resolveCounter(agent, counterId);

        Token activeToken = tokenRepository.findByCounterIdAndStatus(counter.getId(), TokenStatus.SERVING)
                .stream()
                .findFirst()
                .orElse(null);
        if (activeToken != null) {
            throw new IllegalStateException("A customer is already being served at this counter. Complete the service or mark the token as no-show before calling the next customer.");
        }

        Token nextToken = queueFlowSupportService.findEligibleWaitingTokens(counter).stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No waiting tokens are available for this counter right now."));

        counter.setCurrentAgent(agent);
        counter.setIsOnline(true);
        counterRepository.save(counter);

        nextToken.setStatus(TokenStatus.SERVING);
        nextToken.setCounter(counter);
        nextToken.setAgent(agent);
        nextToken.setCalledAt(LocalDateTime.now());
        nextToken.setNotifiedAt(LocalDateTime.now());

        Token saved = tokenRepository.save(nextToken);
        emailNotificationService.sendTurnCalled(saved);
        return mapper.toBookingResponse(saved, queueFlowSupportService.getQueuePeopleAhead(saved), 0);
    }

    @Transactional
    public void completeToken(Long tokenId, String agentUsername) {
        AppUser agent = queueFlowSupportService.getUser(agentUsername);
        Token token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new RuntimeException("Token not found"));
        Counter counter = queueFlowSupportService.resolveCounter(agent, token.getCounter() != null ? token.getCounter().getId() : null);
        validateServingOwnership(token, counter);
        token.setStatus(TokenStatus.COMPLETED);
        token.setServedAt(LocalDateTime.now());
        tokenRepository.save(token);
    }

    @Transactional
    public void markNoShow(Long tokenId, String agentUsername) {
        AppUser agent = queueFlowSupportService.getUser(agentUsername);
        Token token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new RuntimeException("Token not found"));
        Counter counter = queueFlowSupportService.resolveCounter(agent, token.getCounter() != null ? token.getCounter().getId() : null);
        validateServingOwnership(token, counter);
        token.setStatus(TokenStatus.NO_SHOW);
        token.setServedAt(LocalDateTime.now());
        tokenRepository.save(token);
    }

    private void validateServingOwnership(Token token, Counter counter) {
        if (token.getStatus() != TokenStatus.SERVING) {
            throw new IllegalStateException("Only the token that is currently being served can be updated from this action.");
        }
        if (token.getCounter() == null || !token.getCounter().getId().equals(counter.getId())) {
            throw new IllegalStateException("This token is not assigned to your counter.");
        }
    }
}
