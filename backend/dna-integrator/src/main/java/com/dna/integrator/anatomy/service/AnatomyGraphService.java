package com.dna.integrator.anatomy.service;

import com.dna.integrator.anatomy.model.AnatomyGraph;
import com.dna.integrator.anatomy.model.Edge;
import com.dna.integrator.anatomy.model.Node;
import com.dna.integrator.anatomy.model.Overlay;
import com.dna.integrator.anatomy.rules.MappingRuleConfig;
import com.dna.integrator.anatomy.rules.RuleEngine;
import com.dna.integrator.exception.ResourceNotFoundException;
import com.dna.integrator.model.SampleEntity;
import com.dna.integrator.model.VariantCallEntity;
import com.dna.integrator.repository.SampleRepository;
import com.dna.integrator.repository.VariantCallRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Service for generating anatomy graphs from genomic variant data.
 *
 * Educational/research purposes only - not for medical diagnosis or treatment.
 *
 * This service implements a deterministic pipeline:
 * 1. Load canonical variant calls for a sample
 * 2. Normalize/clean variant data
 * 3. Apply mapping rules to generate overlays
 * 4. Produce sorted, stable AnatomyGraph output
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AnatomyGraphService {

    private final SampleRepository sampleRepository;
    private final VariantCallRepository variantCallRepository;
    private final RuleEngine ruleEngine;

    /**
     * Generate an anatomy graph for a given sample ID.
     *
     * @param sampleId The sample ID to process
     * @return Render-ready AnatomyGraph with nodes, edges, and overlays
     * @throws ResourceNotFoundException if sample not found
     */
    public AnatomyGraph generateAnatomyGraph(Long sampleId) {
        log.info("Generating anatomy graph for sample {}", sampleId);

        // Step 1: Verify sample exists and load metadata
        SampleEntity sample = sampleRepository.findById(sampleId)
                .orElseThrow(() -> new ResourceNotFoundException("Sample not found with ID: " + sampleId));

        log.debug("Sample {} found: {} variants", sampleId, sample.getVariantCount());

        // Step 2: Load base anatomy structure from rules config
        AnatomyGraph graph = initializeBaseGraph(sampleId);

        // Step 3: Load canonical variant calls
        List<VariantCallEntity> variants = variantCallRepository.findBySampleId(sampleId);
        log.debug("Loaded {} variant calls", variants.size());

        // Step 4: Normalize and process variants
        List<VariantCallEntity> normalizedVariants = normalizeVariants(variants);

        // Step 5: Apply rules to generate overlays
        List<Overlay> overlays = generateOverlays(normalizedVariants);
        log.debug("Generated {} overlays from {} variants", overlays.size(), normalizedVariants.size());

        // Step 6: Add overlays to graph
        overlays.forEach(graph::addOverlay);

        // Step 7: Sort all elements for deterministic output
        graph.sortAll();

        log.info("Anatomy graph generated for sample {}: {} nodes, {} edges, {} overlays",
                 sampleId, graph.getNodes().size(), graph.getEdges().size(), graph.getOverlays().size());

        return graph;
    }

    /**
     * Initialize the base anatomy graph structure from rules configuration
     */
    private AnatomyGraph initializeBaseGraph(Long sampleId) {
        MappingRuleConfig config = ruleEngine.getRuleConfig();

        AnatomyGraph graph = AnatomyGraph.builder()
                .sampleId(sampleId)
                .rulesVersion(config.getVersion())
                .build();

        // Add base nodes
        if (config.getBaseAnatomyGraph() != null &&
            config.getBaseAnatomyGraph().getNodes() != null) {
            config.getBaseAnatomyGraph().getNodes().forEach(graph::addNode);
        }

        // Add base edges
        if (config.getBaseAnatomyGraph() != null &&
            config.getBaseAnatomyGraph().getEdges() != null) {
            config.getBaseAnatomyGraph().getEdges().forEach(graph::addEdge);
        }

        return graph;
    }

    /**
     * Normalize variant data for consistent processing.
     * Currently handles:
     * - Chromosome naming standardization (chr1 -> 1, chrX -> X)
     * - Null value handling
     */
    private List<VariantCallEntity> normalizeVariants(List<VariantCallEntity> variants) {
        List<VariantCallEntity> normalized = new ArrayList<>();

        for (VariantCallEntity variant : variants) {
            // Create a normalized copy to avoid modifying the original entity
            VariantCallEntity normalizedVariant = VariantCallEntity.builder()
                    .id(variant.getId())
                    .sample(variant.getSample())
                    .chrom(normalizeChromosome(variant.getChrom()))
                    .pos(variant.getPos())
                    .rsid(variant.getRsid())
                    .ref(variant.getRef())
                    .alt(variant.getAlt())
                    .genotype(variant.getGenotype())
                    .qual(variant.getQual())
                    .filter(variant.getFilter())
                    .lineNumber(variant.getLineNumber())
                    .source(variant.getSource())
                    .annotations(variant.getAnnotations())
                    .build();

            normalized.add(normalizedVariant);
        }

        return normalized;
    }

    /**
     * Normalize chromosome naming (remove "chr" prefix, standardize case)
     */
    private String normalizeChromosome(String chrom) {
        if (chrom == null) return "";

        String normalized = chrom.trim().toUpperCase();

        // Remove "CHR" prefix if present
        if (normalized.startsWith("CHR")) {
            normalized = normalized.substring(3);
        }

        return normalized;
    }

    /**
     * Generate overlays by applying rules to all variants
     */
    private List<Overlay> generateOverlays(List<VariantCallEntity> variants) {
        List<Overlay> allOverlays = new ArrayList<>();

        for (VariantCallEntity variant : variants) {
            List<Overlay> variantOverlays = ruleEngine.applyRules(variant);
            allOverlays.addAll(variantOverlays);
        }

        return allOverlays;
    }

    /**
     * Get summary statistics for a generated graph
     */
    public AnatomyGraphStats getGraphStats(AnatomyGraph graph) {
        return AnatomyGraphStats.builder()
                .sampleId(graph.getSampleId())
                .nodeCount(graph.getNodes().size())
                .edgeCount(graph.getEdges().size())
                .overlayCount(graph.getOverlays().size())
                .systemCount(countNodesByType(graph, Node.NodeType.SYSTEM))
                .organCount(countNodesByType(graph, Node.NodeType.ORGAN))
                .substructureCount(countNodesByType(graph, Node.NodeType.SUBSTRUCTURE))
                .highEvidenceCount(countOverlaysByEvidence(graph, Overlay.EvidenceLevel.HIGH))
                .mediumEvidenceCount(countOverlaysByEvidence(graph, Overlay.EvidenceLevel.MEDIUM))
                .lowEvidenceCount(countOverlaysByEvidence(graph, Overlay.EvidenceLevel.LOW))
                .build();
    }

    private long countNodesByType(AnatomyGraph graph, Node.NodeType type) {
        return graph.getNodes().stream()
                .filter(n -> n.getType() == type)
                .count();
    }

    private long countOverlaysByEvidence(AnatomyGraph graph, Overlay.EvidenceLevel level) {
        return graph.getOverlays().stream()
                .filter(o -> o.getEvidence() == level)
                .count();
    }

    /**
     * Statistics about a generated anatomy graph
     */
    @lombok.Data
    @lombok.Builder
    public static class AnatomyGraphStats {
        private Long sampleId;
        private int nodeCount;
        private int edgeCount;
        private int overlayCount;
        private long systemCount;
        private long organCount;
        private long substructureCount;
        private long highEvidenceCount;
        private long mediumEvidenceCount;
        private long lowEvidenceCount;
    }
}
