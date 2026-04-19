package com.financetracker.backend.service.impl;

import com.financetracker.backend.dto.BudgetDto;
import com.financetracker.backend.entity.Budget;
import com.financetracker.backend.entity.User;
import com.financetracker.backend.repository.BudgetRepository;
import com.financetracker.backend.repository.TransactionRepository;
import com.financetracker.backend.service.BudgetService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;

@Service
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final com.financetracker.backend.repository.UserRepository userRepository;

    public BudgetServiceImpl(BudgetRepository budgetRepository,
                             TransactionRepository transactionRepository,
                             com.financetracker.backend.repository.UserRepository userRepository) {
        this.budgetRepository = budgetRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public BudgetDto setMonthlyBudget(Long userId, BudgetDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.financetracker.backend.exception.ResourceNotFoundException("User not found"));
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
    public BudgetDto getMonthlyBudget(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.financetracker.backend.exception.ResourceNotFoundException("User not found"));
        return budgetRepository.findByUser(user)
                .map(b -> {
                    BudgetDto dto = new BudgetDto();
                    dto.setMonthlyLimit(b.getMonthlyLimit());
                    return dto;
                })
                .orElse(null);
    }

    @Override
    public BigDecimal getRemainingBudget(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.financetracker.backend.exception.ResourceNotFoundException("User not found"));
        Budget budget = budgetRepository.findByUser(user).orElse(null);
        if (budget == null) {
            return BigDecimal.ZERO;
        }

        YearMonth currentMonth = YearMonth.now();
        LocalDate start = currentMonth.atDay(1);
        LocalDate end = currentMonth.atEndOfMonth();

        return budget.getMonthlyLimit()
                .subtract(transactionRepository.findByUserIdAndDateBetween(userId, start, end)
                        .stream()
                        .filter(t -> t.getType() == com.financetracker.backend.entity.TransactionType.EXPENSE)
                        .map(t -> t.getAmount())
                        .reduce(BigDecimal.ZERO, BigDecimal::add));
    }

    @Override
    public boolean isBudgetExceeded(Long userId) {
        BigDecimal remaining = getRemainingBudget(userId);
        return remaining.compareTo(BigDecimal.ZERO) < 0;
    }
}

