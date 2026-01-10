package com.dna.integrator.service.importer;

import com.dna.integrator.dto.ImportResult;
import com.dna.integrator.dto.SampleMetadata;
import com.dna.integrator.dto.VariantCall;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Vendor-neutral generic TSV/CSV importer for genotype data.
 * Supports flexible column mapping for rsID, chromosome, position, genotype, and alleles.
 *
 * Educational/research purposes only - not for medical diagnosis or treatment.
 *
 * Expected formats (flexible column order):
 * - rsid, chromosome, position, genotype
 * - rsid, chromosome, position, allele1, allele2
 * - name, chromosome, position, genotype
 *
 * Supports both tab-separated and comma-separated files.
 *
 * @version 1.0.0
 */
@Service
@Slf4j
public class GenotypeTSVImporter {

    private static final String PARSER_VERSION = "1.0.0";

    // Required column names (case-insensitive, with common variations)
    private static final Set<String> RSID_COLUMNS = Set.of("rsid", "rs", "snp", "variant", "id", "name");
    private static final Set<String> CHROM_COLUMNS = Set.of("chromosome", "chrom", "chr");
    private static final Set<String> POS_COLUMNS = Set.of("position", "pos", "location");
    private static final Set<String> GENOTYPE_COLUMNS = Set.of("genotype", "alleles", "result");
    private static final Set<String> ALLELE1_COLUMNS = Set.of("allele1", "allele_1", "a1");
    private static final Set<String> ALLELE2_COLUMNS = Set.of("allele2", "allele_2", "a2");

    /**
     * Import genotype TSV/CSV file with strict validation (default mode)
     */
    public ImportResult importGenotypeTSV(String userId, byte[] fileContent, String filename) {
        return importGenotypeTSV(userId, fileContent, filename, true);
    }

    /**
     * Import genotype TSV/CSV file with configurable validation mode
     *
     * @param userId User identifier
     * @param fileContent Raw file bytes
     * @param filename Original filename
     * @param strictMode If true, fails on any parsing error; if false, collects errors and continues
     * @return Import result with statistics and errors
     */
    public ImportResult importGenotypeTSV(String userId, byte[] fileContent, String filename, boolean strictMode) {
        log.info("Starting genotype TSV import for user {} - file: {} ({} bytes), strict mode: {}",
                 userId, filename, fileContent.length, strictMode);

        List<VariantCall> variants = new ArrayList<>();
        List<ImportResult.ValidationError> errors = new ArrayList<>();
        int lineNumber = 0;
        int rejectedLines = 0;

        try {
            // Calculate file hash
            String fileHash = calculateSHA256(fileContent);

            // Detect delimiter
            String delimiter = detectDelimiter(fileContent);
            log.debug("Detected delimiter: '{}'", delimiter);

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(new ByteArrayInputStream(fileContent), StandardCharsets.UTF_8))) {

                String line;
                String[] headers = null;
                ColumnMapping columnMapping = null;

                while ((line = reader.readLine()) != null) {
                    lineNumber++;

                    // Skip empty lines
                    if (line.trim().isEmpty()) {
                        continue;
                    }

                    // Skip comment lines
                    if (line.startsWith("#")) {
                        continue;
                    }

                    // Parse header line
                    if (headers == null) {
                        headers = parseLine(line, delimiter);
                        columnMapping = mapColumns(headers);

                        // Validate required columns
                        List<String> missingColumns = validateRequiredColumns(columnMapping);
                        if (!missingColumns.isEmpty()) {
                            String errorMsg = "Missing required columns: " + String.join(", ", missingColumns);
                            log.error(errorMsg);
                            return ImportResult.builder()
                                    .importedVariantsCount(0)
                                    .rejectedLinesCount(1)
                                    .fileHash(fileHash)
                                    .parserVersion(PARSER_VERSION)
                                    .errors(List.of(ImportResult.ValidationError.builder()
                                            .lineNumber(1)
                                            .errorMessage(errorMsg)
                                            .lineContent(line)
                                            .build()))
                                    .success(false)
                                    .message(errorMsg)
                                    .build();
                        }

                        log.debug("Column mapping: {}", columnMapping);
                        continue;
                    }

                    // Parse data line
                    try {
                        String[] values = parseLine(line, delimiter);
                        VariantCall variant = parseGenotypeLine(values, columnMapping, lineNumber);
                        variants.add(variant);
                    } catch (Exception e) {
                        rejectedLines++;
                        ImportResult.ValidationError error = ImportResult.ValidationError.builder()
                                .lineNumber(lineNumber)
                                .errorMessage(e.getMessage())
                                .lineContent(line.length() > 100 ? line.substring(0, 100) + "..." : line)
                                .build();
                        errors.add(error);

                        log.debug("Error parsing genotype line {}: {}", lineNumber, e.getMessage());

                        // In strict mode, stop on first error
                        if (strictMode && !errors.isEmpty()) {
                            break;
                        }
                    }
                }
            }

