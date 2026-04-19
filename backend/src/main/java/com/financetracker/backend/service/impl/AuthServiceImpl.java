package com.financetracker.backend.service.impl;

import com.financetracker.backend.entity.Account;
import com.financetracker.backend.entity.Category;
import com.financetracker.backend.entity.TransactionType;
import com.financetracker.backend.entity.AccountType;
import com.financetracker.backend.entity.User;
import com.financetracker.backend.payload.AuthDtos;
import com.financetracker.backend.repository.AccountRepository;
import com.financetracker.backend.repository.CategoryRepository;
import com.financetracker.backend.repository.UserRepository;
import com.financetracker.backend.security.JwtTokenProvider;
import com.financetracker.backend.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthServiceImpl(UserRepository userRepository,
                           AccountRepository accountRepository,
                           CategoryRepository categoryRepository,
                           PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager,
                           JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    @Transactional
    public User register(AuthDtos.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setBaseCurrency("USD");
        User savedUser = userRepository.save(user);

        // Seed 1: Default Account
        Account defaultAccount = new Account();
        defaultAccount.setUser(savedUser);
        defaultAccount.setAccountName("Personal Savings");
        defaultAccount.setAccountType(AccountType.SAVINGS_ACCOUNT);
        defaultAccount.setBalance(BigDecimal.ZERO);
        defaultAccount.setCurrency("USD");
        accountRepository.save(defaultAccount);

        // Seed 2: Default Categories
        List<Category> defaultCategories = List.of(
            createCategory(savedUser, "Salary", TransactionType.INCOME, "#10b981"),
            createCategory(savedUser, "Investment", TransactionType.INCOME, "#3b82f6"),
            createCategory(savedUser, "Housing", TransactionType.EXPENSE, "#ef4444"),
            createCategory(savedUser, "Food", TransactionType.EXPENSE, "#f59e0b"),
            createCategory(savedUser, "Transport", TransactionType.EXPENSE, "#8b5cf6"),
            createCategory(savedUser, "Entertainment", TransactionType.EXPENSE, "#ec4899"),
            createCategory(savedUser, "Health", TransactionType.EXPENSE, "#06b6d4")
        );
        categoryRepository.saveAll(defaultCategories);

        return savedUser;
    }

    private Category createCategory(User user, String name, TransactionType type, String color) {
        Category cat = new Category();
        cat.setUser(user);
        cat.setName(name);
        cat.setType(type);
        cat.setColor(color);
        return cat;
    }

    @Override
    public String login(AuthDtos.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        return jwtTokenProvider.generateToken(authentication);
    }
}
