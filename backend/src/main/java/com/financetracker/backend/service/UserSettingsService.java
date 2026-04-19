package com.financetracker.backend.service;

import com.financetracker.backend.entity.UserSettings;

public interface UserSettingsService {
    UserSettings getSettingsByUserId(Long userId);
    UserSettings updateSettings(Long userId, UserSettings settings);
}
