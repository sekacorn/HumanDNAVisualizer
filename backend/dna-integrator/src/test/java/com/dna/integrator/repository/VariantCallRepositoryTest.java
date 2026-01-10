package com.dna.integrator.repository;

import com.dna.integrator.model.SampleEntity;
import com.dna.integrator.model.VariantCallEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Repository tests for VariantCallEntity.
 * Tests CRUD operations, queries, and relationships.
 *
 * Educational/research purposes only - not for medical diagnosis or treatment.
 */
@DataJpaTest
@ActiveProfiles("test")
class VariantCallRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private SampleRepository sampleRepository;

    @Autowired
    private VariantCallRepository variantCallRepository;

    private SampleEntity testSample;

    @BeforeEach
    void setUp() {
        // Clear database
        variantCallRepository.deleteAll();
        sampleRepository.deleteAll();

        // Create and save test sample
        testSample = SampleEntity.builder()
                .userId("test-user")
                .fileHash("test-hash")
                .importFormat("vcf")
                .parserVersion("1.0.0")
                .importedAt(LocalDateTime.now())
                .build();

        testSample = sampleRepository.save(testSample);
    }

    @Test
    @DisplayName("Should save and retrieve variant call")
    void testSaveAndRetrieve() {
        VariantCallEntity variant = VariantCallEntity.builder()
                .sample(testSample)
                .chrom("1")
                .pos(12345L)
                .rsid("rs123456")
                .ref("A")
                .alt("G")
                .genotype("0/1")
                .qual(99.5)
                .filter("PASS")
                .source("vcf")
                .build();

        VariantCallEntity saved = variantCallRepository.save(variant);

        assertNotNull(saved.getId());
        assertTrue(saved.getId() > 0);

        Optional<VariantCallEntity> retrieved = variantCallRepository.findById(saved.getId());

        assertTrue(retrieved.isPresent());
        assertEquals("1", retrieved.get().getChrom());
        assertEquals(12345L, retrieved.get().getPos());
        assertEquals("rs123456", retrieved.get().getRsid());
    }

    @Test
    @DisplayName("Should find variants by sample ID")
    void testFindBySampleId() {
        // Create variants
        createVariant("1", 1000L, "rs001");
        createVariant("1", 2000L, "rs002");
        createVariant("2", 3000L, "rs003");

        List<VariantCallEntity> variants = variantCallRepository.findBySampleId(testSample.getId());

        assertEquals(3, variants.size());
    }

    @Test
    @DisplayName("Should find variants by sample ID with pagination")
    void testFindBySampleIdWithPagination() {
        // Create 5 variants
        for (int i = 1; i <= 5; i++) {
            createVariant("1", (long) i * 1000, "rs" + i);
        }

        Page<VariantCallEntity> page1 = variantCallRepository.findBySampleId(
                testSample.getId(), PageRequest.of(0, 2));

        assertEquals(2, page1.getContent().size());
        assertEquals(5, page1.getTotalElements());
        assertEquals(3, page1.getTotalPages());

        Page<VariantCallEntity> page2 = variantCallRepository.findBySampleId(
                testSample.getId(), PageRequest.of(1, 2));

        assertEquals(2, page2.getContent().size());
    }

    @Test
    @DisplayName("Should find variants by chromosome")
    void testFindBySampleIdAndChrom() {
        createVariant("1", 1000L, "rs001");
        createVariant("1", 2000L, "rs002");
        createVariant("2", 3000L, "rs003");
        createVariant("X", 4000L, "rs004");

        List<VariantCallEntity> chr1Variants =
                variantCallRepository.findBySampleIdAndChrom(testSample.getId(), "1");

        assertEquals(2, chr1Variants.size());

        List<VariantCallEntity> chrXVariants =
                variantCallRepository.findBySampleIdAndChrom(testSample.getId(), "X");

        assertEquals(1, chrXVariants.size());
    }

    @Test
    @DisplayName("Should find variant by chromosome and position")
    void testFindByChromAndPos() {
        createVariant("1", 12345L, "rs123");

        Optional<VariantCallEntity> found =
                variantCallRepository.findBySampleIdAndChromAndPos(testSample.getId(), "1", 12345L);

        assertTrue(found.isPresent());
        assertEquals("rs123", found.get().getRsid());
    }

    @Test
    @DisplayName("Should find variants in genomic range")
    void testFindVariantsInRange() {
        createVariant("1", 1000L, "rs001");
        createVariant("1", 2000L, "rs002");
        createVariant("1", 3000L, "rs003");
        createVariant("1", 4000L, "rs004");
        createVariant("2", 2500L, "rs005"); // Different chromosome

        List<VariantCallEntity> variants = variantCallRepository.findVariantsInRange(
                testSample.getId(), "1", 1500L, 3500L);

        assertEquals(2, variants.size());
        assertTrue(variants.stream().allMatch(v -> v.getPos() >= 1500 && v.getPos() <= 3500));
    }

    @Test
    @DisplayName("Should count variants by sample ID")
    void testCountBySampleId() {
        createVariant("1", 1000L, "rs001");
        createVariant("2", 2000L, "rs002");

        long count = variantCallRepository.countBySampleId(testSample.getId());

        assertEquals(2, count);
    }

    @Test
    @DisplayName("Should count variants by chromosome")
    void testCountBySampleIdAndChrom() {
        createVariant("1", 1000L, "rs001");
        createVariant("1", 2000L, "rs002");
        createVariant("2", 3000L, "rs003");

        long chr1Count = variantCallRepository.countBySampleIdAndChrom(testSample.getId(), "1");
        long chr2Count = variantCallRepository.countBySampleIdAndChrom(testSample.getId(), "2");

        assertEquals(2, chr1Count);
        assertEquals(1, chr2Count);
    }

    @Test
    @DisplayName("Should find variants by genotype")
    void testFindByGenotype() {
        VariantCallEntity het = createVariant("1", 1000L, "rs001");
        het.setGenotype("0/1");
        variantCallRepository.save(het);

        VariantCallEntity hom = createVariant("1", 2000L, "rs002");
        hom.setGenotype("1/1");
        variantCallRepository.save(hom);

        List<VariantCallEntity> heterozygous =
                variantCallRepository.findBySampleIdAndGenotype(testSample.getId(), "0/1");

        assertEquals(1, heterozygous.size());
        assertEquals("rs001", heterozygous.get(0).getRsid());
    }

    @Test
    @DisplayName("Should find variants with quality above threshold")
    void testFindVariantsWithQualityAbove() {
        VariantCallEntity highQual = createVariant("1", 1000L, "rs001");
        highQual.setQual(99.0);
        variantCallRepository.save(highQual);

        VariantCallEntity lowQual = createVariant("1", 2000L, "rs002");
        lowQual.setQual(50.0);
        variantCallRepository.save(lowQual);

        VariantCallEntity noQual = createVariant("1", 3000L, "rs003");
        variantCallRepository.save(noQual);

        List<VariantCallEntity> highQualityVariants =
                variantCallRepository.findVariantsWithQualityAbove(testSample.getId(), 80.0);

        assertEquals(1, highQualityVariants.size());
        assertEquals("rs001", highQualityVariants.get(0).getRsid());
    }

    @Test
    @DisplayName("Should find passed variants")
    void testFindPassedVariants() {
        VariantCallEntity pass1 = createVariant("1", 1000L, "rs001");
        pass1.setFilter("PASS");
        variantCallRepository.save(pass1);

        VariantCallEntity pass2 = createVariant("1", 2000L, "rs002");
        pass2.setFilter(null);
        variantCallRepository.save(pass2);

        VariantCallEntity failed = createVariant("1", 3000L, "rs003");
        failed.setFilter("LowQual");
        variantCallRepository.save(failed);

        List<VariantCallEntity> passed =
                variantCallRepository.findPassedVariants(testSample.getId());

        assertEquals(2, passed.size());
    }

    @Test
    @DisplayName("Should find all rsIDs for sample")
    void testFindAllRsidsForSample() {
        createVariant("1", 1000L, "rs001");
        createVariant("1", 2000L, "rs002");
        createVariant("2", 3000L, null); // No rsID

        List<String> rsids = variantCallRepository.findAllRsidsForSample(testSample.getId());

        assertEquals(2, rsids.size());
        assertTrue(rsids.contains("rs001"));
        assertTrue(rsids.contains("rs002"));
    }

    @Test
    @DisplayName("Should find all chromosomes for sample")
    void testFindAllChromosomesForSample() {
        createVariant("1", 1000L, "rs001");
        createVariant("1", 2000L, "rs002");
        createVariant("2", 3000L, "rs003");
        createVariant("X", 4000L, "rs004");

        List<String> chromosomes = variantCallRepository.findAllChromosomesForSample(testSample.getId());

        assertEquals(3, chromosomes.size());
        assertTrue(chromosomes.contains("1"));
        assertTrue(chromosomes.contains("2"));
        assertTrue(chromosomes.contains("X"));
    }

    @Test
    @DisplayName("Should cascade delete variants when sample is deleted")
    void testCascadeDelete() {
        createVariant("1", 1000L, "rs001");
        createVariant("1", 2000L, "rs002");

        assertEquals(2, variantCallRepository.countBySampleId(testSample.getId()));

        // Delete sample
        sampleRepository.deleteById(testSample.getId());

        // Variants should be automatically deleted
        assertEquals(0, variantCallRepository.countBySampleId(testSample.getId()));
    }

    /**
     * Helper method to create a variant
     */
    private VariantCallEntity createVariant(String chrom, Long pos, String rsid) {
        VariantCallEntity variant = VariantCallEntity.builder()
                .sample(testSample)
                .chrom(chrom)
                .pos(pos)
                .rsid(rsid)
                .ref("A")
                .alt("G")
                .source("vcf")
                .build();

        return variantCallRepository.save(variant);
    }
}
