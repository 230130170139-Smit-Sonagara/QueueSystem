package com.smit.queuesystem.dto;

public record CreateQueueRequest(
        Long branchId,
        Long departmentId,
        String name,
        String serviceCode,
        String prefix,
        String description,
        Integer averageServiceTimeMinutes,
        Boolean isActive
) {
}
