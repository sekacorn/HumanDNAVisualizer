package com.dna.integrator.qa;

import com.dna.integrator.dto.ImportResult;
import com.dna.integrator.dto.VariantCall;
import com.dna.integrator.service.importer.VCFImporter;
import com.dna.integrator.service.importer.GenotypeTSVImporter;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Determinism Tests
 *
 * Validates that processing is deterministic: same input → same output (always).
 *
 * Critical for educational/research software:
 * - Reproducibility
 * - Consistency
 * - Trust
 * - Debuggability
 *
 * Part of QA / Verification Agent implementation.
 */
@SpringBootTest
@DisplayName("Determinism Tests - Same Input → Same Output")
public class DeterminismTest {

    @Autowired
    private VCFImporter vcfImporter;

    @Autowired
    private GenotypeTSVImporter genotypeTSVImporter;

    @Autowired
    private ObjectMapper objectMapper;

    private static final int DETERMINISM_ITERATIONS = 10;

    // ============================================================================
    // VCF Import Determinism Tests
    // ============================================================================

    @Test
    @DisplayName("CRITICAL: VCF import must be deterministic")
    public void testVCFImport_Deterministic() throws IOException {
        // Load test VCF
        byte[] vcfContent = loadFixture("test-fixtures/golden-inputs/vcf/minimal.vcf");

        // Import same file multiple times
        List<ImportResult> results = new ArrayList<>();
        for (int i = 0; i < DETERMINISM_ITERATIONS; i++) {
            ImportResult result = vcfImporter.importVCF("test-user", vcfContent,
                    "minimal.vcf", true);
            results.add(result);
        }

        // All results must be identical
        ImportResult first = results.get(0);
        for (int i = 1; i < results.size(); i++) {
            assertImportResultEquals(first, results.get(i),
                    "Iteration #" + (i + 1) + " differs from first import");
        }
    }

    @Test
    @DisplayName("VCF import should produce identical JSON serialization")
    public void testVCFImport_JSONDeterministic() throws IOException {
        byte[] vcfContent = loadFixture("test-fixtures/golden-inputs/vcf/minimal.vcf");

        // Import and serialize multiple times
        Set<String> jsonOutputs = new HashSet<>();
        for (int i = 0; i < DETERMINISM_ITERATIONS; i++) {
            ImportResult result = vcfImporter.importVCF("test-user", vcfContent,
                    "minimal.vcf", true);
            String json = objectMapper.writeValueAsString(result.getVariants());
            jsonOutputs.add(json);
        }

        // Should be exactly one unique JSON output
        assertEquals(1, jsonOutputs.size(),
                "CRITICAL: VCF import produced different JSON outputs - NOT DETERMINISTIC");
    }

    // ============================================================================
    // TSV Import Determinism Tests
    // ============================================================================

    @Test
    @DisplayName("CRITICAL: TSV import must be deterministic")
    public void testTSVImport_Deterministic() throws IOException {
        // Load test TSV
        byte[] tsvContent = loadFixture("test-fixtures/golden-inputs/tsv/minimal.tsv");

        // Import same file multiple times
        List<ImportResult> results = new ArrayList<>();
        for (int i = 0; i < DETERMINISM_ITERATIONS; i++) {
            ImportResult result = genotypeTSVImporter.importGenotypeTSV("test-user",
                    tsvContent, "minimal.tsv", true);
            results.add(result);
        }

        // All results must be identical
        ImportResult first = results.get(0);
        for (int i = 1; i < results.size(); i++) {
            assertImportResultEquals(first, results.get(i),
                    "Iteration #" + (i + 1) + " differs from first import");
        }
    }

    @Test
    @DisplayName("TSV import should produce identical JSON serialization")
    public void testTSVImport_JSONDeterministic() throws IOException {
        byte[] tsvContent = loadFixture("test-fixtures/golden-inputs/tsv/minimal.tsv");

        // Import and serialize multiple times
        Set<String> jsonOutputs = new HashSet<>();
        for (int i = 0; i < DETERMINISM_ITERATIONS; i++) {
            ImportResult result = genotypeTSVImporter.importGenotypeTSV("test-user",
                    tsvContent, "minimal.tsv", true);
            String json = objectMapper.writeValueAsString(result.getVariants());
            jsonOutputs.add(json);
        }

        // Should be exactly one unique JSON output
        assertEquals(1, jsonOutputs.size(),
                "CRITICAL: TSV import produced different JSON outputs - NOT DETERMINISTIC");
    }

    // ============================================================================
    // Variant Call Determinism Tests
    // ============================================================================

    @Test
    @DisplayName("Variant ordering must be deterministic")
    public void testVariantOrdering_Deterministic() throws IOException {
        byte[] vcfContent = loadFixture("test-fixtures/golden-inputs/vcf/minimal.vcf");

        // Import multiple times and collect variant sequences
        List<List<String>> variantSequences = new ArrayList<>();
        for (int i = 0; i < DETERMINISM_ITERATIONS; i++) {
            ImportResult result = vcfImporter.importVCF("test-user", vcfContent,
                    "minimal.vcf", true);

            List<String> sequence = new ArrayList<>();
            for (VariantCall variant : result.getVariants()) {
                sequence.add(variantToString(variant));
            }
            variantSequences.add(sequence);
        }

        // All sequences must be identical
        List<String> first = variantSequences.get(0);
        for (int i = 1; i < variantSequences.size(); i++) {
            assertEquals(first, variantSequences.get(i),
                    "Variant ordering differs in iteration #" + (i + 1));
        }
    }

