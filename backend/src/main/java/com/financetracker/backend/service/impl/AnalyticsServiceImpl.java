package com.financetracker.backend.service.impl;

import com.financetracker.backend.dto.AnalyticsDto;
import com.financetracker.backend.entity.Expense;
import com.financetracker.backend.entity.Income;
import com.financetracker.backend.entity.User;
import com.financetracker.backend.repository.ExpenseRepository;
import com.financetracker.backend.repository.IncomeRepository;
import com.financetracker.backend.service.AnalyticsService;
import com.financetracker.backend.service.UserService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;
    private final UserService userService;

    public AnalyticsServiceImpl(IncomeRepository incomeRepository,
                                ExpenseRepository expenseRepository,
                                UserService userService) {
        this.incomeRepository = incomeRepository;
        this.expenseRepository = expenseRepository;
        this.userService = userService;
    }

    @Override
    public AnalyticsDto getAnalytics() {
        User user = userService.getCurrentUserEntity();
        List<Income> incomes = incomeRepository.findByUser(user);
        List<Expense> expenses = expenseRepository.findByUser(user);

        Map<String, BigDecimal> categorySpending = expenses.stream()
                .collect(Collectors.groupingBy(
                        Expense::getCategory,
                        Collectors.mapping(Expense::getAmount,
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add)
                        )
                ));

        Map<String, BigDecimal> monthlyExpenses = expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> YearMonth.from(e.getDate()).toString(),
                        Collectors.mapping(Expense::getAmount,
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add)
                        )
                ));

        Map<String, BigDecimal> monthlyIncome = incomes.stream()
                .collect(Collectors.groupingBy(
                        i -> YearMonth.from(i.getDate()).toString(),
                        Collectors.mapping(Income::getAmount,
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add)
                        )
                ));

        AnalyticsDto dto = new AnalyticsDto();
        dto.setCategorySpending(categorySpending);
        dto.setMonthlyExpenses(monthlyExpenses);
        dto.setMonthlyIncome(monthlyIncome);
        return dto;
    }
}

