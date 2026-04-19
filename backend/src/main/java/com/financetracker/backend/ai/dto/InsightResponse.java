package com.financetracker.backend.ai.dto;

import java.util.List;

public class InsightResponse {
    private int financialHealthScore;
    private List<String> insights;
    private String recommendation;
    private boolean dataAvailable = true;
    private String message;


    public InsightResponse() {}

    /** Returns a structured "no data" response — Gemini was NOT called. */
    public static InsightResponse noData() {
        InsightResponse r = new InsightResponse(
                0,
                java.util.List.of(),
                "No financial data available."
        );
        r.setDataAvailable(false);
        r.setMessage("Not enough data to generate insights. Please add at least 3 transactions.");
        return r;
    }



    public InsightResponse(int financialHealthScore, List<String> insights, String recommendation) {
        this.financialHealthScore = financialHealthScore;
        this.insights = insights;
        this.recommendation = recommendation;
    }

    public int getFinancialHealthScore() {
        return financialHealthScore;
    }

    public void setFinancialHealthScore(int financialHealthScore) {
        this.financialHealthScore = financialHealthScore;
    }

    public List<String> getInsights() {
        return insights;
    }

    public void setInsights(List<String> insights) {
        this.insights = insights;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
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

