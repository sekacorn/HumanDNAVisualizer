package com.dna.integrator.controller;

import com.dna.integrator.repository.GenomicDataRepository;
import com.dna.integrator.service.importer.GenotypeTSVImporter;
import com.dna.integrator.service.importer.VCFImporter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Paths;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for ImportController
 */
@SpringBootTest(classes = {com.dna.integrator.DNAIntegratorApp.class, com.dna.integrator.config.TestSecurityConfig.class})
@AutoConfigureMockMvc
@Transactional
@org.springframework.test.context.ActiveProfiles("test")
class ImportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private GenomicDataRepository genomicDataRepository;

    @Autowired
    private VCFImporter vcfImporter;

    @Autowired
    private GenotypeTSVImporter genotypeTSVImporter;

    @BeforeEach
    void setUp() {
        // Clean up database before each test
        genomicDataRepository.deleteAll();
    }

    @Test
    @DisplayName("POST /api/import/vcf - Should successfully import valid VCF file")
    void testImportVCFSuccess() throws Exception {
        // Load fixture file
        byte[] fileContent = loadFixture("sample_valid.vcf");

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample_valid.vcf",
                "text/plain",
                fileContent
        );

        mockMvc.perform(multipart("/api/import/vcf")
                        .file(file)
                        .param("userId", "test-user")
                        .param("strictMode", "true")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.importedVariantsCount").value(5))
                .andExpect(jsonPath("$.rejectedLinesCount").value(0))
                .andExpect(jsonPath("$.fileHash").exists())
                .andExpect(jsonPath("$.parserVersion").value("1.0.0"))
                .andExpect(jsonPath("$.message").value(containsString("Successfully imported")))
                .andExpect(jsonPath("$.metadata.genomeBuild").value("GRCh38"))
                .andExpect(jsonPath("$.metadata.importFormat").value("vcf"))
                .andExpect(jsonPath("$.metadata.userId").value("test-user"))
                .andExpect(jsonPath("$.variants").isArray())
                .andExpect(jsonPath("$.variants", hasSize(5)));
    }

    @Test
    @DisplayName("POST /api/import/vcf - Should handle invalid VCF in strict mode")
    void testImportVCFInvalidStrict() throws Exception {
        byte[] fileContent = loadFixture("sample_invalid.vcf");

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample_invalid.vcf",
                "text/plain",
                fileContent
        );

        mockMvc.perform(multipart("/api/import/vcf")
                        .file(file)
                        .param("userId", "test-user")
                        .param("strictMode", "true")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.rejectedLinesCount").value(greaterThan(0)))
                .andExpect(jsonPath("$.errors").isArray())
                .andExpect(jsonPath("$.errors", not(empty())));
    }

    @Test
    @DisplayName("POST /api/import/vcf - Should handle invalid VCF in lenient mode")
    void testImportVCFInvalidLenient() throws Exception {
        byte[] fileContent = loadFixture("sample_invalid.vcf");

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample_invalid.vcf",
                "text/plain",
                fileContent
        );

        mockMvc.perform(multipart("/api/import/vcf")
                        .file(file)
                        .param("userId", "test-user")
                        .param("strictMode", "false")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk()) // Should succeed if at least one variant imported
                .andExpect(jsonPath("$.importedVariantsCount").value(greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.rejectedLinesCount").value(greaterThan(0)))
                .andExpect(jsonPath("$.errors").isArray())
                .andExpect(jsonPath("$.errors", not(empty())));
    }

    @Test
    @DisplayName("POST /api/import/vcf - Should reject empty file")
    void testImportVCFEmptyFile() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "empty.vcf",
                "text/plain",
                new byte[0]
        );

        mockMvc.perform(multipart("/api/import/vcf")
                        .file(file)
                        .param("userId", "test-user")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(containsString("empty")));
    }

    @Test
    @DisplayName("POST /api/import/genotype - Should successfully import tab-separated genotype file")
    void testImportGenotypeTabSuccess() throws Exception {
        byte[] fileContent = loadFixture("sample_genotype_tab.txt");

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample_genotype_tab.txt",
                "text/plain",
                fileContent
        );

        mockMvc.perform(multipart("/api/import/genotype")
                        .file(file)
                        .param("userId", "test-user")
                        .param("strictMode", "true")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.importedVariantsCount").value(10))
                .andExpect(jsonPath("$.rejectedLinesCount").value(0))
                .andExpect(jsonPath("$.fileHash").exists())
                .andExpect(jsonPath("$.parserVersion").value("1.0.0"))
                .andExpect(jsonPath("$.message").value(containsString("Successfully imported")))
                .andExpect(jsonPath("$.metadata.importFormat").value("generic_tsv"))
                .andExpect(jsonPath("$.variants").isArray())
                .andExpect(jsonPath("$.variants", hasSize(10)));
    }

    @Test
    @DisplayName("POST /api/import/genotype - Should successfully import CSV genotype file")
    void testImportGenotypeCSVSuccess() throws Exception {
        byte[] fileContent = loadFixture("sample_genotype_csv.csv");

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample_genotype_csv.csv",
                "text/csv",
                fileContent
        );

        mockMvc.perform(multipart("/api/import/genotype")
                        .file(file)
                        .param("userId", "test-user")
                        .param("strictMode", "true")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.importedVariantsCount").value(10))
                .andExpect(jsonPath("$.rejectedLinesCount").value(0))
                .andExpect(jsonPath("$.variants").isArray())
                .andExpect(jsonPath("$.variants", hasSize(10)));
    }

    @Test
    @DisplayName("POST /api/import/genotype - Should handle invalid genotype file in strict mode")
    void testImportGenotypeInvalidStrict() throws Exception {
        byte[] fileContent = loadFixture("sample_genotype_invalid.txt");

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample_genotype_invalid.txt",
                "text/plain",
                fileContent
        );

        mockMvc.perform(multipart("/api/import/genotype")
                        .file(file)
                        .param("userId", "test-user")
                        .param("strictMode", "true")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.rejectedLinesCount").value(greaterThan(0)))
                .andExpect(jsonPath("$.errors").isArray())
                .andExpect(jsonPath("$.errors", not(empty())));
    }

    @Test
    @DisplayName("POST /api/import/genotype - Should handle invalid genotype file in lenient mode")
    void testImportGenotypeInvalidLenient() throws Exception {
        byte[] fileContent = loadFixture("sample_genotype_invalid.txt");

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample_genotype_invalid.txt",
                "text/plain",
                fileContent
        );

        mockMvc.perform(multipart("/api/import/genotype")
                        .file(file)
                        .param("userId", "test-user")
                        .param("strictMode", "false")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.importedVariantsCount").value(greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.rejectedLinesCount").value(greaterThan(0)))
                .andExpect(jsonPath("$.errors").isArray())
                .andExpect(jsonPath("$.errors", not(empty())));
    }

    @Test
    @DisplayName("POST /api/import/genotype - Should reject empty file")
    void testImportGenotypeEmptyFile() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "empty.txt",
                "text/plain",
                new byte[0]
        );

        mockMvc.perform(multipart("/api/import/genotype")
                        .file(file)
                        .param("userId", "test-user")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(containsString("empty")));
    }

    @Test
    @DisplayName("POST /api/import/vcf - Should store variants in database")
    void testImportVCFStoresInDatabase() throws Exception {
        byte[] fileContent = loadFixture("sample_valid.vcf");

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample_valid.vcf",
                "text/plain",
                fileContent
        );

        // Verify database is empty before import
        assertEquals(0, genomicDataRepository.count());

        mockMvc.perform(multipart("/api/import/vcf")
                        .file(file)
                        .param("userId", "test-user")
                        .param("strictMode", "true")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Verify variants were stored in database
        assertEquals(5, genomicDataRepository.count());

        // Verify data can be retrieved
        var storedVariants = genomicDataRepository.findByUserId("test-user");
        assertEquals(5, storedVariants.size());
    }

    @Test
    @DisplayName("POST /api/import/genotype - Should store variants in database")
    void testImportGenotypeStoresInDatabase() throws Exception {
        byte[] fileContent = loadFixture("sample_genotype_tab.txt");

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample_genotype_tab.txt",
                "text/plain",
                fileContent
        );

        // Verify database is empty before import
        assertEquals(0, genomicDataRepository.count());

        mockMvc.perform(multipart("/api/import/genotype")
                        .file(file)
                        .param("userId", "test-user")
                        .param("strictMode", "true")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Verify variants were stored in database
        assertEquals(10, genomicDataRepository.count());

        // Verify data can be retrieved
        var storedVariants = genomicDataRepository.findByUserId("test-user");
        assertEquals(10, storedVariants.size());
    }

    /**
     * Helper method to load fixture files
     */
    private byte[] loadFixture(String filename) throws Exception {
        String path = "src/test/resources/fixtures/" + filename;
        return Files.readAllBytes(Paths.get(path));
    }

    /**
     * Helper method for assertions
     */
    private void assertEquals(long expected, long actual) {
        if (expected != actual) {
            throw new AssertionError("Expected " + expected + " but got " + actual);
        }
    }
}
