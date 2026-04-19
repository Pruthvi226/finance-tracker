package com.financetracker.backend.controller;

import com.financetracker.backend.dto.AnalyticsDto;
import com.financetracker.backend.dto.ApiResponse;
import com.financetracker.backend.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<AnalyticsDto>> getAnalytics(
            @RequestParam(value = "accountId", required = false) Long accountId) {
        AnalyticsDto analytics = analyticsService.getAnalytics(accountId);
        return ResponseEntity.ok(ApiResponse.success(analytics, "Analytics data retrieved successfully"));
    }
}

