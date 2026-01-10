package com.dna.integrator.controller;

import com.dna.integrator.model.SampleEntity;
import com.dna.integrator.repository.SampleRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing genomic samples.
 *
 * Educational/research purposes only - not for medical use.
 */
@RestController
@RequestMapping("/api/samples")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${security.allowed-origins}")
@Tag(name = "Sample Management", description = "Manage imported genomic samples")
public class SampleController {

    private final SampleRepository sampleRepository;

    @GetMapping("/user/{userId}")
    @Operation(summary = "List user samples",
               description = "Retrieve all genomic samples for a specific user, " +
                             "ordered by import date (most recent first). " +
                             "Educational/research purposes only.")
    public ResponseEntity<List<SampleEntity>> listUserSamples(
            @Parameter(description = "User ID", required = true)
            @PathVariable String userId) {

        log.info("Fetching samples for user: {}", userId);

        List<SampleEntity> samples = sampleRepository.findByUserIdOrderByImportedAtDesc(userId);

        log.info("Found {} samples for user {}", samples.size(), userId);

        return ResponseEntity.ok(samples);
    }

    @GetMapping("/{sampleId}")
    @Operation(summary = "Get sample details",
               description = "Retrieve detailed information about a specific genomic sample. " +
                             "Educational/research purposes only.")
    public ResponseEntity<SampleEntity> getSample(
            @Parameter(description = "Sample ID", required = true)
            @PathVariable Long sampleId) {

        log.info("Fetching sample: {}", sampleId);

        return sampleRepository.findById(sampleId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{sampleId}")
    @Operation(summary = "Delete sample",
               description = "Delete a genomic sample and all associated variant calls. " +
                             "This action cannot be undone. " +
                             "Educational/research purposes only.")
    public ResponseEntity<Void> deleteSample(
            @Parameter(description = "Sample ID", required = true)
            @PathVariable Long sampleId) {

        log.info("Deleting sample: {}", sampleId);

        if (!sampleRepository.existsById(sampleId)) {
            return ResponseEntity.notFound().build();
        }

        sampleRepository.deleteById(sampleId);

        log.info("Successfully deleted sample: {}", sampleId);

        return ResponseEntity.noContent().build();
    }
}
