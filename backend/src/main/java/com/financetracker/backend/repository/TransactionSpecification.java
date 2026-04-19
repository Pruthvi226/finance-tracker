package com.financetracker.backend.repository;

import com.financetracker.backend.dto.TransactionFilterDto;
import com.financetracker.backend.entity.Transaction;
import com.financetracker.backend.entity.TransactionType;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class TransactionSpecification {

    public static Specification<Transaction> getTransactionsByFilter(Long userId, TransactionFilterDto filter) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always enforce user isolation
            predicates.add(criteriaBuilder.equal(root.get("user").get("id"), userId));

            if (filter != null) {
                if (filter.getCategory() != null && !filter.getCategory().trim().isEmpty()) {
                    predicates.add(criteriaBuilder.equal(root.get("category").get("name"), filter.getCategory().trim().toUpperCase()));
                }
                
                if (filter.getTransactionType() != null && !filter.getTransactionType().trim().isEmpty()) {
                    try {
                        TransactionType type = TransactionType.valueOf(filter.getTransactionType().trim().toUpperCase());
                        predicates.add(criteriaBuilder.equal(root.get("type"), type));
                    } catch (IllegalArgumentException e) {
                        // ignore invalid type
                    }
                }
                
                if (filter.getStartDate() != null && !filter.getStartDate().trim().isEmpty()) {
                    try {
                        LocalDate startDate = LocalDate.parse(filter.getStartDate().trim());
                        predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("date"), startDate));
                    } catch (Exception e) {}
                }
                
                if (filter.getEndDate() != null && !filter.getEndDate().trim().isEmpty()) {
                    try {
                        LocalDate endDate = LocalDate.parse(filter.getEndDate().trim());
                        predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("date"), endDate));
                    } catch (Exception e) {}
                }
                
                if (filter.getMinAmount() != null) {
                    predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("amount"), filter.getMinAmount()));
                }
                
                if (filter.getMaxAmount() != null) {
                    predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("amount"), filter.getMaxAmount()));
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
