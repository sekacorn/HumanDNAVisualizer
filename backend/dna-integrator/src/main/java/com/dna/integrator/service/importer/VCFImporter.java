package com.dna.integrator.service.importer;

import com.dna.integrator.dto.ImportResult;
import com.dna.integrator.dto.SampleMetadata;
import com.dna.integrator.dto.VariantCall;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.GZIPInputStream;

/**
 * Vendor-neutral VCF (Variant Call Format) file importer.
 * Supports both .vcf and .vcf.gz formats.
 *
 * Educational/research purposes only - not for medical diagnosis or treatment.
 *
 * VCF Format Specification: https://samtools.github.io/hts-specs/VCFv4.2.pdf
 *
 * Parses standard VCF columns:
 * #CHROM  POS     ID      REF     ALT     QUAL    FILTER  INFO    FORMAT  [SAMPLE...]
 *
 * @version 1.0.0
 */
@Service
@Slf4j
public class VCFImporter {

    private static final String PARSER_VERSION = "1.0.0";
    private static final int MIN_VCF_COLUMNS = 8; // Minimum columns in VCF format

    /**
     * Import VCF file with strict validation (default mode)
     */
    public ImportResult importVCF(String userId, byte[] fileContent, String filename) {
        return importVCF(userId, fileContent, filename, true);
    }

