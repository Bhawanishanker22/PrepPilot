package com.preppilot.backend.service;

import com.preppilot.backend.dto.AnswerRequest;
import com.preppilot.backend.dto.InterviewRequest;
import com.preppilot.backend.model.MockInterview;
import com.preppilot.backend.model.User;
import com.preppilot.backend.model.UserAnswer;
import com.preppilot.backend.repository.MockInterviewRepository;
import com.preppilot.backend.repository.UserAnswerRepository;
import com.preppilot.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final MockInterviewRepository interviewRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final UserRepository userRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public MockInterview createInterview(InterviewRequest request) {
        User user = getCurrentUser();

        String questionsJson = geminiService.generateQuestions(
                request.getJobPosition(),
                request.getJobDescription(),
                request.getExperienceLevel()
        );

        MockInterview interview = MockInterview.builder()
                .user(user)
                .jobPosition(request.getJobPosition())
                .jobDescription(request.getJobDescription())
                .experienceLevel(request.getExperienceLevel())
                .questionsJson(questionsJson)
                .build();

        return interviewRepository.save(interview);
    }

    public List<MockInterview> getUserInterviews() {
        User user = getCurrentUser();
        return interviewRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public MockInterview getInterview(Long id) {
        User user = getCurrentUser();
        MockInterview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        if (!interview.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        return interview;
    }

    public UserAnswer submitAnswer(AnswerRequest request) {
        User user = getCurrentUser();

        MockInterview interview = interviewRepository.findById(request.getInterviewId())
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        if (!interview.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        String feedbackJson = geminiService.generateFeedback(
                request.getQuestion(),
                request.getUserAnswer(),
                interview.getJobPosition()
        );

        String feedback;
        int rating;

        try {
            String cleaned = feedbackJson.trim()
                    .replaceAll("^```json", "")
                    .replaceAll("^```", "")
                    .replaceAll("```$", "")
                    .trim();

            JsonNode node = objectMapper.readTree(cleaned);
            feedback = node.path("feedback").asText() + "\n\nIdeal Answer: " +
                    node.path("idealAnswer").asText();
            rating = node.path("rating").asInt();
        } catch (Exception e) {
            feedback = feedbackJson;
            rating = 5;
        }

        UserAnswer answer = UserAnswer.builder()
                .interview(interview)
                .question(request.getQuestion())
                .userAnswer(request.getUserAnswer())
                .aiFeedback(feedback)
                .aiRating(rating)
                .build();

        return userAnswerRepository.save(answer);
    }

    public List<UserAnswer> getAnswers(Long interviewId) {
        return userAnswerRepository.findByInterviewId(interviewId);
    }
}