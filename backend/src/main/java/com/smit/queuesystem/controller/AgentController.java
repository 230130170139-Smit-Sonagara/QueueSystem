package com.smit.queuesystem.controller;

import com.smit.queuesystem.dto.AgentWorkspaceDto;
import com.smit.queuesystem.dto.BookingResponseDto;
import com.smit.queuesystem.service.agent.AgentQueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/agent")
@RequiredArgsConstructor
public class AgentController {

    private final AgentQueueService queueService;

    @GetMapping("/workspace")
    public AgentWorkspaceDto workspace(@RequestParam(required = false) Long counterId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return queueService.getAgentWorkspace(username, counterId);
    }

    @PostMapping("/counters/{counterId}/next")
    public BookingResponseDto callNextToken(@PathVariable Long counterId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return queueService.callNextToken(counterId, username);
    }

    @PostMapping("/tokens/{tokenId}/complete")
    public void completeToken(@PathVariable Long tokenId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        queueService.completeToken(tokenId, username);
    }

    @PostMapping("/tokens/{tokenId}/no-show")
    public void markNoShow(@PathVariable Long tokenId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        queueService.markNoShow(tokenId, username);
    }
}
