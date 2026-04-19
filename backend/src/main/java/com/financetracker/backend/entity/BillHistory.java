package com.financetracker.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bill_history")
public class BillHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bill_id", nullable = false)
    private Bill bill;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amountPaid;

    @Column(name = "payment_date", nullable = false)
    private LocalDateTime paymentDate = LocalDateTime.now();

    @Column(name = "transaction_id")
    private Long transactionId;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Bill getBill() { return bill; }
    public void setBill(Bill bill) { this.bill = bill; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public BigDecimal getAmountPaid() { return amountPaid; }
    public void setAmountPaid(BigDecimal amountPaid) { this.amountPaid = amountPaid; }

    public LocalDateTime getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDateTime paymentDate) { this.paymentDate = paymentDate; }

    public Long getTransactionId() { return transactionId; }
    public void setTransactionId(Long transactionId) { this.transactionId = transactionId; }

    public BillHistory() {}

    // Manual Builder
    public static BillHistoryBuilder builder() {
        return new BillHistoryBuilder();
    }

    public static class BillHistoryBuilder {
        private Bill bill;
        private User user;
        private BigDecimal amountPaid;
        private LocalDateTime paymentDate = LocalDateTime.now();
        private Long transactionId;

        public BillHistoryBuilder bill(Bill bill) { this.bill = bill; return this; }
        public BillHistoryBuilder user(User user) { this.user = user; return this; }
        public BillHistoryBuilder amountPaid(BigDecimal amountPaid) { this.amountPaid = amountPaid; return this; }
        public BillHistoryBuilder paymentDate(LocalDateTime paymentDate) { this.paymentDate = paymentDate; return this; }
        public BillHistoryBuilder transactionId(Long transactionId) { this.transactionId = transactionId; return this; }

        public BillHistory build() {
            BillHistory bh = new BillHistory();
            bh.setBill(this.bill);
            bh.setUser(this.user);
            bh.setAmountPaid(this.amountPaid);
            bh.setPaymentDate(this.paymentDate);
            bh.setTransactionId(this.transactionId);
            return bh;
        }
    }
}
