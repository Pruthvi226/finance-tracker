package com.financetracker.backend.controller;

import com.financetracker.backend.dto.ApiResponse;
import com.financetracker.backend.entity.Bill;
import com.financetracker.backend.entity.User;
import com.financetracker.backend.repository.UserRepository;
import com.financetracker.backend.service.BillService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    private final BillService billService;
    private final UserRepository userRepository;

    public BillController(BillService billService, UserRepository userRepository) {
        this.billService = billService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Bill>>> getBills(@RequestAttribute("userId") Long userId) {
        List<Bill> bills = billService.getBillsByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(bills, "Bills retrieved successfully"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Bill>> createBill(
            @RequestAttribute("userId") Long userId,
            @RequestBody Bill bill) {
        User user = userRepository.findById(userId).orElseThrow();
        bill.setUser(user);
        Bill saved = billService.createBill(bill);
        return ResponseEntity.ok(ApiResponse.success(saved, "Bill created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Bill>> updateBill(@PathVariable Long id, @RequestBody Bill bill) {
        Bill updated = billService.updateBill(id, bill);
        return ResponseEntity.ok(ApiResponse.success(updated, "Bill updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBill(@PathVariable Long id) {
        billService.deleteBill(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Bill deleted successfully"));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<ApiResponse<Bill>> markAsPaid(@PathVariable Long id) {
        Bill paid = billService.markAsPaid(id);
        return ResponseEntity.ok(ApiResponse.success(paid, "Bill marked as paid"));
    }
}
