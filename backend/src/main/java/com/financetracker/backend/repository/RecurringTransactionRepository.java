package com.financetracker.backend.repository;

import com.financetracker.backend.entity.RecurringTransaction;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, Long> {
    @EntityGraph(attributePaths = {"category"})
    List<RecurringTransaction> findByUserId(Long userId);
    
    @EntityGraph(attributePaths = {"category"})
    List<RecurringTransaction> findByActiveTrueAndNextExecutionDateLessThanEqual(LocalDate date);
}
