package com.dna.integrator.anatomy.rules;

import com.dna.integrator.anatomy.model.Edge;
import com.dna.integrator.anatomy.model.Node;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Configuration for variant-to-anatomy mapping rules.
 * Loaded from JSON configuration file.
 *
 * Educational/research purposes only - not for medical diagnosis or treatment.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MappingRuleConfig {

    @JsonProperty("version")
    private String version;

    @JsonProperty("description")
    private String description;

    @JsonProperty("disclaimer")
    private String disclaimer;

    @JsonProperty("baseAnatomyGraph")
    private BaseAnatomyGraph baseAnatomyGraph;

    @JsonProperty("mappingRules")
    @Builder.Default
    private List<MappingRule> mappingRules = new ArrayList<>();

    /**
     * Base anatomy graph structure (nodes and edges)
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BaseAnatomyGraph {
        @JsonProperty("nodes")
        private List<Node> nodes = new ArrayList<>();

        @JsonProperty("edges")
        private List<Edge> edges = new ArrayList<>();
    }

    /**
     * Individual mapping rule
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MappingRule {
        @JsonProperty("ruleId")
        private String ruleId;

        @JsonProperty("description")
        private String description;

        @JsonProperty("conditions")
        private RuleConditions conditions;

        @JsonProperty("outcome")
        private RuleOutcome outcome;
    }

    /**
     * Conditions that must be met for a rule to apply
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RuleConditions {
        /**
         * Exact chromosome match (e.g., "1", "X", "MT")
         */
        @JsonProperty("chrom")
        private String chrom;

        /**
         * Exact rsID match (e.g., "rs1234567")
         */
        @JsonProperty("rsid")
        private String rsid;

        /**
         * Position range (inclusive)
         */
        @JsonProperty("positionRange")
        private PositionRange positionRange;

        /**
         * Regex pattern for genotype matching
         */
        @JsonProperty("genotypePattern")
        private String genotypePattern;

        /**
         * Minimum quality score
         */
        @JsonProperty("qualityMin")
        private Double qualityMin;
    }

    /**
     * Position range for rule matching
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PositionRange {
        @JsonProperty("min")
        private Long min;

        @JsonProperty("max")
        private Long max;
    }

    /**
     * Outcome when rule conditions are met
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RuleOutcome {
        /**
         * Target anatomy node ID
         */
        @JsonProperty("targetNodeId")
        private String targetNodeId;

        /**
         * Overlay intensity (0.0 to 1.0)
         */
        @JsonProperty("intensity")
        private Double intensity;

        /**
         * Display label for the overlay
         */
        @JsonProperty("label")
        private String label;

        /**
         * Evidence level (HIGH, MEDIUM, LOW)
         */
        @JsonProperty("evidence")
        private String evidence;

        /**
         * Source references
         */
        @JsonProperty("sources")
        private List<String> sources = new ArrayList<>();
    }
}
