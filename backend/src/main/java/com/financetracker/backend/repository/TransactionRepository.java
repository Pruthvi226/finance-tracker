package com.financetracker.backend.repository;

import com.financetracker.backend.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {
    @Override
    @EntityGraph(attributePaths = {"category", "account"})
    Page<Transaction> findAll(Specification<Transaction> spec, Pageable pageable);
    
    @Override
    @EntityGraph(attributePaths = {"category", "account"})
    List<Transaction> findAll(Specification<Transaction> spec);

    @EntityGraph(attributePaths = {"category", "account"})
    Page<Transaction> findByUserId(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"category", "account"})
    List<Transaction> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"category", "account"})
    List<Transaction> findByUserIdOrderByDateDesc(Long userId);

    @EntityGraph(attributePaths = {"category", "account"})
    List<Transaction> findByUserIdAndAccountId(Long userId, Long accountId);

    @EntityGraph(attributePaths = {"category", "account"})
    List<Transaction> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
}
