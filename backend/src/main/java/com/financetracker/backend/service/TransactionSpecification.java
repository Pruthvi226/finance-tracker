package com.financetracker.backend.service;

import com.financetracker.backend.entity.Transaction;
import com.financetracker.backend.entity.TransactionType;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TransactionSpecification {

    public static Specification<Transaction> hasUserId(Long userId) {
        return (root, query, cb) -> cb.equal(root.get("user").get("id"), userId);
    }

    public static Specification<Transaction> hasCategoryId(Long categoryId) {
        return (root, query, cb) -> cb.equal(root.get("category").get("id"), categoryId);
    }

    public static Specification<Transaction> hasAccountId(Long accountId) {
        return (root, query, cb) -> cb.equal(root.get("account").get("id"), accountId);
    }

    public static Specification<Transaction> hasType(TransactionType type) {
        return (root, query, cb) -> cb.equal(root.get("type"), type);
    }

    public static Specification<Transaction> dateBetween(LocalDate startDate, LocalDate endDate) {
        return (root, query, cb) -> {
            if (startDate != null && endDate != null) {
                return cb.between(root.get("date"), startDate, endDate);
            } else if (startDate != null) {
                return cb.greaterThanOrEqualTo(root.get("date"), startDate);
            } else if (endDate != null) {
                return cb.lessThanOrEqualTo(root.get("date"), endDate);
            }
            return null;
        };
    }

    public static Specification<Transaction> amountBetween(BigDecimal minAmount, BigDecimal maxAmount) {
        return (root, query, cb) -> {
            if (minAmount != null && maxAmount != null) {
                return cb.between(root.get("amount"), minAmount, maxAmount);
            } else if (minAmount != null) {
                return cb.greaterThanOrEqualTo(root.get("amount"), minAmount);
            } else if (maxAmount != null) {
                return cb.lessThanOrEqualTo(root.get("amount"), maxAmount);
            }
            return null;
        };
    }

    public static Specification<Transaction> descriptionContains(String text) {
        return (root, query, cb) -> cb.like(cb.lower(root.get("description")), "%" + text.toLowerCase() + "%");
    }
}
