package com.dna.integrator.anatomy.controller;

import com.dna.integrator.anatomy.model.AnatomyGraph;
import com.dna.integrator.anatomy.service.AnatomyGraphService;
import com.dna.integrator.common.SafeAPIResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for generating anatomy graphs from genomic variant data.
 *
 * Educational/research visualization only - not for medical diagnosis or treatment.
 */
@RestController
@RequestMapping("/api/anatomygraph")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${security.allowed-origins}")
@Tag(name = "Anatomy Graph", description = "Variant-to-anatomy visualization endpoints")
public class AnatomyGraphController {

    private final AnatomyGraphService anatomyGraphService;

    @GetMapping("/{sampleId}")
    @Operation(summary = "Generate anatomy graph for sample",
               description = "Generate a render-ready anatomy graph from genomic variants. " +
                             "The graph contains nodes (anatomical structures), edges (relationships), " +
                             "and overlays (variant associations with evidence levels). " +
                             "Output is deterministic and sorted for reproducibility. " +
                             "Educational/research purposes only - not for medical diagnosis or treatment.")
    public ResponseEntity<SafeAPIResponse<AnatomyGraph>> getAnatomyGraph(
            @Parameter(description = "Sample ID", required = true)
            @PathVariable Long sampleId) {

        log.info("Received request for anatomy graph - sample ID: {}", sampleId);

        AnatomyGraph graph = anatomyGraphService.generateAnatomyGraph(sampleId);

        log.info("Successfully generated anatomy graph for sample {} - {} overlays",
                 sampleId, graph.getOverlays().size());

        // Wrap in SafeAPIResponse with disclaimer and safety fields
        SafeAPIResponse<AnatomyGraph> response = SafeAPIResponse.ofEvidenceLabeled(graph);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{sampleId}/stats")
    @Operation(summary = "Get anatomy graph statistics",
               description = "Get summary statistics about the generated anatomy graph " +
                             "without returning the full graph data. Useful for UI previews. " +
                             "Educational/research purposes only.")
    public ResponseEntity<SafeAPIResponse<AnatomyGraphService.AnatomyGraphStats>> getGraphStats(
            @Parameter(description = "Sample ID", required = true)
            @PathVariable Long sampleId) {

        log.info("Received request for anatomy graph stats - sample ID: {}", sampleId);

        AnatomyGraph graph = anatomyGraphService.generateAnatomyGraph(sampleId);
        AnatomyGraphService.AnatomyGraphStats stats = anatomyGraphService.getGraphStats(graph);

        log.info("Generated stats for sample {}: {} overlays ({} high, {} medium, {} low evidence)",
                 sampleId, stats.getOverlayCount(),
                 stats.getHighEvidenceCount(), stats.getMediumEvidenceCount(), stats.getLowEvidenceCount());

        // Wrap in SafeAPIResponse with disclaimer and safety fields
        SafeAPIResponse<AnatomyGraphService.AnatomyGraphStats> response = SafeAPIResponse.ofEvidenceLabeled(stats);

        return ResponseEntity.ok(response);
    }
}
