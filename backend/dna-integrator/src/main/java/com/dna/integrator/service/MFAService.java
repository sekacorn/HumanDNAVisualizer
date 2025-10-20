package com.dna.integrator.service;

import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import com.warrenstrange.googleauth.GoogleAuthenticatorQRGenerator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Multi-Factor Authentication (MFA) Service
 * Uses TOTP (Time-based One-Time Password) via Google Authenticator
 */
@Service
@Slf4j
public class MFAService {

    private final GoogleAuthenticator googleAuthenticator;

    public MFAService() {
        this.googleAuthenticator = new GoogleAuthenticator();
    }

    /**
     * Generate a new TOTP secret for a user
     * @param username Username for the QR code
     * @return MFA setup data including secret and QR code URL
     */
    public MFASetupData generateMFASecret(String username) {
        GoogleAuthenticatorKey key = googleAuthenticator.createCredentials();
        String secret = key.getKey();

        // Generate QR code URL for authenticator apps
        String qrCodeUrl = GoogleAuthenticatorQRGenerator.getOtpAuthTotpURL(
                "HumanDNAVisualizer",
                username,
                key
        );

        log.info("Generated MFA secret for user: {}", username);

        return new MFASetupData(secret, qrCodeUrl);
    }

    /**
     * Verify a TOTP code
     * @param secret User's TOTP secret
     * @param code Code entered by user
     * @return true if code is valid
     */
    public boolean verifyCode(String secret, int code) {
        return googleAuthenticator.authorize(secret, code);
    }

    /**
     * Data class for MFA setup
     */
    public record MFASetupData(String secret, String qrCodeUrl) {}
}
