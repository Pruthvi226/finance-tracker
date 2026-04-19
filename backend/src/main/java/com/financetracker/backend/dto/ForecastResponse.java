package com.financetracker.backend.dto;

import java.util.List;

public class ForecastResponse {
    private boolean dataAvailable;
    private List<MonthForecast> forecasts;
    private String strategy;
    private List<String> milestones;

    public ForecastResponse() {}

    public static ForecastResponse noData() {
        ForecastResponse r = new ForecastResponse();
        r.setDataAvailable(false);
        return r;
    }

    public boolean isDataAvailable() { return dataAvailable; }
    public void setDataAvailable(boolean dataAvailable) { this.dataAvailable = dataAvailable; }
    public List<MonthForecast> getForecasts() { return forecasts; }
    public void setForecasts(List<MonthForecast> forecasts) { this.forecasts = forecasts; }
    public String getStrategy() { return strategy; }
    public void setStrategy(String strategy) { this.strategy = strategy; }
    public List<String> getMilestones() { return milestones; }
    public void setMilestones(List<String> milestones) { this.milestones = milestones; }

    public static class MonthForecast {
        private String month;
        private double predictedBalance;
        private double confidence;

        public String getMonth() { return month; }
        public void setMonth(String month) { this.month = month; }
        public double getPredictedBalance() { return predictedBalance; }
        public void setPredictedBalance(double predictedBalance) { this.predictedBalance = predictedBalance; }
        public double getConfidence() { return confidence; }
        public void setConfidence(double confidence) { this.confidence = confidence; }
    }
}
