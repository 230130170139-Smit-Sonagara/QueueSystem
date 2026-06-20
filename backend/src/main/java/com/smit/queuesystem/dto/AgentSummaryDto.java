package com.smit.queuesystem.dto;

public record AgentSummaryDto(
        Long id,
        String username,
        String fullName,
        String email,
        Long organizationId,
        Long branchId,
        String branchName,
        Long counterId,
        String counterName
) {
}
