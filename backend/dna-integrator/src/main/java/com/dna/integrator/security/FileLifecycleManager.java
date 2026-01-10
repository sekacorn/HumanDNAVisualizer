package com.dna.integrator.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * File Lifecycle Manager
 *
 * Manages the secure lifecycle of uploaded files:
 * 1. Receive file (MultipartFile → byte[])
 * 2. Compute hash (SHA-256)
 * 3. Process file (parse variants)
 * 4. Optionally store encrypted copy (if configured)
 * 5. Discard raw file (default behavior)
 *
 * Security requirements:
 * - Raw files NOT stored by default (STORE_RAW_UPLOADS=false)
 * - Hash always computed (for deduplication/audit)
 * - Stored files are encrypted (if storage enabled)
 * - Old files auto-deleted after retention period
 *
 * Part of Security & Privacy Agent implementation.
 */
@Service
@Slf4j
public class FileLifecycleManager {

    @Value("${security.file-handling.store-raw-uploads:false}")
    private boolean storeRawUploads;

    @Value("${security.file-handling.raw-file-storage-path:./secure-uploads}")
    private String rawFileStoragePath;

    @Value("${security.file-handling.max-storage-days:30}")
    private int maxStorageDays;

    @Value("${security.file-handling.encrypt-stored-files:true}")
    private boolean encryptStoredFiles;

    /**
     * Handle file after successful import.
     *
     * Default behavior: File is discarded (byte[] eligible for garbage collection).
     * If STORE_RAW_UPLOADS=true: File is stored (encrypted if configured).
     *
     * @param fileContent Raw file bytes
     * @param filename Original filename (sanitized)
     * @param fileHash SHA-256 hash of file
     * @param userId User who uploaded the file
     */
    public void handleFileAfterImport(byte[] fileContent, String filename,
                                      String fileHash, String userId) {
        if (storeRawUploads) {
            log.info("SECURITY: Storing raw upload (STORE_RAW_UPLOADS=true) - hash: {}, user: {}",
                     fileHash, userId);

            try {
                storeFile(fileContent, filename, fileHash, userId);
            } catch (IOException e) {
                log.error("Failed to store raw upload file: {}", fileHash, e);
                // Don't fail import if storage fails - variants already saved
            }
        } else {
            log.debug("SECURITY: Discarding raw upload (STORE_RAW_UPLOADS=false) - hash: {}",
                     fileHash);
            // No action needed - byte[] will be garbage collected
            // MultipartFile temp file automatically deleted by Spring
        }
    }

    /**
     * Store file to secure storage.
     *
     * Files stored with hash as filename to prevent collisions.
     * Optionally encrypted if configured.
     *
     * @param fileContent Raw file bytes
     * @param filename Original filename
     * @param fileHash SHA-256 hash
     * @param userId User ID for audit
     * @throws IOException if storage fails
     */
    private void storeFile(byte[] fileContent, String filename, String fileHash,
                          String userId) throws IOException {
        // Create storage directory if it doesn't exist
        Path storagePath = Paths.get(rawFileStoragePath);
        if (!Files.exists(storagePath)) {
            Files.createDirectories(storagePath);
            log.info("Created raw file storage directory: {}", rawFileStoragePath);
        }

        // Use hash as filename to prevent collisions and maintain uniqueness
        String extension = getFileExtension(filename);
        String storageFilename = fileHash + extension;
        Path filePath = storagePath.resolve(storageFilename);

        // Check if file already exists (deduplication)
        if (Files.exists(filePath)) {
            log.info("SECURITY: File already stored (duplicate detected) - hash: {}", fileHash);
            return;
        }

        // Store file (encrypted if configured)
        byte[] dataToStore = fileContent;
        if (encryptStoredFiles) {
            // TODO: Implement encryption when FieldEncryptor is available
            // For now, log that encryption is requested but not yet implemented
            log.warn("SECURITY: File encryption requested but not yet implemented - storing unencrypted");
        }

        Files.write(filePath, dataToStore);
        log.info("SECURITY: Stored raw file - hash: {}, path: {}, size: {} bytes",
                 fileHash, filePath, dataToStore.length);

        // Record metadata for cleanup
        recordFileMetadata(fileHash, storageFilename, userId);
    }

