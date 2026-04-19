package com.financetracker.backend.controller;

import com.financetracker.backend.dto.ApiResponse;
import com.financetracker.backend.service.GamificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/gamification")
public class GamificationController {

    private final GamificationService gamificationService;

    public GamificationController(GamificationService gamificationService) {
        this.gamificationService = gamificationService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats(@RequestAttribute("userId") Long userId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("streakCount", gamificationService.calculateSavingsStreak(userId));
        stats.put("achievements", gamificationService.getAchievements(userId));
        return ResponseEntity.ok(ApiResponse.success(stats, "Gamification metrics retrieved successfully"));
    }
}
