package com.financetracker.backend.controller;

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
    public ResponseEntity<FinancialGoalDto> createGoal(@Valid @RequestBody FinancialGoalDto dto) {
        return new ResponseEntity<>(financialGoalService.createGoal(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FinancialGoalDto> updateGoal(@PathVariable Long id, @Valid @RequestBody FinancialGoalDto dto) {
        return ResponseEntity.ok(financialGoalService.updateGoal(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        financialGoalService.deleteGoal(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<FinancialGoalDto>> getUserGoals() {
        return ResponseEntity.ok(financialGoalService.getUserGoals());
    }
}
