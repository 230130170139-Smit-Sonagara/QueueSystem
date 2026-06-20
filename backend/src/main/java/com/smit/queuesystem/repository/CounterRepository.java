package com.smit.queuesystem.repository;

import com.smit.queuesystem.entity.Counter;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CounterRepository extends JpaRepository<Counter, Long> {
    List<Counter> findByBranchId(Long branchId);
    List<Counter> findByDepartmentId(Long departmentId);
    java.util.Optional<Counter> findFirstByCurrentAgentId(Long currentAgentId);
    java.util.Optional<Counter> findByCode(String code);
}
