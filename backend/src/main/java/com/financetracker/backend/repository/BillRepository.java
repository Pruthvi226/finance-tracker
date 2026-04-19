package com.financetracker.backend.repository;

import com.financetracker.backend.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByUserId(Long userId);
    List<Bill> findByUserIdAndStatus(Long userId, Bill.BillStatus status);
    List<Bill> findByDueDateBetweenAndStatusNot(LocalDate start, LocalDate end, Bill.BillStatus status);
    List<Bill> findByDueDateLessThanAndStatus(LocalDate date, Bill.BillStatus status);
}
