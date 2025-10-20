package com.dna.integrator.controller;

import com.dna.integrator.model.User;
import com.dna.integrator.repository.UserRepository;
import com.dna.integrator.security.JwtUtil;
import com.dna.integrator.security.CustomUserDetailsService;
import com.dna.integrator.service.MFAService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * REST Controller for user authentication
 * Handles registration, login, MFA setup
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3005", "http://localhost:3006"})
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    private final MFAService mfaService;

    /**
     * Register new user
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            // Check if username already exists
            if (userRepository.findByUsername(request.getUsername()).isPresent()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Username already exists"));
            }

            // Check if email already exists
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Email already exists"));
            }

            // Create new user
            User user = new User();
            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setRoles(Set.of(com.dna.integrator.model.Role.USER));
            user.setEnabled(true);
            user.setAccountNonExpired(true);
            user.setAccountNonLocked(true);
            user.setCredentialsNonExpired(true);

            userRepository.save(user);

            log.info("New user registered: {}", request.getUsername());

            return ResponseEntity.ok(Map.of(
                    "message", "User registered successfully",
                    "username", user.getUsername()
            ));

        } catch (Exception e) {
            log.error("Registration error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }

    /**
     * User login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // Load user
            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

            // Verify password
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                throw new BadCredentialsException("Invalid username or password");
            }

            // Check if MFA is enabled
            if (user.isMfaEnabled()) {
                // MFA required
                if (request.getTotpCode() == null || request.getTotpCode().isEmpty()) {
                    return ResponseEntity.ok(Map.of(
                            "mfaRequired", true,
                            "message", "Please provide your 6-digit authentication code"
                    ));
                }

                // Verify TOTP code
                try {
                    int code = Integer.parseInt(request.getTotpCode());
                    if (!mfaService.verifyCode(user.getMfaSecret(), code)) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of("message", "Invalid authentication code"));
                    }
                } catch (NumberFormatException e) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("message", "Invalid code format"));
                }
            }

            // Generate JWT token
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
            String token = jwtUtil.generateToken(userDetails);

            log.info("User logged in: {}", request.getUsername());

            // Return token and user info
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", Map.of(
                    "username", user.getUsername(),
                    "email", user.getEmail(),
                    "roles", user.getRoles()
            ));

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            log.warn("Failed login attempt for user: {}", request.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid username or password"));
        } catch (Exception e) {
            log.error("Login error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Login failed: " + e.getMessage()));
        }
    }

    /**
     * Verify JWT token
     */
    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            String username = jwtUtil.extractUsername(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtUtil.validateToken(token, userDetails)) {
                return ResponseEntity.ok(Map.of("valid", true));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("valid", false));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("valid", false));
        }
    }

    /**
     * Setup MFA (generate TOTP secret and QR code)
     */
    @PostMapping("/mfa/setup")
    public ResponseEntity<?> setupMFA(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);

            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            MFAService.MFASetupData setupData = mfaService.generateMFASecret(username);

            // Save secret to user (but don't enable MFA yet)
            user.setMfaSecret(setupData.secret());
            userRepository.save(user);

            log.info("MFA setup initiated for user: {}", username);

            return ResponseEntity.ok(Map.of(
                    "secret", setupData.secret(),
                    "qrCodeUrl", setupData.qrCodeUrl()
            ));

        } catch (Exception e) {
            log.error("MFA setup error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "MFA setup failed: " + e.getMessage()));
        }
    }

    /**
     * Enable MFA (verify TOTP code and activate)
     */
    @PostMapping("/mfa/enable")
    public ResponseEntity<?> enableMFA(@RequestHeader("Authorization") String authHeader,
                                       @RequestBody MFARequest request) {
        try {
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);

            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Verify TOTP code
            try {
                int code = Integer.parseInt(request.getTotpCode());
                if (!mfaService.verifyCode(user.getMfaSecret(), code)) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("message", "Invalid authentication code"));
                }
            } catch (NumberFormatException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Invalid code format"));
            }

            // Enable MFA
            user.setMfaEnabled(true);
            userRepository.save(user);

            log.info("MFA enabled for user: {}", username);

            return ResponseEntity.ok(Map.of("message", "MFA enabled successfully"));

        } catch (Exception e) {
            log.error("MFA enable error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "MFA enable failed: " + e.getMessage()));
        }
    }

    /**
     * Disable MFA
     */
    @PostMapping("/mfa/disable")
    public ResponseEntity<?> disableMFA(@RequestHeader("Authorization") String authHeader,
                                        @RequestBody MFARequest request) {
        try {
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);

            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Verify TOTP code before disabling
            try {
                int code = Integer.parseInt(request.getTotpCode());
                if (!mfaService.verifyCode(user.getMfaSecret(), code)) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("message", "Invalid authentication code"));
                }
            } catch (NumberFormatException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Invalid code format"));
            }

            // Disable MFA
            user.setMfaEnabled(false);
            user.setMfaSecret(null);
            userRepository.save(user);

            log.info("MFA disabled for user: {}", username);

            return ResponseEntity.ok(Map.of("message", "MFA disabled successfully"));

        } catch (Exception e) {
            log.error("MFA disable error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "MFA disable failed: " + e.getMessage()));
        }
    }

    // Request DTOs
    public static class RegisterRequest {
        private String username;
        private String email;
        private String password;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class LoginRequest {
        private String username;
        private String password;
        private String totpCode;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getTotpCode() { return totpCode; }
        public void setTotpCode(String totpCode) { this.totpCode = totpCode; }
    }

    public static class MFARequest {
        private String totpCode;

        public String getTotpCode() { return totpCode; }
        public void setTotpCode(String totpCode) { this.totpCode = totpCode; }
    }
}
