package com.financetracker.backend.dto;

import java.math.BigDecimal;
import java.util.Map;

public class AnalyticsDto {

    // Category -> total spent
    private Map<String, BigDecimal> categorySpending;

    // yyyy-MM -> expense amount
    private Map<String, BigDecimal> monthlyExpenses;

    // yyyy-MM -> income amount
    private Map<String, BigDecimal> monthlyIncome;

    public AnalyticsDto() {
    }

    public Map<String, BigDecimal> getCategorySpending() {
        return categorySpending;
    }

    public void setCategorySpending(Map<String, BigDecimal> categorySpending) {
        this.categorySpending = categorySpending;
    }

    public Map<String, BigDecimal> getMonthlyExpenses() {
        return monthlyExpenses;
    }

    public void setMonthlyExpenses(Map<String, BigDecimal> monthlyExpenses) {
        this.monthlyExpenses = monthlyExpenses;
    }

    public Map<String, BigDecimal> getMonthlyIncome() {
        return monthlyIncome;
    }

    public void setMonthlyIncome(Map<String, BigDecimal> monthlyIncome) {
        this.monthlyIncome = monthlyIncome;
    }
}

