package com.financetracker.backend.controller;

import com.financetracker.backend.dto.ApiResponse;
import com.financetracker.backend.dto.BudgetDto;
import com.financetracker.backend.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
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
    public ResponseEntity<ApiResponse<BudgetDto>> setBudget(
            @RequestAttribute("userId") Long userId,
            @Valid @RequestBody BudgetDto dto) {
        BudgetDto result = budgetService.setMonthlyBudget(userId, dto);
        return ResponseEntity.ok(ApiResponse.success(result, "Monthly budget configured successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<BudgetDto>> getBudget(@RequestAttribute("userId") Long userId) {
        BudgetDto result = budgetService.getMonthlyBudget(userId);
        return ResponseEntity.ok(ApiResponse.success(result, "Monthly budget retrieved successfully"));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBudgetStatus(@RequestAttribute("userId") Long userId) {
        BigDecimal remaining = budgetService.getRemainingBudget(userId);
        boolean exceeded = budgetService.isBudgetExceeded(userId);

        Map<String, Object> body = new HashMap<>();
        body.put("remaining", remaining);
        body.put("exceeded", exceeded);
        return ResponseEntity.ok(ApiResponse.success(body, "Budget status snapshot retrieved"));
    }
}

