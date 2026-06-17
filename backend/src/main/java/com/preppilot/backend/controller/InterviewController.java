package com.preppilot.backend.controller;

import com.preppilot.backend.dto.AnswerRequest;
import com.preppilot.backend.dto.InterviewRequest;
import com.preppilot.backend.model.MockInterview;
import com.preppilot.backend.model.UserAnswer;
import com.preppilot.backend.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping
    public ResponseEntity<MockInterview> createInterview(
            @Valid @RequestBody InterviewRequest request) {
        return ResponseEntity.ok(interviewService.createInterview(request));
    }

    @GetMapping
    public ResponseEntity<List<MockInterview>> getUserInterviews() {
        return ResponseEntity.ok(interviewService.getUserInterviews());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MockInterview> getInterview(@PathVariable Long id) {
        return ResponseEntity.ok(interviewService.getInterview(id));
    }

    @PostMapping("/answer")
    public ResponseEntity<UserAnswer> submitAnswer(
            @Valid @RequestBody AnswerRequest request) {
        return ResponseEntity.ok(interviewService.submitAnswer(request));
    }

    @GetMapping("/{id}/answers")
    public ResponseEntity<List<UserAnswer>> getAnswers(@PathVariable Long id) {
        return ResponseEntity.ok(interviewService.getAnswers(id));
    }
}