package com.financetracker.backend.service.impl;

import com.financetracker.backend.dto.FinancialGoalDto;
import com.financetracker.backend.entity.FinancialGoal;
import com.financetracker.backend.entity.User;
import com.financetracker.backend.exception.ResourceNotFoundException;
import com.financetracker.backend.repository.FinancialGoalRepository;
import com.financetracker.backend.service.FinancialGoalService;
import com.financetracker.backend.service.UserService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FinancialGoalServiceImpl implements FinancialGoalService {

    private final FinancialGoalRepository financialGoalRepository;
    private final UserService userService;

    public FinancialGoalServiceImpl(FinancialGoalRepository financialGoalRepository, UserService userService) {
        this.financialGoalRepository = financialGoalRepository;
        this.userService = userService;
    }

    @Override
    public FinancialGoalDto createGoal(FinancialGoalDto dto) {
        User user = userService.getCurrentUserEntity();
        FinancialGoal goal = new FinancialGoal();
        goal.setUser(user);
        goal.setTitle(dto.getTitle());
        goal.setTargetAmount(dto.getTargetAmount());
        goal.setCurrentAmount(dto.getCurrentAmount() != null ? dto.getCurrentAmount() : BigDecimal.ZERO);
        goal.setDeadline(dto.getDeadline());

        FinancialGoal saved = financialGoalRepository.save(goal);
        return mapToDto(saved);
    }

    @Override
    public FinancialGoalDto updateGoal(Long id, FinancialGoalDto dto) {
        FinancialGoal goal = financialGoalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with id: " + id));
        User user = userService.getCurrentUserEntity();

        if (!goal.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Cannot update other users' goals");
        }

        goal.setTitle(dto.getTitle());
        goal.setTargetAmount(dto.getTargetAmount());
        if (dto.getCurrentAmount() != null) {
            goal.setCurrentAmount(dto.getCurrentAmount());
        }
        goal.setDeadline(dto.getDeadline());

        FinancialGoal saved = financialGoalRepository.save(goal);
        return mapToDto(saved);
    }

    @Override
    public void deleteGoal(Long id) {
        FinancialGoal goal = financialGoalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with id: " + id));
        User user = userService.getCurrentUserEntity();

        if (!goal.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Cannot delete other users' goals");
        }

        financialGoalRepository.delete(goal);
    }

    @Override
    public List<FinancialGoalDto> getUserGoals() {
        User user = userService.getCurrentUserEntity();
        return financialGoalRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private FinancialGoalDto mapToDto(FinancialGoal goal) {
        FinancialGoalDto dto = new FinancialGoalDto();
        dto.setId(goal.getId());
        dto.setTitle(goal.getTitle());
        dto.setTargetAmount(goal.getTargetAmount());
        dto.setCurrentAmount(goal.getCurrentAmount());
        dto.setDeadline(goal.getDeadline());

        // 1. Progress Percentage
        double progress = 0.0;
        if (goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) {
            progress = goal.getCurrentAmount()
                    .divide(goal.getTargetAmount(), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"))
                    .doubleValue();
        }
        dto.setProgressPercentage(Math.min(progress, 100.0));

        // 2. Required Monthly Savings
        long monthsRemaining = ChronoUnit.MONTHS.between(LocalDate.now(), goal.getDeadline());
        if (monthsRemaining <= 0) {
            monthsRemaining = 1; // avoid division by zero
        }
        BigDecimal remainingAmount = goal.getTargetAmount().subtract(goal.getCurrentAmount());
        if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
            dto.setRequiredMonthlySavings(BigDecimal.ZERO);
        } else {
            BigDecimal required = remainingAmount.divide(BigDecimal.valueOf(monthsRemaining), 2, RoundingMode.HALF_UP);
            dto.setRequiredMonthlySavings(required);
        }

        // 3. Estimated Completion Date
        long monthsElapsed = ChronoUnit.MONTHS.between(goal.getCreatedAt().toLocalDate(), LocalDate.now());
        if (monthsElapsed == 0) monthsElapsed = 1;
        
        if (goal.getCurrentAmount().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal velocity = goal.getCurrentAmount().divide(new BigDecimal(monthsElapsed), 2, RoundingMode.HALF_UP);
            if (velocity.compareTo(BigDecimal.ZERO) > 0 && remainingAmount.compareTo(BigDecimal.ZERO) > 0) {
                 long monthsToTarget = remainingAmount.divide(velocity, 0, RoundingMode.HALF_UP).longValue();
                 dto.setEstimatedCompletionDate(LocalDate.now().plusMonths(monthsToTarget));
            } else {
                 dto.setEstimatedCompletionDate(goal.getDeadline());
            }
        } else {
            dto.setEstimatedCompletionDate(null);
        }

        return dto;
    }
}
