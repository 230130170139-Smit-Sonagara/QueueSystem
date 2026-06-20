package com.smit.queuesystem.service.admin;

import com.smit.queuesystem.dto.AdminCatalogDto;
import com.smit.queuesystem.dto.AdminDashboardDto;
import com.smit.queuesystem.dto.AdminSetupDto;
import com.smit.queuesystem.dto.AgentSummaryDto;
import com.smit.queuesystem.dto.BoardTokenDto;
import com.smit.queuesystem.dto.BranchSummaryDto;
import com.smit.queuesystem.dto.CounterSummaryDto;
import com.smit.queuesystem.dto.DashboardMetricDto;
import com.smit.queuesystem.dto.DepartmentSummaryDto;
import com.smit.queuesystem.dto.OrganizationSummaryDto;
import com.smit.queuesystem.dto.QueueOptionDto;
import com.smit.queuesystem.entity.Branch;
import com.smit.queuesystem.entity.Department;
import com.smit.queuesystem.entity.Organization;
import com.smit.queuesystem.entity.ServiceQueue;
import com.smit.queuesystem.entity.Token;
import com.smit.queuesystem.enums.Role;
import com.smit.queuesystem.enums.TokenStatus;
import com.smit.queuesystem.mapper.QueueDtoMapper;
import com.smit.queuesystem.repository.AppUserRepository;
import com.smit.queuesystem.repository.BranchRepository;
import com.smit.queuesystem.repository.CounterRepository;
import com.smit.queuesystem.repository.DepartmentRepository;
import com.smit.queuesystem.repository.OrganizationRepository;
import com.smit.queuesystem.repository.ServiceQueueRepository;
import com.smit.queuesystem.repository.TokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminQueryService {

    private final OrganizationRepository organizationRepository;
    private final BranchRepository branchRepository;
    private final DepartmentRepository departmentRepository;
    private final ServiceQueueRepository queueRepository;
    private final CounterRepository counterRepository;
    private final TokenRepository tokenRepository;
    private final AppUserRepository userRepository;
    private final QueueDtoMapper mapper;

    public AdminDashboardDto getAdminDashboard() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        List<Branch> branches = branchRepository.findAll();
        long branchCount = branches.size();
        long queueCount = queueRepository.count();
        long counterCount = counterRepository.count();
        long todayTokens = branches.stream()
                .mapToLong(branch -> tokenRepository.countByServiceQueueBranchIdAndIssuedAtBetween(branch.getId(), startOfDay, endOfDay))
                .sum();
        long activeServing = branches.stream()
                .mapToLong(branch -> tokenRepository.countByServiceQueueBranchIdAndStatusAndIssuedAtBetween(branch.getId(), TokenStatus.SERVING, startOfDay, endOfDay))
                .sum();

        List<DashboardMetricDto> metrics = List.of(
                new DashboardMetricDto("Today's Tokens", String.valueOf(todayTokens), "Bookings across all active branches"),
                new DashboardMetricDto("Live Counters", String.valueOf(counterCount), "Total configured service counters"),
                new DashboardMetricDto("Active Serving", String.valueOf(activeServing), "Customers currently being served"),
                new DashboardMetricDto("Queue Network", branchCount + " branches / " + queueCount + " queues", "Advanced multi-branch topology")
        );

        List<QueueOptionDto> spotlightQueues = queueRepository.findAll().stream()
                .filter(ServiceQueue::getIsActive)
                .map(this::mapQueueOption)
                .sorted(Comparator.comparing(QueueOptionDto::waitingCount).reversed())
                .limit(6)
                .toList();

        List<BoardTokenDto> liveServing = branches.stream()
                .flatMap(branch -> tokenRepository.findByServiceQueueBranchIdAndStatusOrderByCalledAtDesc(branch.getId(), TokenStatus.SERVING).stream())
                .sorted(Comparator.comparing(Token::getCalledAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(8)
                .map(mapper::toBoardToken)
                .toList();

        return new AdminDashboardDto(
                metrics,
                branches.stream().map(this::mapBranchSummary).toList(),
                spotlightQueues,
                liveServing
        );
    }

    public AdminSetupDto getAdminSetup() {
        var admin = userRepository.findFirstByRole(Role.SUPER_ADMIN)
                .orElseThrow(() -> new RuntimeException("Admin not initialized"));
        Organization organization = organizationRepository.findAll().stream().findFirst().orElse(null);
        return new AdminSetupDto(
                organization != null ? organization.getName() : "No Organization Configured",
                admin.getEmail(),
                branchRepository.findAll().stream().map(this::mapBranchSummary).toList()
        );
    }

    public AdminCatalogDto getAdminCatalog() {
        List<OrganizationSummaryDto> organizations = organizationRepository.findAll().stream()
                .map(this::mapOrganizationSummary)
                .toList();
        List<BranchSummaryDto> branches = branchRepository.findAll().stream()
                .map(this::mapBranchSummary)
                .toList();
        List<DepartmentSummaryDto> departments = departmentRepository.findAll().stream()
                .map(this::mapDepartmentSummary)
                .toList();
        List<QueueOptionDto> queues = queueRepository.findAll().stream()
                .map(this::mapQueueOption)
                .toList();
        List<CounterSummaryDto> counters = counterRepository.findAll().stream()
                .map(mapper::toCounterSummary)
                .toList();
        List<AgentSummaryDto> agents = userRepository.findByRole(Role.AGENT).stream()
                .map(agent -> mapper.toAgentSummary(agent, counterRepository.findFirstByCurrentAgentId(agent.getId()).orElse(null)))
                .toList();
        return new AdminCatalogDto(organizations, branches, departments, queues, counters, agents);
    }

    private OrganizationSummaryDto mapOrganizationSummary(Organization organization) {
        return mapper.toOrganizationSummary(organization, branchRepository.findByOrganizationId(organization.getId()).size());
    }

    private BranchSummaryDto mapBranchSummary(Branch branch) {
        return mapper.toBranchSummary(
                branch,
                queueRepository.findByBranchId(branch.getId()).size(),
                counterRepository.findByBranchId(branch.getId()).size()
        );
    }

    private DepartmentSummaryDto mapDepartmentSummary(Department department) {
        int queueCount = queueRepository.findByBranchId(department.getBranch().getId()).stream()
                .filter(queue -> queue.getDepartment() != null && queue.getDepartment().getId().equals(department.getId()))
                .toList()
                .size();
        int counterCount = counterRepository.findByBranchId(department.getBranch().getId()).stream()
                .filter(counter -> counter.getDepartment() != null && counter.getDepartment().getId().equals(department.getId()))
                .toList()
                .size();
        return mapper.toDepartmentSummary(department, queueCount, counterCount);
    }

    private QueueOptionDto mapQueueOption(ServiceQueue queue) {
        int waitingCount = tokenRepository.findByServiceQueueIdAndStatusOrderBySequenceNumberAsc(queue.getId(), TokenStatus.WAITING).size();
        return mapper.toQueueOption(queue, waitingCount);
    }
}
