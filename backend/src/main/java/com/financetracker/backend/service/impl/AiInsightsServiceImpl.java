package com.financetracker.backend.service.impl;

import com.financetracker.backend.entity.Transaction;
import com.financetracker.backend.entity.User;
import com.financetracker.backend.repository.TransactionRepository;
import com.financetracker.backend.service.AiInsightsService;
import com.financetracker.backend.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AiInsightsServiceImpl implements AiInsightsService {

    private final TransactionRepository transactionRepository;
    private final UserService userService;
    private final RestTemplate restTemplate;

    @Value("${ai.gemini.api.key:}")
    private String geminiApiKey;

    public AiInsightsServiceImpl(TransactionRepository transactionRepository, UserService userService) {
        this.transactionRepository = transactionRepository;
        this.userService = userService;
        this.restTemplate = new RestTemplate();
    }

    @Override
    public String generateFinancialInsights() {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            return "AI Insights are currently disabled. Please configure the Gemini API key.";
        }

        User user = userService.getCurrentUserEntity();
        
        // Fetch last 30 days of transactions
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(30);
        List<Transaction> recentTransactions = transactionRepository.findByUserIdAndDateBetween(user.getId(), startDate, endDate);

        if (recentTransactions.isEmpty()) {
            return "Not enough transaction data in the last 30 days to generate insights.";
        }

        double totalIncome = recentTransactions.stream()
                .filter(t -> t.getType() == com.financetracker.backend.entity.TransactionType.INCOME)
                .mapToDouble(t -> t.getAmount().doubleValue())
                .sum();

        double totalExpense = recentTransactions.stream()
                .filter(t -> t.getType() == com.financetracker.backend.entity.TransactionType.EXPENSE)
                .mapToDouble(t -> t.getAmount().doubleValue())
                .sum();

        Map<String, Double> categoryExpenses = recentTransactions.stream()
                .filter(t -> t.getType() == com.financetracker.backend.entity.TransactionType.EXPENSE && t.getCategory() != null)
                .collect(Collectors.groupingBy(
                        t -> t.getCategory().getName(),
                        Collectors.summingDouble(t -> t.getAmount().doubleValue())
                ));

        String prompt = String.format(
            "Act as an expert financial advisor. Here is my financial data for the last 30 days: " +
            "Total Income: %.2f, Total Expense: %.2f. " +
            "Category Breakdown: %s. " +
            "Provide a brief, encouraging, and actionable 3-sentence summary of my spending habits " +
            "and one specific tip to improve my savings rate.",
            totalIncome, totalExpense, categoryExpenses.toString()
        );

        return callGeminiApi(prompt);
    }

    private String callGeminiApi(String prompt) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String requestBody = "{" +
                "\"contents\": [{" +
                "\"parts\":[{\"text\": \"" + prompt.replace("\"", "\\\"") + "\"}]" +
                "}]" +
                "}";

        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            // Quick and simple parsing to extract the answer text
            String resBody = response.getBody();
            if (resBody != null && resBody.contains("\"text\":")) {
                int start = resBody.indexOf("\"text\":") + 8;
                int end = resBody.indexOf("\"", start);
                String result = resBody.substring(start, end);
                result = result.replace("\\n", "\n").replace("\\\"", "\"");
                return result;
            }
            return "Unable to parse AI response.";
        } catch (Exception e) {
            e.printStackTrace();
            return "Error calling AI service. Please try again later.";
        }
    }
}
