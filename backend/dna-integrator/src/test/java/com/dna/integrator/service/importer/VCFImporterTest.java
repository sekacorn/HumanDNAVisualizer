package com.dna.integrator.service.importer;

import com.dna.integrator.dto.ImportResult;
import com.dna.integrator.dto.VariantCall;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for VCFImporter
 */
class VCFImporterTest {

    private VCFImporter vcfImporter;

    @BeforeEach
    void setUp() {
        vcfImporter = new VCFImporter();
    }

    @Test
    @DisplayName("Should successfully import valid VCF file")
    void testImportValidVCF() throws IOException {
        // Load fixture file
        byte[] fileContent = loadFixture("sample_valid.vcf");

        // Import with strict mode
        ImportResult result = vcfImporter.importVCF("test-user", fileContent, "sample_valid.vcf", true);

        // Verify results
        assertTrue(result.isSuccess(), "Import should succeed");
        assertEquals(5, result.getImportedVariantsCount(), "Should import 5 variants");
        assertEquals(0, result.getRejectedLinesCount(), "Should have no rejected lines");
        assertNotNull(result.getFileHash(), "Should have file hash");
        assertEquals("1.0.0", result.getParserVersion(), "Should have parser version");
        assertTrue(result.getErrors().isEmpty(), "Should have no errors");

        // Verify variants
        assertNotNull(result.getVariants(), "Should have variants list");
        assertEquals(5, result.getVariants().size(), "Should have 5 variants");

        // Verify first variant
        VariantCall firstVariant = result.getVariants().get(0);
        assertEquals("1", firstVariant.getChrom(), "First variant chromosome");
        assertEquals(10177L, firstVariant.getPos(), "First variant position");
        assertEquals("rs367896724", firstVariant.getId(), "First variant rsID");
        assertEquals("A", firstVariant.getRef(), "First variant ref allele");
        assertEquals("AC", firstVariant.getAlt(), "First variant alt allele");
        assertEquals(100.0, firstVariant.getQuality(), "First variant quality");
        assertEquals("0/1", firstVariant.getGenotype(), "First variant genotype");
        assertEquals("vcf", firstVariant.getSource(), "First variant source");

        // Verify metadata
        assertNotNull(result.getMetadata(), "Should have metadata");
        assertEquals("GRCh38", result.getMetadata().getGenomeBuild(), "Should extract genome build");
        assertEquals("vcf", result.getMetadata().getImportFormat(), "Should have import format");
        assertEquals("test-user", result.getMetadata().getUserId(), "Should have user ID");
        assertEquals("sample_valid.vcf", result.getMetadata().getOriginalFilename(), "Should have filename");
    }

    @Test
    @DisplayName("Should handle invalid VCF file in strict mode")
    void testImportInvalidVCFStrictMode() throws IOException {
        // Load fixture file with errors
        byte[] fileContent = loadFixture("sample_invalid.vcf");

        // Import with strict mode (should fail on first error)
        ImportResult result = vcfImporter.importVCF("test-user", fileContent, "sample_invalid.vcf", true);

        // Verify results
        assertFalse(result.isSuccess(), "Import should fail in strict mode");
        assertTrue(result.getImportedVariantsCount() < 4, "Should stop after first error");
        assertTrue(result.getRejectedLinesCount() > 0, "Should have rejected lines");
        assertFalse(result.getErrors().isEmpty(), "Should have errors");
    }

    @Test
    @DisplayName("Should handle invalid VCF file in lenient mode")
    void testImportInvalidVCFLenientMode() throws IOException {
        // Load fixture file with errors
        byte[] fileContent = loadFixture("sample_invalid.vcf");

        // Import with lenient mode (should collect all errors)
        ImportResult result = vcfImporter.importVCF("test-user", fileContent, "sample_invalid.vcf", false);

        // Verify results
        assertTrue(result.isSuccess(), "Import should succeed in lenient mode if at least one variant imported");
        assertTrue(result.getImportedVariantsCount() >= 1, "Should import at least valid variants");
        assertTrue(result.getRejectedLinesCount() > 0, "Should have rejected lines");
        assertFalse(result.getErrors().isEmpty(), "Should collect all errors");

        // Verify errors have line numbers
        for (ImportResult.ValidationError error : result.getErrors()) {
            assertNotNull(error.getLineNumber(), "Error should have line number");
            assertNotNull(error.getErrorMessage(), "Error should have message");
        }
    }

