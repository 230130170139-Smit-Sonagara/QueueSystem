package com.smit.queuesystem.dto;

import com.smit.queuesystem.enums.TokenStatus;
import com.smit.queuesystem.enums.TokenType;

import java.time.LocalDateTime;

public record BookingResponseDto(
        Long id,
        String tokenIdentifier,
        Integer sequenceNumber,
        TokenType type,
        TokenStatus status,
        String customerName,
        String customerPhone,
        String customerEmail,
        String queueName,
        String branchName,
        String organizationName,
        Integer estimatedWaitMinutes,
        Integer peopleAhead,
        LocalDateTime issuedAt
) {
}
