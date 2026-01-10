package com.dna.integrator.security;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Security tests for file handling utilities.
 *
 * Tests validate:
 * - Filename sanitization (path traversal prevention)
 * - SHA-256 hash computation
 * - File extension validation
 * - Memory safety checks
 *
 * Part of Security & Privacy Agent implementation.
 */
@DisplayName("File Security Utilities Tests")
public class FileSecurityTest {

    // ============================================================================
    // Filename Sanitization Tests
    // ============================================================================

    @Test
    @DisplayName("Should sanitize path traversal attack - Unix style")
    public void testSanitizeFilename_PathTraversalUnix() {
        String malicious = "../../etc/passwd";
        String sanitized = FileSecurityUtil.sanitizeFilename(malicious);

        assertFalse(sanitized.contains("/"), "Sanitized filename should not contain /");
        assertFalse(sanitized.contains(".."), "Sanitized filename should not contain ..");
        assertEquals(".._.._ etc_passwd", sanitized);
    }

    @Test
    @DisplayName("Should sanitize path traversal attack - Windows style")
    public void testSanitizeFilename_PathTraversalWindows() {
        String malicious = "..\\..\\Windows\\System32\\config";
        String sanitized = FileSecurityUtil.sanitizeFilename(malicious);

        assertFalse(sanitized.contains("\\"), "Sanitized filename should not contain \\");
        assertFalse(sanitized.contains(".."), "Sanitized filename should not contain ..");
        assertEquals(".._.._ Windows_System32_config", sanitized);
    }

    @Test
    @DisplayName("Should remove null bytes from filename")
    public void testSanitizeFilename_NullBytes() {
        String malicious = "file\0.txt";
        String sanitized = FileSecurityUtil.sanitizeFilename(malicious);

        assertFalse(sanitized.contains("\0"), "Sanitized filename should not contain null bytes");
        assertEquals("file.txt", sanitized);
    }

    @Test
    @DisplayName("Should remove dangerous characters")
    public void testSanitizeFilename_DangerousChars() {
        String malicious = "file<>:\"|?*.vcf";
        String sanitized = FileSecurityUtil.sanitizeFilename(malicious);

        assertFalse(sanitized.contains("<"), "Should remove <");
        assertFalse(sanitized.contains(">"), "Should remove >");
        assertFalse(sanitized.contains(":"), "Should remove :");
        assertFalse(sanitized.contains("\""), "Should remove \"");
        assertFalse(sanitized.contains("|"), "Should remove |");
        assertFalse(sanitized.contains("?"), "Should remove ?");
        assertFalse(sanitized.contains("*"), "Should remove *");
    }

    @Test
    @DisplayName("Should truncate long filenames to 255 characters")
    public void testSanitizeFilename_TooLong() {
        String longFilename = "a".repeat(300) + ".vcf";
        String sanitized = FileSecurityUtil.sanitizeFilename(longFilename);

        assertTrue(sanitized.length() <= 255, "Filename should be truncated to 255 chars");
        assertTrue(sanitized.endsWith(".vcf"), "File extension should be preserved");
    }

    @Test
    @DisplayName("Should handle null filename")
    public void testSanitizeFilename_Null() {
        String sanitized = FileSecurityUtil.sanitizeFilename(null);
        assertEquals("upload.dat", sanitized);
    }

    @Test
    @DisplayName("Should handle empty filename")
    public void testSanitizeFilename_Empty() {
        String sanitized = FileSecurityUtil.sanitizeFilename("");
        assertEquals("upload.dat", sanitized);
    }

    @Test
    @DisplayName("Should handle whitespace-only filename")
    public void testSanitizeFilename_Whitespace() {
        String sanitized = FileSecurityUtil.sanitizeFilename("   ");
        assertEquals("upload.dat", sanitized);
    }

    @Test
    @DisplayName("Should preserve valid filename")
    public void testSanitizeFilename_ValidFilename() {
        String valid = "my-genomic-data_v2.vcf.gz";
        String sanitized = FileSecurityUtil.sanitizeFilename(valid);
        assertEquals(valid, sanitized);
    }

    // ============================================================================
    // SHA-256 Hash Computation Tests
    // ============================================================================

    @Test
    @DisplayName("Should compute correct SHA-256 hash")
    public void testComputeSHA256_Correctness() {
        String testData = "Hello, World!";
        byte[] bytes = testData.getBytes();

        String hash = FileSecurityUtil.computeSHA256(bytes);

        // Expected SHA-256 hash of "Hello, World!"
        String expected = "dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f";
        assertEquals(expected, hash);
    }

    @Test
    @DisplayName("Should produce 64-character hex string")
    public void testComputeSHA256_Length() {
        byte[] bytes = "test".getBytes();
        String hash = FileSecurityUtil.computeSHA256(bytes);

        assertEquals(64, hash.length(), "SHA-256 hash should be 64 hex characters");
        assertTrue(hash.matches("[0-9a-f]{64}"), "Hash should be lowercase hex");
    }

    @Test
    @DisplayName("Should produce different hashes for different inputs")
    public void testComputeSHA256_Uniqueness() {
        byte[] bytes1 = "file1".getBytes();
        byte[] bytes2 = "file2".getBytes();

        String hash1 = FileSecurityUtil.computeSHA256(bytes1);
        String hash2 = FileSecurityUtil.computeSHA256(bytes2);

        assertNotEquals(hash1, hash2, "Different inputs should produce different hashes");
    }

