package com.securebank.controller;

import com.securebank.dto.ApiResponse;
import com.securebank.dto.LedgerEntryDto;
import com.securebank.dto.TransactionDto;
import com.securebank.service.TransactionService;
import com.securebank.util.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<TransactionDto>>> getTransactions(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        String username = SecurityUtils.getCurrentUsername();
        Page<TransactionDto> transactions = transactionService.getUserTransactions(username, type, status, startDate, endDate, page, size);
        return ResponseEntity.ok(ApiResponse.success(transactions));
    }

    @GetMapping("/{transactionId}")
    public ResponseEntity<ApiResponse<TransactionDto>> getTransactionById(@PathVariable Long transactionId) {
        String username = SecurityUtils.getCurrentUsername();
        TransactionDto tx = transactionService.getTransactionById(transactionId, username);
        return ResponseEntity.ok(ApiResponse.success(tx));
    }

    @GetMapping("/{transactionId}/ledger")
    public ResponseEntity<ApiResponse<List<LedgerEntryDto>>> getTransactionLedger(@PathVariable Long transactionId) {
        String username = SecurityUtils.getCurrentUsername();
        List<LedgerEntryDto> entries = transactionService.getTransactionLedgerEntries(transactionId, username);
        return ResponseEntity.ok(ApiResponse.success(entries));
    }
}
