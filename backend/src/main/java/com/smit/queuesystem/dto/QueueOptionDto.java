package com.smit.queuesystem.dto;

public record QueueOptionDto(
        Long id,
        String name,
        String serviceCode,
        String description,
        String prefix,
        Integer averageServiceTimeMinutes,
        Long branchId,
        String branchName,
        String departmentName,
        Integer waitingCount
) {
}
