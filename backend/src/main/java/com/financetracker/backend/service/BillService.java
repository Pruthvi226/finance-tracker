package com.financetracker.backend.service;

import com.financetracker.backend.entity.Bill;
import java.util.List;

public interface BillService {
    Bill createBill(Bill bill);
    Bill updateBill(Long id, Bill bill);
    void deleteBill(Long id);
    List<Bill> getBillsByUserId(Long userId);
    Bill markAsPaid(Long billId);
    void processDueBills();
}
