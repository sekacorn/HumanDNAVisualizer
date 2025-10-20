package com.dna.integrator.service;

import com.dna.integrator.model.EnvData;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

/**
 * Service for parsing CSV environmental/lifestyle data
 * Uses Apache Commons CSV (Apache License 2.0)
 */
@Service
@Slf4j
public class CSVParserService {

    public List<EnvData> parseCSV(String userId, String csvContent) throws IOException {
        List<EnvData> envDataList = new ArrayList<>();

        try (CSVParser csvParser = CSVParser.parse(new StringReader(csvContent),
                CSVFormat.DEFAULT.withFirstRecordAsHeader().withIgnoreHeaderCase().withTrim())) {

            for (CSVRecord record : csvParser) {
                EnvData data = EnvData.builder()
                        .userId(userId)
                        .diet(getFieldValue(record, "diet"))
                        .exerciseFrequency(getFieldValue(record, "exercise_frequency"))
                        .smokingStatus(getFieldValue(record, "smoking_status"))
                        .alcoholConsumption(getFieldValue(record, "alcohol_consumption"))
                        .sleepHours(getFieldValue(record, "sleep_hours"))
                        .stressLevel(getFieldValue(record, "stress_level"))
                        .occupation(getFieldValue(record, "occupation"))
                        .location(getFieldValue(record, "location"))
                        .build();

                envDataList.add(data);
            }
        }

        log.info("Parsed {} environmental records from CSV for user {}", envDataList.size(), userId);
        return envDataList;
    }

    private String getFieldValue(CSVRecord record, String fieldName) {
        try {
            return record.isMapped(fieldName) ? record.get(fieldName) : null;
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
