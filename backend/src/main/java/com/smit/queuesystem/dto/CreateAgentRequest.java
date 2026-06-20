package com.smit.queuesystem.dto;

public record CreateAgentRequest(
        Long branchId,
        Long counterId,
        String username,
        String password,
        String fullName,
        String email,
        String phone,
        Boolean emailNotificationsEnabled
) {
}
