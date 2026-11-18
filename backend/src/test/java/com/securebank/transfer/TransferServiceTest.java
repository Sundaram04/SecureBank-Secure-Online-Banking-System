package com.securebank.transfer;

import com.securebank.dto.TransactionDto;
import com.securebank.dto.TransferRequest;
import com.securebank.entity.BankAccount;
import com.securebank.entity.LedgerEntry;
import com.securebank.entity.Transaction;
import com.securebank.entity.User;
import com.securebank.exception.InsufficientBalanceException;
import com.securebank.exception.UnauthorizedAccessException;
import com.securebank.repository.BankAccountRepository;
import com.securebank.repository.LedgerEntryRepository;
import com.securebank.repository.TransactionRepository;
import com.securebank.repository.UserRepository;
import com.securebank.security.RateLimiterService;
import com.securebank.service.AuditService;
import com.securebank.service.NotificationService;
import com.securebank.service.SecurityMonitoringService;
import com.securebank.service.TransferService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TransferServiceTest {

    @Mock private BankAccountRepository bankAccountRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private LedgerEntryRepository ledgerEntryRepository;
    @Mock private UserRepository userRepository;
    @Mock private AuditService auditService;
    @Mock private SecurityMonitoringService securityMonitoringService;
    @Mock private NotificationService notificationService;
    @Mock private RateLimiterService rateLimiterService;

    private TransferService transferService;

    private User alice;
    private User bob;
    private BankAccount aliceAccount;
    private BankAccount bobAccount;

    @BeforeEach
    void setUp() {
        transferService = new TransferService(
                bankAccountRepository,
                transactionRepository,
                ledgerEntryRepository,
                userRepository,
                auditService,
                securityMonitoringService,
                notificationService,
                rateLimiterService
        );

        ReflectionTestUtils.setField(transferService, "maxPerTransferAmount", new BigDecimal("100000.00"));
        ReflectionTestUtils.setField(transferService, "dailyLimitAmount", new BigDecimal("500000.00"));
        ReflectionTestUtils.setField(transferService, "suspiciousAmountThreshold", new BigDecimal("50000.00"));
        ReflectionTestUtils.setField(transferService, "velocityWindowMinutes", 10);
        ReflectionTestUtils.setField(transferService, "velocityMaxTransfers", 5);

        alice = new User();
        alice.setId(1L);
        alice.setUsername("alice@securebank.com");
        alice.setFirstName("Alice");
        alice.setLastName("Sharma");

        bob = new User();
        bob.setId(2L);
        bob.setUsername("bob@securebank.com");
        bob.setFirstName("Bob");
        bob.setLastName("Verma");

        aliceAccount = new BankAccount();
        aliceAccount.setId(10L);
        aliceAccount.setUser(alice);
        aliceAccount.setAccountNumber("SB-1001-SAVINGS");
        aliceAccount.setBalance(new BigDecimal("10000.0000"));
        aliceAccount.setStatus("ACTIVE");

        bobAccount = new BankAccount();
        bobAccount.setId(20L);
        bobAccount.setUser(bob);
        bobAccount.setAccountNumber("SB-1002-SAVINGS");
        bobAccount.setBalance(new BigDecimal("5000.0000"));
        bobAccount.setStatus("ACTIVE");

        lenient().when(rateLimiterService.tryConsumeTransfer(anyLong())).thenReturn(true);
        lenient().when(userRepository.findByUsername("alice@securebank.com")).thenReturn(Optional.of(alice));
    }

    @Test
    @DisplayName("Should successfully execute atomic transfer with double-entry ledger bookkeeping")
    void executeTransferSuccess() {
        TransferRequest request = new TransferRequest();
        request.setSourceAccountId(10L);
        request.setDestinationAccountNumber("SB-1002-SAVINGS");
        request.setAmount(new BigDecimal("2000.00"));
        request.setDescription("Rent payment");

        when(bankAccountRepository.findById(10L)).thenReturn(Optional.of(aliceAccount));
        when(bankAccountRepository.findByAccountNumber("SB-1002-SAVINGS")).thenReturn(Optional.of(bobAccount));
        when(transactionRepository.sumRecentCompletedTransfersByUser(eq(1L), any())).thenReturn(BigDecimal.ZERO);

        // Pessimistic locking mocks
        when(bankAccountRepository.findByIdWithLock(10L)).thenReturn(Optional.of(aliceAccount));
        when(bankAccountRepository.findByIdWithLock(20L)).thenReturn(Optional.of(bobAccount));

        when(transactionRepository.save(any(Transaction.class))).thenAnswer(i -> {
            Transaction t = i.getArgument(0);
            t.setId(100L);
            return t;
        });

        TransactionDto result = transferService.executeTransfer("alice@securebank.com", request);

        assertNotNull(result);
        assertEquals(new BigDecimal("2000.00"), result.getAmount());
        assertEquals("COMPLETED", result.getStatus());

        // Verify balances after double-entry operation
        assertEquals(new BigDecimal("8000.0000"), aliceAccount.getBalance());
        assertEquals(new BigDecimal("7000.0000"), bobAccount.getBalance());

        // Verify double-entry ledger records (1 DEBIT, 1 CREDIT)
        ArgumentCaptor<LedgerEntry> ledgerCaptor = ArgumentCaptor.forClass(LedgerEntry.class);
        verify(ledgerEntryRepository, times(2)).save(ledgerCaptor.capture());

        var entries = ledgerCaptor.getAllValues();
        assertEquals("DEBIT", entries.get(0).getEntryType());
        assertEquals(new BigDecimal("2000.00"), entries.get(0).getAmount());
        assertEquals(new BigDecimal("8000.0000"), entries.get(0).getBalanceAfter());

        assertEquals("CREDIT", entries.get(1).getEntryType());
        assertEquals(new BigDecimal("2000.00"), entries.get(1).getAmount());
        assertEquals(new BigDecimal("7000.0000"), entries.get(1).getBalanceAfter());
    }

    @Test
    @DisplayName("Should reject transfer when source account has insufficient balance")
    void executeTransferInsufficientBalance() {
        TransferRequest request = new TransferRequest();
        request.setSourceAccountId(10L);
        request.setDestinationAccountNumber("SB-1002-SAVINGS");
        request.setAmount(new BigDecimal("15000.00")); // More than 10,000 available

        when(bankAccountRepository.findById(10L)).thenReturn(Optional.of(aliceAccount));
        when(bankAccountRepository.findByAccountNumber("SB-1002-SAVINGS")).thenReturn(Optional.of(bobAccount));
        when(transactionRepository.sumRecentCompletedTransfersByUser(eq(1L), any())).thenReturn(BigDecimal.ZERO);
        when(bankAccountRepository.findByIdWithLock(10L)).thenReturn(Optional.of(aliceAccount));
        when(bankAccountRepository.findByIdWithLock(20L)).thenReturn(Optional.of(bobAccount));

        assertThrows(InsufficientBalanceException.class, () -> transferService.executeTransfer("alice@securebank.com", request));
        // Balances should remain untouched
        assertEquals(new BigDecimal("10000.0000"), aliceAccount.getBalance());
        assertEquals(new BigDecimal("5000.0000"), bobAccount.getBalance());
        verify(transactionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should block IDOR attack when caller attempts transfer from account they do not own")
    void executeTransferIdorBlocked() {
        TransferRequest request = new TransferRequest();
        request.setSourceAccountId(20L); // Bob's account ID!
        request.setDestinationAccountNumber("SB-1001-SAVINGS");
        request.setAmount(new BigDecimal("1000.00"));

        when(bankAccountRepository.findById(20L)).thenReturn(Optional.of(bobAccount)); // Bob's account is not owned by Alice

        assertThrows(UnauthorizedAccessException.class, () -> transferService.executeTransfer("alice@securebank.com", request));
        verify(securityMonitoringService).recordEvent(eq("IDOR_UNAUTHORIZED_TRANSFER_SOURCE"), eq("CRITICAL"), any(), anyString(), anyString());
    }

    @Test
    @DisplayName("Should return existing transaction on duplicate idempotency key without duplicate debits")
    void executeTransferIdempotencyProtection() {
        TransferRequest request = new TransferRequest();
        request.setSourceAccountId(10L);
        request.setDestinationAccountNumber("SB-1002-SAVINGS");
        request.setAmount(new BigDecimal("500.00"));
        request.setIdempotencyKey("KEY-12345");

        Transaction existing = new Transaction();
        existing.setId(99L);
        existing.setTransactionReference("TXN-ALREADY-EXISTS");
        existing.setIdempotencyKey("KEY-12345");
        existing.setAmount(new BigDecimal("500.00"));
        existing.setStatus("COMPLETED");
        existing.setSourceAccount(aliceAccount);
        existing.setDestinationAccount(bobAccount);

        when(transactionRepository.findByIdempotencyKey("KEY-12345")).thenReturn(Optional.of(existing));

        TransactionDto result = transferService.executeTransfer("alice@securebank.com", request);

        assertEquals("TXN-ALREADY-EXISTS", result.getTransactionReference());
        verify(bankAccountRepository, never()).save(any());
        verify(ledgerEntryRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should reject negative or zero amount transfers")
    void executeTransferNegativeAmount() {
        TransferRequest request = new TransferRequest();
        request.setSourceAccountId(10L);
        request.setDestinationAccountNumber("SB-1002-SAVINGS");
        request.setAmount(new BigDecimal("-50.00"));

        assertThrows(IllegalArgumentException.class, () -> transferService.executeTransfer("alice@securebank.com", request));
    }
}
