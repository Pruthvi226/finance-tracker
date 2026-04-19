package com.financetracker.backend.dto;

public class AiChatMessageDto {
    private String query;
    private String response;

    public AiChatMessageDto() {}

    public AiChatMessageDto(String query, String response) {
        this.query = query;
        this.response = response;
    }

    // Getters and Setters
    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }

    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
}
