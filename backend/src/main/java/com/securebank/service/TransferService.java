package com.securebank.service;

import com.securebank.dto.TransactionDto;
import com.securebank.dto.TransferRequest;
import com.securebank.entity.BankAccount;
import com.securebank.entity.LedgerEntry;
import com.securebank.entity.Transaction;
import com.securebank.entity.User;
import com.securebank.exception.InsufficientBalanceException;
import com.securebank.exception.RateLimitExceededException;
import com.securebank.exception.ResourceNotFoundException;
import com.securebank.exception.UnauthorizedAccessException;
import com.securebank.repository.BankAccountRepository;
import com.securebank.repository.LedgerEntryRepository;
import com.securebank.repository.TransactionRepository;
import com.securebank.repository.UserRepository;
import com.securebank.security.RateLimiterService;
import com.securebank.util.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;

@Service
public class TransferService {

    private static final Logger log = LoggerFactory.getLogger(TransferService.class);

    private final BankAccountRepository bankAccountRepository;
    private final TransactionRepository transactionRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final SecurityMonitoringService securityMonitoringService;
    private final NotificationService notificationService;
    private final RateLimiterService rateLimiterService;

    @Value("${securebank.transfer.max-per-transfer-amount:100000.00}")
    private BigDecimal maxPerTransferAmount;

    @Value("${securebank.transfer.daily-limit-amount:500000.00}")
    private BigDecimal dailyLimitAmount;

    @Value("${securebank.transfer.suspicious-amount-threshold:50000.00}")
    private BigDecimal suspiciousAmountThreshold;

    @Value("${securebank.transfer.velocity-window-minutes:10}")
    private int velocityWindowMinutes;

    @Value("${securebank.transfer.velocity-max-transfers:5}")
    private int velocityMaxTransfers;

    public TransferService(
            BankAccountRepository bankAccountRepository,
            TransactionRepository transactionRepository,
            LedgerEntryRepository ledgerEntryRepository,
            UserRepository userRepository,
            AuditService auditService,
            SecurityMonitoringService securityMonitoringService,
            NotificationService notificationService,
            RateLimiterService rateLimiterService
    ) {
        this.bankAccountRepository = bankAccountRepository;
        this.transactionRepository = transactionRepository;
        this.ledgerEntryRepository = ledgerEntryRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.securityMonitoringService = securityMonitoringService;
        this.notificationService = notificationService;
        this.rateLimiterService = rateLimiterService;
    }

