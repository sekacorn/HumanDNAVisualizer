package com.dna.integrator.qa;

import com.dna.integrator.dto.ImportResult;
import com.dna.integrator.model.GenomicData;
import com.dna.integrator.repository.GenomicDataRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * End-to-End Smoke Tests
 *
 * Validates complete user workflows from start to finish.
 *
 * Tests critical paths:
 * 1. File upload → variants stored → data queryable
 * 2. Import → anatomy graph generation → frontend loadable
 *
 * These tests run against the full application stack.
 *
 * Part of QA / Verification Agent implementation.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("E2E Smoke Tests - Full Workflow Validation")
@org.springframework.context.annotation.Import(com.dna.integrator.config.TestSecurityConfig.class)
public class E2ESmokeTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private GenomicDataRepository genomicDataRepository;

    private static final String TEST_USER_ID = "e2e-smoke-test-user";
    private static String importedFileHash;

    // ============================================================================
    // Full Import Workflow Test
    // ============================================================================

    @Test
    @Order(1)
    @DisplayName("E2E Step 1: Upload VCF file via API")
    public void step1_uploadVCFFile() throws IOException {
        // 1. Load test VCF
        byte[] vcfContent = loadFixture("test-fixtures/golden-inputs/vcf/minimal.vcf");
        assertNotNull(vcfContent, "Test VCF file should exist");
        assertTrue(vcfContent.length > 0, "Test VCF should not be empty");

        // 2. Prepare multipart request
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new ByteArrayResource(vcfContent) {
            @Override
            public String getFilename() {
                return "e2e-test.vcf";
            }
        });
        body.add("userId", TEST_USER_ID);
        body.add("strictMode", "true");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

        // 3. Upload via API
        ResponseEntity<ImportResult> response = restTemplate.postForEntity(
                "/api/import/vcf", request, ImportResult.class);

        // 4. Verify response
        assertEquals(HttpStatus.OK, response.getStatusCode(),
                "E2E: VCF upload should return 200 OK");

        ImportResult result = response.getBody();
        assertNotNull(result, "E2E: ImportResult should not be null");
        assertTrue(result.isSuccess(), "E2E: Import should succeed");
        assertTrue(result.getImportedVariantsCount() > 0,
                "E2E: Should have imported at least one variant");

        // 5. Store file hash for next steps
        importedFileHash = result.getFileHash();
        assertNotNull(importedFileHash, "E2E: File hash should be computed");
        assertEquals(64, importedFileHash.length(), "E2E: File hash should be SHA-256");

        System.out.println("✅ E2E Step 1: VCF uploaded successfully");
        System.out.println("   - Variants imported: " + result.getImportedVariantsCount());
        System.out.println("   - File hash: " + importedFileHash.substring(0, 16) + "...");
    }

    @Test
    @Order(2)
    @DisplayName("E2E Step 2: Verify variants stored in database")
    public void step2_verifyDatabaseStorage() {
        // Query database for imported variants
        List<GenomicData> storedData = genomicDataRepository.findByUserId(TEST_USER_ID);

        assertFalse(storedData.isEmpty(),
                "E2E: Variants should be stored in database");
        assertTrue(storedData.size() > 0,
                "E2E: Should have at least one variant in database");

        // Verify data structure
        GenomicData first = storedData.get(0);
        assertNotNull(first.getChromosome(), "E2E: Variant should have chromosome");
        assertNotNull(first.getPosition(), "E2E: Variant should have position");
        assertNotNull(first.getReferenceAllele(), "E2E: Variant should have ref allele");
        assertNotNull(first.getAlternateAllele(), "E2E: Variant should have alt allele");

        // Verify file hash is in annotations
        assertNotNull(first.getAnnotations(), "E2E: Variant should have annotations");
        assertTrue(first.getAnnotations().contains(importedFileHash),
                "E2E: File hash should be in annotations");

        System.out.println("✅ E2E Step 2: Variants verified in database");
        System.out.println("   - Stored variants: " + storedData.size());
        System.out.println("   - First variant: " + first.getChromosome() + ":" + first.getPosition());
    }

    @Test
    @Order(3)
    @Disabled("Pending full anatomy graph API implementation - endpoint URL to be finalized")
    @DisplayName("E2E Step 3: Generate anatomy graph from variants")
    public void step3_generateAnatomyGraph() {
        // Request anatomy graph via API
        ResponseEntity<String> response = restTemplate.getForEntity(
                "/api/anatomy/graph?userId=" + TEST_USER_ID, String.class);

        assertEquals(HttpStatus.OK, response.getStatusCode(),
                "E2E: Anatomy graph endpoint should return 200 OK");

        String graphJson = response.getBody();
        assertNotNull(graphJson, "E2E: Anatomy graph JSON should not be null");
        assertTrue(graphJson.length() > 0, "E2E: Anatomy graph should not be empty");

        // Verify JSON structure (basic validation)
        assertTrue(graphJson.contains("nodes"), "E2E: Graph should have nodes");
        assertTrue(graphJson.contains("overlays"), "E2E: Graph should have overlays");
        assertTrue(graphJson.contains("rulesVersion"), "E2E: Graph should have rulesVersion");

        System.out.println("✅ E2E Step 3: Anatomy graph generated");
        System.out.println("   - JSON length: " + graphJson.length() + " bytes");
    }

    @Test
    @Order(4)
    @Disabled("Pending full anatomy graph API implementation - endpoint URL to be finalized")
    @DisplayName("E2E Step 4: Verify frontend can load anatomy graph")
    public void step4_frontendCanLoadGraph() {
        // Simulate frontend request for anatomy graph
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        HttpEntity<String> request = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/anatomy/graph?userId=" + TEST_USER_ID,
                HttpMethod.GET,
                request,
                String.class);

        assertEquals(HttpStatus.OK, response.getStatusCode(),
                "E2E: Frontend should be able to load graph");

        String json = response.getBody();
        assertNotNull(json, "E2E: Graph JSON should not be null");

        // Verify Content-Type header
        MediaType contentType = response.getHeaders().getContentType();
        assertNotNull(contentType, "E2E: Content-Type header should be set");
        assertTrue(contentType.includes(MediaType.APPLICATION_JSON),
                "E2E: Content-Type should be application/json");

        System.out.println("✅ E2E Step 4: Frontend can load graph");
        System.out.println("   - Content-Type: " + contentType);
    }

    // ============================================================================
    // Data Query Workflow Test
    // ============================================================================

    @Test
    @Order(5)
    @Disabled("Pending full genomic data query API implementation - endpoint URL to be finalized")
    @DisplayName("E2E Step 5: Query genomic data via API")
    public void step5_queryGenomicData() {
        // Query genomic data for user
        ResponseEntity<String> response = restTemplate.getForEntity(
                "/api/genomic-data/user/" + TEST_USER_ID, String.class);

        assertEquals(HttpStatus.OK, response.getStatusCode(),
                "E2E: Genomic data query should return 200 OK");

        String dataJson = response.getBody();
        assertNotNull(dataJson, "E2E: Genomic data JSON should not be null");
        assertTrue(dataJson.length() > 0, "E2E: Genomic data should not be empty");

        // Verify it's an array
        assertTrue(dataJson.trim().startsWith("["), "E2E: Response should be JSON array");
        assertTrue(dataJson.trim().endsWith("]"), "E2E: Response should be JSON array");

        System.out.println("✅ E2E Step 5: Genomic data queryable");
        System.out.println("   - Response length: " + dataJson.length() + " bytes");
    }

    // ============================================================================
    // API Health Check Test
    // ============================================================================

    @Test
    @Order(6)
    @DisplayName("E2E Step 6: Health check - system is operational")
    public void step6_healthCheck() {
        // Check application health
        ResponseEntity<String> response = restTemplate.getForEntity(
                "/actuator/health", String.class);

        assertEquals(HttpStatus.OK, response.getStatusCode(),
                "E2E: Health endpoint should return 200 OK");

        String health = response.getBody();
        assertNotNull(health, "E2E: Health response should not be null");
        assertTrue(health.contains("UP") || health.contains("\"status\":\"UP\""),
                "E2E: System should be UP");

        System.out.println("✅ E2E Step 6: System health verified");
        System.out.println("   - Status: UP");
    }

    // ============================================================================
    // Cleanup
    // ============================================================================

    @AfterAll
    public static void cleanup(@Autowired GenomicDataRepository repository) {
        // Clean up test data
        List<GenomicData> testData = repository.findByUserId(TEST_USER_ID);
        if (!testData.isEmpty()) {
            repository.deleteAll(testData);
            System.out.println("🧹 E2E Cleanup: Deleted " + testData.size() + " test variants");
        }
    }

    // ============================================================================
    // Negative Tests - Error Handling
    // ============================================================================

    @Test
    @DisplayName("E2E Negative: Empty file upload should be rejected")
    public void testNegative_emptyFileRejected() {
        // Attempt to upload empty file
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new ByteArrayResource(new byte[0]) {
            @Override
            public String getFilename() {
                return "empty.vcf";
            }
        });
        body.add("userId", "test-user");
        body.add("strictMode", "true");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<ImportResult> response = restTemplate.postForEntity(
                "/api/import/vcf", request, ImportResult.class);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode(),
                "E2E: Empty file should be rejected with 400 Bad Request");
    }

    @Test
    @Disabled("Pending full API implementation - endpoint URL to be finalized")
    @DisplayName("E2E Negative: Invalid user ID should return empty results")
    public void testNegative_invalidUserReturnsEmpty() {
        // Query with non-existent user
        ResponseEntity<String> response = restTemplate.getForEntity(
                "/api/anatomy/graph?userId=nonexistent-user-12345", String.class);

        // Should return OK but with empty or minimal graph
        assertEquals(HttpStatus.OK, response.getStatusCode(),
                "E2E: Query with invalid user should return 200 OK");

        String json = response.getBody();
        assertNotNull(json, "E2E: Response should not be null");
    }

    // ============================================================================
    // Helper Methods
    // ============================================================================

    /**
     * Load test fixture file.
     */
    private byte[] loadFixture(String path) throws IOException {
        String fullPath = "src/test/resources/" + path;
        return Files.readAllBytes(Paths.get(fullPath));
    }
}
