package com.financetracker.backend.ai;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;

/**
 * Low-level Gemini API HTTP client upgraded for Java 21+ and Multi-modal support.
 */
@Component
public class GeminiClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiClient.class);

    private final RestTemplate restTemplate;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    public GeminiClient(@Qualifier("geminiRestTemplate") RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Sends a text prompt to Gemini.
     */
    public String callGemini(String prompt) {
        return callGeminiInternal(prompt, null, null);
    }

    /**
     * Sends a text prompt and image data to Gemini (Vision).
     */
    public String callGeminiVision(String prompt, byte[] imageBytes, String mimeType) {
        return callGeminiInternal(prompt, imageBytes, mimeType);
    }

    private String callGeminiInternal(String prompt, byte[] imageBytes, String mimeType) {
        String url = apiUrl + "?key=" + apiKey;

        // Build parts list
        List<Map<String, Object>> parts = new ArrayList<>();
        parts.add(Map.of("text", prompt));

        if (imageBytes != null && mimeType != null) {
            parts.add(Map.of(
                "inline_data", Map.of(
                    "mime_type", mimeType,
                    "data", Base64.getEncoder().encodeToString(imageBytes)
                )
            ));
        }

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of("parts", parts)),
                "generationConfig", Map.of(
                        "temperature", imageBytes != null ? 0.1 : 0.7,
                        "maxOutputTokens", 2048
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity,
                    new ParameterizedTypeReference<Map<String, Object>>() {});

            return extractText(response.getBody());

        } catch (HttpClientErrorException e) {
            log.error("[Gemini] API Error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            return fallback("AI service error: " + e.getStatusCode());
        } catch (Exception e) {
            log.error("[Gemini] Unexpected error: {}", e.getMessage(), e);
            return fallback("AI service unavailable.");
        }
    }

    private String extractText(Map<?, ?> body) {
        if (body == null) return fallback("Empty response");
        try {
            List<?> candidates = (List<?>) body.get("candidates");
            if (candidates == null || candidates.isEmpty()) return fallback("No candidates");
            Map<?, ?> firstCandidate = (Map<?, ?>) candidates.get(0);
            Map<?, ?> content = (Map<?, ?>) firstCandidate.get("content");
            List<?> parts = (List<?>) content.get("parts");
            Map<?, ?> firstPart = (Map<?, ?>) parts.get(0);
            return (String) firstPart.get("text");
        } catch (Exception e) {
            log.error("[Gemini] Extraction error", e);
            return fallback("Parsing error");
        }
    }

    private String fallback(String message) {
        return "{\"error\": true, \"message\": \"" + message + "\"}";
    }
}
