package com.financetracker.backend.ai.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * Configuration for Gemini AI REST client.
 * Uses a dedicated RestTemplate with configured timeouts to avoid
 * blocking the main application thread on AI calls.
 */
@Configuration
public class AiConfig {

    @Value("${gemini.timeout.connect:10}")
    private int connectTimeoutSeconds;

    @Value("${gemini.timeout.read:30}")
    private int readTimeoutSeconds;

    /**
     * Provides a RestTemplate bean named "geminiRestTemplate" with
     * generous timeouts suitable for LLM inference latency.
     */
    @Bean("geminiRestTemplate")
    public RestTemplate geminiRestTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(connectTimeoutSeconds))
                .setReadTimeout(Duration.ofSeconds(readTimeoutSeconds))
                .build();
    }
}
