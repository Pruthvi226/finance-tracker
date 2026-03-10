package com.financetracker.backend.service.impl;

import com.financetracker.backend.dto.IncomeDto;
import com.financetracker.backend.entity.Income;
import com.financetracker.backend.entity.User;
import com.financetracker.backend.exception.ResourceNotFoundException;
import com.financetracker.backend.repository.IncomeRepository;
import com.financetracker.backend.service.IncomeService;
import com.financetracker.backend.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class IncomeServiceImpl implements IncomeService {

    private final IncomeRepository incomeRepository;
    private final UserService userService;

    public IncomeServiceImpl(IncomeRepository incomeRepository, UserService userService) {
        this.incomeRepository = incomeRepository;
        this.userService = userService;
    }

    @Override
    @Transactional
    public IncomeDto createIncome(IncomeDto dto) {
        User user = userService.getCurrentUserEntity();
        Income income = new Income();
        income.setUser(user);
        income.setAmount(dto.getAmount());
        income.setSource(dto.getSource());
        income.setDate(dto.getDate());
        income.setDescription(dto.getDescription());
        Income saved = incomeRepository.save(income);
        return toDto(saved);
    }

    @Override
    @Transactional
    public IncomeDto updateIncome(Long id, IncomeDto dto) {
        User user = userService.getCurrentUserEntity();
        Income income = incomeRepository.findById(id)
                .filter(i -> i.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Income not found"));

        income.setAmount(dto.getAmount());
        income.setSource(dto.getSource());
        income.setDate(dto.getDate());
        income.setDescription(dto.getDescription());
        return toDto(incomeRepository.save(income));
    }

    @Override
    @Transactional
    public void deleteIncome(Long id) {
        User user = userService.getCurrentUserEntity();
        Income income = incomeRepository.findById(id)
                .filter(i -> i.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Income not found"));
        incomeRepository.delete(income);
    }

    @Override
    public List<IncomeDto> getAllIncome(LocalDate startDate, LocalDate endDate) {
        User user = userService.getCurrentUserEntity();
        List<Income> incomes;
        if (startDate != null && endDate != null) {
            incomes = incomeRepository.findByUserAndDateBetween(user, startDate, endDate);
        } else {
            incomes = incomeRepository.findByUser(user);
        }
        return incomes.stream().map(this::toDto).collect(Collectors.toList());
    }

    private IncomeDto toDto(Income income) {
        IncomeDto dto = new IncomeDto();
        dto.setId(income.getId());
        dto.setAmount(income.getAmount());
        dto.setSource(income.getSource());
        dto.setDate(income.getDate());
        dto.setDescription(income.getDescription());
        return dto;
    }
}

