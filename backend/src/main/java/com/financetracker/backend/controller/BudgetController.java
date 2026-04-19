package com.financetracker.backend.controller;

import com.financetracker.backend.dto.ApiResponse;
import com.financetracker.backend.dto.BudgetDto;
import com.financetracker.backend.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
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
    public ResponseEntity<ApiResponse<List<BudgetDto>>> getBudgets(@RequestAttribute("userId") Long userId) {
        List<BudgetDto> result = budgetService.getAllBudgets(userId);
        return ResponseEntity.ok(ApiResponse.success(result, "Monthly budgets retrieved successfully"));
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
