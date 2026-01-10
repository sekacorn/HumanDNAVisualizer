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
 * Unit tests for GenotypeTSVImporter
 */
class GenotypeTSVImporterTest {

    private GenotypeTSVImporter tsvImporter;

    @BeforeEach
    void setUp() {
        tsvImporter = new GenotypeTSVImporter();
    }

    @Test
    @DisplayName("Should successfully import tab-separated genotype file")
    void testImportTabSeparatedFile() throws IOException {
        // Load fixture file
        byte[] fileContent = loadFixture("sample_genotype_tab.txt");

        // Import with strict mode
        ImportResult result = tsvImporter.importGenotypeTSV("test-user", fileContent, "sample_genotype_tab.txt", true);

        // Verify results
        assertTrue(result.isSuccess(), "Import should succeed");
        assertEquals(10, result.getImportedVariantsCount(), "Should import 10 variants");
        assertEquals(0, result.getRejectedLinesCount(), "Should have no rejected lines");
        assertNotNull(result.getFileHash(), "Should have file hash");
        assertEquals("1.0.0", result.getParserVersion(), "Should have parser version");
        assertTrue(result.getErrors().isEmpty(), "Should have no errors");

        // Verify variants
        assertNotNull(result.getVariants(), "Should have variants list");
        assertEquals(10, result.getVariants().size(), "Should have 10 variants");

        // Verify first variant
        VariantCall firstVariant = result.getVariants().get(0);
        assertEquals("1", firstVariant.getChrom(), "First variant chromosome");
        assertEquals(82154L, firstVariant.getPos(), "First variant position");
        assertEquals("rs4477212", firstVariant.getId(), "First variant rsID");
        assertEquals("A", firstVariant.getRef(), "First variant ref allele");
        assertEquals("A", firstVariant.getAlt(), "First variant alt allele (homozygous)");
        assertEquals("AA", firstVariant.getGenotype(), "First variant genotype");
        assertEquals("generic_tsv", firstVariant.getSource(), "First variant source");

        // Verify heterozygous variant
        VariantCall hetVariant = result.getVariants().get(1);
        assertEquals("rs3094315", hetVariant.getId());
        assertEquals("AG", hetVariant.getGenotype());
        assertEquals("A", hetVariant.getRef());
        assertEquals("G", hetVariant.getAlt());

        // Verify metadata
        assertNotNull(result.getMetadata(), "Should have metadata");
        assertEquals("generic_tsv", result.getMetadata().getImportFormat(), "Should have import format");
        assertEquals("test-user", result.getMetadata().getUserId(), "Should have user ID");
        assertEquals("sample_genotype_tab.txt", result.getMetadata().getOriginalFilename(), "Should have filename");
    }

    @Test
    @DisplayName("Should successfully import comma-separated genotype file with allele columns")
    void testImportCSVFileWithAlleles() throws IOException {
        // Load fixture file
        byte[] fileContent = loadFixture("sample_genotype_csv.csv");

        // Import with strict mode
        ImportResult result = tsvImporter.importGenotypeTSV("test-user", fileContent, "sample_genotype_csv.csv", true);

        // Verify results
        assertTrue(result.isSuccess(), "Import should succeed");
        assertEquals(10, result.getImportedVariantsCount(), "Should import 10 variants");
        assertEquals(0, result.getRejectedLinesCount(), "Should have no rejected lines");

        // Verify variants
        assertEquals(10, result.getVariants().size(), "Should have 10 variants");

        // Verify first variant (homozygous)
        VariantCall firstVariant = result.getVariants().get(0);
        assertEquals("1", firstVariant.getChrom());
        assertEquals(82154L, firstVariant.getPos());
        assertEquals("rs4477212", firstVariant.getId());
        assertEquals("A", firstVariant.getRef());
        assertEquals("A", firstVariant.getAlt());
        assertEquals("AA", firstVariant.getGenotype());

        // Verify heterozygous variant
        VariantCall hetVariant = result.getVariants().get(1);
        assertEquals("rs3094315", hetVariant.getId());
        assertEquals("A", hetVariant.getRef());
        assertEquals("G", hetVariant.getAlt());
        assertEquals("AG", hetVariant.getGenotype());
    }

    @Test
    @DisplayName("Should handle invalid genotype file in strict mode")
    void testImportInvalidGenotypeStrictMode() throws IOException {
        // Load fixture file with errors
        byte[] fileContent = loadFixture("sample_genotype_invalid.txt");

        // Import with strict mode (should fail on first error)
        ImportResult result = tsvImporter.importGenotypeTSV("test-user", fileContent, "sample_genotype_invalid.txt", true);

        // Verify results
        assertFalse(result.isSuccess(), "Import should fail in strict mode");
        assertTrue(result.getImportedVariantsCount() < 5, "Should stop after first error");
        assertTrue(result.getRejectedLinesCount() > 0, "Should have rejected lines");
        assertFalse(result.getErrors().isEmpty(), "Should have errors");
    }

