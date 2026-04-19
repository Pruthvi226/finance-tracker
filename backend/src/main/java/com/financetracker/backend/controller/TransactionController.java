package com.financetracker.backend.controller;

import com.financetracker.backend.dto.ApiResponse;
import com.financetracker.backend.dto.PageResponse;
import com.financetracker.backend.dto.TransactionDto;
import com.financetracker.backend.service.ExportService;
import com.financetracker.backend.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final ExportService exportService;

    public TransactionController(TransactionService transactionService, ExportService exportService) {
        this.transactionService = transactionService;
        this.exportService = exportService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TransactionDto>> createTransaction(
            @RequestAttribute("userId") Long userId,
            @Valid @RequestBody TransactionDto transactionDto) {
        TransactionDto saved = transactionService.createTransaction(userId, transactionDto);
        return new ResponseEntity<>(ApiResponse.success(saved, "Transaction created successfully"), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionDto>> updateTransaction(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id,
            @Valid @RequestBody TransactionDto transactionDto) {
        TransactionDto updated = transactionService.updateTransaction(userId, id, transactionDto);
        return ResponseEntity.ok(ApiResponse.success(updated, "Transaction updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id) {
        transactionService.deleteTransaction(userId, id);
        return ResponseEntity.ok(ApiResponse.success(null, "Transaction deleted successfully"));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportTransactions(@RequestAttribute("userId") Long userId) {
        List<com.financetracker.backend.entity.Transaction> list = transactionService.getAllTransactionsByUserId(userId);
        String csv = exportService.exportTransactionsToCsv(list);
        byte[] bytes = csv.getBytes();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=transactions_export.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .contentLength(bytes.length)
                .body(bytes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionDto>> getTransactionById(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id) {
        TransactionDto transaction = transactionService.getTransactionById(userId, id);
        return ResponseEntity.ok(ApiResponse.success(transaction, "Transaction retrieved successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<TransactionDto>>> getUserTransactions(
            @RequestAttribute("userId") Long userId,
            @RequestParam(value = "pageNo", defaultValue = "0", required = false) int pageNo,
            @RequestParam(value = "pageSize", defaultValue = "10", required = false) int pageSize,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "accountId", required = false) Long accountId,
            @RequestParam(value = "type", required = false) com.financetracker.backend.entity.TransactionType type,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(value = "minAmount", required = false) BigDecimal minAmount,
            @RequestParam(value = "maxAmount", required = false) BigDecimal maxAmount,
            @RequestParam(value = "search", required = false) String search) {
        
        PageResponse<TransactionDto> pageResult = transactionService.getUserTransactions(
                userId, pageNo, pageSize, categoryId, accountId, type, startDate, endDate, minAmount, maxAmount, search);
        return ResponseEntity.ok(ApiResponse.success(pageResult, "Transactions retrieved successfully"));
    }

    @PostMapping(value = "/{id}/receipt", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<TransactionDto>> uploadReceipt(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        TransactionDto uploaded = transactionService.uploadReceipt(userId, id, file);
        return ResponseEntity.ok(ApiResponse.success(uploaded, "Receipt uploaded successfully"));
    }
}
