package com.dna.integrator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Metadata about an imported genomic data file.
 * Tracks provenance and parser information for reproducibility.
 *
 * Educational/research purposes only - not for medical diagnosis or treatment.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SampleMetadata {

    /**
     * Genome build/assembly version (e.g., "GRCh37", "GRCh38", "hg19", "hg38")
     * Optional - may be null if not specified in source file
     */
    private String genomeBuild;

    /**
     * Import format identifier (e.g., "vcf", "vcf.gz", "23andme_txt", "ancestry_txt", "generic_tsv")
     */
    private String importFormat;

    /**
     * SHA-256 hash of the source file for integrity verification
     */
    private String fileHash;

    /**
     * Version of the parser that processed this file (for reproducibility)
     */
    private String parserVersion;

    /**
     * Timestamp when the file was imported
     */
    private LocalDateTime importedAt;

    /**
     * Original filename (if available)
     */
    private String originalFilename;

    /**
     * File size in bytes
     */
    private Long fileSizeBytes;

    /**
     * User ID who uploaded the file
     */
    private String userId;
}
