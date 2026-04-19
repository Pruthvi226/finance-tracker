package com.financetracker.backend.service;

import com.financetracker.backend.dto.RecurringTransactionDto;
import java.util.List;

public interface RecurringTransactionService {
    RecurringTransactionDto createRecurringTransaction(Long userId, RecurringTransactionDto dto);
    RecurringTransactionDto updateRecurringTransaction(Long userId, Long id, RecurringTransactionDto dto);
    void deleteRecurringTransaction(Long userId, Long id);
    List<RecurringTransactionDto> getUserRecurringTransactions(Long userId);
}
