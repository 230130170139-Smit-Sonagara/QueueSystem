package com.smit.queuesystem.dto;

import com.smit.queuesystem.enums.TokenType;

import java.time.LocalDateTime;

public record BoardTokenDto(
        Long id,
        String tokenIdentifier,
        Long branchId,
        String branchName,
        String queueName,
        String counterName,
        TokenType type,
        LocalDateTime calledAt
) {
}
