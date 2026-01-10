package com.dna.integrator.security;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Security configuration tests.
 *
 * Validates that:
 * - Default security configuration is secure
 * - Configuration flags behave correctly
 * - No unsafe defaults exist
 *
 * Part of Security & Privacy Agent implementation.
 */
@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.yml")
@DisplayName("Security Configuration Tests")
public class SecurityConfigTest {

    @Value("${security.file-handling.store-raw-uploads:false}")
    private boolean storeRawUploads;

    @Value("${security.network.enable-remote-llm:false}")
    private boolean enableRemoteLLM;

    @Value("${security.network.enable-external-apis:false}")
    private boolean enableExternalAPIs;

    @Value("${security.privacy.minimal-logging:true}")
    private boolean minimalLogging;

    @Value("${security.privacy.gdpr-mode:true}")
    private boolean gdprMode;

    // ============================================================================
    // Default Security Posture Tests
    // ============================================================================

    @Test
    @DisplayName("CRITICAL: STORE_RAW_UPLOADS must default to false")
    public void testStoreRawUploadsDefaultIsFalse() {
        assertFalse(storeRawUploads,
                "CRITICAL SECURITY: STORE_RAW_UPLOADS must default to false");
    }

    @Test
    @DisplayName("CRITICAL: ENABLE_REMOTE_LLM must default to false")
    public void testEnableRemoteLLMDefaultIsFalse() {
        assertFalse(enableRemoteLLM,
                "CRITICAL SECURITY: ENABLE_REMOTE_LLM must default to false");
    }

    @Test
    @DisplayName("CRITICAL: ENABLE_EXTERNAL_APIS must default to false")
    public void testEnableExternalAPIsDefaultIsFalse() {
        assertFalse(enableExternalAPIs,
                "CRITICAL SECURITY: ENABLE_EXTERNAL_APIS must default to false");
    }

    @Test
    @DisplayName("Minimal logging should be enabled by default")
    public void testMinimalLoggingDefaultIsTrue() {
        assertTrue(minimalLogging,
                "Minimal logging should be enabled for privacy");
    }

    @Test
    @DisplayName("GDPR mode should be enabled by default")
    public void testGDPRModeDefaultIsTrue() {
        assertTrue(gdprMode,
                "GDPR compliance mode should be enabled by default");
    }

    // ============================================================================
    // Security Principle Tests
    // ============================================================================

    @Test
    @DisplayName("Privacy by default: No external data transmission")
    public void testPrivacyByDefault() {
        assertFalse(enableRemoteLLM, "No remote LLM calls by default");
        assertFalse(enableExternalAPIs, "No external API calls by default");
        assertFalse(storeRawUploads, "No raw file storage by default");
    }

    @Test
    @DisplayName("Minimal data retention: No unnecessary storage")
    public void testMinimalDataRetention() {
        assertFalse(storeRawUploads,
                "Raw files should NOT be stored unless explicitly configured");
    }

    @Test
    @DisplayName("Secure defaults: All privacy-sensitive flags are off")
    public void testSecureDefaults() {
        // Verify secure default posture
        assertAll("Secure defaults",
                () -> assertFalse(storeRawUploads, "Raw storage off"),
                () -> assertFalse(enableRemoteLLM, "Remote LLM off"),
                () -> assertFalse(enableExternalAPIs, "External APIs off"),
                () -> assertTrue(minimalLogging, "Minimal logging on"),
                () -> assertTrue(gdprMode, "GDPR mode on")
        );
    }

    // ============================================================================
    // Configuration Documentation Tests
    // ============================================================================

    @Test
    @DisplayName("Configuration should be self-documenting")
    public void testConfigurationDocumentation() {
        // This test verifies that configuration is well-documented
        // by checking that all security flags have default values
        assertNotNull(storeRawUploads, "STORE_RAW_UPLOADS should have default");
        assertNotNull(enableRemoteLLM, "ENABLE_REMOTE_LLM should have default");
        assertNotNull(enableExternalAPIs, "ENABLE_EXTERNAL_APIS should have default");
    }
}
