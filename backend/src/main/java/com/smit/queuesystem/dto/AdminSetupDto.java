package com.smit.queuesystem.dto;

import java.util.List;

public record AdminSetupDto(
        String organizationName,
        String adminEmail,
        List<BranchSummaryDto> branches
) {
}
