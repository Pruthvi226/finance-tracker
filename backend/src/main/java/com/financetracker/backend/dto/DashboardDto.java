package com.financetracker.backend.dto;

import java.math.BigDecimal;
import java.util.Map;

public class DashboardDto {

    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal remainingBalance;

    // key: yyyy-MM, value: amount
    private Map<String, BigDecimal> monthlySummary;

    public DashboardDto() {
    }

    public BigDecimal getTotalIncome() {
        return totalIncome;
    }

    public void setTotalIncome(BigDecimal totalIncome) {
        this.totalIncome = totalIncome;
    }

    public BigDecimal getTotalExpense() {
        return totalExpense;
    }

    public void setTotalExpense(BigDecimal totalExpense) {
        this.totalExpense = totalExpense;
    }

    public BigDecimal getRemainingBalance() {
        return remainingBalance;
    }

    public void setRemainingBalance(BigDecimal remainingBalance) {
        this.remainingBalance = remainingBalance;
    }

    public Map<String, BigDecimal> getMonthlySummary() {
        return monthlySummary;
    }

    public void setMonthlySummary(Map<String, BigDecimal> monthlySummary) {
        this.monthlySummary = monthlySummary;
    }
}