    @Test
    @DisplayName("Should produce same hash for same input (deterministic)")
    public void testComputeSHA256_Deterministic() {
        byte[] bytes = "test data".getBytes();

        String hash1 = FileSecurityUtil.computeSHA256(bytes);
        String hash2 = FileSecurityUtil.computeSHA256(bytes);

        assertEquals(hash1, hash2, "Same input should always produce same hash");
    }

    @Test
    @DisplayName("Should handle empty file")
    public void testComputeSHA256_EmptyFile() {
        byte[] empty = new byte[0];
        String hash = FileSecurityUtil.computeSHA256(empty);

        assertNotNull(hash);
        assertEquals(64, hash.length());
        // SHA-256 of empty string
        assertEquals("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", hash);
    }

    @Test
    @DisplayName("Should handle large file")
    public void testComputeSHA256_LargeFile() {
        byte[] largeFile = new byte[1024 * 1024]; // 1 MB
        for (int i = 0; i < largeFile.length; i++) {
            largeFile[i] = (byte) (i % 256);
        }

        String hash = FileSecurityUtil.computeSHA256(largeFile);

        assertNotNull(hash);
        assertEquals(64, hash.length());
    }

    // ============================================================================
    // File Extension Validation Tests
    // ============================================================================

    @Test
    @DisplayName("Should allow VCF files")
    public void testIsAllowedExtension_VCF() {
        assertTrue(FileSecurityUtil.isAllowedExtension("sample.vcf", "vcf,csv,json"));
        assertTrue(FileSecurityUtil.isAllowedExtension("sample.vcf.gz", "vcf,csv,json"));
        assertTrue(FileSecurityUtil.isAllowedExtension("SAMPLE.VCF", "vcf,csv,json"));
    }

    @Test
    @DisplayName("Should allow CSV files")
    public void testIsAllowedExtension_CSV() {
        assertTrue(FileSecurityUtil.isAllowedExtension("genotypes.csv", "vcf,csv,json"));
        assertTrue(FileSecurityUtil.isAllowedExtension("GENOTYPES.CSV", "vcf,csv,json"));
    }

    @Test
    @DisplayName("Should reject disallowed extensions")
    public void testIsAllowedExtension_Rejected() {
        assertFalse(FileSecurityUtil.isAllowedExtension("malware.exe", "vcf,csv,json"));
        assertFalse(FileSecurityUtil.isAllowedExtension("script.sh", "vcf,csv,json"));
        assertFalse(FileSecurityUtil.isAllowedExtension("archive.zip", "vcf,csv,json"));
    }

    @Test
    @DisplayName("Should handle null inputs")
    public void testIsAllowedExtension_NullInputs() {
        assertFalse(FileSecurityUtil.isAllowedExtension(null, "vcf,csv"));
        assertFalse(FileSecurityUtil.isAllowedExtension("file.vcf", null));
        assertFalse(FileSecurityUtil.isAllowedExtension(null, null));
    }

    @Test
    @DisplayName("Should be case-insensitive")
    public void testIsAllowedExtension_CaseInsensitive() {
        assertTrue(FileSecurityUtil.isAllowedExtension("File.VCF", "vcf"));
        assertTrue(FileSecurityUtil.isAllowedExtension("file.Vcf", "VCF"));
    }

    // ============================================================================
    // Memory Safety Tests
    // ============================================================================

    @Test
    @DisplayName("Should estimate memory requirement correctly")
    public void testEstimateMemoryRequirement() {
        long fileSize = 10 * 1024 * 1024; // 10 MB
        long estimate = FileSecurityUtil.estimateMemoryRequirement(fileSize);

        // Should be approximately 3x file size
        assertEquals(fileSize * 3, estimate);
    }

    @Test
    @DisplayName("Should check memory availability")
    public void testHasSufficientMemory_SmallFile() {
        long smallFile = 1024; // 1 KB
        assertTrue(FileSecurityUtil.hasSufficientMemory(smallFile),
                "Should have memory for small file");
    }

    @Test
    @DisplayName("Should detect insufficient memory for huge file")
    public void testHasSufficientMemory_HugeFile() {
        long hugeFile = Long.MAX_VALUE / 10; // Unrealistically large
        assertFalse(FileSecurityUtil.hasSufficientMemory(hugeFile),
                "Should detect insufficient memory for huge file");
    }

    // ============================================================================
    // Integration Tests
    // ============================================================================

    @Test
    @DisplayName("Should handle complex attack vector filename")
    public void testComplexAttackVector() {
        String complex = "../../../etc/passwd\0.vcf<script>alert('xss')</script>";
        String sanitized = FileSecurityUtil.sanitizeFilename(complex);

        assertFalse(sanitized.contains(".."), "Should remove ..");
        assertFalse(sanitized.contains("/"), "Should remove /");
        assertFalse(sanitized.contains("\0"), "Should remove null bytes");
        assertFalse(sanitized.contains("<"), "Should remove <");
        assertFalse(sanitized.contains(">"), "Should remove >");
        assertTrue(sanitized.endsWith(".vcf"), "Should preserve .vcf extension");
    }

    @Test
    @DisplayName("Should process real-world VCF filename")
    public void testRealWorldFilename() {
        String realistic = "patient_genome_GRCh38_2024-01-09.vcf.gz";
        String sanitized = FileSecurityUtil.sanitizeFilename(realistic);

        assertEquals(realistic, sanitized, "Valid filename should remain unchanged");

        byte[] mockData = realistic.getBytes();
        String hash = FileSecurityUtil.computeSHA256(mockData);

        assertNotNull(hash);
        assertEquals(64, hash.length());
    }
}
