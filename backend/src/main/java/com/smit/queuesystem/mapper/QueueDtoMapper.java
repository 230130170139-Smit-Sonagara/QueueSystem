package com.smit.queuesystem.mapper;

import com.smit.queuesystem.dto.AgentSummaryDto;
import com.smit.queuesystem.dto.BoardTokenDto;
import com.smit.queuesystem.dto.BookingResponseDto;
import com.smit.queuesystem.dto.BranchSummaryDto;
import com.smit.queuesystem.dto.CounterSummaryDto;
import com.smit.queuesystem.dto.DepartmentSummaryDto;
import com.smit.queuesystem.dto.OrganizationSummaryDto;
import com.smit.queuesystem.dto.QueueOptionDto;
import com.smit.queuesystem.dto.TrackingResponseDto;
import com.smit.queuesystem.entity.AppUser;
import com.smit.queuesystem.entity.Branch;
import com.smit.queuesystem.entity.Counter;
import com.smit.queuesystem.entity.Department;
import com.smit.queuesystem.entity.Organization;
import com.smit.queuesystem.entity.ServiceQueue;
import com.smit.queuesystem.entity.Token;
import org.springframework.stereotype.Component;

@Component
public class QueueDtoMapper {

    public OrganizationSummaryDto toOrganizationSummary(Organization organization, int branchCount) {
        return new OrganizationSummaryDto(
                organization.getId(),
                organization.getName(),
                organization.getCode(),
                organization.getContactEmail(),
                organization.getDescription(),
                branchCount
        );
    }

    public BranchSummaryDto toBranchSummary(Branch branch, int queueCount, int counterCount) {
        return new BranchSummaryDto(
                branch.getId(),
                branch.getName(),
                branch.getLocation(),
                branch.getTimezone(),
                branch.getSupportEmail(),
                branch.getContactNumber(),
                branch.getOrganization().getId(),
                branch.getOrganization().getName(),
                queueCount,
                counterCount
        );
    }

    public DepartmentSummaryDto toDepartmentSummary(Department department, int queueCount, int counterCount) {
        return new DepartmentSummaryDto(
                department.getId(),
                department.getName(),
                department.getBranch().getOrganization().getId(),
                department.getBranch().getId(),
                department.getBranch().getName(),
                queueCount,
                counterCount
        );
    }

    public QueueOptionDto toQueueOption(ServiceQueue queue, int waitingCount) {
        return new QueueOptionDto(
                queue.getId(),
                queue.getName(),
                queue.getServiceCode(),
                queue.getDescription(),
                queue.getPrefix(),
                queue.getAverageServiceTimeMinutes(),
                queue.getBranch().getId(),
                queue.getBranch().getName(),
                queue.getDepartment() != null ? queue.getDepartment().getName() : "General",
                waitingCount
        );
    }

    public BookingResponseDto toBookingResponse(Token token, int peopleAhead, int estimatedWait) {
        return new BookingResponseDto(
                token.getId(),
                token.getTokenIdentifier(),
                token.getSequenceNumber(),
                token.getType(),
                token.getStatus(),
                token.getCustomerName(),
                token.getCustomerPhone(),
                token.getCustomerEmail(),
                token.getServiceQueue().getName(),
                token.getServiceQueue().getBranch().getName(),
                token.getServiceQueue().getBranch().getOrganization().getName(),
                estimatedWait,
                peopleAhead,
                token.getIssuedAt()
        );
    }

    public TrackingResponseDto toTrackingResponse(Token token, int peopleAhead, int estimatedWait, boolean notifySoon) {
        return new TrackingResponseDto(
                token.getId(),
                token.getTokenIdentifier(),
                token.getType(),
                token.getStatus(),
                token.getCustomerName(),
                token.getServiceQueue().getName(),
                token.getServiceQueue().getBranch().getName(),
                token.getCounter() != null ? token.getCounter().getName() : null,
                peopleAhead,
                estimatedWait,
                token.getIssuedAt(),
                token.getCalledAt(),
                token.getServedAt(),
                notifySoon
        );
    }

    public BoardTokenDto toBoardToken(Token token) {
        return new BoardTokenDto(
                token.getId(),
                token.getTokenIdentifier(),
                token.getServiceQueue().getBranch().getId(),
                token.getServiceQueue().getBranch().getName(),
                token.getServiceQueue().getName(),
                token.getCounter() != null ? token.getCounter().getName() : "Waiting",
                token.getType(),
                token.getCalledAt()
        );
    }

    public CounterSummaryDto toCounterSummary(Counter counter) {
        return new CounterSummaryDto(
                counter.getId(),
                counter.getName(),
                counter.getCode(),
                counter.getIsOnline(),
                counter.getBranch().getOrganization().getId(),
                counter.getBranch().getId(),
                counter.getBranch().getName(),
                counter.getDepartment() != null ? counter.getDepartment().getId() : null,
                counter.getDepartment() != null ? counter.getDepartment().getName() : null,
                counter.getCurrentAgent() != null ? counter.getCurrentAgent().getId() : null,
                counter.getCurrentAgent() != null ? counter.getCurrentAgent().getFullName() : null
        );
    }

    public AgentSummaryDto toAgentSummary(AppUser agent, Counter assignedCounter) {
        return new AgentSummaryDto(
                agent.getId(),
                agent.getUsername(),
                agent.getFullName(),
                agent.getEmail(),
                agent.getOrganization() != null ? agent.getOrganization().getId() : null,
                agent.getBranch() != null ? agent.getBranch().getId() : null,
                agent.getBranch() != null ? agent.getBranch().getName() : null,
                assignedCounter != null ? assignedCounter.getId() : null,
                assignedCounter != null ? assignedCounter.getName() : null
        );
    }
}