    @Test
    @DisplayName("Should handle invalid genotype file in lenient mode")
    void testImportInvalidGenotypeLenientMode() throws IOException {
        // Load fixture file with errors
        byte[] fileContent = loadFixture("sample_genotype_invalid.txt");

        // Import with lenient mode (should collect all errors)
        ImportResult result = tsvImporter.importGenotypeTSV("test-user", fileContent, "sample_genotype_invalid.txt", false);

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
    @DisplayName("Should detect tab delimiter")
    void testDetectTabDelimiter() throws IOException {
        String tsvContent = """
                rsid\tchromosome\tposition\tgenotype
                rs123\t1\t12345\tAA
                """;

        byte[] fileContent = tsvContent.getBytes();
        ImportResult result = tsvImporter.importGenotypeTSV("test-user", fileContent, "test.txt", true);

        assertTrue(result.isSuccess());
        assertEquals(1, result.getImportedVariantsCount());
    }

    @Test
    @DisplayName("Should detect comma delimiter")
    void testDetectCommaDelimiter() throws IOException {
        String csvContent = """
                rsid,chromosome,position,genotype
                rs123,1,12345,AA
                """;

        byte[] fileContent = csvContent.getBytes();
        ImportResult result = tsvImporter.importGenotypeTSV("test-user", fileContent, "test.csv", true);

        assertTrue(result.isSuccess());
        assertEquals(1, result.getImportedVariantsCount());
    }

    @Test
    @DisplayName("Should handle quoted CSV fields")
    void testQuotedCSVFields() throws IOException {
        String csvContent = """
                rsid,chromosome,position,genotype
                "rs123","1","12345","AA"
                """;

        byte[] fileContent = csvContent.getBytes();
        ImportResult result = tsvImporter.importGenotypeTSV("test-user", fileContent, "test.csv", true);

        assertTrue(result.isSuccess());
        assertEquals(1, result.getImportedVariantsCount());
    }

    @Test
    @DisplayName("Should fail when missing required chromosome column")
    void testMissingChromosomeColumn() throws IOException {
        String tsvContent = """
                rsid\tposition\tgenotype
                rs123\t12345\tAA
                """;

        byte[] fileContent = tsvContent.getBytes();
        ImportResult result = tsvImporter.importGenotypeTSV("test-user", fileContent, "test.txt", true);

        assertFalse(result.isSuccess());
        assertTrue(result.getMessage().contains("chromosome"));
    }

    @Test
    @DisplayName("Should fail when missing required position column")
    void testMissingPositionColumn() throws IOException {
        String tsvContent = """
                rsid\tchromosome\tgenotype
                rs123\t1\tAA
                """;

        byte[] fileContent = tsvContent.getBytes();
        ImportResult result = tsvImporter.importGenotypeTSV("test-user", fileContent, "test.txt", true);

        assertFalse(result.isSuccess());
        assertTrue(result.getMessage().contains("position"));
    }

    @Test
    @DisplayName("Should fail when missing genotype and allele columns")
    void testMissingGenotypeAndAlleles() throws IOException {
        String tsvContent = """
                rsid\tchromosome\tposition
                rs123\t1\t12345
                """;

        byte[] fileContent = tsvContent.getBytes();
        ImportResult result = tsvImporter.importGenotypeTSV("test-user", fileContent, "test.txt", true);

        assertFalse(result.isSuccess());
        assertTrue(result.getMessage().contains("genotype"));
    }

    @Test
    @DisplayName("Should accept different column name variations")
    void testColumnNameVariations() throws IOException {
        // Test with 'chr' instead of 'chromosome'
        String tsvContent = """
                snp\tchr\tpos\tresult
                rs123\t1\t12345\tAA
                """;

        byte[] fileContent = tsvContent.getBytes();
        ImportResult result = tsvImporter.importGenotypeTSV("test-user", fileContent, "test.txt", true);

        assertTrue(result.isSuccess());
        assertEquals(1, result.getImportedVariantsCount());
    }

    @Test
    @DisplayName("Should reject line with invalid position")
    void testInvalidPosition() throws IOException {
        String tsvContent = """
                rsid\tchromosome\tposition\tgenotype
                rs123\t1\tnot_a_number\tAA
                """;

        byte[] fileContent = tsvContent.getBytes();
        ImportResult result = tsvImporter.importGenotypeTSV("test-user", fileContent, "test.txt", false);

        assertFalse(result.isSuccess());
        assertEquals(0, result.getImportedVariantsCount());
        assertEquals(1, result.getRejectedLinesCount());
        assertTrue(result.getErrors().get(0).getErrorMessage().contains("position"));
    }

    @Test
    @DisplayName("Should reject line with empty chromosome")
    void testEmptyChromosome() throws IOException {
        String tsvContent = """
                rsid\tchromosome\tposition\tgenotype
                rs123\t\t12345\tAA
                """;

        byte[] fileContent = tsvContent.getBytes();
        ImportResult result = tsvImporter.importGenotypeTSV("test-user", fileContent, "test.txt", false);

        assertFalse(result.isSuccess());
        assertEquals(0, result.getImportedVariantsCount());
        assertEquals(1, result.getRejectedLinesCount());
        assertTrue(result.getErrors().get(0).getErrorMessage().contains("Chromosome"));
    }

    @Test
    @DisplayName("Should handle missing rsID gracefully")
    void testMissingRsID() throws IOException {
        String tsvContent = """
                rsid\tchromosome\tposition\tgenotype
                -\t1\t12345\tAA
                --\t1\t67890\tGG
                \t1\t11111\tCC
                """;

        byte[] fileContent = tsvContent.getBytes();
        ImportResult result = tsvImporter.importGenotypeTSV("test-user", fileContent, "test.txt", true);

        assertTrue(result.isSuccess());
        assertEquals(3, result.getImportedVariantsCount());

        // Verify all rsIDs are null
        for (VariantCall variant : result.getVariants()) {
            assertNull(variant.getId(), "Missing rsIDs should be null");
        }
    }

    @Test
    @DisplayName("Should parse various genotype formats")
    void testVariousGenotypeFormats() throws IOException {
        String tsvContent = """
                rsid\tchromosome\tposition\tgenotype
                rs1\t1\t100\tAA
                rs2\t1\t200\tAG
                rs3\t1\t300\tA/G
                rs4\t1\t400\tA|G
                rs5\t1\t500\tGG
                """;

        byte[] fileContent = tsvContent.getBytes();
        ImportResult result = tsvImporter.importGenotypeTSV("test-user", fileContent, "test.txt", true);

        assertTrue(result.isSuccess());
        assertEquals(5, result.getImportedVariantsCount());

        // Verify all formats are parsed
        assertEquals("AA", result.getVariants().get(0).getGenotype());
        assertEquals("AG", result.getVariants().get(1).getGenotype());
        assertEquals("A/G", result.getVariants().get(2).getGenotype());
        assertEquals("A|G", result.getVariants().get(3).getGenotype());
        assertEquals("GG", result.getVariants().get(4).getGenotype());
    }

    @Test
    @DisplayName("Should skip comment lines")
    void testSkipCommentLines() throws IOException {
        String tsvContent = """
                # This is a comment
                rsid\tchromosome\tposition\tgenotype
                # Another comment
                rs123\t1\t12345\tAA
                """;

        byte[] fileContent = tsvContent.getBytes();
        ImportResult result = tsvImporter.importGenotypeTSV("test-user", fileContent, "test.txt", true);

        assertTrue(result.isSuccess());
        assertEquals(1, result.getImportedVariantsCount(), "Should skip comment lines");
    }

    @Test
    @DisplayName("Should skip empty lines")
    void testSkipEmptyLines() throws IOException {
        String tsvContent = """
                rsid\tchromosome\tposition\tgenotype

                rs123\t1\t12345\tAA

                rs456\t1\t67890\tGG
                """;

        byte[] fileContent = tsvContent.getBytes();
        ImportResult result = tsvImporter.importGenotypeTSV("test-user", fileContent, "test.txt", true);

        assertTrue(result.isSuccess());
        assertEquals(2, result.getImportedVariantsCount(), "Should skip empty lines");
    }

    @Test
    @DisplayName("Should handle file with only headers")
    void testFileWithOnlyHeaders() throws IOException {
        String tsvContent = """
                rsid\tchromosome\tposition\tgenotype
                """;

        byte[] fileContent = tsvContent.getBytes();
        ImportResult result = tsvImporter.importGenotypeTSV("test-user", fileContent, "test.txt", true);

        assertFalse(result.isSuccess());
        assertEquals(0, result.getImportedVariantsCount());
    }

    @Test
    @DisplayName("Should calculate file hash")
    void testFileHash() throws IOException {
        String tsvContent = """
                rsid\tchromosome\tposition\tgenotype
                rs123\t1\t12345\tAA
                """;

        byte[] fileContent = tsvContent.getBytes();
        ImportResult result = tsvImporter.importGenotypeTSV("test-user", fileContent, "test.txt", true);

        assertNotNull(result.getFileHash(), "Should have file hash");
        assertEquals(64, result.getFileHash().length(), "SHA-256 hash should be 64 hex characters");
    }

    @Test
    @DisplayName("Should handle X and Y chromosomes")
    void testSexChromosomes() throws IOException {
        String tsvContent = """
                rsid\tchromosome\tposition\tgenotype
                rs123\tX\t12345\tAA
                rs456\tY\t67890\tGG
                rs789\tMT\t11111\tCC
                """;

        byte[] fileContent = tsvContent.getBytes();
        ImportResult result = tsvImporter.importGenotypeTSV("test-user", fileContent, "test.txt", true);

        assertTrue(result.isSuccess());
        assertEquals(3, result.getImportedVariantsCount());

        assertEquals("X", result.getVariants().get(0).getChrom());
        assertEquals("Y", result.getVariants().get(1).getChrom());
        assertEquals("MT", result.getVariants().get(2).getChrom());
    }

    /**
     * Helper method to load fixture files
     */
    private byte[] loadFixture(String filename) throws IOException {
        String path = "src/test/resources/fixtures/" + filename;
        return Files.readAllBytes(Paths.get(path));
    }
}
