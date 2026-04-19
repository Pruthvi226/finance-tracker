package com.financetracker.backend.service;

import com.financetracker.backend.dto.BudgetDto;

import java.math.BigDecimal;
import java.util.List;

public interface BudgetService {

    BudgetDto setMonthlyBudget(Long userId, BudgetDto dto);

    List<BudgetDto> getAllBudgets(Long userId);

    BigDecimal getRemainingBudget(Long userId);

    boolean isBudgetExceeded(Long userId);
}
