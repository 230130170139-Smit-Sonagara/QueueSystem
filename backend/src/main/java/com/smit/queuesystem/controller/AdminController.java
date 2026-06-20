package com.smit.queuesystem.controller;

import com.smit.queuesystem.dto.AdminDashboardDto;
import com.smit.queuesystem.dto.AdminCatalogDto;
import com.smit.queuesystem.dto.AdminSetupDto;
import com.smit.queuesystem.dto.AssignAgentRequest;
import com.smit.queuesystem.dto.BranchSummaryDto;
import com.smit.queuesystem.dto.CounterSummaryDto;
import com.smit.queuesystem.dto.CreateAgentRequest;
import com.smit.queuesystem.dto.CreateBranchRequest;
import com.smit.queuesystem.dto.CreateCounterRequest;
import com.smit.queuesystem.dto.CreateDepartmentRequest;
import com.smit.queuesystem.dto.CreateOrganizationRequest;
import com.smit.queuesystem.dto.CreateQueueRequest;
import com.smit.queuesystem.dto.DepartmentSummaryDto;
import com.smit.queuesystem.dto.OrganizationSummaryDto;
import com.smit.queuesystem.dto.QueueOptionDto;
import com.smit.queuesystem.dto.AgentSummaryDto;
import com.smit.queuesystem.service.admin.AdminManagementService;
import com.smit.queuesystem.service.admin.AdminQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminQueryService adminQueryService;
    private final AdminManagementService adminManagementService;

    @GetMapping("/dashboard")
    public AdminDashboardDto dashboard() {
        return adminQueryService.getAdminDashboard();
    }

    @GetMapping("/setup")
    public AdminSetupDto setup() {
        return adminQueryService.getAdminSetup();
    }

    @GetMapping("/catalog")
    public AdminCatalogDto catalog() {
        return adminQueryService.getAdminCatalog();
    }

    @PostMapping("/organizations")
    public OrganizationSummaryDto createOrganization(@RequestBody CreateOrganizationRequest request) {
        return adminManagementService.createOrganization(request);
    }

    @PutMapping("/organizations/{organizationId}")
    public OrganizationSummaryDto updateOrganization(@PathVariable Long organizationId, @RequestBody CreateOrganizationRequest request) {
        return adminManagementService.updateOrganization(organizationId, request);
    }

    @PostMapping("/branches")
    public BranchSummaryDto createBranch(@RequestBody CreateBranchRequest request) {
        return adminManagementService.createBranch(request);
    }

    @PutMapping("/branches/{branchId}")
    public BranchSummaryDto updateBranch(@PathVariable Long branchId, @RequestBody CreateBranchRequest request) {
        return adminManagementService.updateBranch(branchId, request);
    }

    @PostMapping("/departments")
    public DepartmentSummaryDto createDepartment(@RequestBody CreateDepartmentRequest request) {
        return adminManagementService.createDepartment(request);
    }

    @PutMapping("/departments/{departmentId}")
    public DepartmentSummaryDto updateDepartment(@PathVariable Long departmentId, @RequestBody CreateDepartmentRequest request) {
        return adminManagementService.updateDepartment(departmentId, request);
    }

    @PostMapping("/queues")
    public QueueOptionDto createQueue(@RequestBody CreateQueueRequest request) {
        return adminManagementService.createQueue(request);
    }

    @PutMapping("/queues/{queueId}")
    public QueueOptionDto updateQueue(@PathVariable Long queueId, @RequestBody CreateQueueRequest request) {
        return adminManagementService.updateQueue(queueId, request);
    }

    @PostMapping("/counters")
    public CounterSummaryDto createCounter(@RequestBody CreateCounterRequest request) {
        return adminManagementService.createCounter(request);
    }

    @PutMapping("/counters/{counterId}")
    public CounterSummaryDto updateCounter(@PathVariable Long counterId, @RequestBody CreateCounterRequest request) {
        return adminManagementService.updateCounter(counterId, request);
    }

    @PostMapping("/agents")
    public AgentSummaryDto createAgent(@RequestBody CreateAgentRequest request) {
        return adminManagementService.createAgent(request);
    }

    @PutMapping("/agents/{agentId}")
    public AgentSummaryDto updateAgent(@PathVariable Long agentId, @RequestBody CreateAgentRequest request) {
        return adminManagementService.updateAgent(agentId, request);
    }

    @PostMapping("/counters/{counterId}/assign-agent")
    public CounterSummaryDto assignAgent(@PathVariable Long counterId, @RequestBody AssignAgentRequest request) {
        return adminManagementService.assignAgentToCounter(counterId, request);
    }

    @DeleteMapping("/organizations/{organizationId}")
    public void deleteOrganization(@PathVariable Long organizationId) {
        adminManagementService.deleteOrganization(organizationId);
    }

    @DeleteMapping("/branches/{branchId}")
    public void deleteBranch(@PathVariable Long branchId) {
        adminManagementService.deleteBranch(branchId);
    }

    @DeleteMapping("/departments/{departmentId}")
    public void deleteDepartment(@PathVariable Long departmentId) {
        adminManagementService.deleteDepartment(departmentId);
    }

    @DeleteMapping("/queues/{queueId}")
    public void deleteQueue(@PathVariable Long queueId) {
        adminManagementService.deleteQueue(queueId);
    }

    @DeleteMapping("/counters/{counterId}")
    public void deleteCounter(@PathVariable Long counterId) {
        adminManagementService.deleteCounter(counterId);
    }

    @DeleteMapping("/agents/{agentId}")
    public void deleteAgent(@PathVariable Long agentId) {
        adminManagementService.deleteAgent(agentId);
    }
}
