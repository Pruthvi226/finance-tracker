package com.financetracker.backend.service;

import com.financetracker.backend.dto.AnalyticsDto;

public interface AnalyticsService {

    AnalyticsDto getAnalytics(Long accountId);
}

