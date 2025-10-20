package com.dna.integrator.service;

import com.dna.integrator.model.GenomicData;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

/**
 * Service for parsing VCF (Variant Call Format) files
 * Uses open-source parsing without proprietary dependencies
 */
@Service
@Slf4j
public class VCFParserService {

    public List<GenomicData> parseVCF(String userId, String vcfContent) throws IOException {
        List<GenomicData> genomicDataList = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new StringReader(vcfContent))) {
            String line;
            while ((line = reader.readLine()) != null) {
                // Skip header lines
                if (line.startsWith("#")) {
                    continue;
                }

                // Parse VCF data line
                String[] fields = line.split("\t");
                if (fields.length >= 5) {
                    GenomicData data = GenomicData.builder()
                            .userId(userId)
                            .fileFormat("vcf")
                            .chromosome(fields[0])
                            .position(Long.parseLong(fields[1]))
                            .referenceAllele(fields[3])
                            .alternateAllele(fields[4])
                            .quality(fields[5].equals(".") ? null : Double.parseDouble(fields[5]))
                            .rawData(line)
                            .build();

                    genomicDataList.add(data);
                }
            }
        }

        log.info("Parsed {} variants from VCF for user {}", genomicDataList.size(), userId);
        return genomicDataList;
    }
}
