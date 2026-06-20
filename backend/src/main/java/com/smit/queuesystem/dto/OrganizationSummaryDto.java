package com.smit.queuesystem.dto;

public record OrganizationSummaryDto(
        Long id,
        String name,
        String code,
        String contactEmail,
        String description,
        Integer branchCount
) {
}
