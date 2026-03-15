package com.financetracker.backend.service;

import com.financetracker.backend.dto.AccountDto;
import com.financetracker.backend.entity.Account;
import com.financetracker.backend.entity.User;
import com.financetracker.backend.exception.ResourceNotFoundException;
import com.financetracker.backend.repository.AccountRepository;
import com.financetracker.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    public AccountService(AccountRepository accountRepository, UserRepository userRepository) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public AccountDto createAccount(Long userId, AccountDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Account account = new Account(
                user,
                dto.getAccountName(),
                dto.getAccountType(),
                dto.getBalance() != null ? dto.getBalance() : BigDecimal.ZERO,
                dto.getCurrency() != null ? dto.getCurrency() : "USD"
        );

        Account savedAccount = accountRepository.save(account);
        return mapToDto(savedAccount);
    }

    @Transactional(readOnly = true)
    public List<AccountDto> getUserAccounts(Long userId) {
        return accountRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AccountDto updateAccount(Long userId, Long accountId, AccountDto dto) {
        Account account = accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        account.setAccountName(dto.getAccountName());
        account.setAccountType(dto.getAccountType());
        if (dto.getBalance() != null) {
            account.setBalance(dto.getBalance());
        }
        if (dto.getCurrency() != null) {
            account.setCurrency(dto.getCurrency());
        }

        Account updatedAccount = accountRepository.save(account);
        return mapToDto(updatedAccount);
    }

    @Transactional
    public void deleteAccount(Long userId, Long accountId) {
        Account account = accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        accountRepository.delete(account);
    }

    private AccountDto mapToDto(Account account) {
        AccountDto dto = new AccountDto();
        dto.setId(account.getId());
        dto.setAccountName(account.getAccountName());
        dto.setAccountType(account.getAccountType());
        dto.setBalance(account.getBalance());
        dto.setCurrency(account.getCurrency());
        dto.setCreatedAt(account.getCreatedAt());
        return dto;
    }
}