    /**
     * Import VCF file with configurable validation mode
     *
     * @param userId User identifier
     * @param fileContent Raw file bytes
     * @param filename Original filename
     * @param strictMode If true, fails on any parsing error; if false, collects errors and continues
     * @return Import result with statistics and errors
     */
    public ImportResult importVCF(String userId, byte[] fileContent, String filename, boolean strictMode) {
        log.info("Starting VCF import for user {} - file: {} ({} bytes), strict mode: {}",
                 userId, filename, fileContent.length, strictMode);

        List<VariantCall> variants = new ArrayList<>();
        List<ImportResult.ValidationError> errors = new ArrayList<>();
        String genomeBuild = null;
        int lineNumber = 0;
        int rejectedLines = 0;

        try {
            // Calculate file hash
            String fileHash = calculateSHA256(fileContent);

            // Determine if file is gzipped
            boolean isGzipped = filename != null && filename.endsWith(".gz");

            // Create appropriate input stream
            InputStream inputStream = new ByteArrayInputStream(fileContent);
            if (isGzipped) {
                inputStream = new GZIPInputStream(inputStream);
            }

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {

                String line;
                while ((line = reader.readLine()) != null) {
                    lineNumber++;

                    // Skip empty lines
                    if (line.trim().isEmpty()) {
                        continue;
                    }

                    // Parse header lines to extract metadata
                    if (line.startsWith("##")) {
                        if (line.startsWith("##reference=") || line.startsWith("##genome_build=")) {
                            genomeBuild = extractGenomeBuild(line);
                        }
                        continue;
                    }

                    // Skip column header line
                    if (line.startsWith("#CHROM")) {
                        continue;
                    }

                    // Skip non-data lines
                    if (line.startsWith("#")) {
                        continue;
                    }

                    // Parse data line
                    try {
                        VariantCall variant = parseVCFLine(line, lineNumber);
                        variants.add(variant);
                    } catch (Exception e) {
                        rejectedLines++;
                        ImportResult.ValidationError error = ImportResult.ValidationError.builder()
                                .lineNumber(lineNumber)
                                .errorMessage(e.getMessage())
                                .lineContent(line.length() > 100 ? line.substring(0, 100) + "..." : line)
                                .build();
                        errors.add(error);

                        log.debug("Error parsing VCF line {}: {}", lineNumber, e.getMessage());

                        // In strict mode, stop on first error
                        if (strictMode && !errors.isEmpty()) {
                            break;
                        }
                    }
                }
            }

            // Build metadata
            SampleMetadata metadata = SampleMetadata.builder()
                    .genomeBuild(genomeBuild)
                    .importFormat(isGzipped ? "vcf.gz" : "vcf")
                    .fileHash(fileHash)
                    .parserVersion(PARSER_VERSION)
                    .importedAt(LocalDateTime.now())
                    .originalFilename(filename)
                    .fileSizeBytes((long) fileContent.length)
                    .userId(userId)
                    .build();

            // Build result
            boolean success = !variants.isEmpty() && (!strictMode || errors.isEmpty());
            String message = buildResultMessage(variants.size(), rejectedLines, strictMode, errors);

            ImportResult result = ImportResult.builder()
                    .importedVariantsCount(variants.size())
                    .rejectedLinesCount(rejectedLines)
                    .fileHash(fileHash)
                    .parserVersion(PARSER_VERSION)
                    .metadata(metadata)
                    .errors(errors)
                    .success(success)
                    .message(message)
                    .variants(variants)
                    .build();

            log.info("VCF import completed for user {} - imported: {}, rejected: {}, success: {}",
                     userId, variants.size(), rejectedLines, success);

            return result;

        } catch (IOException e) {
            log.error("IO error during VCF import for user {}: {}", userId, e.getMessage(), e);
            return ImportResult.builder()
                    .importedVariantsCount(0)
                    .rejectedLinesCount(lineNumber)
                    .parserVersion(PARSER_VERSION)
                    .errors(List.of(ImportResult.ValidationError.builder()
                            .lineNumber(lineNumber)
                            .errorMessage("IO Error: " + e.getMessage())
                            .build()))
                    .success(false)
                    .message("Failed to read VCF file: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Parse a single VCF data line into a VariantCall
     */
    private VariantCall parseVCFLine(String line, int lineNumber) {
        String[] fields = line.split("\t");

        if (fields.length < MIN_VCF_COLUMNS) {
            throw new IllegalArgumentException(
                    String.format("Invalid VCF line: expected at least %d columns, got %d",
                                  MIN_VCF_COLUMNS, fields.length));
        }

        // Parse required columns
        String chrom = fields[0].trim();
        String posStr = fields[1].trim();
        String id = fields[2].trim();
        String ref = fields[3].trim();
        String alt = fields[4].trim();
        String qualStr = fields[5].trim();

        // Validate chromosome
        if (chrom.isEmpty()) {
            throw new IllegalArgumentException("Chromosome (CHROM) cannot be empty");
        }

        // Validate and parse position
        Long pos;
        try {
            pos = Long.parseLong(posStr);
            if (pos <= 0) {
                throw new IllegalArgumentException("Position (POS) must be positive");
            }
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid position (POS): " + posStr);
        }

        // Validate alleles
        if (ref.isEmpty() || ref.equals(".")) {
            throw new IllegalArgumentException("Reference allele (REF) cannot be empty or '.'");
        }
        if (alt.isEmpty()) {
            throw new IllegalArgumentException("Alternate allele (ALT) cannot be empty");
        }

        // Parse quality (optional)
        Double quality = null;
        if (!qualStr.equals(".")) {
            try {
                quality = Double.parseDouble(qualStr);
            } catch (NumberFormatException e) {
                log.debug("Could not parse quality score '{}' at line {}", qualStr, lineNumber);
            }
        }

        // Extract genotype from FORMAT/SAMPLE columns (if present)
        String genotype = null;
        if (fields.length >= 10) {
            String format = fields[8].trim();
            String sample = fields[9].trim();
            genotype = extractGenotype(format, sample);
        }

        // Use ID field if available, otherwise null
        String variantId = (id.equals(".") || id.isEmpty()) ? null : id;

        return VariantCall.builder()
                .chrom(chrom)
                .pos(pos)
                .id(variantId)
                .ref(ref)
                .alt(alt)
                .genotype(genotype)
                .quality(quality)
                .source("vcf")
                .lineNumber(lineNumber)
                .build();
    }

    /**
     * Extract genotype from FORMAT and SAMPLE fields
     * Looks for GT (genotype) field in FORMAT column
     */
    private String extractGenotype(String format, String sample) {
        String[] formatFields = format.split(":");
        String[] sampleFields = sample.split(":");

        if (formatFields.length != sampleFields.length) {
            return null;
        }

        for (int i = 0; i < formatFields.length; i++) {
            if (formatFields[i].equals("GT")) {
                return sampleFields[i];
            }
        }

        return null;
    }

    /**
     * Extract genome build from VCF header metadata
     */
    private String extractGenomeBuild(String headerLine) {
        // ##reference=GRCh38
        // ##genome_build=hg19
        int equalsIndex = headerLine.indexOf('=');
        if (equalsIndex > 0 && equalsIndex < headerLine.length() - 1) {
            return headerLine.substring(equalsIndex + 1).trim();
        }
        return null;
    }

    /**
     * Build result message based on import statistics
     */
    private String buildResultMessage(int imported, int rejected, boolean strictMode,
                                     List<ImportResult.ValidationError> errors) {
        if (strictMode && !errors.isEmpty()) {
            return String.format("Import failed in strict mode: %d error(s) found", errors.size());
        }

        if (imported == 0) {
            return "No variants imported. Please check file format.";
        }

        if (rejected == 0) {
            return String.format("Successfully imported %d variants", imported);
        }

        return String.format("Imported %d variants, rejected %d lines with errors", imported, rejected);
    }

    /**
     * Calculate SHA-256 hash of file content
     */
    private String calculateSHA256(byte[] content) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(content);
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            log.error("SHA-256 algorithm not available", e);
            return "hash_unavailable";
        }
    }

}
