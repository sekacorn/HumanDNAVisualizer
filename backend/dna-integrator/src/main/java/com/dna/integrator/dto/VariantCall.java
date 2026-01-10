package com.dna.integrator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Canonical DTO representing a single genomic variant call.
 * This is a vendor-neutral representation used internally across the system.
 *
 * Educational/research purposes only - not for medical diagnosis or treatment.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VariantCall {

    /**
     * Chromosome identifier (e.g., "1", "2", "X", "Y", "MT")
     */
    private String chrom;

    /**
     * Genomic position (1-based coordinate)
     */
    private Long pos;

    /**
     * Variant identifier (e.g., rsID like "rs1234567")
     * Optional - may be null if not provided by source
     */
    private String id;

    /**
     * Reference allele (e.g., "A", "G", "T", "C")
     */
    private String ref;

    /**
     * Alternate allele (e.g., "A", "G", "T", "C")
     */
    private String alt;

    /**
     * Genotype call (e.g., "0/0", "0/1", "1/1", "AA", "AG", "--")
     * Optional - may be null for some formats
     */
    private String genotype;

    /**
     * Quality score for this variant call
     * Optional - may be null if not provided by source
     */
    private Double quality;

    /**
     * Source format of this variant (e.g., "vcf", "23andme", "ancestry", "generic_tsv")
     */
    private String source;

    /**
     * Line number from source file (for error reporting)
     */
    private Integer lineNumber;
}
