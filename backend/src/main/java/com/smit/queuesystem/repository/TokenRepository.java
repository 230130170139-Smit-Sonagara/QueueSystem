package com.smit.queuesystem.repository;

import com.smit.queuesystem.entity.Token;
import com.smit.queuesystem.enums.TokenStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TokenRepository extends JpaRepository<Token, Long> {
    List<Token> findByServiceQueueIdOrderBySequenceNumberAsc(Long serviceQueueId);
    List<Token> findByServiceQueueIdAndStatusOrderBySequenceNumberAsc(Long serviceQueueId, TokenStatus status);
    Optional<Token> findFirstByServiceQueueIdAndStatusOrderBySequenceNumberAsc(Long serviceQueueId, TokenStatus status);
    Optional<Token> findFirstByServiceQueueIdAndStatusOrderByTypeDescSequenceNumberAsc(Long serviceQueueId, TokenStatus status);
    List<Token> findByServiceQueueBranchIdAndStatusOrderByCalledAtDesc(Long branchId, TokenStatus status);
    List<Token> findTop10ByServiceQueueBranchIdAndStatusOrderByCalledAtDesc(Long branchId, TokenStatus status);
    List<Token> findTop10ByServiceQueueBranchIdAndStatusOrderBySequenceNumberAsc(Long branchId, TokenStatus status);
    List<Token> findByServiceQueueBranchIdAndIssuedAtBetween(Long branchId, java.time.LocalDateTime start, java.time.LocalDateTime end);
    List<Token> findByServiceQueueBranchIdOrderByIssuedAtDesc(Long branchId);
    List<Token> findByCounterId(Long counterId);
    List<Token> findByCounterIdAndStatus(Long counterId, TokenStatus status);
    List<Token> findByAgentId(Long agentId);
    void deleteByServiceQueueId(Long serviceQueueId);
    void deleteByServiceQueueBranchId(Long branchId);
    long countByServiceQueueBranchIdAndIssuedAtBetween(Long branchId, java.time.LocalDateTime start, java.time.LocalDateTime end);
    long countByServiceQueueBranchIdAndStatusAndIssuedAtBetween(Long branchId, TokenStatus status, java.time.LocalDateTime start, java.time.LocalDateTime end);
}
