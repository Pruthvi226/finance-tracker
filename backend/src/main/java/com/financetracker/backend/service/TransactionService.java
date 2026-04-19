package com.financetracker.backend.service;

import com.financetracker.backend.dto.PageResponse;
import com.financetracker.backend.dto.TransactionDto;
import com.financetracker.backend.entity.Transaction;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface TransactionService {
    TransactionDto createTransaction(Long userId, TransactionDto transactionDto);
    TransactionDto updateTransaction(Long userId, Long id, TransactionDto transactionDto);
    void deleteTransaction(Long userId, Long id);
    TransactionDto getTransactionById(Long userId, Long id);
    List<Transaction> getAllTransactionsByUserId(Long userId);
    PageResponse<TransactionDto> getUserTransactions(
        Long userId,
        int pageNo, int pageSize, Long categoryId, Long accountId,
        com.financetracker.backend.entity.TransactionType type,
        LocalDate startDate, LocalDate endDate, 
        BigDecimal minAmount, BigDecimal maxAmount, String search
    );
    TransactionDto uploadReceipt(Long userId, Long id, MultipartFile file);
}
