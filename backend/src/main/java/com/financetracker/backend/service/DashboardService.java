package com.financetracker.backend.service;

import com.financetracker.backend.dto.DashboardDto;

public interface DashboardService {

    DashboardDto getDashboardSummary(Long accountId);
}

