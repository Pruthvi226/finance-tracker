package com.financetracker.backend.service.impl;

import com.financetracker.backend.dto.CategoryDto;
import com.financetracker.backend.dto.PageResponse;
import com.financetracker.backend.dto.TransactionDto;
import com.financetracker.backend.entity.Category;
import com.financetracker.backend.entity.Transaction;
import com.financetracker.backend.entity.User;
import com.financetracker.backend.exception.ResourceNotFoundException;
import com.financetracker.backend.entity.Account;
import com.financetracker.backend.repository.AccountRepository;
import com.financetracker.backend.repository.CategoryRepository;
import com.financetracker.backend.repository.TransactionRepository;
import com.financetracker.backend.service.ReceiptStorageService;
import com.financetracker.backend.service.TransactionService;
import com.financetracker.backend.service.TransactionSpecification;
import com.financetracker.backend.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserService userService;
    private final ReceiptStorageService receiptStorageService;
    private final AccountRepository accountRepository;

    public TransactionServiceImpl(TransactionRepository transactionRepository,
                                  CategoryRepository categoryRepository,
                                  UserService userService,
                                  ReceiptStorageService receiptStorageService,
                                  AccountRepository accountRepository) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.userService = userService;
        this.receiptStorageService = receiptStorageService;
        this.accountRepository = accountRepository;
    }

    @Override
    public TransactionDto createTransaction(TransactionDto transactionDto) {
        User user = userService.getCurrentUserEntity();
        Category category = categoryRepository.findById(transactionDto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + transactionDto.getCategoryId()));

        Account account = accountRepository.findByIdAndUserId(transactionDto.getAccountId(), user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + transactionDto.getAccountId()));

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setAccount(account);
        transaction.setCategory(category);
        transaction.setAmount(transactionDto.getAmount());
        transaction.setCurrency(transactionDto.getCurrency() != null ? transactionDto.getCurrency() : user.getBaseCurrency());
        transaction.setType(transactionDto.getType());
        transaction.setDate(transactionDto.getDate());
        transaction.setDescription(transactionDto.getDescription());
        transaction.setReceiptUrl(transactionDto.getReceiptUrl());

        Transaction saved = transactionRepository.save(transaction);
        return mapToDto(saved);
    }

    @Override
    public TransactionDto updateTransaction(Long id, TransactionDto transactionDto) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
        User user = userService.getCurrentUserEntity();

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Cannot update other users' transactions");
        }

        Category category = categoryRepository.findById(transactionDto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + transactionDto.getCategoryId()));

        Account account = accountRepository.findByIdAndUserId(transactionDto.getAccountId(), user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + transactionDto.getAccountId()));

        transaction.setAccount(account);
        transaction.setCategory(category);
        transaction.setAmount(transactionDto.getAmount());
        transaction.setCurrency(transactionDto.getCurrency() != null ? transactionDto.getCurrency() : user.getBaseCurrency());
        transaction.setType(transactionDto.getType());
        transaction.setDate(transactionDto.getDate());
        transaction.setDescription(transactionDto.getDescription());
        transaction.setReceiptUrl(transactionDto.getReceiptUrl());

        Transaction saved = transactionRepository.save(transaction);
        return mapToDto(saved);
    }

    @Override
    public void deleteTransaction(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
        User user = userService.getCurrentUserEntity();

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Cannot delete other users' transactions");
        }

        transactionRepository.delete(transaction);
    }

    @Override
    public TransactionDto getTransactionById(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
        User user = userService.getCurrentUserEntity();

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Cannot access other users' transactions");
        }

        return mapToDto(transaction);
    }

    @Override
    public PageResponse<TransactionDto> getUserTransactions(
            int pageNo, int pageSize, Long categoryId, Long accountId,
            com.financetracker.backend.entity.TransactionType type,
            LocalDate startDate, LocalDate endDate,
            BigDecimal minAmount, BigDecimal maxAmount, String search) {

        User user = userService.getCurrentUserEntity();
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("date").descending());

        Specification<Transaction> spec = Specification.where(TransactionSpecification.hasUserId(user.getId()));

        if (categoryId != null) {
            spec = spec.and(TransactionSpecification.hasCategoryId(categoryId));
        }
        if (accountId != null) {
            spec = spec.and(TransactionSpecification.hasAccountId(accountId));
        }
        if (type != null) {
            spec = spec.and(TransactionSpecification.hasType(type));
        }
        if (startDate != null || endDate != null) {
            spec = spec.and(TransactionSpecification.dateBetween(startDate, endDate));
        }
        if (minAmount != null || maxAmount != null) {
            spec = spec.and(TransactionSpecification.amountBetween(minAmount, maxAmount));
        }
        if (search != null && !search.isEmpty()) {
            spec = spec.and(TransactionSpecification.descriptionContains(search));
        }

        Page<Transaction> page = transactionRepository.findAll(spec, pageable);

        List<TransactionDto> content = page.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return new PageResponse<>(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    @Override
    public TransactionDto uploadReceipt(Long id, MultipartFile file) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
        User user = userService.getCurrentUserEntity();

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Cannot modify other users' transactions");
        }

        String fileName = receiptStorageService.storeReceipt(file, id);
        
        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/receipts/")
                .path(fileName)
                .toUriString();

        transaction.setReceiptUrl(fileDownloadUri);
        Transaction saved = transactionRepository.save(transaction);
        return mapToDto(saved);
    }

    private TransactionDto mapToDto(Transaction transaction) {
        TransactionDto dto = new TransactionDto();
        dto.setId(transaction.getId());
        dto.setCategoryId(transaction.getCategory() != null ? transaction.getCategory().getId() : null);
        
        if (transaction.getCategory() != null) {
            CategoryDto catDto = new CategoryDto();
            catDto.setId(transaction.getCategory().getId());
            catDto.setName(transaction.getCategory().getName());
            catDto.setType(transaction.getCategory().getType());
            catDto.setColor(transaction.getCategory().getColor());
            catDto.setSystemDefault(transaction.getCategory().getUser() == null);
            dto.setCategory(catDto);
        }

        dto.setAmount(transaction.getAmount());
        dto.setCurrency(transaction.getCurrency());
        dto.setType(transaction.getType());
        dto.setDate(transaction.getDate());
        dto.setDescription(transaction.getDescription());
        dto.setReceiptUrl(transaction.getReceiptUrl());
        dto.setAccountId(transaction.getAccount() != null ? transaction.getAccount().getId() : null);
        return dto;
    }
}
