package com.financetracker.backend.repository;

import com.financetracker.backend.entity.Expense;
import com.financetracker.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByUser(User user);

    List<Expense> findByUserAndCategory(User user, String category);

    List<Expense> findByUserAndDateBetween(User user, LocalDate start, LocalDate end);
}
