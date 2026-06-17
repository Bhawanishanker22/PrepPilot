package com.preppilot.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
@RequiredArgsConstructor
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
                
                Example format:
                [
                  {"question": "...", "hint": "..."},
                  {"question": "...", "hint": "..."}
                ]
                
                Return only the JSON array, no other text.
                """, jobPosition, jobDescription, experienceLevel);

        return callGemini(prompt);
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
                
                Return only the JSON object, no other text.
                """, jobPosition, question, userAnswer);

        return callGemini(prompt);
    }

    private String callGemini(String prompt) {
        try {
            String requestBody = String.format("""
                {
                  "contents": [
                    {
                      "parts": [
                        {"text": %s}
                      ]
                    }
                  ],
                  "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 2048
                  }
                }
                """, objectMapper.writeValueAsString(prompt));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl + "?key=" + apiKey))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request,
                    HttpResponse.BodyHandlers.ofString());

            String responseBody = response.body();

            // Log raw response for debugging
            System.out.println("Gemini raw response: " + responseBody);

            JsonNode root = objectMapper.readTree(responseBody);

            // Handle error response from Gemini
            if (root.has("error")) {
                throw new RuntimeException("Gemini error: " + root.path("error").path("message").asText());
            }

            JsonNode candidates = root.path("candidates");
            if (candidates.isMissingNode() || !candidates.isArray() || candidates.size() == 0) {
                throw new RuntimeException("No candidates in Gemini response: " + responseBody);
            }

            return candidates.get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Gemini API call failed: " + e.getMessage());
        }
    }
}