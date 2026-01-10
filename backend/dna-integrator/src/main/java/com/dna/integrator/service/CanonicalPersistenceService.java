package com.dna.integrator.service;

import com.dna.integrator.dto.ImportResult;
import com.dna.integrator.dto.VariantCall;
import com.dna.integrator.model.SampleEntity;
import com.dna.integrator.model.VariantCallEntity;
import com.dna.integrator.repository.SampleRepository;
import com.dna.integrator.repository.VariantCallRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Service for efficient batch persistence of genomic variant data.
 *
 * Educational/research purposes only - not for medical diagnosis or treatment.
 *
 * This service provides:
 * - Batch insert optimization for large variant datasets
 * - Duplicate detection via file hash
 * - Proper provenance tracking
 * - Transaction management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CanonicalPersistenceService {

    private final SampleRepository sampleRepository;
    private final VariantCallRepository variantCallRepository;

    /**
     * Batch size for variant inserts to optimize memory usage
     */
    private static final int BATCH_SIZE = 1000;

    /**
     * Persist an ImportResult to the canonical schema.
     * Uses batch inserts for optimal performance.
     *
     * @param importResult The import result containing sample metadata and variants
     * @param userId The user who uploaded the data
     * @return The persisted SampleEntity with ID
     */
    @Transactional
    public SampleEntity persistImportResult(ImportResult importResult, String userId) {
        log.info("Persisting import result for user {} - {} variants",
                 userId, importResult.getImportedVariantsCount());

        // Check for duplicate file hash
        if (sampleRepository.existsByFileHash(importResult.getFileHash())) {
            log.warn("Duplicate file detected: {} - skipping persist", importResult.getFileHash());
            Optional<SampleEntity> existing = sampleRepository.findByFileHash(importResult.getFileHash());
            return existing.orElseThrow(() -> new IllegalStateException("Duplicate hash but sample not found"));
        }

        // Create sample entity
        SampleEntity sample = SampleEntity.builder()
                .userId(userId)
                .fileHash(importResult.getFileHash())
                .importFormat(importResult.getMetadata().getImportFormat())
                .genomeBuild(importResult.getMetadata().getGenomeBuild())
                .parserVersion(importResult.getParserVersion())
                .importedAt(importResult.getMetadata().getImportedAt())
                .originalFilename(importResult.getMetadata().getOriginalFilename())
                .fileSizeBytes(importResult.getMetadata().getFileSizeBytes())
                .variantCount(importResult.getImportedVariantsCount())
                .rejectedLineCount(importResult.getRejectedLinesCount())
                .importStatus(determineImportStatus(importResult))
                .metadata(buildMetadataJson(importResult))
                .build();

        // Save sample first to get ID
        sample = sampleRepository.save(sample);
        log.debug("Saved sample with ID: {}", sample.getId());

        // Batch persist variants
        if (!importResult.getVariants().isEmpty()) {
            persistVariantsBatch(sample, importResult.getVariants());
        }

        log.info("Successfully persisted sample {} with {} variants",
                 sample.getId(), sample.getVariantCount());

        return sample;
    }

    /**
     * Persist variants in batches to optimize memory and database performance.
     * Uses batch inserts and flushes periodically to avoid out-of-memory issues.
     *
     * @param sample The parent sample entity
     * @param variantCalls List of variant calls to persist
     */
    private void persistVariantsBatch(SampleEntity sample, List<VariantCall> variantCalls) {
        log.info("Persisting {} variants in batches of {}", variantCalls.size(), BATCH_SIZE);

        List<VariantCallEntity> batch = new ArrayList<>(BATCH_SIZE);
        int totalProcessed = 0;

        for (VariantCall variantCall : variantCalls) {
            VariantCallEntity entity = convertToEntity(variantCall, sample);
            batch.add(entity);

            if (batch.size() >= BATCH_SIZE) {
                variantCallRepository.saveAll(batch);
                totalProcessed += batch.size();
                log.debug("Persisted batch of {} variants ({}/{})",
                         batch.size(), totalProcessed, variantCalls.size());
                batch.clear();
            }
        }

        // Persist remaining variants
        if (!batch.isEmpty()) {
            variantCallRepository.saveAll(batch);
            totalProcessed += batch.size();
            log.debug("Persisted final batch of {} variants ({}/{})",
                     batch.size(), totalProcessed, variantCalls.size());
        }

        log.info("Completed batch persist of {} variants", totalProcessed);
    }

    /**
     * Convert a VariantCall DTO to a VariantCallEntity
     *
     * @param variantCall The DTO to convert
     * @param sample The parent sample
     * @return The entity ready for persistence
     */
    private VariantCallEntity convertToEntity(VariantCall variantCall, SampleEntity sample) {
        return VariantCallEntity.builder()
                .sample(sample)
                .chrom(variantCall.getChrom())
                .pos(variantCall.getPos())
                .rsid(variantCall.getId())
                .ref(variantCall.getRef())
                .alt(variantCall.getAlt())
                .genotype(variantCall.getGenotype())
                .qual(variantCall.getQuality())
                .filter(null) // Not in current VariantCall DTO
                .lineNumber(variantCall.getLineNumber())
                .source(variantCall.getSource())
                .annotations(null) // Can be added later if needed
                .build();
    }

    /**
     * Determine import status based on import result
     *
     * @param importResult The import result
     * @return Status string ("SUCCESS", "PARTIAL", or "FAILED")
     */
    private String determineImportStatus(ImportResult importResult) {
        if (!importResult.isSuccess()) {
            return "FAILED";
        }
        if (importResult.getRejectedLinesCount() > 0) {
            return "PARTIAL";
        }
        return "SUCCESS";
    }

    /**
     * Build metadata JSON from import result
     *
     * @param importResult The import result
     * @return JSON string with metadata
     */
    private String buildMetadataJson(ImportResult importResult) {
        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("\"errorCount\":").append(importResult.getErrors().size()).append(",");
        json.append("\"message\":\"").append(escapeJson(importResult.getMessage())).append("\"");

        if (!importResult.getErrors().isEmpty()) {
            json.append(",\"firstError\":{");
            ImportResult.ValidationError firstError = importResult.getErrors().get(0);
            json.append("\"lineNumber\":").append(firstError.getLineNumber()).append(",");
            json.append("\"message\":\"").append(escapeJson(firstError.getErrorMessage())).append("\"");
            json.append("}");
        }

        json.append("}");
        return json.toString();
    }

    /**
     * Simple JSON string escaping
     */
    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\"", "\\\"")
                    .replace("\\", "\\\\")
                    .replace("\n", "\\n")
                    .replace("\r", "\\r")
                    .replace("\t", "\\t");
    }

    /**
     * Get a sample by ID
     *
     * @param sampleId The sample ID
     * @return Optional containing the sample if found
     */
    public Optional<SampleEntity> getSampleById(Long sampleId) {
        return sampleRepository.findById(sampleId);
    }

    /**
     * Get all samples for a user
     *
     * @param userId The user ID
     * @return List of samples
     */
    public List<SampleEntity> getSamplesForUser(String userId) {
        return sampleRepository.findByUserIdOrderByImportedAtDesc(userId);
    }

    /**
     * Delete a sample and all its variants (cascades automatically)
     *
     * @param sampleId The sample ID to delete
     * @return true if deleted, false if not found
     */
    @Transactional
    public boolean deleteSample(Long sampleId) {
        if (sampleRepository.existsById(sampleId)) {
            sampleRepository.deleteById(sampleId);
            log.info("Deleted sample {} and all associated variants", sampleId);
            return true;
        }
        return false;
    }

    /**
     * Get variant count for a sample
     *
     * @param sampleId The sample ID
     * @return Number of variants
     */
    public long getVariantCount(Long sampleId) {
        return variantCallRepository.countBySampleId(sampleId);
    }

    /**
     * Check if a file hash already exists (duplicate detection)
     *
     * @param fileHash The file hash to check
     * @return true if exists, false otherwise
     */
    public boolean isDuplicateFile(String fileHash) {
        return sampleRepository.existsByFileHash(fileHash);
    }
}
