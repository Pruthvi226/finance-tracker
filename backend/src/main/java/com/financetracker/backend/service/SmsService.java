package com.financetracker.backend.service;

public interface SmsService {
    void sendSms(String phoneNumber, String message);
    void sendBillReminder(String phoneNumber, String billName, String dueDate, String amount);
}
