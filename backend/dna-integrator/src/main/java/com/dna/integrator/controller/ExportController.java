package com.dna.integrator.controller;

import com.dna.integrator.dto.CanonicalSampleExport;
import com.dna.integrator.exception.ResourceNotFoundException;
import com.dna.integrator.model.SampleEntity;
import com.dna.integrator.model.VariantCallEntity;
import com.dna.integrator.repository.SampleRepository;
import com.dna.integrator.repository.VariantCallRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for exporting genomic data in canonical format.
 *
 * Educational/research purposes only - not for medical diagnosis or treatment.
 */
@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${security.allowed-origins}")
@Tag(name = "Export", description = "Canonical data export endpoints")
public class ExportController {

    private final SampleRepository sampleRepository;
    private final VariantCallRepository variantCallRepository;

    private static final String EXPORT_VERSION = "1.0.0";
    private static final String DISCLAIMER = "Educational/research purposes only - " +
            "not for medical diagnosis, treatment, or lifestyle recommendations";

    @GetMapping("/sample/{sampleId}")
    @Operation(summary = "Export sample in canonical format",
               description = "Export a genomic sample with all variant calls in canonical JSON format. " +
                             "This format is suitable for UI display, processing pipelines, and data export. " +
                             "Educational/research purposes only.")
    public ResponseEntity<CanonicalSampleExport> exportSample(
            @Parameter(description = "Sample ID", required = true)
            @PathVariable Long sampleId,

            @Parameter(description = "Include all variants (default: true). Set to false for metadata only.")
            @RequestParam(value = "includeVariants", defaultValue = "true") boolean includeVariants,

            @Parameter(description = "Maximum number of variants to include (default: all). " +
                                   "Use for large samples to limit response size.")
            @RequestParam(value = "maxVariants", required = false) Integer maxVariants) {

        log.info("Exporting sample {} - includeVariants: {}, maxVariants: {}",
                 sampleId, includeVariants, maxVariants);

        // Fetch sample
        SampleEntity sample = sampleRepository.findById(sampleId)
                .orElseThrow(() -> new ResourceNotFoundException("Sample not found with ID: " + sampleId));

        // Build sample info
        CanonicalSampleExport.SampleInfo sampleInfo = CanonicalSampleExport.SampleInfo.builder()
                .id(sample.getId())
                .userId(sample.getUserId())
                .fileHash(sample.getFileHash())
                .importFormat(sample.getImportFormat())
                .genomeBuild(sample.getGenomeBuild())
                .parserVersion(sample.getParserVersion())
                .importedAt(sample.getImportedAt())
                .originalFilename(sample.getOriginalFilename())
                .fileSizeBytes(sample.getFileSizeBytes())
                .variantCount(sample.getVariantCount())
                .rejectedLineCount(sample.getRejectedLineCount())
                .importStatus(sample.getImportStatus())
                .build();

        // Fetch variants if requested
        List<CanonicalSampleExport.VariantInfo> variants = List.of();
        int totalVariants = 0;

        if (includeVariants) {
            List<VariantCallEntity> variantEntities;

            if (maxVariants != null && maxVariants > 0) {
                // Fetch limited number of variants
                Pageable pageable = PageRequest.of(0, maxVariants);
                Page<VariantCallEntity> page = variantCallRepository.findBySampleId(sampleId, pageable);
                variantEntities = page.getContent();
                totalVariants = (int) page.getTotalElements();
            } else {
                // Fetch all variants
                variantEntities = variantCallRepository.findBySampleId(sampleId);
                totalVariants = variantEntities.size();
            }

            variants = variantEntities.stream()
                    .map(this::convertToVariantInfo)
                    .collect(Collectors.toList());
        } else {
            totalVariants = sample.getVariantCount();
        }

        // Build export metadata
        CanonicalSampleExport.ExportMetadata exportMetadata = CanonicalSampleExport.ExportMetadata.builder()
                .exportedAt(LocalDateTime.now())
                .exportVersion(EXPORT_VERSION)
                .exportFormat("canonical_json")
                .totalVariants(totalVariants)
                .disclaimer(DISCLAIMER)
                .build();

        // Build canonical export
        CanonicalSampleExport export = CanonicalSampleExport.builder()
                .sample(sampleInfo)
                .variants(variants)
                .exportMetadata(exportMetadata)
                .build();

        log.info("Successfully exported sample {} with {} variants", sampleId, variants.size());

        return ResponseEntity.ok(export);
    }

