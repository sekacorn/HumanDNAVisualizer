package com.dna.integrator.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * AES-256-GCM encryption service for securing DNA data at rest
 * Uses Galois/Counter Mode for authenticated encryption
 */
@Service
@Slf4j
public class EncryptionService {

    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int KEY_SIZE = 256;
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;

    private final SecretKey secretKey;
    private final SecureRandom secureRandom;

    public EncryptionService(@Value("${security.encryption.key:}") String base64Key) {
        this.secureRandom = new SecureRandom();

        if (base64Key != null && !base64Key.isEmpty()) {
            // Use provided key
            byte[] decodedKey = Base64.getDecoder().decode(base64Key);
            this.secretKey = new SecretKeySpec(decodedKey, 0, decodedKey.length, ALGORITHM);
            log.info("Loaded encryption key from configuration");
        } else {
            // Generate new key (for development only - in production, use external key management)
            try {
                KeyGenerator keyGenerator = KeyGenerator.getInstance(ALGORITHM);
                keyGenerator.init(KEY_SIZE, secureRandom);
                this.secretKey = keyGenerator.generateKey();
                String encodedKey = Base64.getEncoder().encodeToString(secretKey.getEncoded());
                log.warn("Generated new encryption key (DEV ONLY): {}", encodedKey);
                log.warn("Set security.encryption.key in application.yml for production!");
            } catch (Exception e) {
                throw new RuntimeException("Failed to generate encryption key", e);
            }
        }
    }

    /**
     * Encrypt sensitive DNA data using AES-256-GCM
     * @param plaintext Data to encrypt
     * @return Base64-encoded encrypted data with IV prepended
     */
    public String encrypt(String plaintext) {
        if (plaintext == null || plaintext.isEmpty()) {
            return plaintext;
        }

        try {
            // Generate random IV
            byte[] iv = new byte[GCM_IV_LENGTH];
            secureRandom.nextBytes(iv);

            // Initialize cipher
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);

            // Encrypt data
            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

            // Combine IV and ciphertext
            ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + ciphertext.length);
            byteBuffer.put(iv);
            byteBuffer.put(ciphertext);

            // Encode to Base64
            return Base64.getEncoder().encodeToString(byteBuffer.array());

        } catch (Exception e) {
            log.error("Encryption failed", e);
            throw new RuntimeException("Failed to encrypt data", e);
        }
    }

    /**
     * Decrypt DNA data encrypted with AES-256-GCM
     * @param encryptedData Base64-encoded encrypted data with IV
     * @return Decrypted plaintext
     */
    public String decrypt(String encryptedData) {
        if (encryptedData == null || encryptedData.isEmpty()) {
            return encryptedData;
        }

        try {
            // Decode from Base64
            byte[] decodedData = Base64.getDecoder().decode(encryptedData);

            // Extract IV and ciphertext
            ByteBuffer byteBuffer = ByteBuffer.wrap(decodedData);
            byte[] iv = new byte[GCM_IV_LENGTH];
            byteBuffer.get(iv);
            byte[] ciphertext = new byte[byteBuffer.remaining()];
            byteBuffer.get(ciphertext);

            // Initialize cipher
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);

            // Decrypt data
            byte[] plaintext = cipher.doFinal(ciphertext);
            return new String(plaintext, StandardCharsets.UTF_8);

        } catch (Exception e) {
            log.error("Decryption failed", e);
            throw new RuntimeException("Failed to decrypt data", e);
        }
    }

    /**
     * Encrypt specific fields in genomic data before storage
     */
    public String encryptGenomicData(String rawData) {
        return encrypt(rawData);
    }

    /**
     * Decrypt genomic data when retrieving from database
     */
    public String decryptGenomicData(String encryptedData) {
        return decrypt(encryptedData);
    }
}
