package com.dna.integrator.repository;

import com.dna.integrator.model.GenomicData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GenomicDataRepository extends JpaRepository<GenomicData, Long> {
    List<GenomicData> findByUserId(String userId);
    List<GenomicData> findByUserIdAndFileFormat(String userId, String fileFormat);
}
