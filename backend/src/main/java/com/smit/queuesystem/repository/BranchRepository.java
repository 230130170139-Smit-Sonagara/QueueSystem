package com.smit.queuesystem.repository;

import com.smit.queuesystem.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BranchRepository extends JpaRepository<Branch, Long> {
    List<Branch> findByOrganizationId(Long orgId);
}
