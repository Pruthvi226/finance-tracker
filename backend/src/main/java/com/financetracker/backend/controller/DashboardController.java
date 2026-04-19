package com.financetracker.backend.controller;

import com.financetracker.backend.dto.ApiResponse;
import com.financetracker.backend.dto.DashboardDto;
import com.financetracker.backend.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardDto>> getDashboard(
            @RequestAttribute("userId") Long userId,
            @RequestParam(value = "accountId", required = false) Long accountId) {
        DashboardDto dashboard = dashboardService.getDashboardSummary(userId, accountId);
        return ResponseEntity.ok(ApiResponse.success(dashboard, "Dashboard summary retrieved successfully"));
    }
}