    @GetMapping("/sample/{sampleId}/variants")
    @Operation(summary = "Export sample variants only",
               description = "Export just the variant calls for a sample, without sample metadata. " +
                             "Supports pagination for large datasets. " +
                             "Educational/research purposes only.")
    public ResponseEntity<List<CanonicalSampleExport.VariantInfo>> exportVariants(
            @Parameter(description = "Sample ID", required = true)
            @PathVariable Long sampleId,

            @Parameter(description = "Page number (0-indexed)")
            @RequestParam(value = "page", defaultValue = "0") int page,

            @Parameter(description = "Page size")
            @RequestParam(value = "size", defaultValue = "1000") int size,

            @Parameter(description = "Filter by chromosome")
            @RequestParam(value = "chrom", required = false) String chrom) {

        log.info("Exporting variants for sample {} - page: {}, size: {}, chrom: {}",
                 sampleId, page, size, chrom);

        // Verify sample exists
        if (!sampleRepository.existsById(sampleId)) {
            throw new ResourceNotFoundException("Sample not found with ID: " + sampleId);
        }

        // Fetch variants
        Pageable pageable = PageRequest.of(page, size);
        Page<VariantCallEntity> variantPage;

        if (chrom != null && !chrom.isEmpty()) {
            variantPage = variantCallRepository.findBySampleIdAndChrom(sampleId, chrom, pageable);
        } else {
            variantPage = variantCallRepository.findBySampleId(sampleId, pageable);
        }

        List<CanonicalSampleExport.VariantInfo> variants = variantPage.getContent().stream()
                .map(this::convertToVariantInfo)
                .collect(Collectors.toList());

        log.info("Successfully exported {} variants (page {}/{})",
                 variants.size(), page, variantPage.getTotalPages());

        return ResponseEntity.ok(variants);
    }

    @GetMapping("/sample/{sampleId}/chromosomes")
    @Operation(summary = "Get chromosomes present in sample",
               description = "Returns list of all chromosomes that have variant calls in this sample. " +
                             "Educational/research purposes only.")
    public ResponseEntity<List<String>> getChromosomes(
            @Parameter(description = "Sample ID", required = true)
            @PathVariable Long sampleId) {

        log.info("Fetching chromosomes for sample {}", sampleId);

        // Verify sample exists
        if (!sampleRepository.existsById(sampleId)) {
            throw new ResourceNotFoundException("Sample not found with ID: " + sampleId);
        }

        List<String> chromosomes = variantCallRepository.findAllChromosomesForSample(sampleId);

        log.info("Sample {} has variants on {} chromosomes", sampleId, chromosomes.size());

        return ResponseEntity.ok(chromosomes);
    }

    /**
     * Convert VariantCallEntity to VariantInfo DTO
     */
    private CanonicalSampleExport.VariantInfo convertToVariantInfo(VariantCallEntity entity) {
        return CanonicalSampleExport.VariantInfo.builder()
                .id(entity.getId())
                .chrom(entity.getChrom())
                .pos(entity.getPos())
                .rsid(entity.getRsid())
                .ref(entity.getRef())
                .alt(entity.getAlt())
                .genotype(entity.getGenotype())
                .qual(entity.getQual())
                .filter(entity.getFilter())
                .source(entity.getSource())
                .build();
    }
}
