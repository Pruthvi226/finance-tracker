package com.financetracker.backend.controller;

import com.financetracker.backend.dto.ApiResponse;
import com.financetracker.backend.dto.RecurringTransactionDto;
import com.financetracker.backend.service.RecurringTransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recurring-transactions")
public class RecurringTransactionController {

    private final RecurringTransactionService recurringTransactionService;

    public RecurringTransactionController(RecurringTransactionService recurringTransactionService) {
        this.recurringTransactionService = recurringTransactionService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RecurringTransactionDto>> createRecurringTransaction(
            @RequestAttribute("userId") Long userId,
            @Valid @RequestBody RecurringTransactionDto dto) {
        RecurringTransactionDto saved = recurringTransactionService.createRecurringTransaction(userId, dto);
        return new ResponseEntity<>(ApiResponse.success(saved, "Recurring transaction created successfully"), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RecurringTransactionDto>> updateRecurringTransaction(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id,
            @Valid @RequestBody RecurringTransactionDto dto) {
        RecurringTransactionDto updated = recurringTransactionService.updateRecurringTransaction(userId, id, dto);
        return ResponseEntity.ok(ApiResponse.success(updated, "Recurring transaction updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRecurringTransaction(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id) {
        recurringTransactionService.deleteRecurringTransaction(userId, id);
        return ResponseEntity.ok(ApiResponse.success(null, "Recurring transaction deleted successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RecurringTransactionDto>>> getUserRecurringTransactions(@RequestAttribute("userId") Long userId) {
        List<RecurringTransactionDto> recurring = recurringTransactionService.getUserRecurringTransactions(userId);
        return ResponseEntity.ok(ApiResponse.success(recurring, "Recurring transactions retrieved successfully"));
    }
}
