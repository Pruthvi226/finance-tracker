package com.financetracker.backend.repository;

import com.financetracker.backend.entity.Budget;
import com.financetracker.backend.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    @EntityGraph(attributePaths = {"category"})
    Optional<Budget> findByUser(User user);
}
