package com.financetracker.backend.service.impl;

import com.financetracker.backend.service.SmsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class SmsServiceImpl implements SmsService {

    private static final Logger log = LoggerFactory.getLogger(SmsServiceImpl.class);

    @Override
    public void sendSms(String phoneNumber, String message) {
        log.info("[SmsService] Sending SMS to {}: {}", phoneNumber, message);
        // In a real production environment, integrate with Twilio, AWS SNS, etc.
        System.out.println(">>> [SMS SENT] To: " + phoneNumber + " | Msg: " + message);
    }

    @Override
    public void sendBillReminder(String phoneNumber, String billName, String dueDate, String amount) {
        String message = String.format("Reminder: Your bill '%s' for %s is due on %s. - Smart Advisor", 
            billName, amount, dueDate);
        sendSms(phoneNumber, message);
    }
}
