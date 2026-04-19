package com.financetracker.backend.service.impl;

import com.financetracker.backend.entity.User;
import com.financetracker.backend.entity.UserSettings;
import com.financetracker.backend.exception.ResourceNotFoundException;
import com.financetracker.backend.repository.UserRepository;
import com.financetracker.backend.repository.UserSettingsRepository;
import com.financetracker.backend.service.UserSettingsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserSettingsServiceImpl implements UserSettingsService {

    private final UserSettingsRepository userSettingsRepository;
    private final UserRepository userRepository;

    public UserSettingsServiceImpl(UserSettingsRepository userSettingsRepository, UserRepository userRepository) {
        this.userSettingsRepository = userSettingsRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public UserSettings getSettingsByUserId(Long userId) {
        return userSettingsRepository.findByUserId(userId)
            .orElseGet(() -> {
                User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
                UserSettings defaultSettings = UserSettings.builder()
                    .user(user)
                    .theme("light")
                    .currency("USD")
                    .notificationsEnabled(true)
                    .smsAlertsEnabled(false)
                    .emailAlertsEnabled(true)
                    .language("en")
                    .timezone("UTC")
                    .build();
                return userSettingsRepository.save(defaultSettings);
            });
    }

    @Override
    @Transactional
    public UserSettings updateSettings(Long userId, UserSettings settings) {
        UserSettings existing = getSettingsByUserId(userId);
        
        existing.setTheme(settings.getTheme());
        existing.setCurrency(settings.getCurrency());
        existing.setNotificationsEnabled(settings.isNotificationsEnabled());
        existing.setSmsAlertsEnabled(settings.isSmsAlertsEnabled());
        existing.setEmailAlertsEnabled(settings.isEmailAlertsEnabled());
        existing.setLanguage(settings.getLanguage());
        existing.setTimezone(settings.getTimezone());
        
        return userSettingsRepository.save(existing);
    }
}
