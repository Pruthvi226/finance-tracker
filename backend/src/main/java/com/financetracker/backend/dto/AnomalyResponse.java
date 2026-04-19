package com.financetracker.backend.dto;

import java.util.List;

public class AnomalyResponse {
    private boolean dataAvailable;
    private List<AnomalyItem> anomalies;

    public AnomalyResponse() {}

    public static AnomalyResponse noData() {
        AnomalyResponse r = new AnomalyResponse();
        r.setDataAvailable(false);
        return r;
    }

    public boolean isDataAvailable() { return dataAvailable; }
    public void setDataAvailable(boolean dataAvailable) { this.dataAvailable = dataAvailable; }
    public List<AnomalyItem> getAnomalies() { return anomalies; }
    public void setAnomalies(List<AnomalyItem> anomalies) { this.anomalies = anomalies; }

    public static class AnomalyItem {
        private Long id;
        private String reason;
        private String severity;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }
    }
}
