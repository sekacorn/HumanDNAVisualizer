package com.dna.integrator.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Canonical entity representing a single genomic variant call.
 *
 * Educational/research purposes only - not for medical diagnosis or treatment.
 *
 * This entity stores individual variant calls with:
 * - Chromosome and position for genomic coordinate
 * - rsID for variant identifier (when available)
 * - Reference and alternate alleles
 * - Genotype call
 * - Quality and filter information
 */
@Entity
@Table(name = "variant_calls", indexes = {
    @Index(name = "idx_variant_calls_sample_id", columnList = "sample_id"),
    @Index(name = "idx_variant_calls_chrom_pos", columnList = "chrom, pos"),
    @Index(name = "idx_variant_calls_rsid", columnList = "rsid")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VariantCallEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Reference to the parent sample
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sample_id", nullable = false, foreignKey = @ForeignKey(name = "fk_variant_call_sample"))
    private SampleEntity sample;

    /**
     * Chromosome identifier (e.g., "1", "2", "X", "Y", "MT")
     */
    @NotBlank(message = "Chromosome is required")
    @Column(name = "chrom", nullable = false, length = 10)
    private String chrom;

    /**
     * Genomic position (1-based coordinate)
     */
    @NotNull(message = "Position is required")
    @Column(name = "pos", nullable = false)
    private Long pos;

    /**
     * Variant identifier (e.g., rsID like "rs1234567")
     * Optional - may be null if not provided by source
     */
    @Column(name = "rsid", length = 50)
    private String rsid;

    /**
     * Reference allele (e.g., "A", "G", "T", "C")
     */
    @NotBlank(message = "Reference allele is required")
    @Column(name = "ref", nullable = false, length = 1000)
    private String ref;

    /**
     * Alternate allele (e.g., "A", "G", "T", "C")
     */
    @NotBlank(message = "Alternate allele is required")
    @Column(name = "alt", nullable = false, length = 1000)
    private String alt;

    /**
     * Genotype call (e.g., "0/0", "0/1", "1/1", "AA", "AG", "--")
     * Optional - may be null for some formats
     */
    @Column(name = "genotype", length = 50)
    private String genotype;

    /**
     * Quality score for this variant call
     * Optional - may be null if not provided by source
     */
    @Column(name = "qual")
    private Double qual;

    /**
     * Filter status (e.g., "PASS", "LowQual", etc.)
     * Optional - may be null if not provided by source
     */
    @Column(name = "filter", length = 255)
    private String filter;

    /**
     * Line number from source file (for error reporting and debugging)
     */
    @Column(name = "line_number")
    private Integer lineNumber;

    /**
     * Source format of this variant (e.g., "vcf", "generic_tsv")
     */
    @Column(name = "source", length = 50)
    private String source;

    /**
     * Additional annotations as JSON (optional)
     * Can store INFO field from VCF, or other format-specific data
     */
    @Column(name = "annotations", columnDefinition = "TEXT")
    private String annotations;
}