    @Test
    @DisplayName("Should parse VCF line correctly")
    void testParseVCFLine() throws IOException {
        // Create simple VCF with one variant
        String vcfContent = """
                ##fileformat=VCFv4.2
                ##reference=GRCh38
                #CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\tSAMPLE1
                1\t12345\trs123456\tG\tA\t99.5\tPASS\tDP=50\tGT:DP\t1/1:30
                """;

        byte[] fileContent = vcfContent.getBytes();
        ImportResult result = vcfImporter.importVCF("test-user", fileContent, "test.vcf", true);

        assertTrue(result.isSuccess(), "Should succeed");
        assertEquals(1, result.getImportedVariantsCount(), "Should have 1 variant");

        VariantCall variant = result.getVariants().get(0);
        assertEquals("1", variant.getChrom());
        assertEquals(12345L, variant.getPos());
        assertEquals("rs123456", variant.getId());
        assertEquals("G", variant.getRef());
        assertEquals("A", variant.getAlt());
        assertEquals(99.5, variant.getQuality());
        assertEquals("1/1", variant.getGenotype());
    }

    @Test
    @DisplayName("Should handle missing rsID")
    void testMissingRsID() throws IOException {
        String vcfContent = """
                ##fileformat=VCFv4.2
                #CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO
                1\t12345\t.\tG\tA\t99.5\tPASS\tDP=50
                """;

        byte[] fileContent = vcfContent.getBytes();
        ImportResult result = vcfImporter.importVCF("test-user", fileContent, "test.vcf", true);

        assertTrue(result.isSuccess());
        assertEquals(1, result.getImportedVariantsCount());

        VariantCall variant = result.getVariants().get(0);
        assertNull(variant.getId(), "ID should be null when rsID is '.'");
    }

    @Test
    @DisplayName("Should handle missing quality score")
    void testMissingQuality() throws IOException {
        String vcfContent = """
                ##fileformat=VCFv4.2
                #CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO
                1\t12345\trs123\tG\tA\t.\tPASS\tDP=50
                """;

        byte[] fileContent = vcfContent.getBytes();
        ImportResult result = vcfImporter.importVCF("test-user", fileContent, "test.vcf", true);

        assertTrue(result.isSuccess());
        assertEquals(1, result.getImportedVariantsCount());

        VariantCall variant = result.getVariants().get(0);
        assertNull(variant.getQuality(), "Quality should be null when value is '.'");
    }

    @Test
    @DisplayName("Should reject line with invalid position")
    void testInvalidPosition() throws IOException {
        String vcfContent = """
                ##fileformat=VCFv4.2
                #CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO
                1\tnot_a_number\trs123\tG\tA\t99.5\tPASS\tDP=50
                """;

        byte[] fileContent = vcfContent.getBytes();
        ImportResult result = vcfImporter.importVCF("test-user", fileContent, "test.vcf", false);

        assertFalse(result.isSuccess(), "Should fail when no valid variants");
        assertEquals(0, result.getImportedVariantsCount());
        assertEquals(1, result.getRejectedLinesCount());
        assertEquals(1, result.getErrors().size());
        assertTrue(result.getErrors().get(0).getErrorMessage().contains("position"));
    }

    @Test
    @DisplayName("Should reject line with empty chromosome")
    void testEmptyChromosome() throws IOException {
        String vcfContent = """
                ##fileformat=VCFv4.2
                #CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO
                \t12345\trs123\tG\tA\t99.5\tPASS\tDP=50
                """;

        byte[] fileContent = vcfContent.getBytes();
        ImportResult result = vcfImporter.importVCF("test-user", fileContent, "test.vcf", false);

        assertFalse(result.isSuccess());
        assertEquals(0, result.getImportedVariantsCount());
        assertEquals(1, result.getRejectedLinesCount());
        assertTrue(result.getErrors().get(0).getErrorMessage().contains("Chromosome"));
    }

