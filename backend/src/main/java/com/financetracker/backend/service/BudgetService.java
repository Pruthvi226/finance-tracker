package com.financetracker.backend.service;

import com.financetracker.backend.dto.BudgetDto;

import java.math.BigDecimal;

public interface BudgetService {

    BudgetDto setMonthlyBudget(BudgetDto dto);

    BudgetDto getMonthlyBudget();

    BigDecimal getRemainingBudget();

    boolean isBudgetExceeded();
}

