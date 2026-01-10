package com.dna.integrator.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Safe API Response Wrapper
 *
 * Wraps all genomic/anatomic data responses with required safety disclaimers.
 * Enforces non-diagnostic boundaries for educational/research use only.
 *
 * Based on: spec/30_clinical_safety.md Section 5
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SafeAPIResponse<T> {

    /**
     * The actual response data
     */
    private T data;

    /**
     * Disclaimer text (required for all genomic/anatomic responses)
     */
    @Builder.Default
    private String disclaimer = "Educational/research purposes only. Not for medical diagnosis or treatment. Consult healthcare professionals for medical decisions.";

    /**
     * Indicates this is NOT a diagnostic tool (always true)
     */
    @Builder.Default
    private boolean nonDiagnostic = true;

    /**
     * Indicates whether evidence levels are included in the data
     */
    @Builder.Default
    private boolean evidenceLabeled = false;

    /**
     * Response timestamp
     */
    @Builder.Default
    private String timestamp = Instant.now().toString();

    /**
     * API version
     */
    @Builder.Default
    private String version = "1.0.0";

    /**
     * Create a safe response with evidence-labeled data
     *
     * @param data The data to wrap
     * @param <T> Data type
     * @return Safe API response with evidenceLabeled=true
     */
    public static <T> SafeAPIResponse<T> ofEvidenceLabeled(T data) {
        return SafeAPIResponse.<T>builder()
                .data(data)
                .evidenceLabeled(true)
                .build();
    }

    /**
     * Create a safe response with non-evidence-labeled data
     *
     * @param data The data to wrap
     * @param <T> Data type
     * @return Safe API response with evidenceLabeled=false
     */
    public static <T> SafeAPIResponse<T> of(T data) {
        return SafeAPIResponse.<T>builder()
                .data(data)
                .evidenceLabeled(false)
                .build();
    }
}
