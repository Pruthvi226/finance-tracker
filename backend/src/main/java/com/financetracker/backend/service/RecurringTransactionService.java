package com.financetracker.backend.service;

import com.financetracker.backend.dto.RecurringTransactionDto;
import java.util.List;

public interface RecurringTransactionService {
    RecurringTransactionDto createRecurringTransaction(RecurringTransactionDto dto);
    RecurringTransactionDto updateRecurringTransaction(Long id, RecurringTransactionDto dto);
    void deleteRecurringTransaction(Long id);
    List<RecurringTransactionDto> getUserRecurringTransactions();
}
