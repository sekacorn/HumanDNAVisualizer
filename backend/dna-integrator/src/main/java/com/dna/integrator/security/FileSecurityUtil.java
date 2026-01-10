package com.dna.integrator.security;

import lombok.extern.slf4j.Slf4j;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * File Security Utilities
 *
 * Provides security functions for file handling:
 * - Filename sanitization (prevent path traversal)
 * - SHA-256 hash computation (file integrity & deduplication)
 * - File validation
 *
 * Part of Security & Privacy Agent implementation.
 */
@Slf4j
public class FileSecurityUtil {

    /**
     * Sanitize filename to prevent path traversal attacks.
     *
     * Removes path separators, null bytes, and limits length.
     *
     * @param filename Original filename from upload
     * @return Sanitized filename safe for storage
     */
    public static String sanitizeFilename(String filename) {
        if (filename == null || filename.isBlank()) {
            return "upload.dat";
        }

        // Remove path separators (Unix and Windows)
        String sanitized = filename.replaceAll("[/\\\\]", "_");

        // Remove null bytes (can cause issues in some filesystems)
        sanitized = sanitized.replace("\0", "");

        // Remove other dangerous characters
        sanitized = sanitized.replaceAll("[<>:\"|?*]", "_");

        // Remove leading/trailing whitespace and dots
        sanitized = sanitized.trim().replaceAll("^\\.+", "");

        // Limit length to 255 characters (filesystem limit)
        if (sanitized.length() > 255) {
            // Preserve file extension if present
            int lastDot = sanitized.lastIndexOf('.');
            if (lastDot > 0 && lastDot > sanitized.length() - 10) {
                String ext = sanitized.substring(lastDot);
                String name = sanitized.substring(0, 255 - ext.length());
                sanitized = name + ext;
            } else {
                sanitized = sanitized.substring(0, 255);
            }
        }

        // If sanitization resulted in empty string, use default
        if (sanitized.isBlank()) {
            return "upload.dat";
        }

        return sanitized;
    }

    /**
     * Compute SHA-256 hash of file content.
     *
     * Used for:
     * - File integrity verification
     * - Deduplication (detect duplicate uploads)
     * - Audit trail
     *
     * @param fileContent Raw file bytes
     * @return Hex-encoded SHA-256 hash (64 characters)
     * @throws SecurityException if SHA-256 algorithm not available
     */
    public static String computeSHA256(byte[] fileContent) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(fileContent);
            return bytesToHex(hash);
        } catch (NoSuchAlgorithmException e) {
            log.error("SHA-256 algorithm not available", e);
            throw new SecurityException("SHA-256 hash computation failed", e);
        }
    }

    /**
     * Convert byte array to hexadecimal string.
     *
     * @param bytes Byte array to convert
     * @return Hex string (lowercase)
     */
    private static String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }

    /**
     * Validate file extension against allowed list.
     *
     * @param filename Filename to check
     * @param allowedExtensions Comma-separated list of allowed extensions
     * @return true if extension is allowed
     */
    public static boolean isAllowedExtension(String filename, String allowedExtensions) {
        if (filename == null || allowedExtensions == null) {
            return false;
        }

        String lowerFilename = filename.toLowerCase();
        String[] allowed = allowedExtensions.toLowerCase().split(",");

        for (String ext : allowed) {
            String extension = ext.trim();
            if (lowerFilename.endsWith("." + extension) || lowerFilename.endsWith("." + extension + ".gz")) {
                return true;
            }
        }

        return false;
    }

    /**
     * Estimate memory required to process file.
     *
     * Used to prevent OOM by rejecting files that would exceed available memory.
     *
     * @param fileSize File size in bytes
     * @return Estimated memory requirement in bytes (conservative estimate)
     */
    public static long estimateMemoryRequirement(long fileSize) {
        // Conservative estimate: 3x file size
        // (1x for file content, 1x for parsing buffer, 1x for result objects)
        return fileSize * 3;
    }

    /**
     * Check if system has sufficient memory to process file.
     *
     * @param fileSize File size in bytes
     * @return true if sufficient memory available
     */
    public static boolean hasSufficientMemory(long fileSize) {
        Runtime runtime = Runtime.getRuntime();
        long maxMemory = runtime.maxMemory();
        long allocatedMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long availableMemory = maxMemory - allocatedMemory + freeMemory;

        long required = estimateMemoryRequirement(fileSize);

        // Require 20% buffer beyond estimated requirement
        long requiredWithBuffer = (long) (required * 1.2);

        return availableMemory > requiredWithBuffer;
    }
}
