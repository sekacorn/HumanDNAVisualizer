package com.dna.integrator.qa;

import com.dna.integrator.dto.ImportResult;
import com.dna.integrator.dto.VariantCall;
import com.dna.integrator.service.importer.VCFImporter;
import com.dna.integrator.service.importer.GenotypeTSVImporter;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Disabled;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Golden File Tests
 *
 * Validates that processing produces expected outputs by comparing against golden files.
 *
 * Golden files are known-good outputs that serve as regression tests.
 * If code changes cause output to differ, tests fail, preventing silent breakage.
 *
 * Part of QA / Verification Agent implementation.
 */
@SpringBootTest
@DisplayName("Golden File Tests - Regression Prevention")
public class GoldenFileTest {

    @Autowired
    private VCFImporter vcfImporter;

    @Autowired
    private GenotypeTSVImporter genotypeTSVImporter;

    @Autowired
    private ObjectMapper objectMapper;

    // ============================================================================
    // VCF Golden File Tests
    // ============================================================================

    @Test
    @DisplayName("VCF import: minimal.vcf → minimal.json (golden file)")
    public void testVCFImport_MinimalGolden() throws IOException {
        // 1. Load input VCF
        byte[] vcfInput = loadFixture("test-fixtures/golden-inputs/vcf/minimal.vcf");

        // 2. Load expected output (golden file)
        String expectedJson = loadFixtureString("test-fixtures/golden-outputs/vcf/minimal.json");
        List<VariantCall> expectedVariants = objectMapper.readValue(expectedJson,
                new TypeReference<List<VariantCall>>() {});

        // 3. Process input
        ImportResult result = vcfImporter.importVCF("test-user", vcfInput, "minimal.vcf", true);

        // 4. Compare actual vs expected
        assertTrue(result.isSuccess(), "Import should succeed");
        assertEquals(expectedVariants.size(), result.getVariants().size(),
                "Variant count differs from golden file");

        for (int i = 0; i < expectedVariants.size(); i++) {
            assertVariantEquals(expectedVariants.get(i), result.getVariants().get(i),
                    "Variant #" + i + " differs from golden file");
        }
    }

    // ============================================================================
    // TSV Golden File Tests
    // ============================================================================

    @Test
    @DisplayName("TSV import: minimal.tsv → minimal.json (golden file)")
    public void testTSVImport_MinimalGolden() throws IOException {
        // 1. Load input TSV
        byte[] tsvInput = loadFixture("test-fixtures/golden-inputs/tsv/minimal.tsv");

        // 2. Load expected output (golden file)
        String expectedJson = loadFixtureString("test-fixtures/golden-outputs/tsv/minimal.json");
        List<VariantCall> expectedVariants = objectMapper.readValue(expectedJson,
                new TypeReference<List<VariantCall>>() {});

        // 3. Process input
        ImportResult result = genotypeTSVImporter.importGenotypeTSV("test-user", tsvInput,
                "minimal.tsv", true);

        // 4. Compare actual vs expected
        assertTrue(result.isSuccess(), "Import should succeed");
        assertEquals(expectedVariants.size(), result.getVariants().size(),
                "Variant count differs from golden file");

        for (int i = 0; i < expectedVariants.size(); i++) {
            assertVariantEquals(expectedVariants.get(i), result.getVariants().get(i),
                    "Variant #" + i + " differs from golden file");
        }
    }

    // ============================================================================
    // Golden File Generation (Disabled by default)
    // ============================================================================

    /**
     * Utility to generate new golden files.
     *
     * Run manually when:
     * - Creating new test fixtures
     * - Intentionally changing output format
     * - Fixing bugs that affect output
     *
     * Steps:
     * 1. Enable this test (remove @Disabled)
     * 2. Run test to generate golden file
     * 3. Review generated output carefully
     * 4. Commit golden file
     * 5. Re-disable this test
     */
    @Test
    @Disabled("Run manually to generate golden files - DO NOT enable in CI")
    @DisplayName("Generate VCF golden file - minimal.vcf")
    public void generateGoldenFile_VCF_Minimal() throws IOException {
        // 1. Load input
        byte[] vcfInput = loadFixture("test-fixtures/golden-inputs/vcf/minimal.vcf");

        // 2. Process
        ImportResult result = vcfImporter.importVCF("test-user", vcfInput, "minimal.vcf", true);

        // 3. Write golden output
        String json = objectMapper.writerWithDefaultPrettyPrinter()
                .writeValueAsString(result.getVariants());

        String outputPath = "src/test/resources/test-fixtures/golden-outputs/vcf/minimal.json";
        Files.write(Paths.get(outputPath), json.getBytes());

        System.out.println("✅ Golden file generated: " + outputPath);
        System.out.println("⚠️  REVIEW OUTPUT BEFORE COMMITTING");
        System.out.println("📋 Variants: " + result.getVariants().size());
    }

