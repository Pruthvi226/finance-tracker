package com.financetracker.backend.seeder;

import com.financetracker.backend.entity.*;
import com.financetracker.backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
public class DemoDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final FinancialGoalRepository financialGoalRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoDataSeeder(UserRepository userRepository,
                          CategoryRepository categoryRepository,
                          AccountRepository accountRepository,
                          TransactionRepository transactionRepository,
                          BudgetRepository budgetRepository,
                          FinancialGoalRepository financialGoalRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.budgetRepository = budgetRepository;
        this.financialGoalRepository = financialGoalRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail("demo@example.com")) {
            seedDemoData();
        }
    }

    private void seedDemoData() {
        User demoUser = new User();
        demoUser.setName("Demo User");
        demoUser.setEmail("demo@example.com");
        demoUser.setPassword(passwordEncoder.encode("password123"));
        demoUser.setBaseCurrency("INR");
        demoUser = userRepository.save(demoUser);

        Account hdfcBank = accountRepository.save(new Account(demoUser, "HDFC Salary Account", AccountType.BANK_ACCOUNT, new BigDecimal("85000.00"), "INR"));
        Account paytmWallet = accountRepository.save(new Account(demoUser, "Paytm Wallet", AccountType.UPI_WALLET, new BigDecimal("4500.00"), "INR"));
        accountRepository.save(new Account(demoUser, "ICICI Savings", AccountType.SAVINGS_ACCOUNT, new BigDecimal("120000.00"), "INR"));

        Category salary = categoryRepository.save(new Category(null, "Salary", TransactionType.INCOME, demoUser, "#10B981"));
        Category rent = categoryRepository.save(new Category(null, "Rent", TransactionType.EXPENSE, demoUser, "#6366F1"));
        Category food = categoryRepository.save(new Category(null, "Food & Dining", TransactionType.EXPENSE, demoUser, "#F59E0B"));
        categoryRepository.save(new Category(null, "Shopping", TransactionType.EXPENSE, demoUser, "#EC4899"));
        categoryRepository.save(new Category(null, "Travel", TransactionType.EXPENSE, demoUser, "#3B82F6"));
        Category entertainment = categoryRepository.save(new Category(null, "Entertainment", TransactionType.EXPENSE, demoUser, "#8B5CF6"));
        Category bills = categoryRepository.save(new Category(null, "Bills & Utilities", TransactionType.EXPENSE, demoUser, "#EF4444"));

        // 4. Create 1 Global Budget (Database currently supports only 1 budget per user)
        budgetRepository.save(new Budget(null, demoUser, null, new BigDecimal("50000.00"), "INR"));

        // 5. Create 3 Financial Goals
        FinancialGoal carGoal = new FinancialGoal();
        carGoal.setUser(demoUser);
        carGoal.setTitle("New SUV Fund");
        carGoal.setTargetAmount(new BigDecimal("1500000.00"));
        carGoal.setCurrentAmount(new BigDecimal("450000.00"));
        carGoal.setDeadline(LocalDate.now().plusYears(2));
        financialGoalRepository.save(carGoal);

        FinancialGoal travelGoal = new FinancialGoal();
        travelGoal.setUser(demoUser);
        travelGoal.setTitle("Europe Trip 2026");
        travelGoal.setTargetAmount(new BigDecimal("300000.00"));
        travelGoal.setCurrentAmount(new BigDecimal("85000.00"));
        travelGoal.setDeadline(LocalDate.now().plusMonths(14));
        financialGoalRepository.save(travelGoal);

        FinancialGoal emergencyFund = new FinancialGoal();
        emergencyFund.setUser(demoUser);
        emergencyFund.setTitle("Emergency Fund");
        emergencyFund.setTargetAmount(new BigDecimal("500000.00"));
        emergencyFund.setCurrentAmount(new BigDecimal("250000.00"));
        emergencyFund.setDeadline(LocalDate.now().plusMonths(6));
        financialGoalRepository.save(emergencyFund);

        // 6. Create Transactions (over 3 months)
        List<Transaction> transactions = new ArrayList<>();
        LocalDate today = LocalDate.now();
        // Month 1
        transactions.add(createTx(demoUser, hdfcBank, salary, "75000", TransactionType.INCOME, today.withDayOfMonth(1), "Monthly Salary"));
        transactions.add(createTx(demoUser, hdfcBank, rent, "15000", TransactionType.EXPENSE, today.withDayOfMonth(5), "Apartment Rent"));
        transactions.add(createTx(demoUser, paytmWallet, food, "450", TransactionType.EXPENSE, today.minusDays(2), "Starbucks Coffee"));
        transactions.add(createTx(demoUser, hdfcBank, bills, "2400", TransactionType.EXPENSE, today.minusDays(10), "Electricity Bill"));
        // Month 2
        LocalDate lastMonth = today.minusMonths(1);
        transactions.add(createTx(demoUser, hdfcBank, salary, "75000", TransactionType.INCOME, lastMonth.withDayOfMonth(1), "Monthly Salary"));
        transactions.add(createTx(demoUser, hdfcBank, rent, "15000", TransactionType.EXPENSE, lastMonth.withDayOfMonth(5), "Apartment Rent"));
        transactions.add(createTx(demoUser, hdfcBank, entertainment, "1500", TransactionType.EXPENSE, lastMonth.withDayOfMonth(18), "Netflix & YouTube Premium"));
        // Month 3
        LocalDate twoMonthsAgo = today.minusMonths(2);
        transactions.add(createTx(demoUser, hdfcBank, salary, "75000", TransactionType.INCOME, twoMonthsAgo.withDayOfMonth(1), "Monthly Salary"));
        transactions.add(createTx(demoUser, hdfcBank, rent, "15000", TransactionType.EXPENSE, twoMonthsAgo.withDayOfMonth(5), "Apartment Rent"));

        transactionRepository.saveAll(transactions);
    }

    private Transaction createTx(User user, Account account, Category category, String amount, TransactionType type, LocalDate date, String desc) {
        Transaction tx = new Transaction();
        tx.setUser(user);
        tx.setAccount(account);
        tx.setCategory(category);
        tx.setAmount(new BigDecimal(amount));
        tx.setCurrency("INR");
        tx.setType(type);
        tx.setDate(date);
        tx.setDescription(desc);
        return tx;
    }
}
