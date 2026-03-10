package com.financetracker.backend.service.impl;

import com.financetracker.backend.dto.DashboardDto;
import com.financetracker.backend.entity.Expense;
import com.financetracker.backend.entity.Income;
import com.financetracker.backend.entity.User;
import com.financetracker.backend.repository.ExpenseRepository;
import com.financetracker.backend.repository.IncomeRepository;
import com.financetracker.backend.service.DashboardService;
import com.financetracker.backend.service.UserService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;
    private final UserService userService;

    public DashboardServiceImpl(IncomeRepository incomeRepository,
                                ExpenseRepository expenseRepository,
                                UserService userService) {
        this.incomeRepository = incomeRepository;
        this.expenseRepository = expenseRepository;
        this.userService = userService;
    }

    @Override
    public DashboardDto getDashboardSummary() {
        User user = userService.getCurrentUserEntity();

        List<Income> incomes = incomeRepository.findByUser(user);
        List<Expense> expenses = expenseRepository.findByUser(user);

        BigDecimal totalIncome = incomes.stream()
                .map(Income::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalExpense = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remaining = totalIncome.subtract(totalExpense);

        Map<String, BigDecimal> monthlySummary = incomes.stream()
                .collect(Collectors.groupingBy(
                        i -> YearMonth.from(i.getDate()).toString(),
                        Collectors.mapping(Income::getAmount,
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

        // Merge expenses into monthlySummary as net balance per month
        monthlyExpenses.forEach((month, expAmount) -> {
            monthlySummary.merge(month, expAmount.negate(), BigDecimal::add);
        });

        DashboardDto dto = new DashboardDto();
        dto.setTotalIncome(totalIncome);
        dto.setTotalExpense(totalExpense);
        dto.setRemainingBalance(remaining);
        dto.setMonthlySummary(monthlySummary);
        return dto;
    }
}

