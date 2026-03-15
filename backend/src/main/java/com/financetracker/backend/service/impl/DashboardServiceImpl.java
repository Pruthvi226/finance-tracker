package com.financetracker.backend.service.impl;

import com.financetracker.backend.dto.DashboardDto;
import com.financetracker.backend.entity.Transaction;
import com.financetracker.backend.entity.TransactionType;
import com.financetracker.backend.entity.User;
import com.financetracker.backend.repository.TransactionRepository;
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

    private final TransactionRepository transactionRepository;
    private final UserService userService;

    public DashboardServiceImpl(TransactionRepository transactionRepository,
                                UserService userService) {
        this.transactionRepository = transactionRepository;
        this.userService = userService;
    }

    @Override
    public DashboardDto getDashboardSummary(Long accountId) {
        User user = userService.getCurrentUserEntity();

        List<Transaction> transactions;
        if (accountId != null) {
            transactions = transactionRepository.findByUserIdAndAccountId(user.getId(), accountId);
        } else {
            transactions = transactionRepository.findByUserId(user.getId());
        }

        List<Transaction> incomes = transactions.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .collect(Collectors.toList());
        List<Transaction> expenses = transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .collect(Collectors.toList());

        BigDecimal totalIncome = incomes.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalExpense = expenses.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remaining = totalIncome.subtract(totalExpense);

        Map<String, BigDecimal> monthlySummary = incomes.stream()
                .collect(Collectors.groupingBy(
                        i -> YearMonth.from(i.getDate()).toString(),
                        Collectors.mapping(Transaction::getAmount,
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add)
                        )
                ));

        Map<String, BigDecimal> monthlyExpenses = expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> YearMonth.from(e.getDate()).toString(),
                        Collectors.mapping(Transaction::getAmount,
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
