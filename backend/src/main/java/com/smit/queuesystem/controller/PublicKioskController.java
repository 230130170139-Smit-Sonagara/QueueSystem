package com.smit.queuesystem.controller;

import com.smit.queuesystem.dto.*;
import com.smit.queuesystem.service.publicapi.PublicQueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicKioskController {

    private final PublicQueueService queueService;

    @GetMapping("/branches")
    public List<BranchSummaryDto> getAllBranches() {
        return queueService.getAllBranches();
    }

    @GetMapping("/branches/{branchId}/queues")
    public List<QueueOptionDto> getQueues(@PathVariable Long branchId) {
        return queueService.getQueuesByBranch(branchId);
    }

    @PostMapping("/queues/{queueId}/tokens")
    public BookingResponseDto bookToken(@PathVariable Long queueId, @RequestBody PublicTokenRequest request) {
        return queueService.bookToken(queueId, request);
    }

    @GetMapping("/tokens/{tokenId}/tracking")
    public TrackingResponseDto trackToken(@PathVariable Long tokenId) {
        return queueService.getTracking(tokenId);
    }

    @GetMapping("/branches/{branchId}/board")
    public BranchBoardDto getBoard(@PathVariable Long branchId) {
        return queueService.getBranchBoard(branchId);
    }
}
