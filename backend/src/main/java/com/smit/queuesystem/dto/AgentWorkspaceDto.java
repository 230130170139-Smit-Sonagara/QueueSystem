package com.smit.queuesystem.dto;

import java.util.List;

public record AgentWorkspaceDto(
        Long counterId,
        String counterName,
        String branchName,
        String organizationName,
        String agentName,
        String agentEmail,
        Long currentTokenId,
        String currentTokenIdentifier,
        String currentQueueName,
        List<BoardTokenDto> branchServing,
        List<BoardTokenDto> nextWaiting
) {
}
