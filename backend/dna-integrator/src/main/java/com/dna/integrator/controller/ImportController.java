package com.dna.integrator.controller;

import com.dna.integrator.dto.ImportResult;
import com.dna.integrator.dto.VariantCall;
import com.dna.integrator.model.GenomicData;
import com.dna.integrator.repository.GenomicDataRepository;
import com.dna.integrator.security.FileLifecycleManager;
import com.dna.integrator.security.FileSecurityUtil;
import com.dna.integrator.service.importer.GenotypeTSVImporter;
import com.dna.integrator.service.importer.VCFImporter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * REST controller for vendor-neutral genomic data imports.
 * Provides endpoints for importing VCF and generic TSV genotype files.
 *
 * Educational/research purposes only - not for medical diagnosis or treatment.
 */
@RestController
@RequestMapping("/api/import")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${security.allowed-origins}")
@Tag(name = "Import", description = "Vendor-neutral genomic data import endpoints")
public class ImportController {

    private final VCFImporter vcfImporter;
    private final GenotypeTSVImporter genotypeTSVImporter;
    private final GenomicDataRepository genomicDataRepository;
    private final FileLifecycleManager fileLifecycleManager;

    @PostMapping("/vcf")
    @Operation(summary = "Import VCF file",
               description = "Import genomic variants from a VCF (Variant Call Format) file. " +
                             "Supports both .vcf and .vcf.gz formats. " +
                             "Educational/research purposes only.")
    public ResponseEntity<ImportResult> importVCF(
            @Parameter(description = "VCF file to import", required = true)
            @RequestParam("file") MultipartFile file,

            @Parameter(description = "User ID", required = true)
            @RequestParam("userId") String userId,

            @Parameter(description = "Strict validation mode (default: true). " +
                                   "If true, import fails on first error. " +
                                   "If false, collects all errors and imports valid variants.")
            @RequestParam(value = "strictMode", defaultValue = "true") boolean strictMode) {

        log.info("Received VCF import request - user: {}, file: {}, size: {}, strict: {}",
                 userId, file.getOriginalFilename(), file.getSize(), strictMode);

        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ImportResult.builder()
                                .success(false)
                                .message("File is empty")
                                .importedVariantsCount(0)
                                .rejectedLinesCount(0)
                                .build());
            }

            // Sanitize filename for security
            String sanitizedFilename = FileSecurityUtil.sanitizeFilename(file.getOriginalFilename());
            log.info("SECURITY: Sanitized filename - original: {}, sanitized: {}",
                     file.getOriginalFilename(), sanitizedFilename);

            // Read file content once
            byte[] fileContent = file.getBytes();

            // Compute SHA-256 hash for integrity and deduplication
            String fileHash = FileSecurityUtil.computeSHA256(fileContent);
            log.info("SECURITY: Computed file hash - hash: {}, size: {} bytes",
                     fileHash, fileContent.length);

            // Import VCF
            ImportResult result = vcfImporter.importVCF(userId, fileContent, sanitizedFilename, strictMode);

            // Store variants in database if import was successful
            if (result.isSuccess() && !result.getVariants().isEmpty()) {
                List<GenomicData> genomicDataList = convertToGenomicData(result.getVariants(), userId, result);
                genomicDataRepository.saveAll(genomicDataList);
                log.info("Stored {} variants in database for user {}", genomicDataList.size(), userId);
            }

            // Handle file lifecycle (store or discard based on config)
            fileLifecycleManager.handleFileAfterImport(fileContent, sanitizedFilename, fileHash, userId);

            // Return appropriate HTTP status
            HttpStatus status = result.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status).body(result);

        } catch (IOException e) {
            log.error("IO error during VCF import for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ImportResult.builder()
                            .success(false)
                            .message("Error reading file: " + e.getMessage())
                            .importedVariantsCount(0)
                            .rejectedLinesCount(0)
                            .parserVersion("1.0.0")
                            .build());
        } catch (Exception e) {
            log.error("Unexpected error during VCF import for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ImportResult.builder()
                            .success(false)
                            .message("Unexpected error: " + e.getMessage())
                            .importedVariantsCount(0)
                            .rejectedLinesCount(0)
                            .parserVersion("1.0.0")
                            .build());
        }
    }

    @PostMapping("/genotype")
    @Operation(summary = "Import generic genotype file",
               description = "Import genomic variants from a generic TSV/CSV file with flexible column mapping. " +
                             "Supports various column names and formats. " +
                             "Required columns: chromosome, position, and either genotype OR allele1/allele2. " +
                             "Educational/research purposes only.")
    public ResponseEntity<ImportResult> importGenotype(
            @Parameter(description = "Genotype file to import (TSV or CSV)", required = true)
            @RequestParam("file") MultipartFile file,

            @Parameter(description = "User ID", required = true)
            @RequestParam("userId") String userId,

            @Parameter(description = "Strict validation mode (default: true). " +
                                   "If true, import fails on first error. " +
                                   "If false, collects all errors and imports valid variants.")
            @RequestParam(value = "strictMode", defaultValue = "true") boolean strictMode) {

        log.info("Received genotype import request - user: {}, file: {}, size: {}, strict: {}",
                 userId, file.getOriginalFilename(), file.getSize(), strictMode);

        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ImportResult.builder()
                                .success(false)
                                .message("File is empty")
                                .importedVariantsCount(0)
                                .rejectedLinesCount(0)
                                .build());
            }

            // Sanitize filename for security
            String sanitizedFilename = FileSecurityUtil.sanitizeFilename(file.getOriginalFilename());
            log.info("SECURITY: Sanitized filename - original: {}, sanitized: {}",
                     file.getOriginalFilename(), sanitizedFilename);

            // Read file content once
            byte[] fileContent = file.getBytes();

            // Compute SHA-256 hash for integrity and deduplication
            String fileHash = FileSecurityUtil.computeSHA256(fileContent);
            log.info("SECURITY: Computed file hash - hash: {}, size: {} bytes",
                     fileHash, fileContent.length);

            // Import genotype file
            ImportResult result = genotypeTSVImporter.importGenotypeTSV(userId, fileContent,
                                                                        sanitizedFilename, strictMode);

            // Store variants in database if import was successful
            if (result.isSuccess() && !result.getVariants().isEmpty()) {
                List<GenomicData> genomicDataList = convertToGenomicData(result.getVariants(), userId, result);
                genomicDataRepository.saveAll(genomicDataList);
                log.info("Stored {} variants in database for user {}", genomicDataList.size(), userId);
            }

            // Handle file lifecycle (store or discard based on config)
            fileLifecycleManager.handleFileAfterImport(fileContent, sanitizedFilename, fileHash, userId);

            // Return appropriate HTTP status
            HttpStatus status = result.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status).body(result);

        } catch (IOException e) {
            log.error("IO error during genotype import for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ImportResult.builder()
                            .success(false)
                            .message("Error reading file: " + e.getMessage())
                            .importedVariantsCount(0)
                            .rejectedLinesCount(0)
                            .parserVersion("1.0.0")
                            .build());
        } catch (Exception e) {
            log.error("Unexpected error during genotype import for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ImportResult.builder()
                            .success(false)
                            .message("Unexpected error: " + e.getMessage())
                            .importedVariantsCount(0)
                            .rejectedLinesCount(0)
                            .parserVersion("1.0.0")
                            .build());
        }
    }

    /**
     * Convert VariantCall DTOs to GenomicData entities for database storage
     */
    private List<GenomicData> convertToGenomicData(List<VariantCall> variants, String userId, ImportResult result) {
        List<GenomicData> genomicDataList = new ArrayList<>();

        for (VariantCall variant : variants) {
            GenomicData genomicData = GenomicData.builder()
                    .userId(userId)
                    .fileFormat(result.getMetadata().getImportFormat())
                    .uploadedAt(LocalDateTime.now())
                    .chromosome(variant.getChrom())
                    .position(variant.getPos())
                    .referenceAllele(variant.getRef())
                    .alternateAllele(variant.getAlt())
                    .quality(variant.getQuality())
                    .rawData(formatRawData(variant))
                    .parsedVariants(formatParsedVariants(variant))
                    .annotations(formatAnnotations(variant, result))
                    .build();

            genomicDataList.add(genomicData);
        }

        return genomicDataList;
    }

    /**
     * Format raw data string for storage
     */
    private String formatRawData(VariantCall variant) {
        return String.format("%s\t%d\t%s\t%s\t%s\t%s\t%s",
                variant.getChrom(),
                variant.getPos(),
                variant.getId() != null ? variant.getId() : ".",
                variant.getRef(),
                variant.getAlt(),
                variant.getQuality() != null ? variant.getQuality() : ".",
                variant.getGenotype() != null ? variant.getGenotype() : ".");
    }

    /**
     * Format parsed variants as JSON
     */
    private String formatParsedVariants(VariantCall variant) {
        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("\"chrom\":\"").append(variant.getChrom()).append("\",");
        json.append("\"pos\":").append(variant.getPos()).append(",");
        json.append("\"id\":").append(variant.getId() != null ? "\"" + variant.getId() + "\"" : "null").append(",");
        json.append("\"ref\":\"").append(variant.getRef()).append("\",");
        json.append("\"alt\":\"").append(variant.getAlt()).append("\",");
        json.append("\"genotype\":").append(variant.getGenotype() != null ? "\"" + variant.getGenotype() + "\"" : "null").append(",");
        json.append("\"quality\":").append(variant.getQuality() != null ? variant.getQuality() : "null");
        json.append("}");
        return json.toString();
    }

    /**
     * Format annotations including metadata
     */
    private String formatAnnotations(VariantCall variant, ImportResult result) {
        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("\"source\":\"").append(variant.getSource()).append("\",");
        json.append("\"parserVersion\":\"").append(result.getParserVersion()).append("\",");
        json.append("\"fileHash\":\"").append(result.getFileHash()).append("\",");
        json.append("\"originalFilename\":\"").append(result.getMetadata().getOriginalFilename()).append("\",");
        json.append("\"importedAt\":\"").append(result.getMetadata().getImportedAt()).append("\"");
        if (result.getMetadata().getGenomeBuild() != null) {
            json.append(",\"genomeBuild\":\"").append(result.getMetadata().getGenomeBuild()).append("\"");
        }
        json.append("}");
        return json.toString();
    }
}
