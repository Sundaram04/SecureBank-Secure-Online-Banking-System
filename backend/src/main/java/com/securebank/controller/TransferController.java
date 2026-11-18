package com.securebank.controller;

import com.securebank.dto.ApiResponse;
import com.securebank.dto.TransactionDto;
import com.securebank.dto.TransferRequest;
import com.securebank.service.TransferService;
import com.securebank.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transfers")
@PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
public class TransferController {

    private final TransferService transferService;

    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TransactionDto>> transferMoney(
            @Valid @RequestBody TransferRequest request
    ) {
        String username = SecurityUtils.getCurrentUsername();
        TransactionDto tx = transferService.executeTransfer(username, request);
        return ResponseEntity.ok(ApiResponse.success("Transfer completed successfully", tx));
    }
}
