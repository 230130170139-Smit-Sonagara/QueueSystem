package com.smit.queuesystem.repository;

import com.smit.queuesystem.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findByBranchId(Long branchId);
}
