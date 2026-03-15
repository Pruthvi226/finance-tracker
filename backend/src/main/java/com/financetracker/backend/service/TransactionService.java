package com.financetracker.backend.service;

import com.financetracker.backend.dto.PageResponse;
import com.financetracker.backend.dto.TransactionDto;

import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.time.LocalDate;

public interface TransactionService {
    TransactionDto createTransaction(TransactionDto transactionDto);
    TransactionDto updateTransaction(Long id, TransactionDto transactionDto);
    void deleteTransaction(Long id);
    TransactionDto getTransactionById(Long id);
    PageResponse<TransactionDto> getUserTransactions(
        int pageNo, int pageSize, Long categoryId, Long accountId,
        com.financetracker.backend.entity.TransactionType type,
        LocalDate startDate, LocalDate endDate, 
        BigDecimal minAmount, BigDecimal maxAmount, String search
    );
    TransactionDto uploadReceipt(Long id, MultipartFile file);
}
