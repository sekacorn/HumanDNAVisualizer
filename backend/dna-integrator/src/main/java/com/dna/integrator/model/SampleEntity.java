package com.dna.integrator.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Canonical entity representing a genomic sample import with full provenance tracking.
 *
 * Educational/research purposes only - not for medical diagnosis or treatment.
 *
 * This entity stores metadata about imported genomic files, enabling:
 * - File integrity verification via SHA-256 hash
 * - Reproducibility via parser version tracking
 * - Genome build tracking for coordinate system consistency
 * - Import audit trail
 */
@Entity
@Table(name = "samples", indexes = {
    @Index(name = "idx_samples_user_id", columnList = "user_id"),
    @Index(name = "idx_samples_file_hash", columnList = "file_hash"),
    @Index(name = "idx_samples_imported_at", columnList = "imported_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SampleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * User who uploaded this sample
     */
    @NotBlank(message = "User ID is required")
    @Column(name = "user_id", nullable = false, length = 255)
    private String userId;

    /**
     * SHA-256 hash of the original file for integrity verification
     */
    @NotBlank(message = "File hash is required")
    @Column(name = "file_hash", nullable = false, length = 64, unique = true)
    private String fileHash;

    /**
     * Import format (e.g., "vcf", "vcf.gz", "generic_tsv", "23andme", "ancestry")
     */
    @NotBlank(message = "Import format is required")
    @Column(name = "import_format", nullable = false, length = 50)
    private String importFormat;

    /**
     * Genome build/assembly (e.g., "GRCh37", "GRCh38", "hg19", "hg38")
     * Optional - may be null if not specified in source file
     */
    @Column(name = "genome_build", length = 50)
    private String genomeBuild;

    /**
     * Parser version that processed this file (for reproducibility)
     */
    @NotBlank(message = "Parser version is required")
    @Column(name = "parser_version", nullable = false, length = 20)
    private String parserVersion;

    /**
     * Timestamp when the file was imported
     */
    @NotNull(message = "Import timestamp is required")
    @Column(name = "imported_at", nullable = false)
    private LocalDateTime importedAt;

    /**
     * Original filename (optional)
     */
    @Column(name = "original_filename", length = 500)
    private String originalFilename;

    /**
     * File size in bytes
     */
    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    /**
     * Number of variants successfully imported
     */
    @Column(name = "variant_count")
    @Builder.Default
    private Integer variantCount = 0;

    /**
     * Number of lines rejected during import
     */
    @Column(name = "rejected_line_count")
    @Builder.Default
    private Integer rejectedLineCount = 0;

    /**
     * Import status (e.g., "SUCCESS", "PARTIAL", "FAILED")
     */
    @Column(name = "import_status", length = 20)
    @Builder.Default
    private String importStatus = "SUCCESS";

    /**
     * Variant calls associated with this sample
     */
    @OneToMany(mappedBy = "sample", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<VariantCallEntity> variantCalls = new ArrayList<>();

    /**
     * Additional metadata as JSON (optional)
     */
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;

    @PrePersist
    protected void onCreate() {
        if (importedAt == null) {
            importedAt = LocalDateTime.now();
        }
    }

    /**
     * Helper method to add a variant call to this sample
     */
    public void addVariantCall(VariantCallEntity variantCall) {
        variantCalls.add(variantCall);
        variantCall.setSample(this);
    }

    /**
     * Helper method to remove a variant call from this sample
     */
    public void removeVariantCall(VariantCallEntity variantCall) {
        variantCalls.remove(variantCall);
        variantCall.setSample(null);
    }
}
