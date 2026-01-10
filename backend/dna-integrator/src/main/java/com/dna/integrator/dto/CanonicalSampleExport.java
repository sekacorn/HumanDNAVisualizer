package com.dna.integrator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Canonical export format for a genomic sample with all variant calls.
 * This format is designed for:
 * - UI display
 * - Processing pipeline input
 * - Data export/backup
 * - Cross-system interoperability
 *
 * Educational/research purposes only - not for medical diagnosis or treatment.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CanonicalSampleExport {

    /**
     * Sample metadata
     */
    private SampleInfo sample;

    /**
     * List of variant calls
     */
    @Builder.Default
    private List<VariantInfo> variants = new ArrayList<>();

    /**
     * Export metadata
     */
    private ExportMetadata exportMetadata;

    /**
     * Sample information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SampleInfo {
        private Long id;
        private String userId;
        private String fileHash;
        private String importFormat;
        private String genomeBuild;
        private String parserVersion;
        private LocalDateTime importedAt;
        private String originalFilename;
        private Long fileSizeBytes;
        private Integer variantCount;
        private Integer rejectedLineCount;
        private String importStatus;
    }

    /**
     * Variant information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VariantInfo {
        private Long id;
        private String chrom;
        private Long pos;
        private String rsid;
        private String ref;
        private String alt;
        private String genotype;
        private Double qual;
        private String filter;
        private String source;
    }

    /**
     * Export metadata
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExportMetadata {
        private LocalDateTime exportedAt;
        private String exportVersion;
        private String exportFormat;
        private Integer totalVariants;
        private String disclaimer;
    }
}
