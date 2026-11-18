package com.securebank.account;

import com.securebank.dto.BankAccountDto;
import com.securebank.entity.BankAccount;
import com.securebank.entity.User;
import com.securebank.exception.UnauthorizedAccessException;
import com.securebank.repository.BankAccountRepository;
import com.securebank.repository.TransactionRepository;
import com.securebank.repository.UserRepository;
import com.securebank.service.AccountService;
import com.securebank.service.AuditService;
import com.securebank.service.SecurityMonitoringService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AccountSecurityTest {

    @Mock private BankAccountRepository bankAccountRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private UserRepository userRepository;
    @Mock private SecurityMonitoringService securityMonitoringService;
    @Mock private AuditService auditService;

    private AccountService accountService;
    private User alice;
    private User bob;
    private BankAccount aliceAccount;
    private BankAccount bobAccount;

    @BeforeEach
    void setUp() {
        accountService = new AccountService(
                bankAccountRepository,
                transactionRepository,
                userRepository,
                securityMonitoringService,
                auditService
        );

        alice = new User();
        alice.setId(1L);
        alice.setUsername("alice@securebank.com");

        bob = new User();
        bob.setId(2L);
        bob.setUsername("bob@securebank.com");

        aliceAccount = new BankAccount();
        aliceAccount.setId(10L);
        aliceAccount.setUser(alice);
        aliceAccount.setAccountNumber("SB-1001-SAVINGS");
        aliceAccount.setBalance(new BigDecimal("10000.00"));
        aliceAccount.setStatus("ACTIVE");

        bobAccount = new BankAccount();
        bobAccount.setId(20L);
        bobAccount.setUser(bob);
        bobAccount.setAccountNumber("SB-1002-SAVINGS");
        bobAccount.setBalance(new BigDecimal("5000.00"));
        bobAccount.setStatus("ACTIVE");
    }

    @Test
    @DisplayName("Should allow customer to view their own bank account")
    void viewOwnAccountSuccess() {
        when(userRepository.findByUsername("alice@securebank.com")).thenReturn(Optional.of(alice));
        when(bankAccountRepository.findById(10L)).thenReturn(Optional.of(aliceAccount));

        BankAccountDto dto = accountService.getAccountById(10L, "alice@securebank.com");

        assertNotNull(dto);
        assertEquals("SB-1001-SAVINGS", dto.getAccountNumber());
        assertTrue(dto.getMaskedAccountNumber().startsWith("••••-••••-"));
    }

    @Test
    @DisplayName("Should detect and block IDOR attack when customer attempts to access another customer's account")
    void blockIdorUnauthorizedAccountAccess() {
        when(userRepository.findByUsername("alice@securebank.com")).thenReturn(Optional.of(alice));
        // Alice requests account 20L (which belongs to Bob!)
        when(bankAccountRepository.findById(20L)).thenReturn(Optional.of(bobAccount));

        assertThrows(UnauthorizedAccessException.class, () -> accountService.getAccountById(20L, "alice@securebank.com"));

        // Verify security event triggered with CRITICAL severity
        verify(securityMonitoringService).recordEvent(
                eq("IDOR_UNAUTHORIZED_ACCOUNT_ACCESS"),
                eq("CRITICAL"),
                eq(alice),
                eq("alice@securebank.com"),
                contains("unauthorized bank account ID: 20")
        );
    }
}
