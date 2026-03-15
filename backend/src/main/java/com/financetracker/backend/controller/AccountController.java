package com.financetracker.backend.controller;

import com.financetracker.backend.dto.AccountDto;
import com.financetracker.backend.service.AccountService;
import com.financetracker.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;
    private final UserService userService;

    public AccountController(AccountService accountService, UserService userService) {
        this.accountService = accountService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<AccountDto> createAccount(
            @Valid @RequestBody AccountDto accountDto) {
        Long userId = userService.getCurrentUserEntity().getId();
        AccountDto createdAccount = accountService.createAccount(userId, accountDto);
        return new ResponseEntity<>(createdAccount, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AccountDto>> getUserAccounts() {
        Long userId = userService.getCurrentUserEntity().getId();
        List<AccountDto> accounts = accountService.getUserAccounts(userId);
        return ResponseEntity.ok(accounts);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AccountDto> updateAccount(
            @PathVariable Long id,
            @Valid @RequestBody AccountDto accountDto) {
        Long userId = userService.getCurrentUserEntity().getId();
        AccountDto updatedAccount = accountService.updateAccount(userId, id, accountDto);
        return ResponseEntity.ok(updatedAccount);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(
            @PathVariable Long id) {
        Long userId = userService.getCurrentUserEntity().getId();
        accountService.deleteAccount(userId, id);
        return ResponseEntity.noContent().build();
    }
}