    // ============================================================================
    // Metadata Determinism Tests
    // ============================================================================

    @Test
    @DisplayName("Import metadata should be deterministic (except timestamps)")
    public void testMetadata_Deterministic() throws IOException {
        byte[] vcfContent = loadFixture("test-fixtures/golden-inputs/vcf/minimal.vcf");

        // Import multiple times
        List<ImportResult> results = new ArrayList<>();
        for (int i = 0; i < DETERMINISM_ITERATIONS; i++) {
            ImportResult result = vcfImporter.importVCF("test-user", vcfContent,
                    "minimal.vcf", true);
            results.add(result);
        }

        // Check deterministic fields
        ImportResult first = results.get(0);
        for (int i = 1; i < results.size(); i++) {
            ImportResult current = results.get(i);

            assertEquals(first.getImportedVariantsCount(), current.getImportedVariantsCount(),
                    "Imported count differs");
            assertEquals(first.getRejectedLinesCount(), current.getRejectedLinesCount(),
                    "Rejected count differs");
            assertEquals(first.getFileHash(), current.getFileHash(),
                    "File hash differs");
            assertEquals(first.getParserVersion(), current.getParserVersion(),
                    "Parser version differs");

            // Timestamps are allowed to differ (not deterministic by nature)
            // But format should be consistent
            assertNotNull(current.getMetadata().getImportedAt());
        }
    }

    // ============================================================================
    // File Hash Determinism Tests
    // ============================================================================

    @Test
    @DisplayName("File hash computation must be deterministic")
    public void testFileHash_Deterministic() throws IOException {
        byte[] vcfContent = loadFixture("test-fixtures/golden-inputs/vcf/minimal.vcf");

        // Import multiple times and collect hashes
        Set<String> hashes = new HashSet<>();
        for (int i = 0; i < DETERMINISM_ITERATIONS; i++) {
            ImportResult result = vcfImporter.importVCF("test-user", vcfContent,
                    "minimal.vcf", true);
            hashes.add(result.getFileHash());
        }

        // Should be exactly one unique hash
        assertEquals(1, hashes.size(),
                "CRITICAL: File hash is not deterministic");

        // Hash should be 64 hex characters (SHA-256)
        String hash = hashes.iterator().next();
        assertEquals(64, hash.length(), "File hash should be 64 characters");
        assertTrue(hash.matches("[0-9a-f]{64}"), "File hash should be lowercase hex");
    }

    // ============================================================================
    // Helper Methods
    // ============================================================================

    /**
     * Assert two ImportResults are equal (ignoring timestamps).
     */
    private void assertImportResultEquals(ImportResult expected, ImportResult actual, String message) {
        assertEquals(expected.isSuccess(), actual.isSuccess(), message + " - success");
        assertEquals(expected.getImportedVariantsCount(), actual.getImportedVariantsCount(),
                message + " - imported count");
        assertEquals(expected.getRejectedLinesCount(), actual.getRejectedLinesCount(),
                message + " - rejected count");
        assertEquals(expected.getFileHash(), actual.getFileHash(), message + " - file hash");

        // Compare variants
        assertEquals(expected.getVariants().size(), actual.getVariants().size(),
                message + " - variant count");

        for (int i = 0; i < expected.getVariants().size(); i++) {
            assertVariantEquals(expected.getVariants().get(i),
                    actual.getVariants().get(i),
                    message + " - variant #" + i);
        }
    }

    /**
     * Assert two VariantCalls are equal.
     */
    private void assertVariantEquals(VariantCall expected, VariantCall actual, String message) {
        assertEquals(expected.getChrom(), actual.getChrom(), message + " - chrom");
        assertEquals(expected.getPos(), actual.getPos(), message + " - pos");
        assertEquals(expected.getId(), actual.getId(), message + " - id");
        assertEquals(expected.getRef(), actual.getRef(), message + " - ref");
        assertEquals(expected.getAlt(), actual.getAlt(), message + " - alt");
        assertEquals(expected.getGenotype(), actual.getGenotype(), message + " - genotype");
        assertEquals(expected.getSource(), actual.getSource(), message + " - source");

        // Quality may be null or floating point - handle carefully
        if (expected.getQuality() != null && actual.getQuality() != null) {
            assertEquals(expected.getQuality(), actual.getQuality(), 0.0001,
                    message + " - quality");
        } else {
            assertEquals(expected.getQuality(), actual.getQuality(),
                    message + " - quality (null)");
        }
    }

    /**
     * Convert variant to string for ordering comparison.
     */
    private String variantToString(VariantCall variant) {
        return String.format("%s:%d:%s>%s:%s",
                variant.getChrom(),
                variant.getPos(),
                variant.getRef(),
                variant.getAlt(),
                variant.getGenotype());
    }

    /**
     * Load test fixture file.
     */
    private byte[] loadFixture(String path) throws IOException {
        String fullPath = "src/test/resources/" + path;
        return Files.readAllBytes(Paths.get(fullPath));
    }
}
