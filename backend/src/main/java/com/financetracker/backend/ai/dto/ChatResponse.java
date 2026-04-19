package com.financetracker.backend.ai.dto;

public class ChatResponse {
    private String reply;
    private boolean dataAvailable = true;
    private String message;

    public ChatResponse() {}

    public ChatResponse(String reply) {
        this.reply = reply;
    }

    public static ChatResponse noData(String query) {
        ChatResponse r = new ChatResponse("I need more transaction data to answer your question about: " + query);
        r.setDataAvailable(false);
        r.setMessage("Not enough data to generate insights. AI requires at least 3 transactions.");
        return r;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
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
