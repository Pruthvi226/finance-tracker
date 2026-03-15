package com.financetracker.backend.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface ReceiptStorageService {
    String storeReceipt(MultipartFile file, Long transactionId);
    Resource loadReceiptAsResource(String filename);
    void deleteReceipt(String filename);
}
