package com.smit.queuesystem.service.support;

import com.smit.queuesystem.entity.AppUser;
import com.smit.queuesystem.entity.Counter;
import com.smit.queuesystem.entity.Token;
import com.smit.queuesystem.enums.Role;
import com.smit.queuesystem.enums.TokenStatus;
import com.smit.queuesystem.enums.TokenType;
import com.smit.queuesystem.repository.AppUserRepository;
import com.smit.queuesystem.repository.CounterRepository;
import com.smit.queuesystem.repository.TokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QueueFlowSupportService {

    private final AppUserRepository userRepository;
    private final CounterRepository counterRepository;
    private final TokenRepository tokenRepository;

    public AppUser getUser(String username) {
        return userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Counter resolveCounter(AppUser agent, Long requestedCounterId) {
        if (requestedCounterId != null) {
            return counterRepository.findById(requestedCounterId)
                    .orElseThrow(() -> new RuntimeException("Counter not found"));
        }
        return counterRepository.findFirstByCurrentAgentId(agent.getId())
                .or(() -> agent.getBranch() != null
                        ? counterRepository.findByBranchId(agent.getBranch().getId()).stream().findFirst()
                        : java.util.Optional.empty())
                .orElseThrow(() -> new RuntimeException("Counter not assigned"));
    }

    public int getQueuePeopleAhead(Token token) {
        if (token.getStatus() == TokenStatus.COMPLETED || token.getStatus() == TokenStatus.NO_SHOW) {
            return 0;
        }

        List<Token> queueFlowTokens = tokenRepository.findByServiceQueueIdOrderBySequenceNumberAsc(token.getServiceQueue().getId()).stream()
                .filter(candidate -> candidate.getStatus() == TokenStatus.WAITING || candidate.getStatus() == TokenStatus.SERVING)
                .sorted(customerQueueComparator())
                .toList();
        for (int index = 0; index < queueFlowTokens.size(); index++) {
            if (queueFlowTokens.get(index).getId().equals(token.getId())) {
                return index;
            }
        }
        return 0;
    }

    public List<Token> findEligibleWaitingTokens(Counter counter) {
        return tokenRepository.findByServiceQueueBranchIdOrderByIssuedAtDesc(counter.getBranch().getId()).stream()
                .filter(token -> token.getStatus() == TokenStatus.WAITING)
                .filter(token -> counter.getDepartment() == null
                        || (token.getServiceQueue().getDepartment() != null
                        && token.getServiceQueue().getDepartment().getId().equals(counter.getDepartment().getId())))
                .sorted(waitingComparator())
                .toList();
    }

    public String requireText(String value, String fieldName) {
        String normalized = trimToNull(value);
        if (normalized == null) {
            throw new IllegalArgumentException(fieldName + " is required.");
        }
        return normalized;
    }

    public String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    @Transactional
    public void assignAgentToCounter(AppUser agent, Counter targetCounter) {
        Counter existingCounter = counterRepository.findFirstByCurrentAgentId(agent.getId()).orElse(null);

        if (existingCounter != null && existingCounter.getId().equals(targetCounter.getId())) {
            existingCounter.setIsOnline(true);
            counterRepository.save(existingCounter);
            return;
        }

        if (existingCounter != null) {
            existingCounter.setCurrentAgent(null);
            existingCounter.setIsOnline(false);
            counterRepository.save(existingCounter);
        }

        targetCounter.setCurrentAgent(agent);
        targetCounter.setIsOnline(true);
        counterRepository.save(targetCounter);
    }

    @Transactional
    public void cleanupBranchUserReference(AppUser user) {
        if (user.getRole() == Role.AGENT || user.getRole() == Role.CUSTOMER || user.getRole() == Role.BRANCH_MANAGER || user.getRole() == Role.ORG_ADMIN) {
            userRepository.delete(user);
            return;
        }
        user.setBranch(null);
        userRepository.save(user);
    }

    @Transactional
    public void cleanupOrganizationUserReference(AppUser user) {
        if (user.getRole() == Role.SUPER_ADMIN) {
            user.setOrganization(null);
            user.setBranch(null);
            userRepository.save(user);
            return;
        }
        if (userRepository.existsById(user.getId())) {
            userRepository.delete(user);
        }
    }

    private Comparator<Token> waitingComparator() {
        return Comparator
                .comparingInt((Token token) -> priorityValue(token.getType()))
                .thenComparing(Token::getIssuedAt);
    }

    private Comparator<Token> customerQueueComparator() {
        return Comparator
                .comparingInt((Token token) -> priorityValue(token.getType()))
                .thenComparing(Token::getSequenceNumber);
    }

    private int priorityValue(TokenType type) {
        return switch (type) {
            case VIP -> 0;
            case ONLINE_APPOINTMENT -> 1;
            case WALK_IN -> 2;
        };
    }
}
