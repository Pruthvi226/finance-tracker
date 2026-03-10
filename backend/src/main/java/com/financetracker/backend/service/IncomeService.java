package com.financetracker.backend.service;

import com.financetracker.backend.dto.IncomeDto;

import java.time.LocalDate;
import java.util.List;

public interface IncomeService {

    IncomeDto createIncome(IncomeDto dto);

    IncomeDto updateIncome(Long id, IncomeDto dto);

    void deleteIncome(Long id);

    List<IncomeDto> getAllIncome(LocalDate startDate, LocalDate endDate);
}

