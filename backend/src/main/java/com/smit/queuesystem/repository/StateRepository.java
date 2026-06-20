package com.smit.queuesystem.repository;

import com.smit.queuesystem.entity.State;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StateRepository extends JpaRepository<State, Long> {
}
