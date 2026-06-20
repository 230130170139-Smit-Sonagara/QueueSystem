package com.smit.queuesystem.dto;

public record CounterSummaryDto(
        Long id,
        String name,
        String code,
        Boolean isOnline,
        Long organizationId,
        Long branchId,
        String branchName,
        Long departmentId,
        String departmentName,
        Long currentAgentId,
        String currentAgentName
) {
}
