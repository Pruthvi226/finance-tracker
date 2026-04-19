package com.financetracker.backend.dto;

import java.util.List;

public class AiInsightPackDto {
    private String summary;
    private List<String> anomalies;
    private List<String> budgetSuggestions;
    private List<String> savingsRecommendations;

    public AiInsightPackDto() {}

    public AiInsightPackDto(String summary, List<String> anomalies, List<String> budgetSuggestions, List<String> savingsRecommendations) {
        this.summary = summary;
        this.anomalies = anomalies;
        this.budgetSuggestions = budgetSuggestions;
        this.savingsRecommendations = savingsRecommendations;
    }

    // Getters and Setters
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public List<String> getAnomalies() { return anomalies; }
    public void setAnomalies(List<String> anomalies) { this.anomalies = anomalies; }

    public List<String> getBudgetSuggestions() { return budgetSuggestions; }
    public void setBudgetSuggestions(List<String> budgetSuggestions) { this.budgetSuggestions = budgetSuggestions; }

    public List<String> getSavingsRecommendations() { return savingsRecommendations; }
    public void setSavingsRecommendations(List<String> savingsRecommendations) { this.savingsRecommendations = savingsRecommendations; }
}
