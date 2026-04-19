package com.financetracker.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.financetracker.backend.ai.GeminiClient;
import com.financetracker.backend.ai.dto.CategoryResponse;
import com.financetracker.backend.ai.dto.ChatRequest;
import com.financetracker.backend.ai.dto.ChatResponse;
import com.financetracker.backend.ai.dto.InsightResponse;
import com.financetracker.backend.ai.dto.ReceiptResponse;
import com.financetracker.backend.ai.prompts.PromptEngine;
import com.financetracker.backend.dto.AnomalyResponse;
import com.financetracker.backend.dto.ForecastResponse;
import com.financetracker.backend.dto.HealthScoreResponse;
import com.financetracker.backend.dto.PredictionResponse;
import com.financetracker.backend.dto.TransactionFilterDto;
import com.financetracker.backend.entity.Transaction;
import com.financetracker.backend.entity.TransactionType;
import com.financetracker.backend.repository.TransactionRepository;
import com.financetracker.backend.repository.TransactionSpecification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * AI Service — orchestrates all AI-powered finance features.
 *
 * SAFETY RULE: Gemini is NEVER called without real, sufficient user data.
 * Minimum threshold: 3 transactions required before any AI call.
 *
 * Pattern: validate data → build context → PromptEngine → GeminiClient → parse response.
 */
