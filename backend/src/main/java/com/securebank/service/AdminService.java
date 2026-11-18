package com.securebank.service;

import com.securebank.dto.*;
import com.securebank.entity.*;
import com.securebank.exception.ResourceNotFoundException;
import com.securebank.repository.*;
import com.securebank.util.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final BankAccountRepository bankAccountRepository;
    private final TransactionRepository transactionRepository;
    private final AuditLogRepository auditLogRepository;
    private final SecurityEventRepository securityEventRepository;
    private final LoginAttemptRepository loginAttemptRepository;
    private final UserSessionRepository userSessionRepository;
    private final AuditService auditService;

    public AdminService(
            UserRepository userRepository,
            BankAccountRepository bankAccountRepository,
            TransactionRepository transactionRepository,
            AuditLogRepository auditLogRepository,
            SecurityEventRepository securityEventRepository,
            LoginAttemptRepository loginAttemptRepository,
            UserSessionRepository userSessionRepository,
            AuditService auditService
    ) {
        this.userRepository = userRepository;
        this.bankAccountRepository = bankAccountRepository;
        this.transactionRepository = transactionRepository;
        this.auditLogRepository = auditLogRepository;
        this.securityEventRepository = securityEventRepository;
        this.loginAttemptRepository = loginAttemptRepository;
        this.userSessionRepository = userSessionRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<UserDto> getCustomers(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> users;
        if (query != null && !query.isBlank()) {
            users = userRepository.searchCustomers(query.trim(), pageable);
        } else {
            users = userRepository.findAll(pageable);
        }
        return users.map(this::toUserDto);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCustomerDetails(Long customerId) {
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer with ID " + customerId + " not found."));

        List<BankAccountDto> accounts = bankAccountRepository.findByUserId(customerId).stream().map(a -> {
            BankAccountDto dto = new BankAccountDto();
            dto.setId(a.getId());
            dto.setAccountNumber(a.getAccountNumber());
            dto.setMaskedAccountNumber(SecurityUtils.maskAccountNumber(a.getAccountNumber()));
            dto.setAccountType(a.getAccountType());
            dto.setBalance(a.getBalance());
            dto.setCurrency(a.getCurrency());
            dto.setStatus(a.getStatus());
            dto.setCreatedAt(a.getCreatedAt());
            return dto;
        }).toList();

        Map<String, Object> result = new HashMap<>();
        result.put("customer", toUserDto(user));
        result.put("accounts", accounts);
        return result;
    }

    @Transactional
    public UserDto updateCustomerStatus(Long customerId, String newStatus, String adminUsername) {
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer with ID " + customerId + " not found."));

        // Protect admin account from accidental self-suspension
        if (user.getUsername().equalsIgnoreCase(adminUsername)) {
            throw new IllegalArgumentException("Administrator accounts cannot be self-suspended.");
        }

        user.setStatus(newStatus.toUpperCase().trim());
        if ("ACTIVE".equalsIgnoreCase(newStatus)) {
            user.setFailedLoginAttempts(0);
            user.setLockoutUntil(null);
        }

        User saved = userRepository.save(user);

        auditService.logEvent(adminUsername, "ADMIN_CUSTOMER_STATUS_UPDATED", "USER:" + customerId, "127.0.0.1", "SUCCESS",
                "Updated status of " + user.getUsername() + " to " + newStatus, null);

        return toUserDto(saved);
    }

    @Transactional(readOnly = true)
    public Page<TransactionDto> getAllTransactions(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return transactionRepository.findAll(pageable).map(tx -> {
            TransactionDto dto = new TransactionDto();
            dto.setId(tx.getId());
            dto.setTransactionReference(tx.getTransactionReference());
            if (tx.getSourceAccount() != null) {
                dto.setSourceAccountNumber(tx.getSourceAccount().getAccountNumber());
                dto.setMaskedSourceAccountNumber(SecurityUtils.maskAccountNumber(tx.getSourceAccount().getAccountNumber()));
            }
            if (tx.getDestinationAccount() != null) {
                dto.setDestinationAccountNumber(tx.getDestinationAccount().getAccountNumber());
                dto.setMaskedDestinationAccountNumber(SecurityUtils.maskAccountNumber(tx.getDestinationAccount().getAccountNumber()));
            }
            dto.setAmount(tx.getAmount());
            dto.setCurrency(tx.getCurrency());
            dto.setTransactionType(tx.getTransactionType());
            dto.setStatus(tx.getStatus());
            dto.setDescription(tx.getDescription());
            dto.setFailureReason(tx.getFailureReason());
            dto.setCreatedAt(tx.getCreatedAt());
            return dto;
        });
    }

    @Transactional(readOnly = true)
    public Page<AuditLogDto> getAuditLogs(String actor, String action, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return auditLogRepository.searchLogs(
                actor != null && !actor.isBlank() ? actor.trim() : null,
                action != null && !action.isBlank() ? action.trim() : null,
                status != null && !status.isBlank() ? status.trim() : null,
                pageable
        ).map(this::toAuditDto);
    }

    @Transactional(readOnly = true)
    public Page<SecurityEventDto> getSecurityEvents(String reviewStatus, String severity, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return securityEventRepository.searchEvents(
                reviewStatus != null && !reviewStatus.isBlank() ? reviewStatus.trim() : null,
                severity != null && !severity.isBlank() ? severity.trim() : null,
                pageable
        ).map(this::toEventDto);
    }

    @Transactional
    public SecurityEventDto reviewSecurityEvent(Long eventId, String newStatus, String notes, String adminUsername) {
        SecurityEvent event = securityEventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Security event with ID " + eventId + " not found."));

        event.setReviewStatus(newStatus.toUpperCase().trim());
        event.setResolvedBy(adminUsername);
        if (notes != null && !notes.isBlank()) {
            event.setDescription(event.getDescription() + " [Review Note: " + notes.trim() + "]");
        }

        SecurityEvent saved = securityEventRepository.save(event);
        auditService.logEvent(adminUsername, "SECURITY_EVENT_REVIEWED", "EVENT:" + eventId, "127.0.0.1", "SUCCESS",
                "Event " + eventId + " set to " + newStatus, null);

        return toEventDto(saved);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSecurityOverview() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalTransactions", transactionRepository.count());
        stats.put("newSecurityEvents", securityEventRepository.countByReviewStatus("NEW"));
        stats.put("underInvestigationEvents", securityEventRepository.countByReviewStatus("UNDER_INVESTIGATION"));

        OffsetDateTime oneDayAgo = OffsetDateTime.now().minusHours(24);
        stats.put("recentAuditLogsCount", auditLogRepository.count());
        stats.put("recentSecurityEvents", securityEventRepository.findTop10ByOrderByCreatedAtDesc().stream().map(this::toEventDto).toList());

        return stats;
    }

    private UserDto toUserDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getUsername());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhone(user.getPhone());
        dto.setStatus(user.getStatus());
        dto.setMfaEnabled(user.isMfaEnabled());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setRoles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
        return dto;
    }

    private AuditLogDto toAuditDto(AuditLog a) {
        AuditLogDto dto = new AuditLogDto();
        dto.setId(a.getId());
        dto.setActorUsername(a.getActorUsername());
        dto.setAction(a.getAction());
        dto.setTargetResource(a.getTargetResource());
        dto.setIpAddress(a.getIpAddress());
        dto.setStatus(a.getStatus());
        dto.setDetails(a.getDetails());
        dto.setCorrelationId(a.getCorrelationId());
        dto.setTimestamp(a.getTimestamp());
        return dto;
    }

    private SecurityEventDto toEventDto(SecurityEvent e) {
        SecurityEventDto dto = new SecurityEventDto();
        dto.setId(e.getId());
        dto.setEventType(e.getEventType());
        dto.setSeverity(e.getSeverity());
        dto.setUsername(e.getUsername());
        dto.setDescription(e.getDescription());
        dto.setReviewStatus(e.getReviewStatus());
        dto.setResolvedBy(e.getResolvedBy());
        dto.setCreatedAt(e.getCreatedAt());
        return dto;
    }
}
