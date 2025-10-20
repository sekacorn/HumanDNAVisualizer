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
 * Entity representing genomic data from VCF, FASTA, or PDB files
 */
@Entity
@Table(name = "genomic_data")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenomicData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "User ID is required")
    @Column(nullable = false)
    private String userId;

    @NotBlank(message = "File format is required")
    @Column(nullable = false)
    private String fileFormat; // vcf, fasta, pdb, dna

    @NotNull(message = "Upload timestamp is required")
    @Column(nullable = false)
    private LocalDateTime uploadedAt;

    @Column(columnDefinition = "TEXT")
    private String rawData;

    @Column(columnDefinition = "TEXT")
    private String parsedVariants; // JSON representation of variants

    @Column
    private String chromosome;

    @Column
    private Long position;

    @Column
    private String referenceAllele;

    @Column
    private String alternateAllele;

    @Column
    private Double quality;

    @Column(columnDefinition = "TEXT")
    private String annotations; // Additional metadata

    @PrePersist
    protected void onCreate() {
        if (uploadedAt == null) {
            uploadedAt = LocalDateTime.now();
        }
    }
}
