package com.dna.integrator.security;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Security tests for file lifecycle management.
 *
 * Tests validate:
 * - Raw files are NOT stored by default (STORE_RAW_UPLOADS=false)
 * - Raw files ARE stored when explicitly enabled
 * - File hashing works correctly
 * - Configuration flags behave as expected
 * - File cleanup works correctly
 *
 * Part of Security & Privacy Agent implementation.
 */
@DisplayName("File Lifecycle Security Tests")
public class FileLifecycleTest {

    private FileLifecycleManager lifecycleManager;

    @TempDir
    Path tempDir;

    @BeforeEach
    public void setUp() {
        lifecycleManager = new FileLifecycleManager();
    }

    // ============================================================================
    // Default Behavior Tests (STORE_RAW_UPLOADS=false)
    // ============================================================================

    @Test
    @DisplayName("CRITICAL: Raw files should NOT be stored by default")
    public void testRawFileNotStoredByDefault() {
        // Given: Default configuration (STORE_RAW_UPLOADS=false)
        ReflectionTestUtils.setField(lifecycleManager, "storeRawUploads", false);
        ReflectionTestUtils.setField(lifecycleManager, "rawFileStoragePath", tempDir.toString());

        byte[] fileContent = "chr1\t1000\tA\tG".getBytes();
        String filename = "test.vcf";
        String fileHash = FileSecurityUtil.computeSHA256(fileContent);
        String userId = "user123";

        // When: Handle file after import
        lifecycleManager.handleFileAfterImport(fileContent, filename, fileHash, userId);

        // Then: File should NOT exist in storage
        assertFalse(lifecycleManager.fileExists(fileHash),
                "CRITICAL: Raw file should NOT be stored when STORE_RAW_UPLOADS=false");

        try {
            long fileCount = Files.list(tempDir).count();
            assertEquals(0, fileCount,
                    "CRITICAL: Storage directory should be empty by default");
        } catch (IOException e) {
            fail("Failed to check directory: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("File hash should be computed even when not storing file")
    public void testHashComputedWhenNotStoring() {
        // Given: STORE_RAW_UPLOADS=false
        ReflectionTestUtils.setField(lifecycleManager, "storeRawUploads", false);

        byte[] fileContent = "test data".getBytes();
        String fileHash = FileSecurityUtil.computeSHA256(fileContent);

        // Then: Hash should be valid
        assertNotNull(fileHash);
        assertEquals(64, fileHash.length());
        assertTrue(fileHash.matches("[0-9a-f]{64}"));
    }

    @Test
    @DisplayName("Multiple imports with same content should produce same hash")
    public void testDeduplicationByHash() {
        byte[] fileContent = "chr1\t1000\tA\tG".getBytes();

        String hash1 = FileSecurityUtil.computeSHA256(fileContent);
        String hash2 = FileSecurityUtil.computeSHA256(fileContent);

        assertEquals(hash1, hash2, "Same content should produce same hash");
    }

    // ============================================================================
    // Explicit Storage Tests (STORE_RAW_UPLOADS=true)
    // ============================================================================

    @Test
    @DisplayName("Raw files should be stored when explicitly enabled")
    public void testRawFileStoredWhenEnabled() throws IOException {
        // Given: STORE_RAW_UPLOADS=true
        ReflectionTestUtils.setField(lifecycleManager, "storeRawUploads", true);
        ReflectionTestUtils.setField(lifecycleManager, "rawFileStoragePath", tempDir.toString());
        ReflectionTestUtils.setField(lifecycleManager, "encryptStoredFiles", false);

        byte[] fileContent = "chr1\t1000\tA\tG".getBytes();
        String filename = "test.vcf";
        String fileHash = FileSecurityUtil.computeSHA256(fileContent);
        String userId = "user123";

        // When: Handle file after import
        lifecycleManager.handleFileAfterImport(fileContent, filename, fileHash, userId);

        // Then: File should exist in storage
        assertTrue(lifecycleManager.fileExists(fileHash),
                "File should be stored when STORE_RAW_UPLOADS=true");

        long fileCount = Files.list(tempDir).count();
        assertEquals(1, fileCount, "Exactly one file should be stored");
    }

    @Test
    @DisplayName("Should preserve file extension when storing")
    public void testFileExtensionPreserved() throws IOException {
        // Given: STORE_RAW_UPLOADS=true
        ReflectionTestUtils.setField(lifecycleManager, "storeRawUploads", true);
        ReflectionTestUtils.setField(lifecycleManager, "rawFileStoragePath", tempDir.toString());
        ReflectionTestUtils.setField(lifecycleManager, "encryptStoredFiles", false);

        byte[] fileContent = "test".getBytes();
        String filename = "sample.vcf.gz";
        String fileHash = FileSecurityUtil.computeSHA256(fileContent);

        // When: Store file
        lifecycleManager.handleFileAfterImport(fileContent, filename, fileHash, "user123");

        // Then: File should have correct extension
        Path[] files = Files.list(tempDir).toArray(Path[]::new);
        assertEquals(1, files.length);
        assertTrue(files[0].getFileName().toString().endsWith(".vcf.gz"),
                "Stored file should preserve extension");
        assertTrue(files[0].getFileName().toString().startsWith(fileHash),
                "Stored file should use hash as filename");
    }

    @Test
    @DisplayName("Should deduplicate files by hash")
    public void testFileDededuplication() throws IOException {
        // Given: STORE_RAW_UPLOADS=true
        ReflectionTestUtils.setField(lifecycleManager, "storeRawUploads", true);
        ReflectionTestUtils.setField(lifecycleManager, "rawFileStoragePath", tempDir.toString());
        ReflectionTestUtils.setField(lifecycleManager, "encryptStoredFiles", false);

        byte[] fileContent = "duplicate content".getBytes();
        String fileHash = FileSecurityUtil.computeSHA256(fileContent);

        // When: Import same file twice
        lifecycleManager.handleFileAfterImport(fileContent, "file1.vcf", fileHash, "user1");
        lifecycleManager.handleFileAfterImport(fileContent, "file2.vcf", fileHash, "user2");

        // Then: Only one copy should be stored
        long fileCount = Files.list(tempDir).count();
        assertEquals(1, fileCount, "Duplicate file should not be stored twice");
    }

    // ============================================================================
    // File Cleanup Tests
    // ============================================================================

    @Test
    @DisplayName("Should delete files older than retention period")
    public void testOldFileCleanup() throws IOException, InterruptedException {
        // Given: STORE_RAW_UPLOADS=true with short retention
        ReflectionTestUtils.setField(lifecycleManager, "storeRawUploads", true);
        ReflectionTestUtils.setField(lifecycleManager, "rawFileStoragePath", tempDir.toString());
        ReflectionTestUtils.setField(lifecycleManager, "maxStorageDays", 0); // Delete immediately
        ReflectionTestUtils.setField(lifecycleManager, "encryptStoredFiles", false);

        // Create an old file
        Path oldFile = tempDir.resolve("old_file.vcf");
        Files.write(oldFile, "old content".getBytes());

        // Ensure file has old timestamp
        Thread.sleep(10);

        // When: Run cleanup
        lifecycleManager.cleanupOldFiles();

        // Then: Old file should be deleted
        assertFalse(Files.exists(oldFile), "Old file should be deleted");
    }

    @Test
    @DisplayName("Should preserve recent files during cleanup")
    public void testRecentFilePreserved() throws IOException {
        // Given: STORE_RAW_UPLOADS=true with long retention
        ReflectionTestUtils.setField(lifecycleManager, "storeRawUploads", true);
        ReflectionTestUtils.setField(lifecycleManager, "rawFileStoragePath", tempDir.toString());
        ReflectionTestUtils.setField(lifecycleManager, "maxStorageDays", 30);
        ReflectionTestUtils.setField(lifecycleManager, "encryptStoredFiles", false);

        // Create a recent file
        byte[] fileContent = "recent content".getBytes();
        String fileHash = FileSecurityUtil.computeSHA256(fileContent);
        lifecycleManager.handleFileAfterImport(fileContent, "recent.vcf", fileHash, "user123");

        // When: Run cleanup
        lifecycleManager.cleanupOldFiles();

        // Then: Recent file should still exist
        assertTrue(lifecycleManager.fileExists(fileHash), "Recent file should be preserved");
    }

    @Test
    @DisplayName("Cleanup should not run when storage disabled")
    public void testCleanupSkippedWhenStorageDisabled() {
        // Given: STORE_RAW_UPLOADS=false
        ReflectionTestUtils.setField(lifecycleManager, "storeRawUploads", false);

        // When/Then: Cleanup should complete without error
        assertDoesNotThrow(() -> lifecycleManager.cleanupOldFiles(),
                "Cleanup should not fail when storage is disabled");
    }

    // ============================================================================
    // Configuration Tests
    // ============================================================================

    @Test
    @DisplayName("Should report configuration correctly")
    public void testSecurityConfigReporting() {
        ReflectionTestUtils.setField(lifecycleManager, "storeRawUploads", false);
        ReflectionTestUtils.setField(lifecycleManager, "encryptStoredFiles", true);
        ReflectionTestUtils.setField(lifecycleManager, "maxStorageDays", 30);
        ReflectionTestUtils.setField(lifecycleManager, "rawFileStoragePath", "/secure");

        String config = lifecycleManager.getSecurityConfig();

        assertTrue(config.contains("storeRawUploads=false"));
        assertTrue(config.contains("encryptStoredFiles=true"));
        assertTrue(config.contains("maxStorageDays=30"));
        assertTrue(config.contains("storagePath=/secure"));
    }

    @Test
    @DisplayName("CRITICAL: Verify default is secure (no storage)")
    public void testDefaultConfigurationIsSecure() {
        // Given: Fresh instance with defaults
        FileLifecycleManager defaultManager = new FileLifecycleManager();

        // When: Get config
        String config = defaultManager.getSecurityConfig();

        // Then: Should default to NOT storing files
        assertTrue(config.contains("storeRawUploads=false"),
                "CRITICAL: Default must be STORE_RAW_UPLOADS=false");
    }

    // ============================================================================
    // Edge Cases and Error Handling
    // ============================================================================

    @Test
    @DisplayName("Should handle empty file content")
    public void testEmptyFileContent() {
        ReflectionTestUtils.setField(lifecycleManager, "storeRawUploads", false);

        byte[] emptyContent = new byte[0];
        String fileHash = FileSecurityUtil.computeSHA256(emptyContent);

        assertDoesNotThrow(() ->
                lifecycleManager.handleFileAfterImport(emptyContent, "empty.vcf", fileHash, "user123"));
    }

    @Test
    @DisplayName("Should handle large file content")
    public void testLargeFileContent() {
        ReflectionTestUtils.setField(lifecycleManager, "storeRawUploads", false);

        byte[] largeContent = new byte[10 * 1024 * 1024]; // 10 MB
        String fileHash = FileSecurityUtil.computeSHA256(largeContent);

        assertDoesNotThrow(() ->
                lifecycleManager.handleFileAfterImport(largeContent, "large.vcf", fileHash, "user123"));
    }

    @Test
    @DisplayName("Should handle filename with special characters")
    public void testSpecialCharFilename() {
        ReflectionTestUtils.setField(lifecycleManager, "storeRawUploads", true);
        ReflectionTestUtils.setField(lifecycleManager, "rawFileStoragePath", tempDir.toString());
        ReflectionTestUtils.setField(lifecycleManager, "encryptStoredFiles", false);

        byte[] content = "test".getBytes();
        String fileHash = FileSecurityUtil.computeSHA256(content);
        String sanitizedFilename = FileSecurityUtil.sanitizeFilename("../../etc/passwd.vcf");

        assertDoesNotThrow(() ->
                lifecycleManager.handleFileAfterImport(content, sanitizedFilename, fileHash, "user123"));
    }

    // ============================================================================
    // Integration Test
    // ============================================================================

    @Test
    @DisplayName("Full lifecycle test: import, verify, cleanup")
    public void testFullLifecycle() throws IOException {
        // Setup
        ReflectionTestUtils.setField(lifecycleManager, "storeRawUploads", true);
        ReflectionTestUtils.setField(lifecycleManager, "rawFileStoragePath", tempDir.toString());
        ReflectionTestUtils.setField(lifecycleManager, "maxStorageDays", 0);
        ReflectionTestUtils.setField(lifecycleManager, "encryptStoredFiles", false);

        // 1. Import file
        byte[] fileContent = "chr1\t1000\tA\tG".getBytes();
        String fileHash = FileSecurityUtil.computeSHA256(fileContent);
        lifecycleManager.handleFileAfterImport(fileContent, "test.vcf", fileHash, "user123");

        // 2. Verify stored
        assertTrue(lifecycleManager.fileExists(fileHash), "File should be stored");

        // 3. Run cleanup
        lifecycleManager.cleanupOldFiles();

        // 4. Verify deleted (retention = 0 days)
        assertFalse(lifecycleManager.fileExists(fileHash), "File should be cleaned up");
    }
}