    /**
     * Executes an atomic, double-entry financial transfer with strict pessimistic locking,
     * balance validation, limit enforcement, and idempotency protection.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class)
    public TransactionDto executeTransfer(String username, TransferRequest request) {
        User user = getUser(username);

        // 1. Rate limiting check
        if (!rateLimiterService.tryConsumeTransfer(user.getId())) {
            throw new RateLimitExceededException("Transfer rate limit exceeded. Please wait a minute before making another transfer.");
        }

        // 2. Idempotency Key check: prevent accidental duplicate charges
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            Optional<Transaction> existingTx = transactionRepository.findByIdempotencyKey(request.getIdempotencyKey().trim());
            if (existingTx.isPresent()) {
                log.info("Idempotent replay detected for key: {}", request.getIdempotencyKey());
                return toDto(existingTx.get(), request.getSourceAccountId());
            }
        }

        BigDecimal amount = request.getAmount();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Transfer amount must be strictly greater than zero.");
        }

        // 3. Enforce Per-Transfer Limit
        if (amount.compareTo(maxPerTransferAmount) > 0) {
            throw new IllegalArgumentException("Transfer amount exceeds the per-transaction limit of ₹" + maxPerTransferAmount);
        }

        // 4. Verify source account ownership (IDOR check)
        BankAccount sourceMeta = bankAccountRepository.findById(request.getSourceAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Source account not found."));

        if (!sourceMeta.getUser().getId().equals(user.getId())) {
            securityMonitoringService.recordEvent(
                    "IDOR_UNAUTHORIZED_TRANSFER_SOURCE",
                    "CRITICAL",
                    user,
                    username,
                    "Attempted transfer from unauthorized source account ID: " + request.getSourceAccountId()
            );
            auditService.logEvent(username, "UNAUTHORIZED_TRANSFER_ATTEMPT", "ACCOUNT:" + request.getSourceAccountId(), "127.0.0.1", "FAILURE", "IDOR attempt on source account", null);
            throw new UnauthorizedAccessException("You are not authorized to transfer funds from this account.");
        }

        // 5. Look up destination account
        BankAccount destMeta = bankAccountRepository.findByAccountNumber(request.getDestinationAccountNumber().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Destination account '" + request.getDestinationAccountNumber() + "' does not exist."));

        if (sourceMeta.getId().equals(destMeta.getId())) {
            throw new IllegalArgumentException("Source and destination accounts cannot be identical.");
        }

        if (!"ACTIVE".equalsIgnoreCase(destMeta.getStatus())) {
            throw new IllegalArgumentException("Destination account is currently frozen or inactive.");
        }

        // 6. Check Daily Limit
        OffsetDateTime oneDayAgo = OffsetDateTime.now().minusHours(24);
        BigDecimal todayTotal = transactionRepository.sumRecentCompletedTransfersByUser(user.getId(), oneDayAgo);
        if (todayTotal.add(amount).compareTo(dailyLimitAmount) > 0) {
            throw new IllegalArgumentException("Daily transfer limit of ₹" + dailyLimitAmount + " exceeded. Today's total: ₹" + todayTotal);
        }

        // 7. Deadlock-free Pessimistic Locking
        // Lock both accounts in deterministic order of their IDs
        Long firstId = Math.min(sourceMeta.getId(), destMeta.getId());
        Long secondId = Math.max(sourceMeta.getId(), destMeta.getId());

        BankAccount lockedFirst = bankAccountRepository.findByIdWithLock(firstId)
                .orElseThrow(() -> new ResourceNotFoundException("Account lock acquisition failed"));
        BankAccount lockedSecond = bankAccountRepository.findByIdWithLock(secondId)
                .orElseThrow(() -> new ResourceNotFoundException("Account lock acquisition failed"));

        BankAccount lockedSource = sourceMeta.getId().equals(firstId) ? lockedFirst : lockedSecond;
        BankAccount lockedDest = destMeta.getId().equals(firstId) ? lockedFirst : lockedSecond;

        // 8. Balance Check
        if (lockedSource.getBalance().compareTo(amount) < 0) {
            auditService.logEvent(username, "TRANSFER_FAILED_INSUFFICIENT_FUNDS", "ACCOUNT:" + lockedSource.getId(), "127.0.0.1", "FAILURE",
                    "Insufficient funds. Balance: " + lockedSource.getBalance() + ", Requested: " + amount, null);
            throw new InsufficientBalanceException("Insufficient account balance. Available: ₹" + lockedSource.getBalance());
        }

        // 9. Execute Double-Entry Balance Updates
        BigDecimal sourceNewBalance = lockedSource.getBalance().subtract(amount);
        BigDecimal destNewBalance = lockedDest.getBalance().add(amount);

        lockedSource.setBalance(sourceNewBalance);
        lockedDest.setBalance(destNewBalance);

        bankAccountRepository.save(lockedSource);
        bankAccountRepository.save(lockedDest);

        // 10. Record Transaction
        String txRef = SecurityUtils.generateReference("TXN");
        Transaction tx = new Transaction();
        tx.setTransactionReference(txRef);
        tx.setIdempotencyKey(request.getIdempotencyKey());
        tx.setSourceAccount(lockedSource);
        tx.setDestinationAccount(lockedDest);
        tx.setAmount(amount);
        tx.setCurrency(lockedSource.getCurrency());
        tx.setTransactionType("TRANSFER");
        tx.setStatus("COMPLETED");
        tx.setDescription(request.getDescription() != null && !request.getDescription().isBlank() ? request.getDescription().trim() : "Funds Transfer to " + lockedDest.getAccountNumber());
        Transaction savedTx = transactionRepository.save(tx);

        // 11. Record Double-Entry Ledger Entries
        // Debit Source
        LedgerEntry debitEntry = new LedgerEntry();
        debitEntry.setTransaction(savedTx);
        debitEntry.setAccount(lockedSource);
        debitEntry.setEntryType("DEBIT");
        debitEntry.setAmount(amount);
        debitEntry.setBalanceAfter(sourceNewBalance);
        debitEntry.setDescription("Debit for transfer " + txRef + " to " + lockedDest.getAccountNumber());
        ledgerEntryRepository.save(debitEntry);

        // Credit Destination
        LedgerEntry creditEntry = new LedgerEntry();
        creditEntry.setTransaction(savedTx);
        creditEntry.setAccount(lockedDest);
        creditEntry.setEntryType("CREDIT");
        creditEntry.setAmount(amount);
        creditEntry.setBalanceAfter(destNewBalance);
        creditEntry.setDescription("Credit from transfer " + txRef + " from " + lockedSource.getAccountNumber());
        ledgerEntryRepository.save(creditEntry);

        // 12. Security Rule Checks (Velocity & Large Amount Monitoring)
        if (amount.compareTo(suspiciousAmountThreshold) >= 0) {
            securityMonitoringService.recordEvent(
                    "LARGE_TRANSFER_ALERT",
                    "MEDIUM",
                    user,
                    username,
                    "High-value transfer of ₹" + amount + " to account " + lockedDest.getAccountNumber() + " [Ref: " + txRef + "]"
            );
        }

        OffsetDateTime velocityWindow = OffsetDateTime.now().minusMinutes(velocityWindowMinutes);
        long recentCount = transactionRepository.countRecentTransfersByUser(user.getId(), velocityWindow);
        if (recentCount >= velocityMaxTransfers) {
            securityMonitoringService.recordEvent(
                    "SUSPICIOUS_TRANSFER_VELOCITY",
                    "HIGH",
                    user,
                    username,
                    "High velocity: " + recentCount + " transfers in past " + velocityWindowMinutes + " minutes [Ref: " + txRef + "]"
            );
        }

        // 13. Audit and Notifications
        auditService.logEvent(username, "TRANSFER_COMPLETED", "TX:" + txRef, "127.0.0.1", "SUCCESS",
                "Transferred ₹" + amount + " from " + lockedSource.getAccountNumber() + " to " + lockedDest.getAccountNumber(), txRef);

        notificationService.createNotification(user, "Debit Alert",
                "₹" + amount + " debited from " + lockedSource.getAccountNumber() + ". New Balance: ₹" + sourceNewBalance, "TRANSACTION");

        if (!lockedDest.getUser().getId().equals(user.getId())) {
            notificationService.createNotification(lockedDest.getUser(), "Credit Alert",
                    "₹" + amount + " credited to " + lockedDest.getAccountNumber() + " from " + user.getFirstName() + " " + user.getLastName() + ". New Balance: ₹" + destNewBalance, "TRANSACTION");
        }

        return toDto(savedTx, lockedSource.getId());
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    private TransactionDto toDto(Transaction tx, Long viewingAccountId) {
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

        boolean isDebit = tx.getSourceAccount() != null && tx.getSourceAccount().getId().equals(viewingAccountId);
        dto.setDebit(isDebit);

        return dto;
    }
}
