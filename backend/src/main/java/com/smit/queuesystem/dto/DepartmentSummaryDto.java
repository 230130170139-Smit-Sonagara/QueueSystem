package com.smit.queuesystem.dto;

public record DepartmentSummaryDto(
        Long id,
        String name,
        Long organizationId,
        Long branchId,
        String branchName,
        Integer queueCount,
        Integer counterCount
) {
}
