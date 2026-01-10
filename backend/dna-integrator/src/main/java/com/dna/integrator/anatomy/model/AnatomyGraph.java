package com.dna.integrator.anatomy.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Render-ready anatomy graph containing nodes, edges, and variant-based overlays.
 *
 * Educational/research visualization only - not for medical diagnosis or treatment.
 *
 * This graph structure is deterministic and stable - nodes, edges, and overlays
 * are sorted consistently for reproducible visualizations.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnatomyGraph {

    /**
     * List of anatomy nodes (systems, organs, substructures)
     */
    @JsonProperty("nodes")
    @Builder.Default
    private List<Node> nodes = new ArrayList<>();

    /**
     * List of edges connecting nodes in the hierarchy
     */
    @JsonProperty("edges")
    @Builder.Default
    private List<Edge> edges = new ArrayList<>();

    /**
     * List of overlays showing variant associations
     */
    @JsonProperty("overlays")
    @Builder.Default
    private List<Overlay> overlays = new ArrayList<>();

    /**
     * Sample ID this graph was generated from
     */
    @JsonProperty("sampleId")
    private Long sampleId;

    /**
     * Version of the mapping rules used
     */
    @JsonProperty("rulesVersion")
    private String rulesVersion;

    /**
     * Disclaimer for educational use
     */
    @JsonProperty("disclaimer")
    @Builder.Default
    private String disclaimer = "Educational/research visualization only. " +
            "Not for medical diagnosis, treatment decisions, or lifestyle recommendations. " +
            "All associations are labeled with evidence quality and represent " +
            "preliminary research findings that require validation.";

    /**
     * Sort all elements for deterministic output.
     * Call this before serializing to ensure consistent ordering.
     */
    public void sortAll() {
        if (nodes != null) {
            Collections.sort(nodes);
        }
        if (edges != null) {
            Collections.sort(edges);
        }
        if (overlays != null) {
            Collections.sort(overlays);
        }
    }

    /**
     * Add a node to the graph (idempotent - won't add duplicates)
     */
    public void addNode(Node node) {
        if (nodes == null) {
            nodes = new ArrayList<>();
        }
        if (!nodes.contains(node)) {
            nodes.add(node);
        }
    }

    /**
     * Add an edge to the graph (idempotent - won't add duplicates)
     */
    public void addEdge(Edge edge) {
        if (edges == null) {
            edges = new ArrayList<>();
        }
        if (!edges.contains(edge)) {
            edges.add(edge);
        }
    }

    /**
     * Add an overlay to the graph
     */
    public void addOverlay(Overlay overlay) {
        if (overlays == null) {
            overlays = new ArrayList<>();
        }
        // Allow multiple overlays for same node with different labels
        overlays.add(overlay);
    }

    /**
     * Get node by ID
     */
    public Node getNodeById(String nodeId) {
        if (nodes == null) return null;
        return nodes.stream()
                .filter(n -> n.getId().equals(nodeId))
                .findFirst()
                .orElse(null);
    }

    /**
     * Check if node exists
     */
    public boolean hasNode(String nodeId) {
        return getNodeById(nodeId) != null;
    }

    /**
     * Get overlay count for a specific node
     */
    public long getOverlayCountForNode(String nodeId) {
        if (overlays == null) return 0;
        return overlays.stream()
                .filter(o -> o.getTargetNodeId().equals(nodeId))
                .count();
    }
}
