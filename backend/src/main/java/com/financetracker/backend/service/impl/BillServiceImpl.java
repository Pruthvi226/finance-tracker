package com.financetracker.backend.service.impl;

import com.financetracker.backend.entity.Bill;
import com.financetracker.backend.entity.BillHistory;
import com.financetracker.backend.entity.Frequency;
import com.financetracker.backend.entity.Transaction;
import com.financetracker.backend.entity.UserSettings;
import com.financetracker.backend.exception.ResourceNotFoundException;
import com.financetracker.backend.repository.BillHistoryRepository;
import com.financetracker.backend.repository.BillRepository;
import com.financetracker.backend.repository.TransactionRepository;
import com.financetracker.backend.service.BillService;
import com.financetracker.backend.service.EmailService;
import com.financetracker.backend.service.SmsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;


@Service
public class BillServiceImpl implements BillService {

    private static final Logger log = LoggerFactory.getLogger(BillServiceImpl.class);

    private final BillRepository billRepository;
    private final BillHistoryRepository billHistoryRepository;
    private final TransactionRepository transactionRepository;
    private final EmailService emailService;
    private final SmsService smsService;

    public BillServiceImpl(BillRepository billRepository,
                           BillHistoryRepository billHistoryRepository,
                           TransactionRepository transactionRepository,
                           EmailService emailService,
                           SmsService smsService) {
        this.billRepository = billRepository;
        this.billHistoryRepository = billHistoryRepository;
        this.transactionRepository = transactionRepository;
        this.emailService = emailService;
        this.smsService = smsService;
    }

    @Override
    public Bill createBill(Bill bill) {
        return billRepository.save(bill);
    }

    @Override
    public Bill updateBill(Long id, Bill bill) {
        Bill existing = billRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));
        
        existing.setName(bill.getName());
        existing.setAmount(bill.getAmount());
        existing.setDueDate(bill.getDueDate());
        existing.setCategory(bill.getCategory());
        existing.setRecurrence(bill.getRecurrence());
        existing.setStatus(bill.getStatus());
        
        return billRepository.save(existing);
    }

    @Override
    public void deleteBill(Long id) {
        billRepository.deleteById(id);
    }

    @Override
    public List<Bill> getBillsByUserId(Long userId) {
        return billRepository.findByUserId(userId);
    }

    @Override
    @Transactional
    public Bill markAsPaid(Long billId) {
        Bill bill = billRepository.findById(billId)
            .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));

        if (bill.getStatus() == Bill.BillStatus.PAID) {
            return bill;
        }

        // 1. Update Bill Status
        bill.setStatus(Bill.BillStatus.PAID);
        Bill savedBill = billRepository.save(bill);

        // 2. Create Transaction record
        Transaction tx = new Transaction();
        tx.setUser(bill.getUser());
        tx.setAmount(bill.getAmount());
        tx.setDate(LocalDate.now());
        tx.setDescription("Bill Payment: " + bill.getName());
        tx.setType(com.financetracker.backend.entity.TransactionType.EXPENSE);
        Transaction savedTx = transactionRepository.save(tx);

        // 3. Keep History (Requested)
        BillHistory history = BillHistory.builder()
            .bill(bill)
            .user(bill.getUser())
            .amountPaid(bill.getAmount())
            .paymentDate(LocalDateTime.now())
            .transactionId(savedTx.getId())
            .build();
        billHistoryRepository.save(history);

        log.info("[BillService] Bill {} marked as PAID. History logged.", billId);
        return savedBill;
    }

    @Override
    @Transactional
    public void processDueBills() {
        LocalDate today = LocalDate.now();
        
        // 1. Mark Overdue
        List<Bill> overdueBills = billRepository.findByDueDateLessThanAndStatus(today, Bill.BillStatus.UNPAID);
        for (Bill b : overdueBills) {
            b.setStatus(Bill.BillStatus.OVERDUE);
            billRepository.save(b);
            log.warn("[BillService] Bill {} is now OVERDUE", b.getName());
        }

        // 2. Reset Recurring Bills (Logic: Find PAID bills with recurrence and calculate next due date)
        // This is a simplified logic – in production, you might want a specialized query.
        billRepository.findAll().stream()
            .filter(b -> b.getStatus() == Bill.BillStatus.PAID)
            .forEach(b -> {
                b.setDueDate(calculateNextDueDate(b.getDueDate(), b.getRecurrence()));
                b.setStatus(Bill.BillStatus.UNPAID);
                billRepository.save(b);
                log.info("[BillService] Bill {} reset for next cycle: {}", b.getName(), b.getDueDate());
            });

        // 3. Reminders (48 hours before)
        LocalDate reminderDate = today.plusDays(2);
        List<Bill> upcoming = billRepository.findByDueDateBetweenAndStatusNot(
            today, reminderDate, Bill.BillStatus.PAID);
        
        for (Bill b : upcoming) {
            String email = b.getUser().getEmail();
            String name = b.getUser().getName();
            String amount = b.getAmount().toString();
            String due = b.getDueDate().toString();
            
            // Notification Logic based on User Settings
            UserSettings settings = b.getUser().getSettings();
            
            if (settings == null || settings.isEmailAlertsEnabled()) {
                emailService.sendBillReminder(email, name, b.getName(), due, amount);
                log.info("[BillScheduler] Sent Email reminder for bill: {}", b.getName());
            }

            if (settings != null && settings.isSmsAlertsEnabled()) {
                // SMS implementation - assuming user has a phone number field (placeholder for now if not present)
                // For now, we'll log it as per the mock SmsService implementation
                smsService.sendBillReminder("USER-PHONE", b.getName(), due, amount);
                log.info("[BillScheduler] Sent SMS reminder for bill: {}", b.getName());
            }
        }
    }

    private LocalDate calculateNextDueDate(LocalDate current, Frequency frequency) {
        return switch (frequency) {
            case DAILY -> current.plusDays(1);
            case WEEKLY -> current.plusWeeks(1);
            case MONTHLY -> current.plusMonths(1);
            case YEARLY -> current.plusYears(1);
            default -> current.plusMonths(1);
        };
    }
}
