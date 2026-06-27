package com.preppilot.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public String generateQuestions(String jobPosition, String jobDescription, String experienceLevel) {
        String prompt = String.format("""
                You are an expert technical interviewer.
                Generate exactly 5 interview questions for the following role:

                Job Position: %s
                Job Description: %s
                Experience Level: %s

                Return ONLY a valid JSON array with exactly 5 objects, each having:
                - "question": the interview question
                - "hint": a brief hint about what a good answer should cover

                Return only the JSON array, no other text, no markdown.
                """, jobPosition, jobDescription, experienceLevel);

        return callAI(prompt);
    }

    public String generateFeedback(String question, String userAnswer, String jobPosition) {
        String prompt = String.format("""
                You are an expert technical interviewer evaluating a candidate's answer.

                Job Position: %s
                Question: %s
                Candidate's Answer: %s

                Evaluate the answer and return ONLY a valid JSON object with:
                - "feedback": detailed constructive feedback (2-3 sentences)
                - "rating": a score from 1 to 10 (integer only)
                - "idealAnswer": what an ideal answer would include (1-2 sentences)

                Return only the JSON object, no other text, no markdown.
                """, jobPosition, question, userAnswer);

        return callAI(prompt);
    }

    private String callAI(String prompt) {
        try {
            String requestBody = objectMapper.writeValueAsString(
                    new java.util.HashMap<String, Object>() {{
                        put("model", "llama-3.1-8b-instant");
                        put("messages", new java.util.List[] {
                                java.util.List.of(
                                        new java.util.HashMap<String, String>() {{
                                            put("role", "user");
                                            put("content", prompt);
                                        }}
                                )
                        }[0]);
                        put("temperature", 0.7);
                        put("max_tokens", 2048);
                    }}
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request,
                    HttpResponse.BodyHandlers.ofString());

            String responseBody = response.body();
            System.out.println("AI raw response: " + responseBody);

            JsonNode root = objectMapper.readTree(responseBody);

            if (root.has("error")) {
                String errorMsg = root.path("error").isTextual()
                        ? root.path("error").asText()
                        : root.path("error").path("message").asText();
                throw new RuntimeException("AI error: " + errorMsg);
            }

            return root.path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("AI API call failed: " + e.getMessage());
        }
    }
}