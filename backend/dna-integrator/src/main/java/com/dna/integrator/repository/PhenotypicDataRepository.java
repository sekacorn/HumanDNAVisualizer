package com.dna.integrator.repository;

import com.dna.integrator.model.PhenotypicData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhenotypicDataRepository extends JpaRepository<PhenotypicData, Long> {
    List<PhenotypicData> findByUserId(String userId);
    List<PhenotypicData> findByUserIdAndResourceType(String userId, String resourceType);
}
