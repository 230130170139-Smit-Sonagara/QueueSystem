package com.smit.queuesystem.dto;

public record CreateOrganizationRequest(
        String name,
        String code,
        String contactEmail,
        String description
) {
}
