package com.smit.queuesystem.service.admin;

import com.smit.queuesystem.dto.AgentSummaryDto;
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
import com.smit.queuesystem.entity.AppUser;
import com.smit.queuesystem.entity.Branch;
import com.smit.queuesystem.entity.Counter;
import com.smit.queuesystem.entity.Department;
import com.smit.queuesystem.entity.Organization;
import com.smit.queuesystem.entity.ServiceQueue;
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
import com.smit.queuesystem.service.support.QueueFlowSupportService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminManagementService {

    private final OrganizationRepository organizationRepository;
    private final BranchRepository branchRepository;
    private final DepartmentRepository departmentRepository;
    private final ServiceQueueRepository queueRepository;
    private final CounterRepository counterRepository;
    private final TokenRepository tokenRepository;
    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final QueueFlowSupportService queueFlowSupportService;
    private final QueueDtoMapper mapper;

    @Transactional
    public OrganizationSummaryDto createOrganization(CreateOrganizationRequest request) {
        Organization organization = Organization.builder()
                .name(queueFlowSupportService.requireText(request.name(), "Organization name"))
                .code(queueFlowSupportService.requireText(request.code(), "Organization code").toUpperCase())
                .contactEmail(queueFlowSupportService.trimToNull(request.contactEmail()))
                .description(queueFlowSupportService.trimToNull(request.description()))
                .build();
        return mapOrganizationSummary(organizationRepository.save(organization));
    }

    @Transactional
    public OrganizationSummaryDto updateOrganization(Long organizationId, CreateOrganizationRequest request) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));
        organization.setName(queueFlowSupportService.requireText(request.name(), "Organization name"));
        organization.setCode(queueFlowSupportService.requireText(request.code(), "Organization code").toUpperCase());
        organization.setContactEmail(queueFlowSupportService.trimToNull(request.contactEmail()));
        organization.setDescription(queueFlowSupportService.trimToNull(request.description()));
        return mapOrganizationSummary(organizationRepository.save(organization));
    }

    @Transactional
    public BranchSummaryDto createBranch(CreateBranchRequest request) {
        Organization organization = organizationRepository.findById(request.organizationId())
                .orElseThrow(() -> new RuntimeException("Organization not found"));
        Branch branch = Branch.builder()
                .name(queueFlowSupportService.requireText(request.name(), "Branch name"))
                .location(queueFlowSupportService.trimToNull(request.location()))
                .timezone(resolveTimezone(request.timezone()))
                .supportEmail(queueFlowSupportService.trimToNull(request.supportEmail()))
                .contactNumber(queueFlowSupportService.trimToNull(request.contactNumber()))
                .organization(organization)
                .build();
        return mapBranchSummary(branchRepository.save(branch));
    }

    @Transactional
    public BranchSummaryDto updateBranch(Long branchId, CreateBranchRequest request) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new RuntimeException("Branch not found"));
        Organization organization = organizationRepository.findById(request.organizationId())
                .orElseThrow(() -> new RuntimeException("Organization not found"));
        branch.setName(queueFlowSupportService.requireText(request.name(), "Branch name"));
        branch.setLocation(queueFlowSupportService.trimToNull(request.location()));
        branch.setTimezone(resolveTimezone(request.timezone()));
        branch.setSupportEmail(queueFlowSupportService.trimToNull(request.supportEmail()));
        branch.setContactNumber(queueFlowSupportService.trimToNull(request.contactNumber()));
        branch.setOrganization(organization);
        return mapBranchSummary(branchRepository.save(branch));
    }

    @Transactional
    public DepartmentSummaryDto createDepartment(CreateDepartmentRequest request) {
        Branch branch = branchRepository.findById(request.branchId())
                .orElseThrow(() -> new RuntimeException("Branch not found"));
        Department department = Department.builder()
                .name(queueFlowSupportService.requireText(request.name(), "Department name"))
                .branch(branch)
                .build();
        return mapDepartmentSummary(departmentRepository.save(department));
    }

    @Transactional
    public DepartmentSummaryDto updateDepartment(Long departmentId, CreateDepartmentRequest request) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));
        Branch branch = branchRepository.findById(request.branchId())
                .orElseThrow(() -> new RuntimeException("Branch not found"));
        department.setName(queueFlowSupportService.requireText(request.name(), "Department name"));
        department.setBranch(branch);
        return mapDepartmentSummary(departmentRepository.save(department));
    }

    @Transactional
    public QueueOptionDto createQueue(CreateQueueRequest request) {
        Branch branch = branchRepository.findById(request.branchId())
                .orElseThrow(() -> new RuntimeException("Branch not found"));
        Department department = departmentRepository.findById(request.departmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));
        validateDepartmentBranchMatch(branch, department);

        ServiceQueue queue = ServiceQueue.builder()
                .name(queueFlowSupportService.requireText(request.name(), "Queue name"))
                .serviceCode(queueFlowSupportService.requireText(request.serviceCode(), "Service code").toUpperCase())
                .prefix(queueFlowSupportService.requireText(request.prefix(), "Prefix").toUpperCase())
                .description(queueFlowSupportService.trimToNull(request.description()))
                .averageServiceTimeMinutes(request.averageServiceTimeMinutes() != null ? request.averageServiceTimeMinutes() : 5)
                .isActive(request.isActive() == null || request.isActive())
                .branch(branch)
                .department(department)
                .build();
        return mapQueueOption(queueRepository.save(queue));
    }

    @Transactional
    public QueueOptionDto updateQueue(Long queueId, CreateQueueRequest request) {
        ServiceQueue queue = queueRepository.findById(queueId)
                .orElseThrow(() -> new RuntimeException("Queue not found"));
        Branch branch = branchRepository.findById(request.branchId())
                .orElseThrow(() -> new RuntimeException("Branch not found"));
        Department department = departmentRepository.findById(request.departmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));
        validateDepartmentBranchMatch(branch, department);

        queue.setName(queueFlowSupportService.requireText(request.name(), "Queue name"));
        queue.setServiceCode(queueFlowSupportService.requireText(request.serviceCode(), "Service code").toUpperCase());
        queue.setPrefix(queueFlowSupportService.requireText(request.prefix(), "Prefix").toUpperCase());
        queue.setDescription(queueFlowSupportService.trimToNull(request.description()));
        queue.setAverageServiceTimeMinutes(request.averageServiceTimeMinutes() != null ? request.averageServiceTimeMinutes() : 5);
        queue.setIsActive(request.isActive() == null || request.isActive());
        queue.setBranch(branch);
        queue.setDepartment(department);
        return mapQueueOption(queueRepository.save(queue));
    }

    @Transactional
    public CounterSummaryDto createCounter(CreateCounterRequest request) {
        Branch branch = branchRepository.findById(request.branchId())
                .orElseThrow(() -> new RuntimeException("Branch not found"));
        Department department = departmentRepository.findById(request.departmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));
        validateDepartmentBranchMatch(branch, department);

        Counter counter = Counter.builder()
                .name(queueFlowSupportService.requireText(request.name(), "Counter name"))
                .code(queueFlowSupportService.requireText(request.code(), "Counter code").toUpperCase())
                .branch(branch)
                .department(department)
                .isOnline(request.isOnline() != null && request.isOnline())
                .build();
        return mapper.toCounterSummary(counterRepository.save(counter));
    }

    @Transactional
    public CounterSummaryDto updateCounter(Long counterId, CreateCounterRequest request) {
        Counter counter = counterRepository.findById(counterId)
                .orElseThrow(() -> new RuntimeException("Counter not found"));
        Branch branch = branchRepository.findById(request.branchId())
                .orElseThrow(() -> new RuntimeException("Branch not found"));
        Department department = departmentRepository.findById(request.departmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));
        validateDepartmentBranchMatch(branch, department);

        counter.setName(queueFlowSupportService.requireText(request.name(), "Counter name"));
        counter.setCode(queueFlowSupportService.requireText(request.code(), "Counter code").toUpperCase());
        counter.setBranch(branch);
        counter.setDepartment(department);
        if (request.isOnline() != null) {
            counter.setIsOnline(request.isOnline());
        }
        return mapper.toCounterSummary(counterRepository.save(counter));
    }

    @Transactional
    public AgentSummaryDto createAgent(CreateAgentRequest request) {
        Branch branch = branchRepository.findById(request.branchId())
                .orElseThrow(() -> new RuntimeException("Branch not found"));
        Counter counter = counterRepository.findById(request.counterId())
                .orElseThrow(() -> new RuntimeException("Counter not found"));
        validateCounterBranchMatch(branch, counter);

        AppUser agent = AppUser.builder()
                .username(queueFlowSupportService.requireText(request.username(), "Username"))
                .password(passwordEncoder.encode(queueFlowSupportService.requireText(request.password(), "Password")))
                .fullName(queueFlowSupportService.requireText(request.fullName(), "Full name"))
                .email(queueFlowSupportService.trimToNull(request.email()))
                .phone(queueFlowSupportService.trimToNull(request.phone()))
                .emailNotificationsEnabled(request.emailNotificationsEnabled() == null || request.emailNotificationsEnabled())
                .role(Role.AGENT)
                .organization(branch.getOrganization())
                .branch(branch)
                .build();
        AppUser saved = userRepository.save(agent);
        queueFlowSupportService.assignAgentToCounter(saved, counter);
        return mapAgentSummary(saved);
    }

    @Transactional
    public AgentSummaryDto updateAgent(Long agentId, CreateAgentRequest request) {
        AppUser agent = userRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found"));
        if (agent.getRole() != Role.AGENT) {
            throw new IllegalStateException("Only agent accounts can be updated from this action.");
        }
        Branch branch = branchRepository.findById(request.branchId())
                .orElseThrow(() -> new RuntimeException("Branch not found"));
        Counter counter = counterRepository.findById(request.counterId())
                .orElseThrow(() -> new RuntimeException("Counter not found"));
        validateCounterBranchMatch(branch, counter);

        agent.setUsername(queueFlowSupportService.requireText(request.username(), "Username"));
        if (queueFlowSupportService.trimToNull(request.password()) != null) {
            agent.setPassword(passwordEncoder.encode(request.password().trim()));
        }
        agent.setFullName(queueFlowSupportService.requireText(request.fullName(), "Full name"));
        agent.setEmail(queueFlowSupportService.trimToNull(request.email()));
        agent.setPhone(queueFlowSupportService.trimToNull(request.phone()));
        agent.setEmailNotificationsEnabled(request.emailNotificationsEnabled() == null || request.emailNotificationsEnabled());
        agent.setOrganization(branch.getOrganization());
        agent.setBranch(branch);
        AppUser saved = userRepository.save(agent);
        queueFlowSupportService.assignAgentToCounter(saved, counter);
        return mapAgentSummary(saved);
    }

    @Transactional
    public CounterSummaryDto assignAgentToCounter(Long counterId, AssignAgentRequest request) {
        Counter counter = counterRepository.findById(counterId)
                .orElseThrow(() -> new RuntimeException("Counter not found"));
        AppUser agent = userRepository.findById(request.agentId())
                .orElseThrow(() -> new RuntimeException("Agent not found"));
        if (agent.getRole() != Role.AGENT) {
            throw new IllegalStateException("Only agent accounts can be assigned to counters.");
        }
        validateCounterBranchMatch(agent.getBranch(), counter);
        queueFlowSupportService.assignAgentToCounter(agent, counter);
        return mapper.toCounterSummary(counterRepository.findById(counterId).orElseThrow());
    }

    @Transactional
    public void deleteOrganization(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        branchRepository.findByOrganizationId(organizationId)
                .forEach(branch -> deleteBranch(branch.getId()));

        userRepository.findByOrganizationId(organizationId)
                .forEach(queueFlowSupportService::cleanupOrganizationUserReference);

        organizationRepository.delete(organization);
    }

    @Transactional
    public void deleteBranch(Long branchId) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new RuntimeException("Branch not found"));

        counterRepository.findByBranchId(branchId).forEach(counter -> {
            counter.setCurrentAgent(null);
            counter.setIsOnline(false);
            counterRepository.save(counter);
        });

        tokenRepository.deleteByServiceQueueBranchId(branchId);
        queueRepository.findByBranchId(branchId).forEach(queueRepository::delete);
        counterRepository.findByBranchId(branchId).forEach(counterRepository::delete);
        departmentRepository.findByBranchId(branchId).forEach(departmentRepository::delete);

        userRepository.findByBranchId(branchId)
                .forEach(queueFlowSupportService::cleanupBranchUserReference);

        branchRepository.delete(branch);
    }

    @Transactional
    public void deleteDepartment(Long departmentId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        queueRepository.findByDepartmentId(departmentId)
                .forEach(queue -> deleteQueue(queue.getId()));

        counterRepository.findByDepartmentId(departmentId)
                .forEach(counter -> {
                    if (counter.getCurrentAgent() != null) {
                        counter.setCurrentAgent(null);
                        counter.setIsOnline(false);
                        counterRepository.save(counter);
                    }
                    counterRepository.delete(counter);
                });

        departmentRepository.delete(department);
    }

    @Transactional
    public void deleteQueue(Long queueId) {
        ServiceQueue queue = queueRepository.findById(queueId)
                .orElseThrow(() -> new RuntimeException("Queue not found"));
        tokenRepository.deleteByServiceQueueId(queueId);
        queueRepository.delete(queue);
    }

    @Transactional
    public void deleteCounter(Long counterId) {
        Counter counter = counterRepository.findById(counterId)
                .orElseThrow(() -> new RuntimeException("Counter not found"));
        if (counter.getCurrentAgent() != null) {
            counter.setCurrentAgent(null);
            counter.setIsOnline(false);
            counterRepository.save(counter);
        }
        tokenRepository.findByCounterId(counterId).forEach(token -> {
            token.setCounter(null);
            token.setAgent(null);
            if (token.getStatus() == TokenStatus.SERVING) {
                token.setStatus(TokenStatus.WAITING);
            }
            tokenRepository.save(token);
        });
        counterRepository.delete(counter);
    }

    @Transactional
    public void deleteAgent(Long agentId) {
        AppUser agent = userRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found"));
        if (agent.getRole() != Role.AGENT) {
            throw new IllegalStateException("Only agent accounts can be deleted from this action.");
        }
        counterRepository.findFirstByCurrentAgentId(agent.getId()).ifPresent(counter -> {
            counter.setCurrentAgent(null);
            counter.setIsOnline(false);
            counterRepository.save(counter);
        });
        tokenRepository.findByAgentId(agentId).forEach(token -> {
            token.setAgent(null);
            if (token.getStatus() == TokenStatus.SERVING) {
                token.setCounter(null);
                token.setStatus(TokenStatus.WAITING);
            }
            tokenRepository.save(token);
        });
        userRepository.delete(agent);
    }

    private void validateDepartmentBranchMatch(Branch branch, Department department) {
        if (!department.getBranch().getId().equals(branch.getId())) {
            throw new IllegalStateException("The selected department does not belong to the selected branch.");
        }
    }

    private void validateCounterBranchMatch(Branch branch, Counter counter) {
        if (branch == null || !counter.getBranch().getId().equals(branch.getId())) {
            throw new IllegalStateException("The selected counter does not belong to the selected branch.");
        }
    }

    private String resolveTimezone(String timezone) {
        String normalized = queueFlowSupportService.trimToNull(timezone);
        return normalized != null ? normalized : "Asia/Kolkata";
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
        return mapper.toQueueOption(
                queue,
                tokenRepository.findByServiceQueueIdAndStatusOrderBySequenceNumberAsc(queue.getId(), TokenStatus.WAITING).size()
        );
    }

    private AgentSummaryDto mapAgentSummary(AppUser agent) {
        return mapper.toAgentSummary(agent, counterRepository.findFirstByCurrentAgentId(agent.getId()).orElse(null));
    }
}
