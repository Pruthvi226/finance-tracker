package com.financetracker.backend.repository;

import com.financetracker.backend.entity.Income;
import com.financetracker.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface IncomeRepository extends JpaRepository<Income, Long> {
    List<Income> findByUser(User user);

    List<Income> findByUserAndDateBetween(User user, LocalDate start, LocalDate end);
}
