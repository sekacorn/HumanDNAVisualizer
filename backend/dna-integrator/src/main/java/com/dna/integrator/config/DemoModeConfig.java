package com.dna.integrator.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for Demo Mode
 *
 * Demo mode simplifies user registration and provides quick-start features
 * for local development and demonstrations.
 *
 * Features when enabled:
 * - Quick registration with minimal validation
 * - Pre-populated demo users
 * - Simplified authentication flow
 *
 * Security: MUST be disabled in production environments
 */
@Configuration
@ConfigurationProperties(prefix = "app.demo-mode")
@Data
public class DemoModeConfig {

    /**
     * Enable/disable demo mode
     * Default: false (disabled)
     * Set to true in application-dev.yml for local development
     */
    private boolean enabled = false;

    /**
     * Allow quick registration without email verification
     */
    private boolean skipEmailVerification = true;

    /**
     * Auto-assign USER role to new registrations
     */
    private boolean autoAssignUserRole = true;

    /**
     * Allow weaker passwords in demo mode
     * Production minimum: 8 characters with complexity
     * Demo minimum: 6 characters
     */
    private boolean relaxedPasswordPolicy = true;

    /**
     * Provide demo user credentials in API responses
     */
    private boolean exposeDemoCredentials = true;

    /**
     * Auto-create demo users on startup
     */
    private boolean autoCreateDemoUsers = true;

    /**
     * Demo banner message displayed in responses
     */
    private String bannerMessage = "DEMO MODE ACTIVE - Not for production use";
}
