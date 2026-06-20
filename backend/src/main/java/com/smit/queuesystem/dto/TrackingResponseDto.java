package com.smit.queuesystem.dto;

import com.smit.queuesystem.enums.TokenStatus;
import com.smit.queuesystem.enums.TokenType;

import java.time.LocalDateTime;

public record TrackingResponseDto(
        Long id,
        String tokenIdentifier,
        TokenType type,
        TokenStatus status,
        String customerName,
        String queueName,
        String branchName,
        String counterName,
        Integer peopleAhead,
        Integer estimatedWaitMinutes,
        LocalDateTime issuedAt,
        LocalDateTime calledAt,
        LocalDateTime servedAt,
        boolean nearTurn
) {
}
