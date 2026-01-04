package com.dna.integrator.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity representing phenotypic data from FHIR-compliant health records
 */
@Entity
@Table(name = "phenotypic_data")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhenotypicData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "User ID is required")
    @Column(nullable = false)
    private String userId;

    @NotBlank(message = "Resource type is required")
    @Column(nullable = false)
    private String resourceType; // Patient, Observation, Condition, etc.

    @NotNull(message = "Record timestamp is required")
    @Column(nullable = false)
    private LocalDateTime recordedAt;

    @Column(columnDefinition = "TEXT")
    private String fhirJson; // Raw FHIR JSON

    @Column
    private String category; // vital-signs, laboratory, procedure, etc.

    @Column
    private String code; // LOINC or SNOMED code

    @Column(name = "observation_value")  // "value" is a reserved keyword in H2
    private String value;

    @Column
    private String unit;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @PrePersist
    protected void onCreate() {
        if (recordedAt == null) {
            recordedAt = LocalDateTime.now();
        }
    }
}
