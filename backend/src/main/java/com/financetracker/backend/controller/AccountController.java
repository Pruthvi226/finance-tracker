package com.financetracker.backend.controller;

import com.financetracker.backend.dto.AccountDto;
import com.financetracker.backend.dto.ApiResponse;
import com.financetracker.backend.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AccountDto>> createAccount(
            @RequestAttribute("userId") Long userId,
            @Valid @RequestBody AccountDto accountDto) {
        AccountDto createdAccount = accountService.createAccount(userId, accountDto);
        return new ResponseEntity<>(ApiResponse.success(createdAccount, "Account created successfully"), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AccountDto>>> getUserAccounts(@RequestAttribute("userId") Long userId) {
        List<AccountDto> accounts = accountService.getUserAccounts(userId);
        return ResponseEntity.ok(ApiResponse.success(accounts, "Accounts retrieved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AccountDto>> updateAccount(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id,
            @Valid @RequestBody AccountDto accountDto) {
        AccountDto updatedAccount = accountService.updateAccount(userId, id, accountDto);
        return ResponseEntity.ok(ApiResponse.success(updatedAccount, "Account updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id) {
        accountService.deleteAccount(userId, id);
        return ResponseEntity.ok(ApiResponse.success(null, "Account deleted successfully"));
    }
}
