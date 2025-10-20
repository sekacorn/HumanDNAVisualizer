package com.dna.integrator.controller;

import com.dna.integrator.dto.DataUploadResponse;
import com.dna.integrator.model.EnvData;
import com.dna.integrator.model.GenomicData;
import com.dna.integrator.model.PhenotypicData;
import com.dna.integrator.repository.EnvDataRepository;
import com.dna.integrator.repository.GenomicDataRepository;
import com.dna.integrator.repository.PhenotypicDataRepository;
import com.dna.integrator.service.CSVParserService;
import com.dna.integrator.service.FHIRParserService;
import com.dna.integrator.service.VCFParserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * REST controller for uploading genomic, phenotypic, and environmental data
 */
@RestController
@RequestMapping("/api/data")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${security.allowed-origins}")
public class DataUploadController {

    private final GenomicDataRepository genomicDataRepository;
    private final PhenotypicDataRepository phenotypicDataRepository;
    private final EnvDataRepository envDataRepository;
    private final VCFParserService vcfParserService;
    private final FHIRParserService fhirParserService;
    private final CSVParserService csvParserService;

    @PostMapping("/upload/vcf")
    public ResponseEntity<DataUploadResponse> uploadVCF(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") String userId) {
        try {
            String content = new String(file.getBytes(), StandardCharsets.UTF_8);
            List<GenomicData> dataList = vcfParserService.parseVCF(userId, content);
            genomicDataRepository.saveAll(dataList);

            return ResponseEntity.ok(DataUploadResponse.builder()
                    .success(true)
                    .message("VCF file uploaded successfully")
                    .recordsProcessed(dataList.size())
                    .build());
        } catch (IOException e) {
            log.error("Error uploading VCF file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(DataUploadResponse.builder()
                            .success(false)
                            .message("Error processing VCF file: " + e.getMessage())
                            .build());
        }
    }

    @PostMapping("/upload/fhir")
    public ResponseEntity<DataUploadResponse> uploadFHIR(
            @RequestBody String fhirJson,
            @RequestParam("userId") String userId) {
        try {
            PhenotypicData data = fhirParserService.parseFHIRResource(userId, fhirJson);
            PhenotypicData saved = phenotypicDataRepository.save(data);

            return ResponseEntity.ok(DataUploadResponse.builder()
                    .success(true)
                    .message("FHIR resource uploaded successfully")
                    .recordId(saved.getId())
                    .build());
        } catch (Exception e) {
            log.error("Error uploading FHIR resource", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(DataUploadResponse.builder()
                            .success(false)
                            .message("Error processing FHIR resource: " + e.getMessage())
                            .build());
        }
    }

    @PostMapping("/upload/csv")
    public ResponseEntity<DataUploadResponse> uploadCSV(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") String userId) {
        try {
            String content = new String(file.getBytes(), StandardCharsets.UTF_8);
            List<EnvData> dataList = csvParserService.parseCSV(userId, content);
            envDataRepository.saveAll(dataList);

            return ResponseEntity.ok(DataUploadResponse.builder()
                    .success(true)
                    .message("CSV file uploaded successfully")
                    .recordsProcessed(dataList.size())
                    .build());
        } catch (IOException e) {
            log.error("Error uploading CSV file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(DataUploadResponse.builder()
                            .success(false)
                            .message("Error processing CSV file: " + e.getMessage())
                            .build());
        }
    }

    @GetMapping("/genomic/{userId}")
    public ResponseEntity<List<GenomicData>> getGenomicData(@PathVariable String userId) {
        List<GenomicData> data = genomicDataRepository.findByUserId(userId);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/phenotypic/{userId}")
    public ResponseEntity<List<PhenotypicData>> getPhenotypicData(@PathVariable String userId) {
        List<PhenotypicData> data = phenotypicDataRepository.findByUserId(userId);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/environmental/{userId}")
    public ResponseEntity<List<EnvData>> getEnvironmentalData(@PathVariable String userId) {
        List<EnvData> data = envDataRepository.findByUserId(userId);
        return ResponseEntity.ok(data);
    }
}
