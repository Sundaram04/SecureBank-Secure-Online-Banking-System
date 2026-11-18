package com.securebank.controller;

import com.securebank.dto.ApiResponse;
import com.securebank.dto.BankAccountDto;
import com.securebank.dto.TransactionDto;
import com.securebank.service.AccountService;
import com.securebank.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BankAccountDto>>> getMyAccounts() {
        String username = SecurityUtils.getCurrentUsername();
        List<BankAccountDto> accounts = accountService.getUserAccounts(username);
        return ResponseEntity.ok(ApiResponse.success(accounts));
    }

    @GetMapping("/{accountId}")
    public ResponseEntity<ApiResponse<BankAccountDto>> getAccountById(@PathVariable Long accountId) {
        String username = SecurityUtils.getCurrentUsername();
        BankAccountDto account = accountService.getAccountById(accountId, username);
        return ResponseEntity.ok(ApiResponse.success(account));
    }

    @GetMapping("/{accountId}/transactions")
    public ResponseEntity<ApiResponse<List<TransactionDto>>> getAccountTransactions(@PathVariable Long accountId) {
        String username = SecurityUtils.getCurrentUsername();
        List<TransactionDto> transactions = accountService.getAccountTransactions(accountId, username);
        return ResponseEntity.ok(ApiResponse.success(transactions));
    }
}
