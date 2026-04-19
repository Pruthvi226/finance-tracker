package com.financetracker.backend.service.impl;

import com.financetracker.backend.dto.BudgetDto;
import com.financetracker.backend.entity.Budget;
import com.financetracker.backend.entity.User;
import com.financetracker.backend.exception.ResourceNotFoundException;
import com.financetracker.backend.repository.BudgetRepository;
import com.financetracker.backend.repository.CategoryRepository;
import com.financetracker.backend.repository.TransactionRepository;
import com.financetracker.backend.repository.UserRepository;
import com.financetracker.backend.service.BudgetService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public BudgetServiceImpl(BudgetRepository budgetRepository,
                             TransactionRepository transactionRepository,
                             UserRepository userRepository,
                             CategoryRepository categoryRepository) {
        this.budgetRepository = budgetRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    @Override
    @Transactional
    public BudgetDto setMonthlyBudget(Long userId, BudgetDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Budget budget;
        if (dto.getCategoryId() != null) {
            budget = budgetRepository.findByUserId(userId).stream()
                    .filter(b -> b.getCategory() != null && b.getCategory().getId().equals(dto.getCategoryId()))
                    .findFirst()
                    .orElseGet(() -> {
                        Budget b = new Budget();
                        b.setUser(user);
                        b.setCategory(categoryRepository.findById(dto.getCategoryId()).orElse(null));
                        return b;
                    });
        } else {
            budget = budgetRepository.findByUserId(userId).stream()
                    .filter(b -> b.getCategory() == null)
                    .findFirst()
                    .orElseGet(() -> {
                        Budget b = new Budget();
                        b.setUser(user);
                        return b;
                    });
        }

        budget.setMonthlyLimit(dto.getTargetAmount());
        Budget saved = budgetRepository.save(budget);
        return mapToDto(saved, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BudgetDto> getAllBudgets(Long userId) {
        return budgetRepository.findByUserId(userId).stream()
                .map(budget -> mapToDto(budget, userId))
                .collect(Collectors.toList());
    }

    private BudgetDto mapToDto(Budget budget, Long userId) {
        BudgetDto dto = new BudgetDto();
        dto.setId(budget.getId());
        dto.setTargetAmount(budget.getMonthlyLimit());
        
        if (budget.getCategory() != null) {
            dto.setCategoryId(budget.getCategory().getId());
            dto.setCategoryName(budget.getCategory().getName());
        } else {
            dto.setCategoryName("Global");
        }

        // Calculate current spending for this category/month
        YearMonth currentMonth = YearMonth.now();
        LocalDate start = currentMonth.atDay(1);
        LocalDate end = currentMonth.atEndOfMonth();

        BigDecimal spent = transactionRepository.findByUserIdAndDateBetween(userId, start, end).stream()
                .filter(t -> t.getType() == com.financetracker.backend.entity.TransactionType.EXPENSE)
                .filter(t -> {
                    if (budget.getCategory() == null) return true;
                    return t.getCategory() != null && t.getCategory().getId().equals(budget.getCategory().getId());
                })
                .map(t -> t.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        dto.setSpentAmount(spent);
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getRemainingBudget(Long userId) {
        // This calculates the global remaining budget
        return getAllBudgets(userId).stream()
                .filter(b -> b.getCategoryId() == null) // Global one
                .findFirst()
                .map(b -> b.getTargetAmount().subtract(b.getSpentAmount()))
                .orElse(BigDecimal.ZERO);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isBudgetExceeded(Long userId) {
        return getRemainingBudget(userId).compareTo(BigDecimal.ZERO) < 0;
    }
}
