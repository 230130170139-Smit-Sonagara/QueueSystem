package com.smit.queuesystem.dto;

import java.util.List;

public record AdminDashboardDto(
        List<DashboardMetricDto> metrics,
        List<BranchSummaryDto> branches,
        List<QueueOptionDto> spotlightQueues,
        List<BoardTokenDto> liveServing
) {
}
