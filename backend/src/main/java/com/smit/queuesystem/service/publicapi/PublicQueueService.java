package com.smit.queuesystem.service.publicapi;

import com.smit.queuesystem.dto.BoardTokenDto;
import com.smit.queuesystem.dto.BookingResponseDto;
import com.smit.queuesystem.dto.BranchBoardDto;
import com.smit.queuesystem.dto.BranchSummaryDto;
import com.smit.queuesystem.dto.PublicTokenRequest;
import com.smit.queuesystem.dto.QueueOptionDto;
import com.smit.queuesystem.dto.TrackingResponseDto;
import com.smit.queuesystem.entity.Branch;
import com.smit.queuesystem.entity.ServiceQueue;
import com.smit.queuesystem.entity.Token;
import com.smit.queuesystem.enums.TokenStatus;
import com.smit.queuesystem.enums.TokenType;
import com.smit.queuesystem.mapper.QueueDtoMapper;
import com.smit.queuesystem.repository.BranchRepository;
import com.smit.queuesystem.repository.CounterRepository;
import com.smit.queuesystem.repository.ServiceQueueRepository;
import com.smit.queuesystem.repository.TokenRepository;
import com.smit.queuesystem.service.EmailNotificationService;
import com.smit.queuesystem.service.support.QueueFlowSupportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PublicQueueService {

    private final BranchRepository branchRepository;
    private final ServiceQueueRepository queueRepository;
    private final CounterRepository counterRepository;
    private final TokenRepository tokenRepository;
    private final EmailNotificationService emailNotificationService;
    private final QueueFlowSupportService queueFlowSupportService;
    private final QueueDtoMapper mapper;

    public List<BranchSummaryDto> getAllBranches() {
        return branchRepository.findAll().stream()
                .map(branch -> mapper.toBranchSummary(
                        branch,
                        queueRepository.findByBranchId(branch.getId()).size(),
                        counterRepository.findByBranchId(branch.getId()).size()
                ))
                .toList();
    }

    public List<QueueOptionDto> getQueuesByBranch(Long branchId) {
        return queueRepository.findByBranchIdAndIsActiveTrue(branchId).stream()
                .map(queue -> mapper.toQueueOption(
                        queue,
                        tokenRepository.findByServiceQueueIdAndStatusOrderBySequenceNumberAsc(queue.getId(), TokenStatus.WAITING).size()
                ))
                .toList();
    }

    @Transactional
    public BookingResponseDto bookToken(Long queueId, PublicTokenRequest request) {
        ServiceQueue queue = queueRepository.findById(queueId)
                .orElseThrow(() -> new RuntimeException("Queue not found"));

        queue.setCurrentTokenSequence(queue.getCurrentTokenSequence() + 1);
        queueRepository.save(queue);

        TokenType tokenType = request.getTokenType() == null ? TokenType.WALK_IN : request.getTokenType();
        String identifier = queue.getPrefix() + String.format("%03d", queue.getCurrentTokenSequence());

        Token token = Token.builder()
                .tokenIdentifier(identifier)
                .sequenceNumber(queue.getCurrentTokenSequence())
                .type(tokenType)
                .status(TokenStatus.WAITING)
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .customerEmail(request.getCustomerEmail())
                .notes(request.getNotes())
                .serviceQueue(queue)
                .build();

        Token saved = tokenRepository.save(token);
        int peopleAhead = queueFlowSupportService.getQueuePeopleAhead(saved);
        int estimatedWait = Math.max(0, peopleAhead * queue.getAverageServiceTimeMinutes());
        emailNotificationService.sendBookingConfirmation(saved, peopleAhead, estimatedWait);
        return mapper.toBookingResponse(saved, peopleAhead, estimatedWait);
    }

    @Transactional
    public TrackingResponseDto getTracking(Long tokenId) {
        Token token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new RuntimeException("Token not found"));
        int peopleAhead = queueFlowSupportService.getQueuePeopleAhead(token);
        int estimatedWait = token.getStatus() == TokenStatus.SERVING
                ? 0
                : Math.max(0, peopleAhead * token.getServiceQueue().getAverageServiceTimeMinutes());
        boolean nearTurn = peopleAhead <= 2 && token.getStatus() == TokenStatus.WAITING;
        if (nearTurn && token.getNotifiedAt() == null && emailNotificationService.sendNearTurnAlert(token, peopleAhead, estimatedWait)) {
            token.setNotifiedAt(LocalDateTime.now());
            tokenRepository.save(token);
        }
        return mapper.toTrackingResponse(
                token,
                peopleAhead,
                estimatedWait,
                nearTurn
        );
    }

    public BranchBoardDto getBranchBoard(Long branchId) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new RuntimeException("Branch not found"));
        List<BoardTokenDto> serving = tokenRepository.findTop10ByServiceQueueBranchIdAndStatusOrderByCalledAtDesc(branchId, TokenStatus.SERVING)
                .stream()
                .map(mapper::toBoardToken)
                .toList();
        List<BoardTokenDto> waiting = tokenRepository.findTop10ByServiceQueueBranchIdAndStatusOrderBySequenceNumberAsc(branchId, TokenStatus.WAITING)
                .stream()
                .map(mapper::toBoardToken)
                .sorted(Comparator
                        .comparingInt((BoardTokenDto token) -> priorityValue(token.type()))
                        .thenComparing(BoardTokenDto::tokenIdentifier))
                .limit(10)
                .toList();
        return new BranchBoardDto(
                branch.getId(),
                branch.getName(),
                branch.getOrganization().getName(),
                LocalDateTime.now(),
                serving,
                waiting
        );
    }

    private int priorityValue(TokenType type) {
        return switch (type) {
            case VIP -> 0;
            case ONLINE_APPOINTMENT -> 1;
            case WALK_IN -> 2;
        };
    }
}
