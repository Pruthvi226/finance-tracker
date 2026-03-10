package com.financetracker.backend.controller;

import com.financetracker.backend.dto.BudgetDto;
import com.financetracker.backend.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/budget")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping
    public ResponseEntity<BudgetDto> setBudget(@Valid @RequestBody BudgetDto dto) {
        return ResponseEntity.ok(budgetService.setMonthlyBudget(dto));
    }

    @GetMapping
    public ResponseEntity<BudgetDto> getBudget() {
        return ResponseEntity.ok(budgetService.getMonthlyBudget());
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getBudgetStatus() {
        BigDecimal remaining = budgetService.getRemainingBudget();
        boolean exceeded = budgetService.isBudgetExceeded();

        Map<String, Object> body = new HashMap<>();
        body.put("remaining", remaining);
        body.put("exceeded", exceeded);
        return ResponseEntity.ok(body);
    }
}

