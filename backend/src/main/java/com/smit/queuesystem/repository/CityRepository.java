package com.smit.queuesystem.repository;

import com.smit.queuesystem.entity.City;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CityRepository extends JpaRepository<City, Long> {
}
