package com.dna.integrator.service;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import com.dna.integrator.model.PhenotypicData;
import lombok.extern.slf4j.Slf4j;
import org.hl7.fhir.r4.model.Observation;
import org.hl7.fhir.r4.model.Resource;
import org.springframework.stereotype.Service;

/**
 * Service for parsing FHIR-compliant health records
 * Uses HAPI FHIR (Apache License 2.0)
 */
@Service
@Slf4j
public class FHIRParserService {

    private final FhirContext fhirContext;
    private final IParser jsonParser;

    public FHIRParserService() {
        this.fhirContext = FhirContext.forR4();
        this.jsonParser = fhirContext.newJsonParser();
    }

    public PhenotypicData parseFHIRResource(String userId, String fhirJson) {
        try {
            Resource resource = (Resource) jsonParser.parseResource(fhirJson);

            PhenotypicData.PhenotypicDataBuilder builder = PhenotypicData.builder()
                    .userId(userId)
                    .resourceType(resource.getResourceType().name())
                    .fhirJson(fhirJson);

            // Handle Observation resources specifically
            if (resource instanceof Observation) {
                Observation observation = (Observation) resource;

                if (observation.hasCategory()) {
                    builder.category(observation.getCategoryFirstRep().getCodingFirstRep().getCode());
                }

                if (observation.hasCode()) {
                    builder.code(observation.getCode().getCodingFirstRep().getCode());
                }

                if (observation.hasValueQuantity()) {
                    builder.value(observation.getValueQuantity().getValue().toString());
                    builder.unit(observation.getValueQuantity().getUnit());
                }
            }

            PhenotypicData data = builder.build();
            log.info("Parsed FHIR {} resource for user {}", data.getResourceType(), userId);
            return data;

        } catch (Exception e) {
            log.error("Error parsing FHIR resource: {}", e.getMessage());
            throw new RuntimeException("Failed to parse FHIR resource", e);
        }
    }
}