    @Test
    @Disabled("Run manually to generate golden files - DO NOT enable in CI")
    @DisplayName("Generate TSV golden file - minimal.tsv")
    public void generateGoldenFile_TSV_Minimal() throws IOException {
        // 1. Load input
        byte[] tsvInput = loadFixture("test-fixtures/golden-inputs/tsv/minimal.tsv");

        // 2. Process
        ImportResult result = genotypeTSVImporter.importGenotypeTSV("test-user", tsvInput,
                "minimal.tsv", true);

        // 3. Write golden output
        String json = objectMapper.writerWithDefaultPrettyPrinter()
                .writeValueAsString(result.getVariants());

        String outputPath = "src/test/resources/test-fixtures/golden-outputs/tsv/minimal.json";
        Files.write(Paths.get(outputPath), json.getBytes());

        System.out.println("✅ Golden file generated: " + outputPath);
        System.out.println("⚠️  REVIEW OUTPUT BEFORE COMMITTING");
        System.out.println("📋 Variants: " + result.getVariants().size());
    }

    // ============================================================================
    // Golden File Validation Tests
    // ============================================================================

    @Test
    @DisplayName("Golden files should exist and be parseable")
    public void testGoldenFiles_Exist() {
        // VCF golden files
        assertGoldenFileExists("test-fixtures/golden-outputs/vcf/minimal.json");

        // TSV golden files
        assertGoldenFileExists("test-fixtures/golden-outputs/tsv/minimal.json");
    }

    @Test
    @DisplayName("Golden files should contain valid JSON")
    public void testGoldenFiles_ValidJSON() throws IOException {
        // VCF
        String vcfJson = loadFixtureString("test-fixtures/golden-outputs/vcf/minimal.json");
        List<VariantCall> vcfVariants = objectMapper.readValue(vcfJson,
                new TypeReference<List<VariantCall>>() {});
        assertNotNull(vcfVariants);
        assertFalse(vcfVariants.isEmpty(), "VCF golden file should contain variants");

        // TSV
        String tsvJson = loadFixtureString("test-fixtures/golden-outputs/tsv/minimal.json");
        List<VariantCall> tsvVariants = objectMapper.readValue(tsvJson,
                new TypeReference<List<VariantCall>>() {});
        assertNotNull(tsvVariants);
        assertFalse(tsvVariants.isEmpty(), "TSV golden file should contain variants");
    }

    @Test
    @DisplayName("Golden files should contain expected field structure")
    public void testGoldenFiles_Structure() throws IOException {
        // Load and parse golden file
        String json = loadFixtureString("test-fixtures/golden-outputs/vcf/minimal.json");
        List<VariantCall> variants = objectMapper.readValue(json,
                new TypeReference<List<VariantCall>>() {});

        // Verify structure of first variant
        VariantCall first = variants.get(0);
        assertNotNull(first.getChrom(), "Should have chromosome");
        assertNotNull(first.getPos(), "Should have position");
        assertNotNull(first.getSource(), "Should have source");

        // VCF should have quality
        assertNotNull(first.getQuality(), "VCF variant should have quality");
    }

    // ============================================================================
    // Helper Methods
    // ============================================================================

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

        // Quality - handle null and floating point
        if (expected.getQuality() != null && actual.getQuality() != null) {
            assertEquals(expected.getQuality(), actual.getQuality(), 0.0001,
                    message + " - quality");
        } else if (expected.getQuality() == null && actual.getQuality() == null) {
            // Both null - OK
        } else {
            fail(message + " - quality mismatch (one null, one not)");
        }
    }

    /**
     * Load test fixture as byte array.
     */
    private byte[] loadFixture(String path) throws IOException {
        String fullPath = "src/test/resources/" + path;
        return Files.readAllBytes(Paths.get(fullPath));
    }

    /**
     * Load test fixture as string.
     */
    private String loadFixtureString(String path) throws IOException {
        String fullPath = "src/test/resources/" + path;
        return new String(Files.readAllBytes(Paths.get(fullPath)));
    }

    /**
     * Assert golden file exists.
     */
    private void assertGoldenFileExists(String path) {
        String fullPath = "src/test/resources/" + path;
        assertTrue(Files.exists(Paths.get(fullPath)),
                "Golden file should exist: " + path);
    }
}
