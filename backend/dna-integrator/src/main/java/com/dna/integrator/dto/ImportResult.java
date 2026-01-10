package com.dna.integrator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Result of a genomic file import operation.
 * Contains summary statistics and error details.
 *
 * Educational/research purposes only - not for medical diagnosis or treatment.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportResult {

    /**
     * Number of variants successfully imported
     */
    private int importedVariantsCount;

    /**
     * Number of lines that were rejected due to parsing errors
     */
    private int rejectedLinesCount;

    /**
     * SHA-256 hash of the source file
     */
    private String fileHash;

    /**
     * Version of the parser used
     */
    private String parserVersion;

    /**
     * Sample metadata
     */
    private SampleMetadata metadata;

    /**
     * List of validation errors (line number and error message)
     */
    @Builder.Default
    private List<ValidationError> errors = new ArrayList<>();

    /**
     * Whether the import was successful (at least some variants imported)
     */
    private boolean success;

    /**
     * Overall message about the import
     */
    private String message;

    /**
     * List of successfully imported variants
     */
    @Builder.Default
    private List<VariantCall> variants = new ArrayList<>();

    /**
     * Represents a single validation error
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ValidationError {
        private Integer lineNumber;
        private String errorMessage;
        private String lineContent;
    }
}
