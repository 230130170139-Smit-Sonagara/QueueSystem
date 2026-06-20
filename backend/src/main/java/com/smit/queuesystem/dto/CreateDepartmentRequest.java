package com.smit.queuesystem.dto;

public record CreateDepartmentRequest(
        Long branchId,
        String name
) {
}
