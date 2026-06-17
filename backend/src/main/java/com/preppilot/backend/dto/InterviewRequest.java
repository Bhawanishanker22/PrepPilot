package com.preppilot.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InterviewRequest {

    @NotBlank
    private String jobPosition;

    @NotBlank
    private String jobDescription;

    @NotBlank
    private String experienceLevel;
}