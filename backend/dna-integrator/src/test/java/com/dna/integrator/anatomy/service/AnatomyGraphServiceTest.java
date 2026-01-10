package com.dna.integrator.anatomy.service;

import com.dna.integrator.anatomy.model.AnatomyGraph;
import com.dna.integrator.anatomy.model.Overlay;
import com.dna.integrator.anatomy.rules.RuleEngine;
import com.dna.integrator.model.SampleEntity;
import com.dna.integrator.model.VariantCallEntity;
import com.dna.integrator.repository.SampleRepository;
import com.dna.integrator.repository.VariantCallRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Golden-file tests for AnatomyGraphService.
 * Tests deterministic pipeline: variants -> anatomy graph
 *
 * Educational/research purposes only - not for medical diagnosis or treatment.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AnatomyGraphServiceTest {

    @Autowired
    private AnatomyGraphService anatomyGraphService;

    @Autowired
    private SampleRepository sampleRepository;

    @Autowired
    private VariantCallRepository variantCallRepository;

    @Autowired
    private RuleEngine ruleEngine;

    @Autowired
    private ObjectMapper objectMapper;

    private SampleEntity testSample;

    @BeforeEach
    void setUp() {
        // Clean database
        variantCallRepository.deleteAll();
        sampleRepository.deleteAll();

        // Ensure rules are loaded
        if (ruleEngine.getRuleConfig() == null) {
            ruleEngine.loadRules();
        }

        // Create test sample
        testSample = SampleEntity.builder()
                .userId("test-user")
                .fileHash("test-hash-golden")
                .importFormat("vcf")
                .parserVersion("1.0.0")
                .importedAt(LocalDateTime.now())
                .variantCount(0)
                .build();

        testSample = sampleRepository.save(testSample);
    }

    @Test
    @DisplayName("Golden file test: variant at chr1:15000 should generate cardiovascular overlay")
    void testGoldenFileGeneration() throws IOException {
        // Create test variant that matches demo_rule_001
        // (chromosome 1, position 10000-20000 -> cardiovascular_system)
        VariantCallEntity variant = createVariant("1", 15000L, "rs999999", "A", "G", null);

        // Generate anatomy graph
        AnatomyGraph graph = anatomyGraphService.generateAnatomyGraph(testSample.getId());

        // Verify basic structure
        assertNotNull(graph);
        assertEquals(testSample.getId(), graph.getSampleId());
        assertEquals("1.0.0", graph.getRulesVersion());

        // Verify nodes are present and sorted
        assertNotNull(graph.getNodes());
        assertEquals(9, graph.getNodes().size(), "Should have 9 base nodes");
        assertTrue(isSorted(graph.getNodes()), "Nodes should be sorted");

        // Verify edges are present and sorted
        assertNotNull(graph.getEdges());
        assertEquals(6, graph.getEdges().size(), "Should have 6 base edges");
        assertTrue(isSortedEdges(graph.getEdges()), "Edges should be sorted");

        // Verify overlay was generated
        assertNotNull(graph.getOverlays());
        assertEquals(1, graph.getOverlays().size(), "Should have 1 overlay");

        Overlay overlay = graph.getOverlays().get(0);
        assertEquals("cardiovascular_system", overlay.getTargetNodeId());
        assertEquals(0.6, overlay.getIntensity());
        assertEquals(Overlay.EvidenceLevel.LOW, overlay.getEvidence());
        assertEquals("Variant in genomic region associated with cardiovascular structure", overlay.getLabel());

        // Verify disclaimer
        assertNotNull(graph.getDisclaimer());
        assertTrue(graph.getDisclaimer().contains("Educational/research"));
    }

    @Test
    @DisplayName("Test deterministic ordering: same input always produces same output")
    void testDeterministicOrdering() {
        // Create multiple variants
        createVariant("1", 15000L, "rs001", "A", "G", null);
        createVariant("2", 50000L, "rs002", "C", "T", "0/1");
        createVariant("X", 100000L, "rs003", "G", "A", null);

        // Generate graph multiple times
        AnatomyGraph graph1 = anatomyGraphService.generateAnatomyGraph(testSample.getId());
        AnatomyGraph graph2 = anatomyGraphService.generateAnatomyGraph(testSample.getId());

        // Verify outputs are identical
        assertEquals(graph1.getNodes().size(), graph2.getNodes().size());
        assertEquals(graph1.getEdges().size(), graph2.getEdges().size());
        assertEquals(graph1.getOverlays().size(), graph2.getOverlays().size());

        // Verify ordering is consistent
        for (int i = 0; i < graph1.getNodes().size(); i++) {
            assertEquals(graph1.getNodes().get(i).getId(), graph2.getNodes().get(i).getId());
        }

        for (int i = 0; i < graph1.getOverlays().size(); i++) {
            assertEquals(graph1.getOverlays().get(i).getTargetNodeId(),
                        graph2.getOverlays().get(i).getTargetNodeId());
            assertEquals(graph1.getOverlays().get(i).getIntensity(),
                        graph2.getOverlays().get(i).getIntensity());
        }
    }

    @Test
    @DisplayName("Test chromosome normalization: chr1 and 1 should be treated the same")
    void testChromosomeNormalization() {
        // Create variant with "chr1" prefix
        createVariant("chr1", 15000L, "rs001", "A", "G", null);

        AnatomyGraph graph = anatomyGraphService.generateAnatomyGraph(testSample.getId());

        // Should match rule for chromosome "1"
        assertEquals(1, graph.getOverlays().size());
        assertEquals("cardiovascular_system", graph.getOverlays().get(0).getTargetNodeId());
    }

    @Test
    @DisplayName("Test specific rsID matching (demo_rule_002)")
    void testRsIdMatching() {
        // Create variant with specific rsID
        createVariant("5", 100000L, "rs1234567", "A", "G", null);

        AnatomyGraph graph = anatomyGraphService.generateAnatomyGraph(testSample.getId());

        // Should match rule for rs1234567 -> heart
        List<Overlay> overlays = graph.getOverlays();
        assertTrue(overlays.stream()
                .anyMatch(o -> o.getTargetNodeId().equals("heart")));
    }

    @Test
    @DisplayName("Test genotype pattern matching (demo_rule_004)")
    void testGenotypePatternMatching() {
        // Create heterozygous variant on chromosome 2
        createVariant("2", 50000L, "rs002", "C", "T", "0/1");

        AnatomyGraph graph = anatomyGraphService.generateAnatomyGraph(testSample.getId());

        // Should match rule for het on chr2 -> brain
        List<Overlay> overlays = graph.getOverlays();
        assertTrue(overlays.stream()
                .anyMatch(o -> o.getTargetNodeId().equals("brain")));
    }

    @Test
    @DisplayName("Test quality filtering (demo_rule_006)")
    void testQualityFiltering() {
        // Create high-quality variant on chromosome 12
        createVariant("12", 50000L, "rs003", "G", "A", null, 95.0);

        AnatomyGraph graph = anatomyGraphService.generateAnatomyGraph(testSample.getId());

        // Should match rule for qual >= 90 on chr12 -> liver
        List<Overlay> overlays = graph.getOverlays();
        assertTrue(overlays.stream()
                .anyMatch(o -> o.getTargetNodeId().equals("liver")));
    }

    @Test
    @DisplayName("Test multiple overlays on same node")
    void testMultipleOverlaysOnSameNode() {
        // Create two variants that both target cardiovascular_system
        createVariant("1", 15000L, "rs001", "A", "G", null);
        createVariant("1", 18000L, "rs002", "C", "T", null);

        AnatomyGraph graph = anatomyGraphService.generateAnatomyGraph(testSample.getId());

        // Should have 2 overlays on cardiovascular_system
        long cardiovascularOverlays = graph.getOverlays().stream()
                .filter(o -> o.getTargetNodeId().equals("cardiovascular_system"))
                .count();

        assertEquals(2, cardiovascularOverlays);
    }

    @Test
    @DisplayName("Test empty sample generates base graph only")
    void testEmptySample() {
        // No variants added

        AnatomyGraph graph = anatomyGraphService.generateAnatomyGraph(testSample.getId());

        // Should have base nodes and edges but no overlays
        assertEquals(9, graph.getNodes().size());
        assertEquals(6, graph.getEdges().size());
        assertEquals(0, graph.getOverlays().size());
    }

    @Test
    @DisplayName("Test graph statistics")
    void testGraphStatistics() {
        createVariant("1", 15000L, "rs001", "A", "G", null);  // LOW evidence
        createVariant("2", 50000L, "rs002", "C", "T", "0/1"); // MEDIUM evidence

        AnatomyGraph graph = anatomyGraphService.generateAnatomyGraph(testSample.getId());
        AnatomyGraphService.AnatomyGraphStats stats = anatomyGraphService.getGraphStats(graph);

        assertNotNull(stats);
        assertEquals(testSample.getId(), stats.getSampleId());
        assertEquals(9, stats.getNodeCount());
        assertEquals(6, stats.getEdgeCount());
        assertEquals(3, stats.getSystemCount());
        assertEquals(3, stats.getOrganCount());
        assertEquals(3, stats.getSubstructureCount());

        // Verify evidence counts
        assertTrue(stats.getLowEvidenceCount() > 0);
        assertTrue(stats.getMediumEvidenceCount() > 0);
    }

    /**
     * Helper method to create a variant
     */
    private VariantCallEntity createVariant(String chrom, Long pos, String rsid,
                                           String ref, String alt, String genotype) {
        return createVariant(chrom, pos, rsid, ref, alt, genotype, null);
    }

    private VariantCallEntity createVariant(String chrom, Long pos, String rsid,
                                           String ref, String alt, String genotype, Double qual) {
        VariantCallEntity variant = VariantCallEntity.builder()
                .sample(testSample)
                .chrom(chrom)
                .pos(pos)
                .rsid(rsid)
                .ref(ref)
                .alt(alt)
                .genotype(genotype)
                .qual(qual)
                .source("test")
                .build();

        return variantCallRepository.save(variant);
    }

    /**
     * Check if nodes are sorted
     */
    private boolean isSorted(List<?> list) {
        if (list == null || list.size() <= 1) return true;

        for (int i = 0; i < list.size() - 1; i++) {
            if (list.get(i) instanceof Comparable) {
                @SuppressWarnings("unchecked")
                Comparable<Object> current = (Comparable<Object>) list.get(i);
                if (current.compareTo(list.get(i + 1)) > 0) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Check if edges are sorted
     */
    private boolean isSortedEdges(List<?> list) {
        return isSorted(list);
    }
}
