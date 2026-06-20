package com.smit.queuesystem.dto;

import java.util.List;

public record AdminCatalogDto(
        List<OrganizationSummaryDto> organizations,
        List<BranchSummaryDto> branches,
        List<DepartmentSummaryDto> departments,
        List<QueueOptionDto> queues,
        List<CounterSummaryDto> counters,
        List<AgentSummaryDto> agents
) {
}
