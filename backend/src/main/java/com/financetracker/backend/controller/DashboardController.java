package com.financetracker.backend.controller;

import com.financetracker.backend.dto.DashboardDto;
import com.financetracker.backend.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<DashboardDto> getDashboard(
            @RequestParam(value = "accountId", required = false) Long accountId) {
        return ResponseEntity.ok(dashboardService.getDashboardSummary(accountId));
    }
}

