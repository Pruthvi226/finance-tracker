package com.financetracker.backend.dto;

import java.util.List;

public class PredictionResponse {
    private double predictedTotalExpense;
    private String explanation;
    private List<String> advice;
    private boolean dataAvailable = true;
    private String message;


    public PredictionResponse() {}

    /** Returns a structured "no data" response — Gemini was NOT called. */
    public static PredictionResponse noData() {
        PredictionResponse r = new PredictionResponse();
        r.predictedTotalExpense = 0.0;
        r.explanation = "No financial data available to generate predictions.";
        r.advice = java.util.List.of("Add transactions to unlock AI predictions");
        r.setDataAvailable(false);
        r.setMessage("Not enough data. Please add at least 3 transactions.");
        return r;
    }



    public double getPredictedTotalExpense() {
        return predictedTotalExpense;
    }

    public void setPredictedTotalExpense(double predictedTotalExpense) {
        this.predictedTotalExpense = predictedTotalExpense;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public List<String> getAdvice() {
        return advice;
    }

    public void setAdvice(List<String> advice) {
        this.advice = advice;
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

