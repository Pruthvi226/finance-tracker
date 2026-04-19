package com.financetracker.backend.service;

import com.financetracker.backend.entity.Transaction;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExportService {

    public String exportTransactionsToCsv(List<Transaction> transactions) {
        StringBuilder csv = new StringBuilder();
        // Header
        csv.append("ID,Date,Description,Amount,Type,Category,Account\n");

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (Transaction t : transactions) {
            csv.append(t.getId()).append(",");
            csv.append(t.getDate() != null ? t.getDate().format(dtf) : "").append(",");
            
            // Handle commas in description
            String desc = t.getDescription() != null ? t.getDescription().replace(",", " ") : "";
            csv.append(desc).append(",");
            
            csv.append(t.getAmount()).append(",");
            csv.append(t.getType()).append(",");
            csv.append(t.getCategory() != null ? t.getCategory().getName() : "OTHER").append(",");
            csv.append(t.getAccount() != null ? t.getAccount().getAccountName() : "UNLINKED").append("\n");
        }

        return csv.toString();
    }
}
