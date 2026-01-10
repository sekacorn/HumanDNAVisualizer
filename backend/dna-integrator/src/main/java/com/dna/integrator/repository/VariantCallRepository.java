package com.dna.integrator.repository;

import com.dna.integrator.model.VariantCallEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for managing VariantCall entities.
 *
 * Educational/research purposes only - not for medical diagnosis or treatment.
 */
@Repository
public interface VariantCallRepository extends JpaRepository<VariantCallEntity, Long> {

    /**
     * Find all variant calls for a specific sample
     */
    List<VariantCallEntity> findBySampleId(Long sampleId);

    /**
     * Find variant calls for a sample with pagination
     */
    Page<VariantCallEntity> findBySampleId(Long sampleId, Pageable pageable);

    /**
     * Find variant calls by chromosome
     */
    List<VariantCallEntity> findBySampleIdAndChrom(Long sampleId, String chrom);

    /**
     * Find variant calls by chromosome with pagination
     */
    Page<VariantCallEntity> findBySampleIdAndChrom(Long sampleId, String chrom, Pageable pageable);

    /**
     * Find variant calls by rsID
     */
    List<VariantCallEntity> findBySampleIdAndRsid(Long sampleId, String rsid);

    /**
     * Find a specific variant by chromosome and position
     */
    Optional<VariantCallEntity> findBySampleIdAndChromAndPos(Long sampleId, String chrom, Long pos);

    /**
     * Find variant calls in a genomic range
     */
    @Query("SELECT v FROM VariantCallEntity v WHERE v.sample.id = :sampleId " +
           "AND v.chrom = :chrom AND v.pos >= :startPos AND v.pos <= :endPos")
    List<VariantCallEntity> findVariantsInRange(
            @Param("sampleId") Long sampleId,
            @Param("chrom") String chrom,
            @Param("startPos") Long startPos,
            @Param("endPos") Long endPos);

    /**
     * Find variant calls in a genomic range with pagination
     */
    @Query("SELECT v FROM VariantCallEntity v WHERE v.sample.id = :sampleId " +
           "AND v.chrom = :chrom AND v.pos >= :startPos AND v.pos <= :endPos")
    Page<VariantCallEntity> findVariantsInRange(
            @Param("sampleId") Long sampleId,
            @Param("chrom") String chrom,
            @Param("startPos") Long startPos,
            @Param("endPos") Long endPos,
            Pageable pageable);

    /**
     * Count variants for a specific sample
     */
    long countBySampleId(Long sampleId);

    /**
     * Count variants by chromosome
     */
    long countBySampleIdAndChrom(Long sampleId, String chrom);

    /**
     * Find variants by genotype
     */
    List<VariantCallEntity> findBySampleIdAndGenotype(Long sampleId, String genotype);

    /**
     * Find variants with quality score above threshold
     */
    @Query("SELECT v FROM VariantCallEntity v WHERE v.sample.id = :sampleId " +
           "AND v.qual IS NOT NULL AND v.qual >= :minQuality")
    List<VariantCallEntity> findVariantsWithQualityAbove(
            @Param("sampleId") Long sampleId,
            @Param("minQuality") double minQuality);

    /**
     * Find variants that passed filters
     */
    @Query("SELECT v FROM VariantCallEntity v WHERE v.sample.id = :sampleId " +
           "AND (v.filter = 'PASS' OR v.filter IS NULL)")
    List<VariantCallEntity> findPassedVariants(@Param("sampleId") Long sampleId);

    /**
     * Find all rsIDs for a sample (useful for lookups)
     */
    @Query("SELECT DISTINCT v.rsid FROM VariantCallEntity v WHERE v.sample.id = :sampleId AND v.rsid IS NOT NULL")
    List<String> findAllRsidsForSample(@Param("sampleId") Long sampleId);

    /**
     * Find all chromosomes present in a sample
     */
    @Query("SELECT DISTINCT v.chrom FROM VariantCallEntity v WHERE v.sample.id = :sampleId ORDER BY v.chrom")
    List<String> findAllChromosomesForSample(@Param("sampleId") Long sampleId);

    /**
     * Delete all variant calls for a sample (cascade delete helper)
     */
    void deleteBySampleId(Long sampleId);
}
