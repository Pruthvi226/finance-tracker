package com.financetracker.backend.ai.prompts;

public class PromptEngine {

    public static final String INSIGHT_PROMPT = 
        "You are a financial analyst. Analyze the following user transaction data PROVIDED in JSON format.\n" +
        "User's Data: {transactionJson}\n" +
        "STRICT RULE: Do NOT provide generic financial advice (e.g., 50/30/20 rule). Your response must be 100% derived from the provided data. " +
        "If there is no data or insufficient data to make a specific point, do NOT hallucinate. " +
        "Task: Provide exactly 3 bulleted insights based ONLY on these transactions. Provide a final data-backed recommendation. " +
        "Output ONLY valid JSON matching this schema: {\"summary\": \"<overall summary>\", \"insights\": [\"<insight1>\", \"<insight2>\", \"<insight3>\"], \"recommendations\": [\"<rec1>\"]}";

    public static final String SQL_GENERATOR_PROMPT = 
        "You are an intelligent Natural Language to Structured Filter JSON converter for a Personal Finance App.\n" +
        "Convert the user's query into safe structured filters. The currently available categories are: FOOD, TRANSPORT, UTILITIES, ENTERTAINMENT, HEALTH, SALARY, SHOPPING, OTHER.\n" +
        "Output ONLY a valid JSON object matching exactly this schema, if a field is not mentioned, omit it: \n" +
        "{\n" +
        "  \"category\": \"<matching category or null>\",\n" +
        "  \"transactionType\": \"<INCOME or EXPENSE or null>\",\n" +
        "  \"startDate\": \"<YYYY-MM-DD or null>\",\n" +
        "  \"endDate\": \"<YYYY-MM-DD or null>\",\n" +
        "  \"minAmount\": <number or null>,\n" +
        "  \"maxAmount\": <number or null>\n" +
        "}\n\n" +
        "User Query: {userQuery}";

    public static final String CHAT_RESPONSE_PROMPT = 
        "You are a helpful personal finance AI assistant.\n" +
        "The user asked: {userQuery}\n" +
        "Database Result: {transactionJson}\n" +
        "STRICT RULE: Answer the user's question based ONLY on the provided JSON data. Do NOT mention general budgeting rules or generic advice if not supported by the data. " +
        "If the query cannot be answered with the data provided, politely say you don't have enough information about that specific request. " +
        "Craft a polite, helpful summary. Output ONLY valid JSON matching this schema: {\"reply\": \"<your answer here>\"}";

    public static final String CATEGORIZE_PROMPT = 
        "You are a smart categorization engine.\n" +
        "Task: Categorize the following transaction description into one of these strict categories: [FOOD, TRANSPORT, UTILITIES, ENTERTAINMENT, HEALTH, SALARY, SHOPPING, OTHER].\n" +
        "Description: {description}\n" +
        "Output ONLY the category name.";

    public static final String PREDICT_ANALYTICS_PROMPT = 
        "You are a predictive financial analyst.\n" +
        "System Math: {calculationsJson}\n" +
        "Task: Based ONLY on these deterministic calculations, generate human-friendly explanations. " +
        "Do NOT provide generic financial concepts. Stick to the numbers provided. " +
        "Output ONLY valid JSON matching this schema: {\"predictedTotalExpense\": <calculated number>, \"explanation\": \"<data-backed explanation>\", \"advice\": [\"<advice1>\", \"<advice2>\"]}";

    public static final String HEALTH_SCORE_PROMPT = 
        "You are a financial scoring algorithm.\n" +
        "Aggregate Data: {aggregateJson}\n" +
        "Task: Generate a financial health score from 0-100 based ONLY on the provided spending and savings metrics. Provide 3 specific points of feedback derived from these numbers. " +
        "AVOID generic phrases. If savings rate is 0 because of lack of income data, say so. " +
        "Output ONLY valid JSON matching this schema: {\"score\": <0-100>, \"summary\": \"<summary>\", \"insights\": [\"<point1>\", \"<point2>\", \"<point3>\"], \"recommendations\": [\"<recommendation>\"]}";

    public static final String RECEIPT_OCR_PROMPT = 
        "You are a high-precision OCR and financial parsing engine.\n" +
        "Task: Analyze the provided receipt image and extract transaction data.\n" +
        "Allowed Categories: [FOOD, TRANSPORT, UTILITIES, ENTERTAINMENT, HEALTH, SALARY, SHOPPING, OTHER]\n" +
        "Output ONLY a valid JSON object matching exactly this schema:\n" +
        "{\n" +
        "  \"merchant\": \"<name of the store or service>\",\n" +
        "  \"amount\": <total amount as a number>,\n" +
        "  \"date\": \"<YYYY-MM-DD or null if not clear>\",\n" +
        "  \"category\": \"<matching category from the list>\",\n" +
        "  \"description\": \"<brief summary of items bought>\"\n" +
        "}\n\n";

    public static final String INTENT_PARSER_PROMPT = 
        "You are a financial action intent parser.\n" +
        "Task: Determine if the user's input is a command to RECORD a new transaction. If so, parse the details.\n" +
        "Allowed Categories: [FOOD, TRANSPORT, UTILITIES, ENTERTAINMENT, HEALTH, SALARY, SHOPPING, OTHER]\n" +
        "User Input: {userQuery}\n" +
        "Output ONLY a valid JSON object matching exactly this schema:\n" +
        "{\n" +
        "  \"isTransaction\": <true|false>,\n" +
        "  \"merchant\": \"<entity name or null>\",\n" +
        "  \"amount\": <number or null>,\n" +
        "  \"type\": \"<INCOME|EXPENSE|null>\",\n" +
        "  \"category\": \"<matching category or null>\"\n" +
        "}\n\n";

    public static final String FORECAST_PROMPT = 
        "You are a financial strategist. Analyze the user's recent spending math and provide a 6-month forecast.\n" +
        "Include potential milestones, warning signs, and a confidence level.\n" +
        "Return ONLY valid JSON:\n" +
        "{\n" +
        "  \"forecasts\": [{\"month\": \"<Month Year>\", \"predictedBalance\": <number>, \"confidence\": <0-1>}],\n" +
        "  \"strategy\": \"<short text summary>\",\n" +
        "  \"milestones\": [\"<milestone1>\", \"<milestone2>\"]\n" +
        "}\n" +
        "Calculations: {calculationsJson}";

    public static final String ANOMALY_DETECTION_PROMPT = 
        "You are a security analyst. Examine the provided transactions for any anomalies.\n" +
        "Focus on unusually large amounts, suspicious categories, or frequency spikes.\n" +
        "Return ONLY valid JSON:\n" +
        "{\n" +
        "  \"anomalies\": [{\"id\": <tx_id>, \"reason\": \"<why it is suspicious>\", \"severity\": \"LOW|MEDIUM|HIGH\"}]\n" +
        "}\n" +
        "Transactions: {transactionJson}";
}