    @Test
    @DisplayName("Should reject line with empty reference allele")
    void testEmptyReferenceAllele() throws IOException {
        String vcfContent = """
                ##fileformat=VCFv4.2
                #CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO
                1\t12345\trs123\t\tA\t99.5\tPASS\tDP=50
                """;

        byte[] fileContent = vcfContent.getBytes();
        ImportResult result = vcfImporter.importVCF("test-user", fileContent, "test.vcf", false);

        assertFalse(result.isSuccess());
        assertEquals(0, result.getImportedVariantsCount());
        assertEquals(1, result.getRejectedLinesCount());
        assertTrue(result.getErrors().get(0).getErrorMessage().contains("Reference allele"));
    }

    @Test
    @DisplayName("Should handle VCF without sample columns")
    void testVCFWithoutSamples() throws IOException {
        String vcfContent = """
                ##fileformat=VCFv4.2
                #CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO
                1\t12345\trs123\tG\tA\t99.5\tPASS\tDP=50
                2\t67890\trs456\tC\tT\t85.0\tPASS\tDP=40
                """;

        byte[] fileContent = vcfContent.getBytes();
        ImportResult result = vcfImporter.importVCF("test-user", fileContent, "test.vcf", true);

        assertTrue(result.isSuccess());
        assertEquals(2, result.getImportedVariantsCount());

        // Verify genotypes are null when no sample columns
        for (VariantCall variant : result.getVariants()) {
            assertNull(variant.getGenotype(), "Genotype should be null without sample columns");
        }
    }

    @Test
    @DisplayName("Should skip header and comment lines")
    void testSkipHeaders() throws IOException {
        String vcfContent = """
                ##fileformat=VCFv4.2
                ##reference=GRCh38
                ##INFO=<ID=DP,Number=1,Type=Integer,Description="Depth">
                #CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO
                1\t12345\trs123\tG\tA\t99.5\tPASS\tDP=50
                """;

        byte[] fileContent = vcfContent.getBytes();
        ImportResult result = vcfImporter.importVCF("test-user", fileContent, "test.vcf", true);

        assertTrue(result.isSuccess());
        assertEquals(1, result.getImportedVariantsCount(), "Should only parse data lines");
    }

    @Test
    @DisplayName("Should extract genome build from header")
    void testExtractGenomeBuild() throws IOException {
        String vcfContent = """
                ##fileformat=VCFv4.2
                ##reference=GRCh37
                #CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO
                1\t12345\trs123\tG\tA\t99.5\tPASS\tDP=50
                """;

        byte[] fileContent = vcfContent.getBytes();
        ImportResult result = vcfImporter.importVCF("test-user", fileContent, "test.vcf", true);

        assertTrue(result.isSuccess());
        assertEquals("GRCh37", result.getMetadata().getGenomeBuild());
    }

    @Test
    @DisplayName("Should handle empty file")
    void testEmptyFile() throws IOException {
        String vcfContent = "";

        byte[] fileContent = vcfContent.getBytes();
        ImportResult result = vcfImporter.importVCF("test-user", fileContent, "empty.vcf", true);

        assertFalse(result.isSuccess());
        assertEquals(0, result.getImportedVariantsCount());
    }

    @Test
    @DisplayName("Should calculate file hash")
    void testFileHash() throws IOException {
        String vcfContent = """
                ##fileformat=VCFv4.2
                #CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO
                1\t12345\trs123\tG\tA\t99.5\tPASS\tDP=50
                """;

        byte[] fileContent = vcfContent.getBytes();
        ImportResult result = vcfImporter.importVCF("test-user", fileContent, "test.vcf", true);

        assertNotNull(result.getFileHash(), "Should have file hash");
        assertEquals(64, result.getFileHash().length(), "SHA-256 hash should be 64 hex characters");
    }

    /**
     * Helper method to load fixture files
     */
    private byte[] loadFixture(String filename) throws IOException {
        String path = "src/test/resources/fixtures/" + filename;
        return Files.readAllBytes(Paths.get(path));
    }
}