            // Build metadata
            SampleMetadata metadata = SampleMetadata.builder()
                    .genomeBuild(null) // Not typically specified in TSV files
                    .importFormat("generic_tsv")
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

            log.info("Genotype TSV import completed for user {} - imported: {}, rejected: {}, success: {}",
                     userId, variants.size(), rejectedLines, success);

            return result;

        } catch (IOException e) {
            log.error("IO error during genotype TSV import for user {}: {}", userId, e.getMessage(), e);
            return ImportResult.builder()
                    .importedVariantsCount(0)
                    .rejectedLinesCount(lineNumber)
                    .parserVersion(PARSER_VERSION)
                    .errors(List.of(ImportResult.ValidationError.builder()
                            .lineNumber(lineNumber)
                            .errorMessage("IO Error: " + e.getMessage())
                            .build()))
                    .success(false)
                    .message("Failed to read genotype TSV file: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Detect delimiter (tab or comma) by checking the first data line
     */
    private String detectDelimiter(byte[] fileContent) throws IOException {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(new ByteArrayInputStream(fileContent), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (!line.isEmpty() && !line.startsWith("#")) {
                    // Count tabs vs commas
                    int tabs = line.length() - line.replace("\t", "").length();
                    int commas = line.length() - line.replace(",", "").length();
                    return tabs > commas ? "\t" : ",";
                }
            }
        }
        // Default to tab
        return "\t";
    }

    /**
     * Parse a line with the given delimiter, handling quoted values
     */
    private String[] parseLine(String line, String delimiter) {
        if (delimiter.equals(",")) {
            // Handle CSV with potential quotes
            return parseCSVLine(line);
        } else {
            // Simple tab split
            return line.split(delimiter);
        }
    }

    /**
     * Parse CSV line handling quoted fields
     */
    private String[] parseCSVLine(String line) {
        List<String> fields = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                fields.add(current.toString().trim());
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }
        fields.add(current.toString().trim());

        return fields.toArray(new String[0]);
    }

    /**
     * Map column names to indices
     */
    private ColumnMapping mapColumns(String[] headers) {
        ColumnMapping mapping = new ColumnMapping();

        for (int i = 0; i < headers.length; i++) {
            String header = headers[i].toLowerCase().trim();

            if (RSID_COLUMNS.contains(header)) {
                mapping.rsidIndex = i;
            } else if (CHROM_COLUMNS.contains(header)) {
                mapping.chromIndex = i;
            } else if (POS_COLUMNS.contains(header)) {
                mapping.posIndex = i;
            } else if (GENOTYPE_COLUMNS.contains(header)) {
                mapping.genotypeIndex = i;
            } else if (ALLELE1_COLUMNS.contains(header)) {
                mapping.allele1Index = i;
            } else if (ALLELE2_COLUMNS.contains(header)) {
                mapping.allele2Index = i;
            }
        }

        return mapping;
    }

    /**
     * Validate that required columns are present
     */
    private List<String> validateRequiredColumns(ColumnMapping mapping) {
        List<String> missing = new ArrayList<>();

        // Chromosome and position are always required
        if (mapping.chromIndex == -1) {
            missing.add("chromosome");
        }
        if (mapping.posIndex == -1) {
            missing.add("position");
        }

        // Must have either genotype OR both allele1 and allele2
        boolean hasGenotype = mapping.genotypeIndex != -1;
        boolean hasAlleles = mapping.allele1Index != -1 && mapping.allele2Index != -1;

        if (!hasGenotype && !hasAlleles) {
            missing.add("genotype (or allele1/allele2)");
        }

        return missing;
    }

    /**
     * Parse a single data line into a VariantCall
     */
    private VariantCall parseGenotypeLine(String[] values, ColumnMapping mapping, int lineNumber) {
        if (values.length <= Math.max(mapping.chromIndex, mapping.posIndex)) {
            throw new IllegalArgumentException("Line has fewer columns than expected");
        }

        // Parse rsID (optional)
        String rsid = null;
        if (mapping.rsidIndex != -1 && mapping.rsidIndex < values.length) {
            rsid = values[mapping.rsidIndex].trim();
            if (rsid.isEmpty() || rsid.equals("-") || rsid.equals("--")) {
                rsid = null;
            }
        }

        // Parse chromosome
        String chrom = values[mapping.chromIndex].trim();
        if (chrom.isEmpty()) {
            throw new IllegalArgumentException("Chromosome cannot be empty");
        }

        // Parse position
        String posStr = values[mapping.posIndex].trim();
        Long pos;
        try {
            pos = Long.parseLong(posStr);
            if (pos <= 0) {
                throw new IllegalArgumentException("Position must be positive");
            }
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid position: " + posStr);
        }

        // Parse genotype or alleles
        String genotype = null;
        String allele1 = null;
        String allele2 = null;

        if (mapping.genotypeIndex != -1 && mapping.genotypeIndex < values.length) {
            genotype = values[mapping.genotypeIndex].trim();
            if (genotype.isEmpty() || genotype.equals("-") || genotype.equals("--")) {
                genotype = null;
            }
        }

        if (mapping.allele1Index != -1 && mapping.allele1Index < values.length) {
            allele1 = values[mapping.allele1Index].trim();
        }
        if (mapping.allele2Index != -1 && mapping.allele2Index < values.length) {
            allele2 = values[mapping.allele2Index].trim();
        }

        // Determine ref and alt alleles from genotype
        String ref = null;
        String alt = null;

        if (genotype != null) {
            // Try to extract alleles from genotype string
            String[] alleles = parseGenotypeString(genotype);
            if (alleles.length >= 1) {
                ref = alleles[0];
            }
            if (alleles.length >= 2) {
                alt = alleles[1];
            }
        } else if (allele1 != null && allele2 != null) {
            // Use separate allele columns
            ref = allele1;
            alt = allele2;
            genotype = allele1 + allele2; // Reconstruct genotype
        }

        // Validate we have at least some allele information
        if (ref == null || ref.isEmpty()) {
            throw new IllegalArgumentException("Cannot determine reference allele from genotype data");
        }

        // If ref and alt are the same, this is a homozygous reference
        if (alt == null || alt.isEmpty() || alt.equals(ref)) {
            alt = ref;
        }

        return VariantCall.builder()
                .chrom(chrom)
                .pos(pos)
                .id(rsid)
                .ref(ref)
                .alt(alt)
                .genotype(genotype)
                .quality(null) // Not typically provided in TSV files
                .source("generic_tsv")
                .lineNumber(lineNumber)
                .build();
    }

    /**
     * Parse genotype string to extract individual alleles
     * Handles formats like: AA, AG, A/G, A|G, 0/1, etc.
     */
    private String[] parseGenotypeString(String genotype) {
        // Remove common separators
        String normalized = genotype.replace("/", "").replace("|", "").replace(":", "");

        if (normalized.length() == 0) {
            return new String[0];
        } else if (normalized.length() == 1) {
            // Single allele (treat as homozygous)
            return new String[]{normalized, normalized};
        } else if (normalized.length() == 2) {
            // Two alleles
            String a1 = normalized.substring(0, 1);
            String a2 = normalized.substring(1, 2);
            return new String[]{a1, a2};
        } else {
            // Multi-character alleles or complex format
            // Try to split on common delimiters
            if (genotype.contains("/")) {
                return genotype.split("/");
            } else if (genotype.contains("|")) {
                return genotype.split("\\|");
            } else {
                // Assume first character is ref
                return new String[]{normalized.substring(0, 1), normalized.substring(1)};
            }
        }
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
            return "No variants imported. Please check file format and column headers.";
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

    /**
     * Helper class to store column index mappings
     */
    private static class ColumnMapping {
        int rsidIndex = -1;
        int chromIndex = -1;
        int posIndex = -1;
        int genotypeIndex = -1;
        int allele1Index = -1;
        int allele2Index = -1;

        @Override
        public String toString() {
            return String.format("rsid:%d, chrom:%d, pos:%d, genotype:%d, allele1:%d, allele2:%d",
                               rsidIndex, chromIndex, posIndex, genotypeIndex, allele1Index, allele2Index);
        }
    }
}
