package com.dna.integrator.anatomy.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents an edge (relationship) between nodes in the anatomy graph.
 *
 * Educational/research visualization only - not for medical diagnosis or treatment.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Edge implements Comparable<Edge> {

    /**
     * Source node ID
     */
    @JsonProperty("from")
    private String from;

    /**
     * Target node ID
     */
    @JsonProperty("to")
    private String to;

    /**
     * Relationship type between nodes
     */
    @JsonProperty("relation")
    private String relation;

    /**
     * Implement Comparable for deterministic ordering.
     * Sorts by: from, then to, then relation
     */
    @Override
    public int compareTo(Edge other) {
        int fromCompare = this.from.compareTo(other.from);
        if (fromCompare != 0) return fromCompare;

        int toCompare = this.to.compareTo(other.to);
        if (toCompare != 0) return toCompare;

        return this.relation.compareTo(other.relation);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Edge edge = (Edge) o;
        return from != null && from.equals(edge.from) &&
               to != null && to.equals(edge.to) &&
               relation != null && relation.equals(edge.relation);
    }

    @Override
    public int hashCode() {
        int result = from != null ? from.hashCode() : 0;
        result = 31 * result + (to != null ? to.hashCode() : 0);
        result = 31 * result + (relation != null ? relation.hashCode() : 0);
        return result;
    }
}
