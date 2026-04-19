package com.financetracker.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "bills")
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(length = 50)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BillStatus status = BillStatus.UNPAID;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Frequency recurrence = Frequency.MONTHLY;

    @Column(name = "auto_pay")
    private boolean autoPay = false;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BillStatus getStatus() { return status; }
    public void setStatus(BillStatus status) { this.status = status; }

    public Frequency getRecurrence() { return recurrence; }
    public void setRecurrence(Frequency recurrence) { this.recurrence = recurrence; }

    public boolean isAutoPay() { return autoPay; }
    public void setAutoPay(boolean autoPay) { this.autoPay = autoPay; }

    public enum BillStatus {
        PAID, UNPAID, OVERDUE
    }

    public Bill() {}

    public Bill(User user, String name, BigDecimal amount, LocalDate dueDate, String category, BillStatus status, Frequency recurrence) {
        this.user = user;
        this.name = name;
        this.amount = amount;
        this.dueDate = dueDate;
        this.category = category;
        this.status = status;
        this.recurrence = recurrence;
    }
}
