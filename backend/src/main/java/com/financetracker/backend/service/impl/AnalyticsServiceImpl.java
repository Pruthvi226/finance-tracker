package com.financetracker.backend.service.impl;

import com.financetracker.backend.dto.AnalyticsDto;
import com.financetracker.backend.entity.Transaction;
import com.financetracker.backend.entity.TransactionType;
import com.financetracker.backend.entity.User;
import com.financetracker.backend.repository.TransactionRepository;
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

    private final TransactionRepository transactionRepository;
    private final UserService userService;

    public AnalyticsServiceImpl(TransactionRepository transactionRepository,
                                UserService userService) {
        this.transactionRepository = transactionRepository;
        this.userService = userService;
    }

    @Override
    public AnalyticsDto getAnalytics(Long accountId) {
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

        Map<String, BigDecimal> categorySpending = expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCategory() != null ? e.getCategory().getName() : "Uncategorized",
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

        Map<String, BigDecimal> monthlyIncome = incomes.stream()
                .collect(Collectors.groupingBy(
                        i -> YearMonth.from(i.getDate()).toString(),
                        Collectors.mapping(Transaction::getAmount,
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
