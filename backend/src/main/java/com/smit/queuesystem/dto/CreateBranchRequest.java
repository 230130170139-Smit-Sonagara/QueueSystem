package com.smit.queuesystem.dto;

public record CreateBranchRequest(
        Long organizationId,
        String name,
        String location,
        String timezone,
        String supportEmail,
        String contactNumber
) {
}
