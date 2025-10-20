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
 * Entity representing environmental/lifestyle data from CSV surveys
 */
@Entity
@Table(name = "environmental_data")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnvData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "User ID is required")
    @Column(nullable = false)
    private String userId;

    @NotNull(message = "Survey timestamp is required")
    @Column(nullable = false)
    private LocalDateTime surveyedAt;

    @Column
    private String diet; // vegetarian, omnivore, vegan, etc.

    @Column
    private String exerciseFrequency; // daily, weekly, monthly, rarely

    @Column
    private String smokingStatus; // never, former, current

    @Column
    private String alcoholConsumption; // none, moderate, heavy

    @Column
    private String sleepHours;

    @Column
    private String stressLevel; // low, moderate, high

    @Column
    private String occupation;

    @Column
    private String location; // Geographic location for environmental factors

    @Column(columnDefinition = "TEXT")
    private String additionalFactors; // JSON for custom fields

    @PrePersist
    protected void onCreate() {
        if (surveyedAt == null) {
            surveyedAt = LocalDateTime.now();
        }
    }
}
