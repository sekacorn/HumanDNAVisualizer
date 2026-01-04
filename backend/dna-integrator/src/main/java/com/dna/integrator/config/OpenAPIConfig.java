package com.dna.integrator.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI/Swagger configuration for API documentation
 * Access at: http://localhost:8081/swagger-ui.html
 * OpenAPI JSON: http://localhost:8081/v3/api-docs
 */
@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        // Define JWT security scheme
        SecurityScheme securityScheme = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .in(SecurityScheme.In.HEADER)
                .name("Authorization")
                .description("JWT token for authentication. Format: 'Bearer {token}'");

        SecurityRequirement securityRequirement = new SecurityRequirement()
                .addList("bearerAuth");

        return new OpenAPI()
                .info(new Info()
                        .title("DNA Integrator Service API")
                        .version("1.0.0")
                        .description("""
                                RESTful API for the HumanDNAVisualizer platform.

                                This service handles:
                                - User authentication and authorization (JWT-based)
                                - Multi-Factor Authentication (MFA/TOTP)
                                - Genomic data ingestion (VCF, FASTA, PDB formats)
                                - Phenotypic data ingestion (FHIR R4 compliant)
                                - Environmental/lifestyle data ingestion (CSV format)
                                - Data retrieval and management

                                ## Authentication

                                Most endpoints require JWT authentication. Follow these steps:

                                1. Register a user: `POST /api/auth/register`
                                2. Login: `POST /api/auth/login` (returns JWT token)
                                3. Use the token in subsequent requests: `Authorization: Bearer {token}`

                                ## Quick Start

                                Try the authentication flow:
                                1. Click "Authorize" button above
                                2. Register a new user
                                3. Login to get a JWT token
                                4. Enter the token in the authorization dialog
                                5. Try uploading sample data

                                ## Sample Data

                                Sample files are available in `backend/sample-data/`:
                                - `sample.vcf` - VCF genomic data
                                - `sample-fhir.json` - FHIR health records
                                - `environmental.csv` - Lifestyle survey data
                                """)
                        .contact(new Contact()
                                .name("HumanDNAVisualizer Team")
                                .url("https://github.com/yourusername/HumanDNAVisualizer")
                                .email("support@humandna.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8081")
                                .description("Development server"),
                        new Server()
                                .url("https://api.humandna.com")
                                .description("Production server (configure as needed)")
                ))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", securityScheme))
                .addSecurityItem(securityRequirement);
    }
}
