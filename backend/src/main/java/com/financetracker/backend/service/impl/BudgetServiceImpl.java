package com.financetracker.backend.service.impl;

import com.financetracker.backend.dto.BudgetDto;
import com.financetracker.backend.entity.Budget;
import com.financetracker.backend.entity.User;
import com.financetracker.backend.repository.BudgetRepository;
import com.financetracker.backend.repository.ExpenseRepository;
import com.financetracker.backend.service.BudgetService;
import com.financetracker.backend.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;

@Service
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;
    private final UserService userService;

    public BudgetServiceImpl(BudgetRepository budgetRepository,
                             ExpenseRepository expenseRepository,
                             UserService userService) {
        this.budgetRepository = budgetRepository;
        this.expenseRepository = expenseRepository;
        this.userService = userService;
    }

    @Override
    @Transactional
    public BudgetDto setMonthlyBudget(BudgetDto dto) {
        User user = userService.getCurrentUserEntity();
        Budget budget = budgetRepository.findByUser(user)
                .orElseGet(() -> {
                    Budget b = new Budget();
                    b.setUser(user);
                    return b;
                });
        budget.setMonthlyLimit(dto.getMonthlyLimit());
        Budget saved = budgetRepository.save(budget);

        BudgetDto result = new BudgetDto();
        result.setMonthlyLimit(saved.getMonthlyLimit());
        return result;
    }

    @Override
    public BudgetDto getMonthlyBudget() {
        User user = userService.getCurrentUserEntity();
        return budgetRepository.findByUser(user)
                .map(b -> {
                    BudgetDto dto = new BudgetDto();
                    dto.setMonthlyLimit(b.getMonthlyLimit());
                    return dto;
                })
                .orElse(null);
    }

    @Override
    public BigDecimal getRemainingBudget() {
        User user = userService.getCurrentUserEntity();
        Budget budget = budgetRepository.findByUser(user).orElse(null);
        if (budget == null) {
            return BigDecimal.ZERO;
        }

        YearMonth currentMonth = YearMonth.now();
        LocalDate start = currentMonth.atDay(1);
        LocalDate end = currentMonth.atEndOfMonth();

        return budget.getMonthlyLimit()
                .subtract(expenseRepository.findByUserAndDateBetween(user, start, end)
                        .stream()
                        .map(e -> e.getAmount())
                        .reduce(BigDecimal.ZERO, BigDecimal::add));
    }

    @Override
    public boolean isBudgetExceeded() {
        BigDecimal remaining = getRemainingBudget();
        return remaining.compareTo(BigDecimal.ZERO) < 0;
    }
}