    /**
     * Record file metadata for cleanup and audit.
     *
     * @param fileHash SHA-256 hash
     * @param storageFilename Filename in storage
     * @param userId User ID
     */
    private void recordFileMetadata(String fileHash, String storageFilename, String userId) {
        // TODO: Store in database table for tracking
        // For now, just log
        log.info("AUDIT: File stored - hash: {}, filename: {}, user: {}, timestamp: {}",
                 fileHash, storageFilename, userId, LocalDateTime.now());
    }

    /**
     * Get file extension from filename.
     *
     * @param filename Filename
     * @return Extension including dot (e.g., ".vcf.gz"), or empty string if none
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.isBlank()) {
            return "";
        }

        // Handle .vcf.gz, .tar.gz, etc.
        if (filename.endsWith(".vcf.gz")) {
            return ".vcf.gz";
        } else if (filename.endsWith(".tar.gz")) {
            return ".tar.gz";
        }

        // Standard extension
        int lastDot = filename.lastIndexOf('.');
        if (lastDot > 0 && lastDot < filename.length() - 1) {
            return filename.substring(lastDot);
        }

        return "";
    }

    /**
     * Clean up old stored files based on retention policy.
     *
     * Called periodically by scheduler.
     */
    public void cleanupOldFiles() {
        if (!storeRawUploads) {
            // No cleanup needed if we're not storing files
            return;
        }

        log.info("SECURITY: Running file cleanup - retention policy: {} days", maxStorageDays);

        try {
            Path storagePath = Paths.get(rawFileStoragePath);
            if (!Files.exists(storagePath)) {
                return;
            }

            LocalDateTime cutoffDate = LocalDateTime.now().minus(maxStorageDays, ChronoUnit.DAYS);

            Files.list(storagePath)
                    .filter(Files::isRegularFile)
                    .forEach(file -> {
                        try {
                            LocalDateTime lastModified = LocalDateTime.ofInstant(
                                    Files.getLastModifiedTime(file).toInstant(),
                                    java.time.ZoneId.systemDefault());

                            if (lastModified.isBefore(cutoffDate)) {
                                Files.delete(file);
                                log.info("SECURITY: Deleted old file - path: {}, age: {} days",
                                        file, ChronoUnit.DAYS.between(lastModified, LocalDateTime.now()));
                            }
                        } catch (IOException e) {
                            log.error("Failed to delete old file: {}", file, e);
                        }
                    });

        } catch (IOException e) {
            log.error("Failed to cleanup old files", e);
        }
    }

    /**
     * Check if file with given hash already exists in storage.
     *
     * Used for deduplication.
     *
     * @param fileHash SHA-256 hash
     * @return true if file already stored
     */
    public boolean fileExists(String fileHash) {
        if (!storeRawUploads) {
            return false;
        }

        Path storagePath = Paths.get(rawFileStoragePath);
        if (!Files.exists(storagePath)) {
            return false;
        }

        try {
            // Check for files matching hash prefix (any extension)
            return Files.list(storagePath)
                    .anyMatch(file -> file.getFileName().toString().startsWith(fileHash));
        } catch (IOException e) {
            log.error("Failed to check file existence: {}", fileHash, e);
            return false;
        }
    }

    /**
     * Get current security configuration for logging/audit.
     *
     * @return Configuration summary
     */
    public String getSecurityConfig() {
        return String.format(
                "FileLifecycleManager[storeRawUploads=%s, encryptStoredFiles=%s, " +
                "maxStorageDays=%d, storagePath=%s]",
                storeRawUploads, encryptStoredFiles, maxStorageDays, rawFileStoragePath);
    }
}
