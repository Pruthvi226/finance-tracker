package com.financetracker.backend.service;

import com.financetracker.backend.dto.BudgetDto;

import java.math.BigDecimal;

public interface BudgetService {

    BudgetDto setMonthlyBudget(Long userId, BudgetDto dto);

    BudgetDto getMonthlyBudget(Long userId);

    BigDecimal getRemainingBudget(Long userId);

    boolean isBudgetExceeded(Long userId);
}

