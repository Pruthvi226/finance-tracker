package com.financetracker.backend.controller;

import com.financetracker.backend.dto.ApiResponse;
import com.financetracker.backend.entity.UserSettings;
import com.financetracker.backend.service.UserSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final UserSettingsService userSettingsService;

    public SettingsController(UserSettingsService userSettingsService) {
        this.userSettingsService = userSettingsService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<UserSettings>> getSettings(@RequestAttribute("userId") Long userId) {
        UserSettings settings = userSettingsService.getSettingsByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(settings, "Settings retrieved successfully"));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<UserSettings>> updateSettings(
            @RequestAttribute("userId") Long userId,
            @RequestBody UserSettings settings) {
        UserSettings updated = userSettingsService.updateSettings(userId, settings);
        return ResponseEntity.ok(ApiResponse.success(updated, "Settings updated successfully"));
    }
}
