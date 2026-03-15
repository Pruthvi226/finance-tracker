package com.financetracker.backend.dto;

public class FinancialHealthDto {
    private int score;
    private String scoreBreakdown;
    private String recommendations;

    public FinancialHealthDto() {}

    public FinancialHealthDto(int score, String scoreBreakdown, String recommendations) {
        this.score = score;
        this.scoreBreakdown = scoreBreakdown;
        this.recommendations = recommendations;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public String getScoreBreakdown() {
        return scoreBreakdown;
    }

    public void setScoreBreakdown(String scoreBreakdown) {
        this.scoreBreakdown = scoreBreakdown;
    }

    public String getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(String recommendations) {
        this.recommendations = recommendations;
    }
}
