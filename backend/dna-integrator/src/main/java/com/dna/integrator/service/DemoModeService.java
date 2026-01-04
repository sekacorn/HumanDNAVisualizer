package com.dna.integrator.service;

import com.dna.integrator.config.DemoModeConfig;
import com.dna.integrator.model.Role;
import com.dna.integrator.model.User;
import com.dna.integrator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * Service for managing demo mode functionality
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DemoModeService {

    private final DemoModeConfig demoModeConfig;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Auto-create demo users on application startup if demo mode is enabled
     */
    @EventListener(ApplicationReadyEvent.class)
    public void createDemoUsersOnStartup() {
        if (demoModeConfig.isEnabled() && demoModeConfig.isAutoCreateDemoUsers()) {
            log.info("Demo mode enabled - Creating demo users...");
            createDemoUsers();
        }
    }

    /**
     * Check if demo mode is currently enabled
     */
    public boolean isDemoModeEnabled() {
        return demoModeConfig.isEnabled();
    }

    /**
     * Get demo mode status and configuration
     */
    public Map<String, Object> getDemoModeStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("enabled", demoModeConfig.isEnabled());
        status.put("message", demoModeConfig.isEnabled() ? demoModeConfig.getBannerMessage() : "Demo mode is disabled");

        if (demoModeConfig.isEnabled() && demoModeConfig.isExposeDemoCredentials()) {
            status.put("demoUsers", getDemoUserCredentials());
        }

        return status;
    }

    /**
     * Create demo users with predefined credentials
     */
    public void createDemoUsers() {
        createDemoUserIfNotExists("demo", "demo@example.com", "demo123", Set.of(Role.USER));
        createDemoUserIfNotExists("admin", "admin@demo.com", "admin123", Set.of(Role.USER, Role.MODERATOR, Role.ADMIN));
        createDemoUserIfNotExists("moderator", "moderator@demo.com", "mod123", Set.of(Role.USER, Role.MODERATOR));

        log.info("Demo users created successfully");
    }

    /**
     * Create a demo user if it doesn't already exist
     */
    private void createDemoUserIfNotExists(String username, String email, String password, Set<Role> roles) {
        if (userRepository.findByUsername(username).isEmpty()) {
            User user = User.builder()
                    .username(username)
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .firstName("Demo")
                    .lastName(username.substring(0, 1).toUpperCase() + username.substring(1))
                    .roles(roles)
                    .enabled(true)
                    .accountNonExpired(true)
                    .accountNonLocked(true)
                    .credentialsNonExpired(true)
                    .mfaEnabled(false)
                    .build();

            userRepository.save(user);
            log.info("Created demo user: {}", username);
        } else {
            log.debug("Demo user already exists: {}", username);
        }
    }

    /**
     * Get demo user credentials (only when demo mode is enabled)
     */
    public Map<String, Map<String, String>> getDemoUserCredentials() {
        if (!demoModeConfig.isEnabled() || !demoModeConfig.isExposeDemoCredentials()) {
            return Map.of();
        }

        Map<String, Map<String, String>> credentials = new HashMap<>();

        credentials.put("demo", Map.of(
                "username", "demo",
                "password", "demo123",
                "role", "USER"
        ));

        credentials.put("admin", Map.of(
                "username", "admin",
                "password", "admin123",
                "role", "ADMIN"
        ));

        credentials.put("moderator", Map.of(
                "username", "moderator",
                "password", "mod123",
                "role", "MODERATOR"
        ));

        return credentials;
    }

    /**
     * Quick register a user with minimal validation (demo mode only)
     */
    public User quickRegister(String username, String password) {
        if (!demoModeConfig.isEnabled()) {
            throw new IllegalStateException("Quick registration is only available in demo mode");
        }

        // Generate demo email if not provided
        String email = username + "@demo.local";

        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(password))
                .firstName("Demo")
                .lastName("User")
                .roles(Set.of(Role.USER))
                .enabled(true)
                .accountNonExpired(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .mfaEnabled(false)
                .build();

        return userRepository.save(user);
    }

    /**
     * Validate if password meets demo mode requirements
     */
    public boolean validateDemoPassword(String password) {
        if (!demoModeConfig.isEnabled()) {
            // Production mode: strict validation
            return password != null && password.length() >= 8;
        }

        if (demoModeConfig.isRelaxedPasswordPolicy()) {
            // Demo mode: relaxed validation
            return password != null && password.length() >= 6;
        }

        // Demo mode but strict policy
        return password != null && password.length() >= 8;
    }
}
