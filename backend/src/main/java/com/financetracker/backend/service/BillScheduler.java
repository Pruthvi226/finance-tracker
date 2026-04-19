package com.financetracker.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class BillScheduler {

    private static final Logger log = LoggerFactory.getLogger(BillScheduler.class);
    private final BillService billService;

    public BillScheduler(BillService billService) {
        this.billService = billService;
    }

    // Runs every day at midnight
    @Scheduled(cron = "0 0 0 * * ?")
    public void runBillAutomation() {
        log.info("[BillScheduler] Starting daily bill automation...");
        try {
            billService.processDueBills();
            log.info("[BillScheduler] Bill automation completed successfully");
        } catch (Exception e) {
            log.error("[BillScheduler] Bill automation failed: {}", e.getMessage());
        }
    }
}
