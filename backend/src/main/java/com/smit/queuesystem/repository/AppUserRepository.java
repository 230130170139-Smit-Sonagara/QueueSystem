package com.smit.queuesystem.repository;

import com.smit.queuesystem.entity.AppUser;
import com.smit.queuesystem.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByUsername(String username);
    Optional<AppUser> findByEmail(String email);
    Optional<AppUser> findFirstByRole(Role role);
    List<AppUser> findByRole(Role role);
    List<AppUser> findByBranchId(Long branchId);
    List<AppUser> findByOrganizationId(Long organizationId);
}
