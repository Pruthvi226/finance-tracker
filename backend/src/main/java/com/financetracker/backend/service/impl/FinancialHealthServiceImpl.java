package com.financetracker.backend.service.impl;

import com.financetracker.backend.dto.FinancialHealthDto;
import com.financetracker.backend.entity.FinancialGoal;
import com.financetracker.backend.entity.Transaction;
import com.financetracker.backend.entity.TransactionType;
import com.financetracker.backend.entity.User;
import com.financetracker.backend.repository.FinancialGoalRepository;
import com.financetracker.backend.repository.TransactionRepository;
import com.financetracker.backend.service.BudgetService;
import com.financetracker.backend.service.FinancialHealthService;
import com.financetracker.backend.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class FinancialHealthServiceImpl implements FinancialHealthService {

    private final TransactionRepository transactionRepository;
    private final FinancialGoalRepository financialGoalRepository;
    private final BudgetService budgetService;
    private final UserService userService;
    private final RestTemplate restTemplate;

    @Value("${ai.gemini.api.key:}")
    private String geminiApiKey;

    public FinancialHealthServiceImpl(TransactionRepository transactionRepository,
                                      FinancialGoalRepository financialGoalRepository,
                                      BudgetService budgetService,
                                      UserService userService) {
        this.transactionRepository = transactionRepository;
        this.financialGoalRepository = financialGoalRepository;
        this.budgetService = budgetService;
        this.userService = userService;
        this.restTemplate = new RestTemplate();
    }

    @Override
    @Transactional(readOnly = true)
    public FinancialHealthDto calculateFinancialHealth() {
        User user = userService.getCurrentUserEntity();
        
        // 1. Savings Ratio (Trailing 30 Days)
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(30);
        List<Transaction> recentTransactions = transactionRepository.findByUserIdAndDateBetween(user.getId(), startDate, endDate);

        double totalIncome = recentTransactions.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .mapToDouble(t -> t.getAmount().doubleValue())
                .sum();

        double totalExpense = recentTransactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .mapToDouble(t -> t.getAmount().doubleValue())
                .sum();

        double savingsRate = 0;
        if (totalIncome > 0) {
            savingsRate = ((totalIncome - totalExpense) / totalIncome) * 100;
        }

        // 2. Budget Compliance
        boolean budgetExceeded = budgetService.isBudgetExceeded(user.getId());
        
        // 3. Goal Progress Avg
        List<FinancialGoal> goals = financialGoalRepository.findByUserId(user.getId());
        double avgGoalProgress = 0;
        if (!goals.isEmpty()) {
            double totalProgress = 0;
            for (FinancialGoal g : goals) {
                if (g.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) {
                    double progress = g.getCurrentAmount()
                            .divide(g.getTargetAmount(), 4, RoundingMode.HALF_UP)
                            .multiply(new BigDecimal("100"))
                            .doubleValue();
                    totalProgress += Math.min(progress, 100.0);
                }
            }
            avgGoalProgress = totalProgress / goals.size();
        }

        // Calculate Score Base: 100 max
        int baseScore = 50; // Starting baseline
        
        // Savings Modifier (-20 to +25)
        if (savingsRate > 20) baseScore += 25;
        else if (savingsRate > 10) baseScore += 15;
        else if (savingsRate > 0) baseScore += 5;
        else if (savingsRate < 0) baseScore -= 20;

        // Budget Modifier (+15 or -15)
        if (!budgetExceeded) baseScore += 15;
        else baseScore -= 15;

        // Goals Modifier (+0 to +10)
        baseScore += (int) (avgGoalProgress / 10);

        // Bound to 0-100
        int finalScore = Math.max(0, Math.min(100, baseScore));

        String breakdown = String.format(
            "Savings Rate (30d): %.1f%% | Budget Exceeded: %b | Average Goal Progress: %.1f%%",
            savingsRate, budgetExceeded, avgGoalProgress
        );

        String recommendations = "You are doing well, but try to increase your savings rate to at least 20%.";
        
        if (geminiApiKey != null && !geminiApiKey.isEmpty()) {
            String prompt = String.format(
                "Act as a financial coach. Analyze this user data:\n" +
                "Financial Health Score: %d/100\n" +
                "Savings Rate: %.1f%%\n" +
                "Budget Exceeded: %b\n" +
                "Average Goal Progress: %.1f%%\n\n" +
                "Write exactly 2 concise, supportive sentences explaining their score, and 1 specific actionable recommendation.",
                finalScore, savingsRate, budgetExceeded, avgGoalProgress
            );
            recommendations = callGeminiApi(prompt);
        }

        return new FinancialHealthDto(finalScore, breakdown, recommendations);
    }

    private String callGeminiApi(String prompt) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String requestBody = "{" +
                "\"contents\": [{" +
                "\"parts\":[{\"text\": \"" + prompt.replace("\"", "\\\"").replace("\n", " ") + "\"}]" +
                "}]" +
                "}";

        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            String resBody = response.getBody();
            if (resBody != null && resBody.contains("\"text\":")) {
                int start = resBody.indexOf("\"text\":") + 8;
                int end = resBody.indexOf("\"", start);
                String result = resBody.substring(start, end);
                result = result.replace("\\n", "\n").replace("\\\"", "\"");
                return result;
            }
            return "Unable to parse AI response. Keep saving diligently!";
        } catch (Exception e) {
            System.err.println("Gemini API Error: " + e.getMessage());
            return "Error calling AI service. Focus on keeping your budget in check.";
        }
    }
}
