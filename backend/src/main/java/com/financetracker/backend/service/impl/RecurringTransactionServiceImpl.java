package com.financetracker.backend.service.impl;

import com.financetracker.backend.dto.CategoryDto;
import com.financetracker.backend.dto.RecurringTransactionDto;
import com.financetracker.backend.entity.Category;
import com.financetracker.backend.entity.Frequency;
import com.financetracker.backend.entity.RecurringTransaction;
import com.financetracker.backend.entity.Transaction;
import com.financetracker.backend.entity.User;
import com.financetracker.backend.exception.ResourceNotFoundException;
import com.financetracker.backend.repository.CategoryRepository;
import com.financetracker.backend.repository.RecurringTransactionRepository;
import com.financetracker.backend.repository.TransactionRepository;
import com.financetracker.backend.service.RecurringTransactionService;
import com.financetracker.backend.service.UserService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecurringTransactionServiceImpl implements RecurringTransactionService {

    private final RecurringTransactionRepository recurringTransactionRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserService userService;

    public RecurringTransactionServiceImpl(RecurringTransactionRepository recurringTransactionRepository,
                                           TransactionRepository transactionRepository,
                                           CategoryRepository categoryRepository,
                                           UserService userService) {
        this.recurringTransactionRepository = recurringTransactionRepository;
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.userService = userService;
    }

    @Override
    public RecurringTransactionDto createRecurringTransaction(RecurringTransactionDto dto) {
        User user = userService.getCurrentUserEntity();
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId()));

        RecurringTransaction rt = new RecurringTransaction();
        rt.setUser(user);
        rt.setTitle(dto.getTitle());
        rt.setCategory(category);
        rt.setAmount(dto.getAmount());
        rt.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : user.getBaseCurrency());
        rt.setType(dto.getType());
        rt.setFrequency(dto.getFrequency());
        rt.setStartDate(dto.getStartDate());
        rt.setNextExecutionDate(dto.getNextExecutionDate() != null ? dto.getNextExecutionDate() : dto.getStartDate());
        rt.setEndDate(dto.getEndDate());
        rt.setDescription(dto.getDescription());
        rt.setActive(dto.getActive() != null ? dto.getActive() : true);

        RecurringTransaction saved = recurringTransactionRepository.save(rt);
        return mapToDto(saved);
    }

    @Override
    public RecurringTransactionDto updateRecurringTransaction(Long id, RecurringTransactionDto dto) {
        RecurringTransaction rt = recurringTransactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RecurringTransaction not found with id: " + id));
        User user = userService.getCurrentUserEntity();

        if (!rt.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Cannot update other users' recurring transactions");
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId()));

        rt.setTitle(dto.getTitle());
        rt.setCategory(category);
        rt.setAmount(dto.getAmount());
        rt.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : user.getBaseCurrency());
        rt.setType(dto.getType());
        rt.setFrequency(dto.getFrequency());
        rt.setStartDate(dto.getStartDate());
        
        if (dto.getNextExecutionDate() != null) {
            rt.setNextExecutionDate(dto.getNextExecutionDate());
        }
        
        rt.setEndDate(dto.getEndDate());
        rt.setDescription(dto.getDescription());
        
        if (dto.getActive() != null) {
            rt.setActive(dto.getActive());
        }

        RecurringTransaction saved = recurringTransactionRepository.save(rt);
        return mapToDto(saved);
    }

    @Override
    public void deleteRecurringTransaction(Long id) {
        RecurringTransaction rt = recurringTransactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RecurringTransaction not found with id: " + id));
        User user = userService.getCurrentUserEntity();

        if (!rt.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Cannot delete other users' recurring transactions");
        }

        recurringTransactionRepository.delete(rt);
    }

    @Override
    public List<RecurringTransactionDto> getUserRecurringTransactions() {
        User user = userService.getCurrentUserEntity();
        List<RecurringTransaction> list = recurringTransactionRepository.findByUserId(user.getId());
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void processRecurringTransactions() {
        LocalDate today = LocalDate.now();
        List<RecurringTransaction> dueTransactions = recurringTransactionRepository.findByActiveTrueAndNextExecutionDateLessThanEqual(today);

        for (RecurringTransaction rt : dueTransactions) {
            if (rt.getEndDate() != null && today.isAfter(rt.getEndDate())) {
                rt.setActive(false);
                recurringTransactionRepository.save(rt);
                continue;
            }

            Transaction transaction = new Transaction();
            transaction.setUser(rt.getUser());
            transaction.setCategory(rt.getCategory());
            transaction.setAmount(rt.getAmount());
            transaction.setCurrency(rt.getCurrency());
            transaction.setType(rt.getType());
            transaction.setDate(today);
            transaction.setDescription(rt.getTitle() + (rt.getDescription() != null ? " - " + rt.getDescription() : ""));

            transactionRepository.save(transaction);

            rt.setNextExecutionDate(calculateNextExecutionDate(rt.getNextExecutionDate(), rt.getFrequency()));
            recurringTransactionRepository.save(rt);
        }
    }

    private LocalDate calculateNextExecutionDate(LocalDate currentDate, Frequency frequency) {
        return switch (frequency) {
            case DAILY -> currentDate.plusDays(1);
            case WEEKLY -> currentDate.plusWeeks(1);
            case MONTHLY -> currentDate.plusMonths(1);
            case YEARLY -> currentDate.plusYears(1);
            default -> currentDate.plusMonths(1);
        };
    }

    private RecurringTransactionDto mapToDto(RecurringTransaction rt) {
        RecurringTransactionDto dto = new RecurringTransactionDto();
        dto.setId(rt.getId());
        dto.setTitle(rt.getTitle());
        dto.setCategoryId(rt.getCategory() != null ? rt.getCategory().getId() : null);

        if (rt.getCategory() != null) {
            CategoryDto catDto = new CategoryDto();
            catDto.setId(rt.getCategory().getId());
            catDto.setName(rt.getCategory().getName());
            catDto.setType(rt.getCategory().getType());
            catDto.setColor(rt.getCategory().getColor());
            catDto.setSystemDefault(rt.getCategory().getUser() == null);
            dto.setCategory(catDto);
        }

        dto.setAmount(rt.getAmount());
        dto.setCurrency(rt.getCurrency());
        dto.setType(rt.getType());
        dto.setFrequency(rt.getFrequency());
        dto.setStartDate(rt.getStartDate());
        dto.setNextExecutionDate(rt.getNextExecutionDate());
        dto.setEndDate(rt.getEndDate());
        dto.setDescription(rt.getDescription());
        dto.setActive(rt.getActive());
        return dto;
    }
}
