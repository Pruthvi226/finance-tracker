package com.financetracker.backend.service.impl;

import com.financetracker.backend.dto.ExpenseDto;
import com.financetracker.backend.entity.Expense;
import com.financetracker.backend.entity.User;
import com.financetracker.backend.exception.ResourceNotFoundException;
import com.financetracker.backend.repository.ExpenseRepository;
import com.financetracker.backend.service.ExpenseService;
import com.financetracker.backend.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserService userService;

    public ExpenseServiceImpl(ExpenseRepository expenseRepository, UserService userService) {
        this.expenseRepository = expenseRepository;
        this.userService = userService;
    }

    @Override
    @Transactional
    public ExpenseDto createExpense(ExpenseDto dto) {
        User user = userService.getCurrentUserEntity();
        Expense expense = new Expense();
        expense.setUser(user);
        expense.setAmount(dto.getAmount());
        expense.setCategory(dto.getCategory());
        expense.setDate(dto.getDate());
        expense.setDescription(dto.getDescription());
        Expense saved = expenseRepository.save(expense);
        return toDto(saved);
    }

    @Override
    @Transactional
    public ExpenseDto updateExpense(Long id, ExpenseDto dto) {
        User user = userService.getCurrentUserEntity();
        Expense expense = expenseRepository.findById(id)
                .filter(e -> e.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));

        expense.setAmount(dto.getAmount());
        expense.setCategory(dto.getCategory());
        expense.setDate(dto.getDate());
        expense.setDescription(dto.getDescription());
        return toDto(expenseRepository.save(expense));
    }

    @Override
    @Transactional
    public void deleteExpense(Long id) {
        User user = userService.getCurrentUserEntity();
        Expense expense = expenseRepository.findById(id)
                .filter(e -> e.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        expenseRepository.delete(expense);
    }

    @Override
    public List<ExpenseDto> getExpenses(String category, LocalDate startDate, LocalDate endDate) {
        User user = userService.getCurrentUserEntity();
        List<Expense> expenses;

        boolean hasDateRange = startDate != null && endDate != null;

        if (hasDateRange) {
            expenses = expenseRepository.findByUserAndDateBetween(user, startDate, endDate);
        } else if (category != null && !category.isBlank()) {
            expenses = expenseRepository.findByUserAndCategory(user, category);
        } else {
            expenses = expenseRepository.findByUser(user);
        }

        return expenses.stream().map(this::toDto).collect(Collectors.toList());
    }

    private ExpenseDto toDto(Expense expense) {
        ExpenseDto dto = new ExpenseDto();
        dto.setId(expense.getId());
        dto.setAmount(expense.getAmount());
        dto.setCategory(expense.getCategory());
        dto.setDate(expense.getDate());
        dto.setDescription(expense.getDescription());
        return dto;
    }
}

