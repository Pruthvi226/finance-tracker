package com.financetracker.backend.controller;

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
    public ResponseEntity<RecurringTransactionDto> createRecurringTransaction(@Valid @RequestBody RecurringTransactionDto dto) {
        return new ResponseEntity<>(recurringTransactionService.createRecurringTransaction(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecurringTransactionDto> updateRecurringTransaction(@PathVariable Long id, @Valid @RequestBody RecurringTransactionDto dto) {
        return ResponseEntity.ok(recurringTransactionService.updateRecurringTransaction(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecurringTransaction(@PathVariable Long id) {
        recurringTransactionService.deleteRecurringTransaction(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<RecurringTransactionDto>> getUserRecurringTransactions() {
        return ResponseEntity.ok(recurringTransactionService.getUserRecurringTransactions());
    }
}