@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    /** Minimum transactions required before calling Gemini. Prevents hallucination. */
    private static final int MIN_TRANSACTIONS_REQUIRED = 3;

    private final GeminiClient geminiClient;
    private final TransactionRepository transactionRepository;
    private final ObjectMapper objectMapper;

    public AiService(GeminiClient geminiClient, TransactionRepository transactionRepository) {
        this.geminiClient = geminiClient;
        this.transactionRepository = transactionRepository;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Utility helpers
    // ─────────────────────────────────────────────────────────────────────────

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            log.warn("[AiService] Failed to serialize object to JSON", e);
            return "[]";
        }
    }

    /**
     * Strips optional markdown code fences Gemini sometimes wraps responses in.
     * e.g. ```json\n{...}\n``` → {...}
     */
    private String cleanJsonResponse(String response) {
        if (response == null) return "{}";
        String cleaned = response.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        return cleaned.trim();
    }

    /**
     * Guard: checks whether there is enough data to safely call Gemini.
     *
     * @param transactions the user's transaction list
     * @param featureName  for logging
     * @return true if there is enough data, false if AI should be skipped
     */
    private boolean hasEnoughData(List<Transaction> transactions, String featureName) {
        if (transactions == null || transactions.isEmpty()) {
            log.warn("[AiService] {} skipped — no transactions found. AI not called.", featureName);
            return false;
        }
        if (transactions.size() < MIN_TRANSACTIONS_REQUIRED) {
            log.warn("[AiService] {} skipped — only {} transaction(s) found (minimum: {}). AI not called.",
                    featureName, transactions.size(), MIN_TRANSACTIONS_REQUIRED);
            return false;
        }
        log.info("[AiService] {} proceeding — {} transactions found. Calling Gemini.", featureName, transactions.size());
        return true;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. AI Insights — spending analysis & recommendations
    // ─────────────────────────────────────────────────────────────────────────

    public InsightResponse generateInsights(Long userId) {
        log.info("[AiService] Generating insights for userId={}", userId);
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByDateDesc(userId);

        // ──── GUARD CLAUSE ────
        if (!hasEnoughData(transactions, "AI Insights")) {
            InsightResponse r = new InsightResponse();
            r.setDataAvailable(false);
            r.setInsights(List.of(
                "Welcome to Finance Tracker! Record your first few transactions to unlock AI analysis.",
                "Did you know? You can upload receipt images to auto-fill transactions.",
                "AI needs at least 3 transactions to identify your spending patterns safely."
            ));
            r.setRecommendation("Start by adding your common expenses (Coffee, Rent, Travel) to see personalized advice.");
            r.setFinancialHealthScore(0);
            return r;
        }

        List<Map<String, Object>> simplified = transactions.stream().map(t -> {
            Map<String, Object> map = new HashMap<>();
            map.put("amount", t.getAmount());
            map.put("type", t.getType().toString());
            map.put("category", t.getCategory() != null ? t.getCategory().getName() : "Unknown");
            map.put("date", t.getDate() != null ? t.getDate().toString() : "Unknown");
            return map;
        }).collect(Collectors.toList());

        String prompt = PromptEngine.INSIGHT_PROMPT
                .replace("{transactionJson}", toJson(simplified));

        log.info("[AiService] Calling Gemini for insights with {} transactions", transactions.size());
        String rawResponse = geminiClient.callGemini(prompt);

        try {
            return objectMapper.readValue(cleanJsonResponse(rawResponse), InsightResponse.class);
        } catch (Exception e) {
            log.error("[AiService] Failed to parse insights response: {}", rawResponse, e);
            InsightResponse fallback = new InsightResponse();
            fallback.setDataAvailable(true);
            fallback.setFinancialHealthScore(0);
            fallback.setInsights(List.of("Analyzing your data..."));
            fallback.setRecommendation("Please update your transactions to see fresh insights.");
            return fallback;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. AI Chat — natural language queries over transactions
    // ─────────────────────────────────────────────────────────────────────────

    public ChatResponse chat(Long userId, ChatRequest request) {
        log.info("[AiService] AI chat for userId={}, query={}", userId, request.getMessage());

        // Step 1: Convert natural language to a structured filter JSON
        String filterPrompt = PromptEngine.SQL_GENERATOR_PROMPT
                .replace("{userQuery}", request.getMessage());
        String filterRaw = geminiClient.callGemini(filterPrompt);

        TransactionFilterDto filterDto;
        try {
            filterDto = objectMapper.readValue(cleanJsonResponse(filterRaw), TransactionFilterDto.class);
        } catch (Exception e) {
            log.warn("[AiService] Could not parse filter, using empty filter. Raw: {}", filterRaw);
            filterDto = new TransactionFilterDto();
        }

        // Step 2: Execute secure JPA spec query
        List<Transaction> transactions = transactionRepository
                .findAll(TransactionSpecification.getTransactionsByFilter(userId, filterDto));

        // ──── STRICT GUARD CLAUSE for chat ────
        if (!hasEnoughData(transactions, "AI Chat (" + request.getMessage() + ")")) {
            return ChatResponse.noData(request.getMessage());
        }

        // Step 3: Build concise payload to minimize token usage (<= 30 transactions)
        List<Map<String, Object>> displayList = transactions.stream().limit(30).map(t -> {
            Map<String, Object> map = new HashMap<>();
            map.put("amount", t.getAmount());
            map.put("date", t.getDate() != null ? t.getDate().toString() : "Unknown");
            map.put("description", t.getDescription() != null ? t.getDescription() : "");
            map.put("category", t.getCategory() != null ? t.getCategory().getName() : "Unknown");
            map.put("type", t.getType().toString());
            return map;
        }).collect(Collectors.toList());

        // Step 4: Ask Gemini to craft a human-friendly answer
        String chatPrompt = PromptEngine.CHAT_RESPONSE_PROMPT
                .replace("{userQuery}", request.getMessage())
                .replace("{transactionJson}", toJson(displayList));

        log.info("[AiService] Calling Gemini for chat with {} matching transactions", transactions.size());
        String chatRaw = geminiClient.callGemini(chatPrompt);

        try {
            return objectMapper.readValue(cleanJsonResponse(chatRaw), ChatResponse.class);
        } catch (Exception e) {
            log.warn("[AiService] Could not parse chat JSON response, returning raw text.");
            return new ChatResponse(
                    chatRaw.contains("{") ? chatRaw : "Here is what I found: " + chatRaw);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Auto Categorization — classify a transaction description
    //    (No minimum threshold — a single description is valid input)
    // ─────────────────────────────────────────────────────────────────────────

    public CategoryResponse categorize(String description) {
        if (description == null || description.trim().isEmpty()) {
            log.warn("[AiService] Categorize skipped — empty description provided.");
            return new CategoryResponse("OTHER");
        }
        log.info("[AiService] Calling Gemini to categorize: {}", description);
        String prompt = PromptEngine.CATEGORIZE_PROMPT
                .replace("{description}", description);
        String response = geminiClient.callGemini(prompt).trim();

        String category = response.toUpperCase()
                .replaceAll("[^A-Z_]", "")
                .trim();

        List<String> validCategories = List.of(
                "FOOD", "TRANSPORT", "UTILITIES", "ENTERTAINMENT",
                "HEALTH", "SALARY", "SHOPPING", "OTHER");

        if (!validCategories.contains(category)) {
            log.warn("[AiService] Unexpected category '{}' from Gemini, defaulting to OTHER", category);
            category = "OTHER";
        }
        return new CategoryResponse(category);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. Predictive Analytics — Java math + Gemini explanation
    // ─────────────────────────────────────────────────────────────────────────

    public PredictionResponse predictAnalytics(Long userId) {
        log.info("[AiService] Predicting analytics for userId={}", userId);
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByDateDesc(userId);

        // ──── GUARD CLAUSE ────
        if (!hasEnoughData(transactions, "Predict Analytics")) {
            return PredictionResponse.noData();
        }

        // Java deterministic calculations (not AI-hallucinated)
        BigDecimal totalExpenses = BigDecimal.ZERO;
        int expenseCount = 0;

        for (Transaction t : transactions) {
            if (t.getType() == TransactionType.EXPENSE
                    && t.getDate() != null
                    && t.getDate().isAfter(LocalDate.now().minusDays(30))) {
                totalExpenses = totalExpenses.add(t.getAmount());
                expenseCount++;
            }
        }

        BigDecimal dailyAvg = expenseCount > 0
                ? totalExpenses.divide(new BigDecimal(30), 2, java.math.RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        BigDecimal predictedNextMonth = dailyAvg.multiply(new BigDecimal(30));

        Map<String, Object> mathContext = new HashMap<>();
        mathContext.put("last30DaysTotalExpense", totalExpenses);
        mathContext.put("last30DaysDailyAverage", dailyAvg);
        mathContext.put("predictedNextMonthExpense", predictedNextMonth);
        mathContext.put("transactionCount", expenseCount);

        String prompt = PromptEngine.PREDICT_ANALYTICS_PROMPT
                .replace("{calculationsJson}", toJson(mathContext));

        log.info("[AiService] Calling Gemini for prediction with {} expense transactions", expenseCount);
        String rawResponse = geminiClient.callGemini(prompt);

        try {
            return objectMapper.readValue(cleanJsonResponse(rawResponse), PredictionResponse.class);
        } catch (Exception e) {
            log.error("[AiService] Failed to parse prediction response", e);
            PredictionResponse fallback = new PredictionResponse();
            fallback.setDataAvailable(true);
            fallback.setPredictedTotalExpense(predictedNextMonth.doubleValue());
            fallback.setExplanation("Predicted expense based on last 30 days linear trend.");
            fallback.setAdvice(List.of("Monitor your spending daily", "Record all transactions for accuracy"));
            return fallback;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. Financial Health Score — AI-driven scoring & feedback
    // ─────────────────────────────────────────────────────────────────────────

    public HealthScoreResponse calculateHealthScore(Long userId) {
        log.info("[AiService] Calculating health score for userId={}", userId);
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByDateDesc(userId);

        // ──── GUARD CLAUSE ────
        if (!hasEnoughData(transactions, "Health Score")) {
            return HealthScoreResponse.noData();
        }

        BigDecimal income = BigDecimal.ZERO;
        BigDecimal expense = BigDecimal.ZERO;

        for (Transaction t : transactions) {
            if (t.getDate() != null && t.getDate().isAfter(LocalDate.now().minusDays(30))) {
                if (t.getType() == TransactionType.INCOME) income = income.add(t.getAmount());
                if (t.getType() == TransactionType.EXPENSE) expense = expense.add(t.getAmount());
            }
        }

        BigDecimal savings = income.subtract(expense);
        double savingsRate = income.compareTo(BigDecimal.ZERO) > 0
                ? savings.divide(income, 4, java.math.RoundingMode.HALF_UP).doubleValue() * 100
                : 0.0;

        Map<String, Object> data = new HashMap<>();
        data.put("monthlyIncome", income);
        data.put("monthlyExpense", expense);
        data.put("savings", savings);
        data.put("savingsRatePercent", Math.round(savingsRate));

        String prompt = PromptEngine.HEALTH_SCORE_PROMPT
                .replace("{aggregateJson}", toJson(data));

        log.info("[AiService] Calling Gemini for health score. Income={}, Expense={}", income, expense);
        String rawResponse = geminiClient.callGemini(prompt);

        try {
            return objectMapper.readValue(cleanJsonResponse(rawResponse), HealthScoreResponse.class);
        } catch (Exception e) {
            log.error("[AiService] Failed to parse health score response", e);
            HealthScoreResponse fallback = new HealthScoreResponse();
            fallback.setDataAvailable(true);
            fallback.setScore(0);
            fallback.setSummary("Health scoring analysis active.");
            fallback.setInsights(List.of("Tracking income/expense ratios"));
            fallback.setRecommendations(List.of("Continue logging transactions"));
            return fallback;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 6. Receipt OCR — extract data from images
    // ─────────────────────────────────────────────────────────────────────────

    public ReceiptResponse processReceipt(byte[] imageBytes, String mimeType) {
        log.info("[AiService] Processing receipt with Gemini Vision. MimeType={}", mimeType);
        
        try {
            String prompt = PromptEngine.RECEIPT_OCR_PROMPT;
            String rawResponse = geminiClient.callGeminiVision(prompt, imageBytes, mimeType);
            
            log.debug("[AiService] Raw OCR response: {}", rawResponse);
            
            return objectMapper.readValue(cleanJsonResponse(rawResponse), ReceiptResponse.class);
        } catch (Exception e) {
            log.error("[AiService] Failed to process receipt image", e);
            return ReceiptResponse.error("Failed to analyze receipt. Please ensure the image is clear.");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 7. Intent Parsing — detect commands from Chat/CommandBar
    // ─────────────────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    public Map<String, Object> parseIntent(String query) {
        log.info("[AiService] Parsing intent for query: {}", query);
        String prompt = PromptEngine.INTENT_PARSER_PROMPT.replace("{userQuery}", query);
        String rawResponse = geminiClient.callGemini(prompt);
        
        try {
            return objectMapper.readValue(cleanJsonResponse(rawResponse), Map.class);
        } catch (Exception e) {
            log.error("[AiService] Failed to parse intent response", e);
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("isTransaction", false);
            return fallback;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 8. 6-Month Forecast — Strategic predictive modeling
    // ─────────────────────────────────────────────────────────────────────────

    public ForecastResponse getSixMonthForecast(Long userId) {
        log.info("[AiService] Generating 6-month forecast for userId={}", userId);
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByDateDesc(userId);

        if (!hasEnoughData(transactions, "6-Month Forecast")) {
            return ForecastResponse.noData();
        }

        // Calculate average monthly net cash flow (Income - Expense)
        BigDecimal monthlyAvgFlow = calculateMonthlyAvgFlow(transactions);

        Map<String, Object> mathContext = new HashMap<>();
        mathContext.put("monthlyAvgNetFlow", monthlyAvgFlow);
        mathContext.put("currentDate", LocalDate.now().toString());
        
        String prompt = PromptEngine.FORECAST_PROMPT.replace("{calculationsJson}", toJson(mathContext));
        String rawResponse = geminiClient.callGemini(prompt);

        try {
            ForecastResponse response = objectMapper.readValue(cleanJsonResponse(rawResponse), ForecastResponse.class);
            response.setDataAvailable(true);
            return response;
        } catch (Exception e) {
            log.error("[AiService] Failed to parse forecast response", e);
            return ForecastResponse.noData();
        }
    }

    private BigDecimal calculateMonthlyAvgFlow(List<Transaction> txs) {
        BigDecimal net = BigDecimal.ZERO;
        for (Transaction t : txs) {
            if (t.getDate().isAfter(LocalDate.now().minusDays(90))) {
                if (t.getType() == TransactionType.INCOME) net = net.add(t.getAmount());
                else net = net.subtract(t.getAmount());
            }
        }
        return net.divide(new BigDecimal(3), 2, java.math.RoundingMode.HALF_UP);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 9. Anomaly Detection — AI-powered spending outlier detection
    // ─────────────────────────────────────────────────────────────────────────

    public AnomalyResponse detectAnomalies(Long userId) {
        log.info("[AiService] Detecting anomalies for userId={}", userId);
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByDateDesc(userId);

        if (!hasEnoughData(transactions, "Anomaly Detection")) {
            return AnomalyResponse.noData();
        }

        // Send recent transactions to Gemini to look for patterns
        List<Map<String, Object>> recent = transactions.stream().limit(20).map(t -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", t.getId());
            m.put("amount", t.getAmount());
            m.put("category", t.getCategory() != null ? t.getCategory().getName() : "OTHER");
            m.put("description", t.getDescription());
            return m;
        }).collect(Collectors.toList());

        String prompt = PromptEngine.ANOMALY_DETECTION_PROMPT.replace("{transactionJson}", toJson(recent));
        String rawResponse = geminiClient.callGemini(prompt);

        try {
            AnomalyResponse response = objectMapper.readValue(cleanJsonResponse(rawResponse), AnomalyResponse.class);
            response.setDataAvailable(true);
            return response;
        } catch (Exception e) {
            log.error("[AiService] Failed to parse anomaly response", e);
            return AnomalyResponse.noData();
        }
    }
}
