package com.dna.integrator.anatomy.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a node in the anatomy graph (system, organ, or substructure).
 *
 * Educational/research visualization only - not for medical diagnosis or treatment.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Node implements Comparable<Node> {

    /**
     * Unique identifier for this node
     */
    @JsonProperty("id")
    private String id;

    /**
     * Type of anatomical structure (system, organ, substructure)
     */
    @JsonProperty("type")
    private NodeType type;

    /**
     * Human-readable label for display
     */
    @JsonProperty("label")
    private String label;

    /**
     * Node types in the anatomy hierarchy
     */
    public enum NodeType {
        SYSTEM,         // e.g., cardiovascular_system, nervous_system
        ORGAN,          // e.g., heart, brain
        SUBSTRUCTURE    // e.g., left_ventricle, hippocampus
    }

    /**
     * Implement Comparable for deterministic ordering.
     * Sorts by: type (SYSTEM -> ORGAN -> SUBSTRUCTURE), then by id
     */
    @Override
    public int compareTo(Node other) {
        if (this.type != other.type) {
            return this.type.compareTo(other.type);
        }
        return this.id.compareTo(other.id);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Node node = (Node) o;
        return id != null && id.equals(node.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}
