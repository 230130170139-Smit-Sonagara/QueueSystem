package com.smit.queuesystem.repository;

import com.smit.queuesystem.entity.ServiceQueue;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServiceQueueRepository extends JpaRepository<ServiceQueue, Long> {
    List<ServiceQueue> findByBranchId(Long branchId);
    List<ServiceQueue> findByBranchIdAndIsActiveTrue(Long branchId);
    List<ServiceQueue> findByDepartmentId(Long departmentId);
}
