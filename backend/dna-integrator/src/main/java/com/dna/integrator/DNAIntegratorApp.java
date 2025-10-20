package com.dna.integrator;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main application class for DNA Integrator Service
 *
 * This service integrates genomic data (VCF, FASTA, PDB),
 * phenotypic data (FHIR-compliant EHRs), and environmental data (CSV)
 * for personalized health and trait analysis.
 *
 * Open-source implementation using Apache/MIT licensed libraries.
 */
@SpringBootApplication
public class DNAIntegratorApp {

    public static void main(String[] args) {
        SpringApplication.run(DNAIntegratorApp.class, args);
    }
}
