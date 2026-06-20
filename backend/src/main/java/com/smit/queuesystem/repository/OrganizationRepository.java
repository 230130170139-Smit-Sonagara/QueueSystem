package com.smit.queuesystem.repository;

import com.smit.queuesystem.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrganizationRepository extends JpaRepository<Organization, Long> {
}
