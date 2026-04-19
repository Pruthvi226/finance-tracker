package com.financetracker.backend.dto;

import java.util.List;

public class HealthScoreResponse {
    private int score;
    private String summary;
    private List<String> insights;
    private List<String> recommendations;
    private boolean dataAvailable = true;
    private String message;


    public HealthScoreResponse() {}

    /** Returns a structured "no data" response — Gemini was NOT called. */
    public static HealthScoreResponse noData() {
        HealthScoreResponse r = new HealthScoreResponse();
        r.score = 0;
        r.summary = "Insufficient transaction data.";
        r.insights = java.util.List.of("Add transactions to calculate your health score.");
        r.recommendations = java.util.List.of("Please add at least 3 transactions to unlock health scoring.");
        r.setDataAvailable(false);
        r.setMessage("Not enough data to calculate health score.");
        return r;
    }



    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<String> getInsights() {
        return insights;
    }

    public void setInsights(List<String> insights) {
        this.insights = insights;
    }

    public List<String> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }

    public boolean isDataAvailable() {
        return dataAvailable;
    }

    public void setDataAvailable(boolean dataAvailable) {
        this.dataAvailable = dataAvailable;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}

