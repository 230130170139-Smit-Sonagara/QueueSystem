package com.smit.queuesystem.dto;

import java.time.LocalDateTime;
import java.util.List;

public record BranchBoardDto(
        Long branchId,
        String branchName,
        String organizationName,
        LocalDateTime generatedAt,
        List<BoardTokenDto> serving,
        List<BoardTokenDto> waiting
) {
}
