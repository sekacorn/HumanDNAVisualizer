package com.dna.integrator.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for quick registration in demo mode
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Quick registration request for demo mode")
public class QuickRegisterRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Schema(description = "Username for the demo account", example = "demouser")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters in demo mode")
    @Schema(description = "Password (minimum 6 characters in demo mode)", example = "demo123")
    private String password;
}
