package com.dna.integrator.repository;

import com.dna.integrator.model.SampleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for managing Sample entities.
 *
 * Educational/research purposes only - not for medical diagnosis or treatment.
 */
@Repository
public interface SampleRepository extends JpaRepository<SampleEntity, Long> {

    /**
     * Find all samples for a specific user
     */
    List<SampleEntity> findByUserId(String userId);

    /**
     * Find all samples for a user, ordered by import date descending
     */
    List<SampleEntity> findByUserIdOrderByImportedAtDesc(String userId);

    /**
     * Find a sample by its file hash (useful for detecting duplicates)
     */
    Optional<SampleEntity> findByFileHash(String fileHash);

    /**
     * Find samples by import format
     */
    List<SampleEntity> findByImportFormat(String importFormat);

    /**
     * Find samples by genome build
     */
    List<SampleEntity> findByGenomeBuild(String genomeBuild);

    /**
     * Find samples imported after a specific date
     */
    List<SampleEntity> findByImportedAtAfter(LocalDateTime dateTime);

    /**
     * Find samples by import status
     */
    List<SampleEntity> findByImportStatus(String status);

    /**
     * Count samples for a specific user
     */
    long countByUserId(String userId);

    /**
     * Check if a file hash already exists (for duplicate detection)
     */
    boolean existsByFileHash(String fileHash);

    /**
     * Find samples with variant count greater than a threshold
     */
    @Query("SELECT s FROM SampleEntity s WHERE s.variantCount > :minCount")
    List<SampleEntity> findSamplesWithVariantCountGreaterThan(@Param("minCount") int minCount);

    /**
     * Get total variant count for a user across all samples
     */
    @Query("SELECT COALESCE(SUM(s.variantCount), 0) FROM SampleEntity s WHERE s.userId = :userId")
    long getTotalVariantCountForUser(@Param("userId") String userId);

    /**
     * Find samples by user and format
     */
    List<SampleEntity> findByUserIdAndImportFormat(String userId, String importFormat);
}
