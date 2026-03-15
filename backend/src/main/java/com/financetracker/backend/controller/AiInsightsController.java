package com.financetracker.backend.controller;

import com.financetracker.backend.dto.FinancialHealthDto;
import com.financetracker.backend.service.AiInsightsService;
import com.financetracker.backend.service.FinancialHealthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/insights")
public class AiInsightsController {

    private final AiInsightsService aiInsightsService;
    private final FinancialHealthService financialHealthService;

    public AiInsightsController(AiInsightsService aiInsightsService, FinancialHealthService financialHealthService) {
        this.aiInsightsService = aiInsightsService;
        this.financialHealthService = financialHealthService;
    }

    @GetMapping("/generate")
    public ResponseEntity<Map<String, String>> generateInsights() {
        String insights = aiInsightsService.generateFinancialInsights();
        Map<String, String> response = new HashMap<>();
        response.put("insights", insights);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<FinancialHealthDto> getFinancialHealth() {
        return ResponseEntity.ok(financialHealthService.calculateFinancialHealth());
    }
}
