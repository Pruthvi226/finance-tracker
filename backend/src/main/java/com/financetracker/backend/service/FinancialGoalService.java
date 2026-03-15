package com.financetracker.backend.service;

import com.financetracker.backend.dto.FinancialGoalDto;
import java.util.List;

public interface FinancialGoalService {
    FinancialGoalDto createGoal(FinancialGoalDto dto);
    FinancialGoalDto updateGoal(Long id, FinancialGoalDto dto);
    void deleteGoal(Long id);
    List<FinancialGoalDto> getUserGoals();
}
