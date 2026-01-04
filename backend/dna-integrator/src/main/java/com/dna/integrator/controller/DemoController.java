package com.dna.integrator.controller;

import com.dna.integrator.dto.LoginRequest;
import com.dna.integrator.dto.QuickRegisterRequest;
import com.dna.integrator.model.User;
import com.dna.integrator.security.JwtUtil;
import com.dna.integrator.service.DemoModeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for demo mode features
 * Only accessible when demo mode is enabled
 */
@Slf4j
@RestController
@RequestMapping("/api/demo")
@RequiredArgsConstructor
@Tag(name = "Demo Mode", description = "Demo mode features for local development and testing")
public class DemoController {

    private final DemoModeService demoModeService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @GetMapping("/status")
    @Operation(
            summary = "Get demo mode status",
            description = "Returns whether demo mode is enabled and provides demo user credentials if available"
    )
    @ApiResponse(responseCode = "200", description = "Demo mode status retrieved successfully")
    public ResponseEntity<Map<String, Object>> getDemoStatus() {
        return ResponseEntity.ok(demoModeService.getDemoModeStatus());
    }

    @PostMapping("/quick-register")
    @Operation(
            summary = "Quick register a demo user",
            description = "Register a user with minimal validation. Only available in demo mode. Auto-assigns USER role."
    )
    @ApiResponse(responseCode = "200", description = "User registered successfully")
    @ApiResponse(responseCode = "400", description = "Invalid request or demo mode disabled")
    @ApiResponse(responseCode = "409", description = "Username already exists")
    public ResponseEntity<Map<String, Object>> quickRegister(@RequestBody QuickRegisterRequest request) {
        if (!demoModeService.isDemoModeEnabled()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Demo mode is disabled",
                    "message", "Quick registration is only available in demo mode"
            ));
        }

        try {
            User user = demoModeService.quickRegister(request.getUsername(), request.getPassword());

            // Auto-login after registration
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            User authenticatedUser = (User) authentication.getPrincipal();
            String token = jwtUtil.generateToken(authenticatedUser);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Demo user registered and logged in successfully");
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("token", token);
            response.put("type", "Bearer");
            response.put("roles", user.getRoles());
            response.put("demoMode", true);

            log.info("Demo user registered: {}", user.getUsername());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Quick registration failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Registration failed",
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/login-demo-user")
    @Operation(
            summary = "Login with a pre-created demo user",
            description = "Quick login using one of the pre-created demo users: 'demo', 'admin', or 'moderator'"
    )
    @ApiResponse(responseCode = "200", description = "Login successful")
    @ApiResponse(responseCode = "400", description = "Demo mode disabled")
    @ApiResponse(responseCode = "401", description = "Invalid credentials")
    public ResponseEntity<Map<String, Object>> loginDemoUser(@RequestBody LoginRequest request) {
        if (!demoModeService.isDemoModeEnabled()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Demo mode is disabled"
            ));
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            User user = (User) authentication.getPrincipal();
            String token = jwtUtil.generateToken(user);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("type", "Bearer");
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("roles", user.getRoles());
            response.put("demoMode", true);
            response.put("message", "Demo user logged in successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of(
                    "error", "Authentication failed",
                    "message", "Invalid username or password"
            ));
        }
    }

    @GetMapping("/credentials")
    @Operation(
            summary = "Get demo user credentials",
            description = "Returns credentials for all pre-created demo users. Only available in demo mode."
    )
    @ApiResponse(responseCode = "200", description = "Credentials retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Demo mode disabled or credentials exposure disabled")
    public ResponseEntity<Map<String, Object>> getDemoCredentials() {
        if (!demoModeService.isDemoModeEnabled()) {
            return ResponseEntity.status(403).body(Map.of(
                    "error", "Demo mode is disabled"
            ));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("demoUsers", demoModeService.getDemoUserCredentials());
        response.put("message", "Use these credentials to login");
        response.put("warning", "These are demo credentials - not for production use");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/create-demo-users")
    @Operation(
            summary = "Manually create demo users",
            description = "Creates the standard demo users (demo, admin, moderator). Only available in demo mode."
    )
    @ApiResponse(responseCode = "200", description = "Demo users created successfully")
    @ApiResponse(responseCode = "403", description = "Demo mode disabled")
    public ResponseEntity<Map<String, Object>> createDemoUsers() {
        if (!demoModeService.isDemoModeEnabled()) {
            return ResponseEntity.status(403).body(Map.of(
                    "error", "Demo mode is disabled"
            ));
        }

        try {
            demoModeService.createDemoUsers();

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Demo users created successfully");
            response.put("users", demoModeService.getDemoUserCredentials());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to create demo users: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Failed to create demo users",
                    "message", e.getMessage()
            ));
        }
    }
}
