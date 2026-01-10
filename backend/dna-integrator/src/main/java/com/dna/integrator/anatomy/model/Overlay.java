package com.dna.integrator.anatomy.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a visualization overlay on an anatomy node.
 * Overlays show variant-based associations with explicit evidence levels.
 *
 * Educational/research visualization only - not for medical diagnosis or treatment.
 * All associations are labeled with evidence quality and should not be used for
 * medical decisions.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Overlay implements Comparable<Overlay> {

    /**
     * ID of the anatomy node this overlay targets
     */
    @JsonProperty("targetNodeId")
    private String targetNodeId;

    /**
     * Intensity/strength of the association (0.0 to 1.0)
     * This is for visualization purposes only and does not represent medical significance
     */
    @JsonProperty("intensity")
    private Double intensity;

    /**
     * Description of the association for display
     * (e.g., "Variant in gene associated with this structure")
     */
    @JsonProperty("label")
    private String label;

    /**
     * Evidence quality level for this association
     */
    @JsonProperty("evidence")
    private EvidenceLevel evidence;

    /**
     * Source references for this association (literature, databases, etc.)
     */
    @JsonProperty("sources")
    @Builder.Default
    private List<String> sources = new ArrayList<>();

    /**
     * Evidence quality levels
     */
    public enum EvidenceLevel {
        HIGH,    // Well-established, replicated associations
        MEDIUM,  // Some supporting evidence, needs validation
        LOW      // Preliminary or indirect associations
    }

    /**
     * Implement Comparable for deterministic ordering.
     * Sorts by: targetNodeId, then intensity (descending), then label
     */
    @Override
    public int compareTo(Overlay other) {
        int nodeCompare = this.targetNodeId.compareTo(other.targetNodeId);
        if (nodeCompare != 0) return nodeCompare;

        // Sort by intensity descending (higher intensity first)
        int intensityCompare = Double.compare(other.intensity, this.intensity);
        if (intensityCompare != 0) return intensityCompare;

        return this.label.compareTo(other.label);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Overlay overlay = (Overlay) o;
        return targetNodeId != null && targetNodeId.equals(overlay.targetNodeId) &&
               label != null && label.equals(overlay.label);
    }

    @Override
    public int hashCode() {
        int result = targetNodeId != null ? targetNodeId.hashCode() : 0;
        result = 31 * result + (label != null ? label.hashCode() : 0);
        return result;
    }
}
