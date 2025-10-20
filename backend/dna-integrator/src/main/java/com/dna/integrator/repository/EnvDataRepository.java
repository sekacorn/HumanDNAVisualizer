package com.dna.integrator.repository;

import com.dna.integrator.model.EnvData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnvDataRepository extends JpaRepository<EnvData, Long> {
    List<EnvData> findByUserId(String userId);
}
