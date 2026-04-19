package com.financetracker.backend.controller;

import com.financetracker.backend.dto.ApiResponse;
import com.financetracker.backend.dto.FinancialGoalDto;
import com.financetracker.backend.service.FinancialGoalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
public class FinancialGoalController {

    private final FinancialGoalService financialGoalService;

    public FinancialGoalController(FinancialGoalService financialGoalService) {
        this.financialGoalService = financialGoalService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FinancialGoalDto>> createGoal(@Valid @RequestBody FinancialGoalDto dto) {
        FinancialGoalDto saved = financialGoalService.createGoal(dto);
        return new ResponseEntity<>(ApiResponse.success(saved, "Financial goal created successfully"), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FinancialGoalDto>> updateGoal(@PathVariable Long id, @Valid @RequestBody FinancialGoalDto dto) {
        FinancialGoalDto updated = financialGoalService.updateGoal(id, dto);
        return ResponseEntity.ok(ApiResponse.success(updated, "Financial goal updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(@PathVariable Long id) {
        financialGoalService.deleteGoal(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Financial goal deleted successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FinancialGoalDto>>> getUserGoals() {
        List<FinancialGoalDto> goals = financialGoalService.getUserGoals();
        return ResponseEntity.ok(ApiResponse.success(goals, "Financial goals retrieved successfully"));
    }
}
