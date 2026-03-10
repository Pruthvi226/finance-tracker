package com.financetracker.backend.service;

import com.financetracker.backend.dto.ExpenseDto;

import java.time.LocalDate;
import java.util.List;

public interface ExpenseService {

    ExpenseDto createExpense(ExpenseDto dto);

    ExpenseDto updateExpense(Long id, ExpenseDto dto);

    void deleteExpense(Long id);

    List<ExpenseDto> getExpenses(String category, LocalDate startDate, LocalDate endDate);
}

