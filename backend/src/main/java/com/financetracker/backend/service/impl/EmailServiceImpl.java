package com.financetracker.backend.service.impl;

import com.financetracker.backend.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);
    private final JavaMailSender mailSender;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendBillReminder(String to, String userName, String billName, String dueDate, String amount) {
        String subject = "Bill Reminder: " + billName;
        String body = String.format(
            "Hello %s,\n\nThis is a reminder that your bill '%s' for %s is due on %s.\n\nPlease ensure you have sufficient funds in your linked account.\n\nRegards,\nSmart Advisor",
            userName, billName, amount, dueDate
        );
        sendNotification(to, subject, body);
    }

    @Override
    public void sendNotification(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            message.setFrom("no-reply@smartadvisor.com");
            
            mailSender.send(message);
            log.info("[EmailService] Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("[EmailService] Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
