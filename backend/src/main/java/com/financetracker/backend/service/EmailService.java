package com.financetracker.backend.service;

public interface EmailService {
    void sendBillReminder(String to, String userName, String billName, String dueDate, String amount);
    void sendNotification(String to, String subject, String body);
}
