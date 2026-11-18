package com.securebank.service;

import com.securebank.dto.BankAccountDto;
import com.securebank.dto.TransactionDto;
import com.securebank.entity.BankAccount;
import com.securebank.entity.Transaction;
import com.securebank.entity.User;
import com.securebank.exception.ResourceNotFoundException;
import com.securebank.exception.UnauthorizedAccessException;
import com.securebank.repository.BankAccountRepository;
import com.securebank.repository.TransactionRepository;
import com.securebank.repository.UserRepository;
import com.securebank.util.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AccountService {

    private final BankAccountRepository bankAccountRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final SecurityMonitoringService securityMonitoringService;
    private final AuditService auditService;

    public AccountService(
            BankAccountRepository bankAccountRepository,
            TransactionRepository transactionRepository,
            UserRepository userRepository,
            SecurityMonitoringService securityMonitoringService,
            AuditService auditService
    ) {
        this.bankAccountRepository = bankAccountRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.securityMonitoringService = securityMonitoringService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<BankAccountDto> getUserAccounts(String username) {
        User user = getUser(username);
        return bankAccountRepository.findByUserId(user.getId()).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public BankAccountDto getAccountById(Long accountId, String username) {
        User user = getUser(username);

        // IDOR Protection: Check database by account ID and user ID
        BankAccount account = bankAccountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Bank account with ID " + accountId + " not found."));

        if (!account.getUser().getId().equals(user.getId())) {
            // Log security event for IDOR attempt
            securityMonitoringService.recordEvent(
                    "IDOR_UNAUTHORIZED_ACCOUNT_ACCESS",
                    "CRITICAL",
                    user,
                    username,
                    "User attempted to access unauthorized bank account ID: " + accountId
            );
            auditService.logEvent(username, "IDOR_ATTEMPT", "ACCOUNT:" + accountId, "127.0.0.1", "FAILURE", "Cross-account access blocked", null);
            throw new UnauthorizedAccessException("You are not authorized to view or manage this bank account.");
        }

        return toDto(account);
    }

    @Transactional(readOnly = true)
    public List<TransactionDto> getAccountTransactions(Long accountId, String username) {
        // Enforce ownership check before querying transactions
        getAccountById(accountId, username);

        List<Transaction> transactions = transactionRepository.findByAccountId(accountId);
        return transactions.stream()
                .map(tx -> toTransactionDto(tx, accountId))
                .toList();
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    public BankAccountDto toDto(BankAccount a) {
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
    }

    private TransactionDto toTransactionDto(Transaction tx, Long viewingAccountId) {
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
