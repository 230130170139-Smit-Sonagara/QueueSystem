package com.smit.queuesystem.dto;

public record CreateCounterRequest(
        Long branchId,
        Long departmentId,
        String name,
        String code,
        Boolean isOnline
) {
}
