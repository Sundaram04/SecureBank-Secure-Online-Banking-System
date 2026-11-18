package com.securebank.controller;

import com.securebank.dto.*;
import com.securebank.service.AdminService;
import com.securebank.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<Page<UserDto>>> getCustomers(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<UserDto> customers = adminService.getCustomers(query, page, size);
        return ResponseEntity.ok(ApiResponse.success(customers));
    }

    @GetMapping("/customers/{customerId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCustomerDetails(@PathVariable Long customerId) {
        Map<String, Object> details = adminService.getCustomerDetails(customerId);
        return ResponseEntity.ok(ApiResponse.success(details));
    }

    @PutMapping("/customers/{customerId}/status")
    public ResponseEntity<ApiResponse<UserDto>> updateCustomerStatus(
            @PathVariable Long customerId,
            @Valid @RequestBody UserStatusUpdateRequest request
    ) {
        String adminUsername = SecurityUtils.getCurrentUsername();
        UserDto updated = adminService.updateCustomerStatus(customerId, request.getStatus(), adminUsername);
        return ResponseEntity.ok(ApiResponse.success("Customer status updated successfully", updated));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<Page<TransactionDto>>> getAllTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Page<TransactionDto> transactions = adminService.getAllTransactions(page, size);
        return ResponseEntity.ok(ApiResponse.success(transactions));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<Page<AuditLogDto>>> getAuditLogs(
            @RequestParam(required = false) String actor,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<AuditLogDto> logs = adminService.getAuditLogs(actor, action, status, page, size);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @GetMapping("/security-events")
    public ResponseEntity<ApiResponse<Page<SecurityEventDto>>> getSecurityEvents(
            @RequestParam(required = false) String reviewStatus,
            @RequestParam(required = false) String severity,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<SecurityEventDto> events = adminService.getSecurityEvents(reviewStatus, severity, page, size);
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @PutMapping("/security-events/{eventId}")
    public ResponseEntity<ApiResponse<SecurityEventDto>> reviewSecurityEvent(
            @PathVariable Long eventId,
            @Valid @RequestBody ReviewSecurityEventRequest request
    ) {
        String adminUsername = SecurityUtils.getCurrentUsername();
        SecurityEventDto reviewed = adminService.reviewSecurityEvent(eventId, request.getReviewStatus(), request.getNotes(), adminUsername);
        return ResponseEntity.ok(ApiResponse.success("Security event updated", reviewed));
    }

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOverview() {
        Map<String, Object> stats = adminService.getSecurityOverview();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
