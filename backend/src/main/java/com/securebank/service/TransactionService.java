package com.securebank.service;

import com.securebank.dto.LedgerEntryDto;
import com.securebank.dto.TransactionDto;
import com.securebank.entity.LedgerEntry;
import com.securebank.entity.Transaction;
import com.securebank.entity.User;
import com.securebank.exception.ResourceNotFoundException;
import com.securebank.exception.UnauthorizedAccessException;
import com.securebank.repository.LedgerEntryRepository;
import com.securebank.repository.TransactionRepository;
import com.securebank.repository.UserRepository;
import com.securebank.util.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public TransactionService(
            TransactionRepository transactionRepository,
            LedgerEntryRepository ledgerEntryRepository,
            UserRepository userRepository,
            AuditService auditService
    ) {
        this.transactionRepository = transactionRepository;
        this.ledgerEntryRepository = ledgerEntryRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<TransactionDto> getUserTransactions(
            String username,
            String type,
            String status,
            OffsetDateTime startDate,
            OffsetDateTime endDate,
            int page,
            int size
    ) {
        User user = getUser(username);
        Pageable pageable = PageRequest.of(page, size);

        Page<Transaction> txPage = transactionRepository.filterUserTransactions(
                user.getId(),
                type != null && !type.isBlank() ? type.trim() : null,
                status != null && !status.isBlank() ? status.trim() : null,
                startDate,
                endDate,
                pageable
        );

        return txPage.map(tx -> toDto(tx, user.getId()));
    }

    @Transactional(readOnly = true)
    public TransactionDto getTransactionById(Long transactionId, String username) {
        User user = getUser(username);

        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction with ID " + transactionId + " not found."));

        // IDOR Check: User must be either the sender or receiver
        boolean isSender = tx.getSourceAccount() != null && tx.getSourceAccount().getUser().getId().equals(user.getId());
        boolean isReceiver = tx.getDestinationAccount() != null && tx.getDestinationAccount().getUser().getId().equals(user.getId());

        if (!isSender && !isReceiver) {
            auditService.logEvent(username, "UNAUTHORIZED_TRANSACTION_VIEW", "TX:" + transactionId, "127.0.0.1", "FAILURE", "IDOR attempt on transaction detail", null);
            throw new UnauthorizedAccessException("You are not authorized to view this transaction.");
        }

        return toDto(tx, user.getId());
    }

    @Transactional(readOnly = true)
    public List<LedgerEntryDto> getTransactionLedgerEntries(Long transactionId, String username) {
        // Enforce transaction ownership verification first
        getTransactionById(transactionId, username);

        List<LedgerEntry> entries = ledgerEntryRepository.findByTransactionId(transactionId);
        return entries.stream().map(this::toLedgerDto).toList();
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    private TransactionDto toDto(Transaction tx, Long userId) {
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

        boolean isDebit = tx.getSourceAccount() != null && tx.getSourceAccount().getUser().getId().equals(userId);
        dto.setDebit(isDebit);

        return dto;
    }

    private LedgerEntryDto toLedgerDto(LedgerEntry entry) {
        LedgerEntryDto dto = new LedgerEntryDto();
        dto.setId(entry.getId());
        dto.setTransactionReference(entry.getTransaction().getTransactionReference());
        dto.setAccountNumber(entry.getAccount().getAccountNumber());
        dto.setEntryType(entry.getEntryType());
        dto.setAmount(entry.getAmount());
        dto.setBalanceAfter(entry.getBalanceAfter());
        dto.setDescription(entry.getDescription());
        dto.setCreatedAt(entry.getCreatedAt());
        return dto;
    }
}
