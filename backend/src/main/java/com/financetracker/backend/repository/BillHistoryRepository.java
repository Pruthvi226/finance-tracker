package com.financetracker.backend.repository;

import com.financetracker.backend.entity.BillHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillHistoryRepository extends JpaRepository<BillHistory, Long> {
    List<BillHistory> findByUserId(Long userId);
    List<BillHistory> findByBillId(Long billId);
}
