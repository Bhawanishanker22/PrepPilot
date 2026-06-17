package com.preppilot.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AnswerRequest {

    @NotNull
    private Long interviewId;

    @NotBlank
    private String question;

    @NotBlank
    private String userAnswer;
}