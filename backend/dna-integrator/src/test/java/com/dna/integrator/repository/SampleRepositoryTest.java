package com.dna.integrator.repository;

import com.dna.integrator.model.SampleEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Repository tests for SampleEntity.
 * Tests CRUD operations, queries, and constraints.
 *
 * Educational/research purposes only - not for medical diagnosis or treatment.
 */
@DataJpaTest
@ActiveProfiles("test")
class SampleRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private SampleRepository sampleRepository;

    private SampleEntity testSample;

    @BeforeEach
    void setUp() {
        // Clear database
        sampleRepository.deleteAll();

        // Create test sample
        testSample = SampleEntity.builder()
                .userId("test-user")
                .fileHash("abc123def456")
                .importFormat("vcf")
                .genomeBuild("GRCh38")
                .parserVersion("1.0.0")
                .importedAt(LocalDateTime.now())
                .originalFilename("test.vcf")
                .fileSizeBytes(1024L)
                .variantCount(100)
                .rejectedLineCount(0)
                .importStatus("SUCCESS")
                .metadata("{\"test\":\"data\"}")
                .build();
    }

    @Test
    @DisplayName("Should save and retrieve sample")
    void testSaveAndRetrieve() {
        // Save
        SampleEntity saved = sampleRepository.save(testSample);

        assertNotNull(saved.getId(), "ID should be generated");
        assertTrue(saved.getId() > 0, "ID should be positive");

        // Retrieve
        Optional<SampleEntity> retrieved = sampleRepository.findById(saved.getId());

        assertTrue(retrieved.isPresent(), "Sample should be found");
        assertEquals(saved.getUserId(), retrieved.get().getUserId());
        assertEquals(saved.getFileHash(), retrieved.get().getFileHash());
        assertEquals(saved.getImportFormat(), retrieved.get().getImportFormat());
        assertEquals(saved.getGenomeBuild(), retrieved.get().getGenomeBuild());
    }

    @Test
    @DisplayName("Should find samples by user ID")
    void testFindByUserId() {
        // Save multiple samples for same user
        sampleRepository.save(testSample);

        SampleEntity sample2 = SampleEntity.builder()
                .userId("test-user")
                .fileHash("xyz789")
                .importFormat("generic_tsv")
                .parserVersion("1.0.0")
                .importedAt(LocalDateTime.now())
                .build();
        sampleRepository.save(sample2);

        // Save sample for different user
        SampleEntity sample3 = SampleEntity.builder()
                .userId("other-user")
                .fileHash("different123")
                .importFormat("vcf")
                .parserVersion("1.0.0")
                .importedAt(LocalDateTime.now())
                .build();
        sampleRepository.save(sample3);

        // Query
        List<SampleEntity> userSamples = sampleRepository.findByUserId("test-user");

        assertEquals(2, userSamples.size(), "Should find 2 samples for test-user");
    }

    @Test
    @DisplayName("Should find sample by file hash")
    void testFindByFileHash() {
        // Save
        sampleRepository.save(testSample);

        // Query
        Optional<SampleEntity> found = sampleRepository.findByFileHash("abc123def456");

        assertTrue(found.isPresent(), "Sample should be found by file hash");
        assertEquals(testSample.getUserId(), found.get().getUserId());
    }

    @Test
    @DisplayName("Should enforce unique file hash constraint")
    void testUniqueFileHashConstraint() {
        // Save first sample
        sampleRepository.save(testSample);

        // Try to save duplicate file hash
        SampleEntity duplicate = SampleEntity.builder()
                .userId("different-user")
                .fileHash("abc123def456") // Same hash!
                .importFormat("vcf")
                .parserVersion("1.0.0")
                .importedAt(LocalDateTime.now())
                .build();

        // Should throw exception
        assertThrows(Exception.class, () -> {
            sampleRepository.save(duplicate);
            entityManager.flush();
        }, "Duplicate file hash should throw exception");
    }

    @Test
    @DisplayName("Should check if file hash exists")
    void testExistsByFileHash() {
        // Initially doesn't exist
        assertFalse(sampleRepository.existsByFileHash("abc123def456"));

        // Save
        sampleRepository.save(testSample);

        // Now exists
        assertTrue(sampleRepository.existsByFileHash("abc123def456"));
    }

    @Test
    @DisplayName("Should count samples by user ID")
    void testCountByUserId() {
        assertEquals(0, sampleRepository.countByUserId("test-user"));

        sampleRepository.save(testSample);

        assertEquals(1, sampleRepository.countByUserId("test-user"));
    }

    @Test
    @DisplayName("Should find samples by import format")
    void testFindByImportFormat() {
        sampleRepository.save(testSample);

        SampleEntity sample2 = SampleEntity.builder()
                .userId("test-user")
                .fileHash("different")
                .importFormat("generic_tsv")
                .parserVersion("1.0.0")
                .importedAt(LocalDateTime.now())
                .build();
        sampleRepository.save(sample2);

        List<SampleEntity> vcfSamples = sampleRepository.findByImportFormat("vcf");
        assertEquals(1, vcfSamples.size());

        List<SampleEntity> tsvSamples = sampleRepository.findByImportFormat("generic_tsv");
        assertEquals(1, tsvSamples.size());
    }

    @Test
    @DisplayName("Should find samples by genome build")
    void testFindByGenomeBuild() {
        sampleRepository.save(testSample);

        List<SampleEntity> grch38Samples = sampleRepository.findByGenomeBuild("GRCh38");
        assertEquals(1, grch38Samples.size());

        List<SampleEntity> grch37Samples = sampleRepository.findByGenomeBuild("GRCh37");
        assertEquals(0, grch37Samples.size());
    }

    @Test
    @DisplayName("Should find samples by import status")
    void testFindByImportStatus() {
        sampleRepository.save(testSample);

        SampleEntity failed = SampleEntity.builder()
                .userId("test-user")
                .fileHash("failed123")
                .importFormat("vcf")
                .parserVersion("1.0.0")
                .importedAt(LocalDateTime.now())
                .importStatus("FAILED")
                .build();
        sampleRepository.save(failed);

        List<SampleEntity> successful = sampleRepository.findByImportStatus("SUCCESS");
        assertEquals(1, successful.size());

        List<SampleEntity> failedSamples = sampleRepository.findByImportStatus("FAILED");
        assertEquals(1, failedSamples.size());
    }

    @Test
    @DisplayName("Should get total variant count for user")
    void testGetTotalVariantCountForUser() {
        testSample.setVariantCount(100);
        sampleRepository.save(testSample);

        SampleEntity sample2 = SampleEntity.builder()
                .userId("test-user")
                .fileHash("other")
                .importFormat("vcf")
                .parserVersion("1.0.0")
                .importedAt(LocalDateTime.now())
                .variantCount(200)
                .build();
        sampleRepository.save(sample2);

        long total = sampleRepository.getTotalVariantCountForUser("test-user");
        assertEquals(300, total);
    }

    @Test
    @DisplayName("Should delete sample")
    void testDeleteSample() {
        SampleEntity saved = sampleRepository.save(testSample);
        Long id = saved.getId();

        assertTrue(sampleRepository.existsById(id));

        sampleRepository.deleteById(id);

        assertFalse(sampleRepository.existsById(id));
    }

    @Test
    @DisplayName("Should order samples by imported_at descending")
    void testOrderByImportedAtDesc() throws InterruptedException {
        // Save first sample
        sampleRepository.save(testSample);

        // Wait a bit to ensure different timestamps
        Thread.sleep(10);

        // Save second sample
        SampleEntity sample2 = SampleEntity.builder()
                .userId("test-user")
                .fileHash("newer")
                .importFormat("vcf")
                .parserVersion("1.0.0")
                .importedAt(LocalDateTime.now())
                .build();
        sampleRepository.save(sample2);

        // Query ordered
        List<SampleEntity> ordered = sampleRepository.findByUserIdOrderByImportedAtDesc("test-user");

        assertEquals(2, ordered.size());
        // Newer sample should be first
        assertEquals("newer", ordered.get(0).getFileHash());
    }
}
