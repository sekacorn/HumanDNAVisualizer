package com.dna.integrator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataUploadResponse {
    private boolean success;
    private String message;
    private Long recordId;
    private int recordsProcessed;
}
