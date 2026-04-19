package com.financetracker.backend.controller;

import com.financetracker.backend.ai.dto.CategoryResponse;
import com.financetracker.backend.ai.dto.ChatRequest;
import com.financetracker.backend.ai.dto.ChatResponse;
import com.financetracker.backend.ai.dto.InsightResponse;
import com.financetracker.backend.ai.dto.ReceiptResponse;
import com.financetracker.backend.dto.ApiResponse;
import com.financetracker.backend.dto.AnomalyResponse;
import com.financetracker.backend.dto.ForecastResponse;
import com.financetracker.backend.dto.HealthScoreResponse;
import com.financetracker.backend.dto.PredictionResponse;
import com.financetracker.backend.service.AiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * AI Controller — exposes all AI-powered finance endpoints.
 * Standardized with ApiResponse structure.
 */
@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AiController {

    private static final Logger log = LoggerFactory.getLogger(AiController.class);

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @GetMapping("/insights")
    public ResponseEntity<ApiResponse<InsightResponse>> getInsights(@RequestAttribute("userId") Long userId) {
        log.info("[AiController] GET /api/ai/insights for userId={}", userId);
        InsightResponse response = aiService.generateInsights(userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Insights generated successfully"));
    }

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<ChatResponse>> chat(
            @RequestAttribute("userId") Long userId,
            @RequestBody ChatRequest request) {
        log.info("[AiController] POST /api/ai/chat for userId={}", userId);
        ChatResponse response = aiService.chat(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Chat response retrieved"));
    }

    @PostMapping("/categorize")
    public ResponseEntity<ApiResponse<CategoryResponse>> categorize(@RequestBody Map<String, String> payload) {
        String description = payload.get("description");
        if (description == null || description.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Description is required"));
        }
        log.info("[AiController] POST /api/ai/categorize: {}", description);
        CategoryResponse response = aiService.categorize(description);
        return ResponseEntity.ok(ApiResponse.success(response, "Category inferred successfully"));
    }

    @GetMapping("/predict")
    public ResponseEntity<ApiResponse<PredictionResponse>> predict(@RequestAttribute("userId") Long userId) {
        log.info("[AiController] GET /api/ai/predict for userId={}", userId);
        PredictionResponse response = aiService.predictAnalytics(userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Predictions generated successfully"));
    }

    @GetMapping("/health-score")
    public ResponseEntity<ApiResponse<HealthScoreResponse>> getHealthScore(@RequestAttribute("userId") Long userId) {
        log.info("[AiController] GET /api/ai/health-score for userId={}", userId);
        HealthScoreResponse response = aiService.calculateHealthScore(userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Financial health score synchronized"));
    }

    @PostMapping("/receipt")
    public ResponseEntity<ApiResponse<ReceiptResponse>> processReceipt(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("File is empty"));
        }
        try {
            ReceiptResponse response = aiService.processReceipt(file.getBytes(), file.getContentType());
            return ResponseEntity.ok(ApiResponse.success(response, "Receipt processed successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error processing receipt: " + e.getMessage()));
        }
    }

    @PostMapping("/parse-intent")
    public ResponseEntity<ApiResponse<Map<String, Object>>> parseIntent(@RequestBody Map<String, String> payload) {
        String query = payload.get("query");
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Query is required"));
        }
        log.info("[AiController] POST /api/ai/parse-intent: {}", query);
        Map<String, Object> response = aiService.parseIntent(query);
        return ResponseEntity.ok(ApiResponse.success(response, "Intent parsed successfully"));
    }

    @GetMapping("/forecast")
    public ResponseEntity<ApiResponse<ForecastResponse>> getForecast(@RequestAttribute("userId") Long userId) {
        log.info("[AiController] GET /api/ai/forecast for userId={}", userId);
        ForecastResponse response = aiService.getSixMonthForecast(userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Forecast synchronized successfully"));
    }

    @GetMapping("/anomalies")
    public ResponseEntity<ApiResponse<AnomalyResponse>> getAnomalies(@RequestAttribute("userId") Long userId) {
        log.info("[AiController] GET /api/ai/anomalies for userId={}", userId);
        AnomalyResponse response = aiService.detectAnomalies(userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Anomalies detected and reported"));
    }
}
