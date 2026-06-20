package com.smit.queuesystem.dto;

public record BranchSummaryDto(
        Long id,
        String name,
        String location,
        String timezone,
        String supportEmail,
        String contactNumber,
        Long organizationId,
        String organizationName,
        Integer queueCount,
        Integer counterCount
) {
}
