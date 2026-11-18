package com.securebank.service;

import com.securebank.dto.*;
import com.securebank.entity.*;
import org.springframework.security.authentication.BadCredentialsException;
import com.securebank.exception.ResourceNotFoundException;
import com.securebank.exception.UnauthorizedAccessException;
import com.securebank.repository.*;
import com.securebank.security.AesEncryptionService;
import com.securebank.security.TotpService;
import com.securebank.util.SecurityUtils;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final BankAccountRepository bankAccountRepository;
    private final BeneficiaryRepository beneficiaryRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationRepository notificationRepository;
    private final UserSessionRepository userSessionRepository;
    private final LoginAttemptRepository loginAttemptRepository;
    private final MfaSettingRepository mfaSettingRepository;
    private final RecoveryCodeRepository recoveryCodeRepository;
    private final TotpService totpService;
    private final AesEncryptionService aesEncryptionService;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public ProfileService(
            UserRepository userRepository,
            BankAccountRepository bankAccountRepository,
            BeneficiaryRepository beneficiaryRepository,
            TransactionRepository transactionRepository,
            NotificationRepository notificationRepository,
            UserSessionRepository userSessionRepository,
            LoginAttemptRepository loginAttemptRepository,
            MfaSettingRepository mfaSettingRepository,
            RecoveryCodeRepository recoveryCodeRepository,
            TotpService totpService,
            AesEncryptionService aesEncryptionService,
            PasswordEncoder passwordEncoder,
            AuditService auditService
    ) {
        this.userRepository = userRepository;
        this.bankAccountRepository = bankAccountRepository;
        this.beneficiaryRepository = beneficiaryRepository;
        this.transactionRepository = transactionRepository;
        this.notificationRepository = notificationRepository;
        this.userSessionRepository = userSessionRepository;
        this.loginAttemptRepository = loginAttemptRepository;
        this.mfaSettingRepository = mfaSettingRepository;
        this.recoveryCodeRepository = recoveryCodeRepository;
        this.totpService = totpService;
        this.aesEncryptionService = aesEncryptionService;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public UserDto getProfile(String username) {
        return toDto(getUser(username));
    }

    @Transactional
    public UserDto updateProfile(String username, ProfileUpdateRequest request) {
        User user = getUser(username);
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);

        User saved = userRepository.save(user);
        auditService.logEvent(username, "PROFILE_UPDATED", "USER:" + user.getId(), "127.0.0.1", "SUCCESS", "Profile details updated", null);
        return toDto(saved);
    }

    @Transactional
    public MfaSetupResponse setupMfa(String username) {
        User user = getUser(username);
        String secret = totpService.generateSecret();
        String encryptedSecret = aesEncryptionService.encrypt(secret);

        MfaSetting setting = mfaSettingRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    MfaSetting s = new MfaSetting();
                    s.setUser(user);
                    return s;
                });
        setting.setSecretKeyEncrypted(encryptedSecret);
        setting.setVerified(false);
        mfaSettingRepository.save(setting);

        // Generate recovery codes
        recoveryCodeRepository.deleteByUserId(user.getId());
        List<String> rawCodes = totpService.generateRecoveryCodes(8);
        for (String code : rawCodes) {
            RecoveryCode rc = new RecoveryCode();
            rc.setUser(user);
            rc.setCodeHash(passwordEncoder.encode(code));
            rc.setUsed(false);
            recoveryCodeRepository.save(rc);
        }

        String qrCodeDataUri = totpService.generateQrCodeDataUri(user.getUsername(), secret);
        auditService.logEvent(username, "MFA_SETUP_INITIATED", "MFA", "127.0.0.1", "SUCCESS", "Generated new TOTP secret & QR", null);

        return new MfaSetupResponse(secret, qrCodeDataUri, rawCodes);
    }

    @Transactional
    public void enableMfa(String username, String code) {
        User user = getUser(username);
        MfaSetting setting = mfaSettingRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("MFA setup not initiated."));

        String secret = aesEncryptionService.decrypt(setting.getSecretKeyEncrypted());
        if (!totpService.verifyCode(secret, code)) {
            auditService.logEvent(username, "MFA_ENABLE_FAILED", "MFA", "127.0.0.1", "FAILURE", "Invalid verification code", null);
            throw new BadCredentialsException("Invalid authentication code. Please check your authenticator app and try again.");
        }

        setting.setVerified(true);
        mfaSettingRepository.save(setting);

        user.setMfaEnabled(true);
        userRepository.save(user);

        auditService.logEvent(username, "MFA_ENABLED", "MFA", "127.0.0.1", "SUCCESS", "Two-factor authentication activated", null);
    }

    @Transactional
    public void disableMfa(String username, String password) {
        User user = getUser(username);
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            auditService.logEvent(username, "MFA_DISABLE_FAILED", "MFA", "127.0.0.1", "FAILURE", "Incorrect password", null);
            throw new BadCredentialsException("Incorrect password. MFA could not be disabled.");
        }

        user.setMfaEnabled(false);
        userRepository.save(user);

        mfaSettingRepository.findByUserId(user.getId()).ifPresent(setting -> {
            setting.setVerified(false);
            mfaSettingRepository.save(setting);
        });

        recoveryCodeRepository.deleteByUserId(user.getId());
        auditService.logEvent(username, "MFA_DISABLED", "MFA", "127.0.0.1", "SUCCESS", "Two-factor authentication disabled", null);
    }

    @Transactional(readOnly = true)
    public List<UserSessionDto> getActiveSessions(String username, String currentSessionId) {
        User user = getUser(username);
        List<UserSession> sessions = userSessionRepository.findByUserIdAndActiveTrue(user.getId());
        return sessions.stream().map(s -> {
            UserSessionDto dto = new UserSessionDto();
            dto.setId(s.getId());
            dto.setSessionId(s.getSessionId());
            dto.setIpAddress(s.getIpAddress());
            dto.setUserAgent(s.getUserAgent());
            dto.setLastActivity(s.getLastActivity());
            dto.setCreatedAt(s.getCreatedAt());
            dto.setCurrent(s.getSessionId().equals(currentSessionId));
            return dto;
        }).toList();
    }

    @Transactional
    public void revokeSession(String username, Long sessionId) {
        User user = getUser(username);
        UserSession session = userSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedAccessException("Unauthorized session revocation attempt.");
        }

        session.setActive(false);
        userSessionRepository.save(session);
        auditService.logEvent(username, "SESSION_REVOKED", "SESSION:" + sessionId, "127.0.0.1", "SUCCESS", "Terminated session", null);
    }

    @Transactional(readOnly = true)
    public List<LoginAttemptDto> getLoginHistory(String username) {
        return loginAttemptRepository.findByEmailOrderByAttemptTimeDesc(username, PageRequest.of(0, 20)).stream()
                .map(la -> {
                    LoginAttemptDto dto = new LoginAttemptDto();
                    dto.setId(la.getId());
                    dto.setEmail(la.getEmail());
                    dto.setIpAddress(la.getIpAddress());
                    dto.setUserAgent(la.getUserAgent());
                    dto.setSuccess(la.isSuccess());
                    dto.setFailureReason(la.getFailureReason());
                    dto.setAttemptTime(la.getAttemptTime());
                    return dto;
                }).toList();
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDto getDashboardSummary(String username) {
        User user = getUser(username);
        List<BankAccount> accounts = bankAccountRepository.findByUserId(user.getId());

        BigDecimal total = BigDecimal.ZERO;
        BigDecimal savings = BigDecimal.ZERO;
        BigDecimal current = BigDecimal.ZERO;

        for (BankAccount a : accounts) {
            total = total.add(a.getBalance());
            if ("SAVINGS".equalsIgnoreCase(a.getAccountType())) {
                savings = savings.add(a.getBalance());
            } else if ("CURRENT".equalsIgnoreCase(a.getAccountType())) {
                current = current.add(a.getBalance());
            }
        }

        DashboardSummaryDto summary = new DashboardSummaryDto();
        summary.setTotalBalance(total);
        summary.setSavingsBalance(savings);
        summary.setCurrentBalance(current);
        summary.setActiveAccountsCount(accounts.size());
        summary.setBeneficiariesCount(beneficiaryRepository.findByUserId(user.getId()).size());
        summary.setUnreadNotificationsCount(notificationRepository.countByUserIdAndReadFalse(user.getId()));
        summary.setMfaEnabled(user.isMfaEnabled());
        summary.setSecurityScore(user.isMfaEnabled() ? "95% (Strong)" : "65% (Enable 2FA for High Security)");

        // Monthly income & expenses calculation from double-entry ledger in last 30 days
        OffsetDateTime thirtyDaysAgo = OffsetDateTime.now().minusDays(30);
        BigDecimal monthlyExpenses = transactionRepository.sumRecentCompletedTransfersByUser(user.getId(), thirtyDaysAgo);
        summary.setMonthlyExpenses(monthlyExpenses);
        summary.setMonthlyIncome(new BigDecimal("15000.00")); // simulated monthly baseline

        // Recent 5 transactions
        List<TransactionDto> recentTx = transactionRepository.findUserTransactions(user.getId(), PageRequest.of(0, 5))
                .getContent().stream()
                .map(tx -> {
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
                    dto.setCreatedAt(tx.getCreatedAt());
                    dto.setDebit(tx.getSourceAccount() != null && tx.getSourceAccount().getUser().getId().equals(user.getId()));
                    return dto;
                }).toList();
        summary.setRecentTransactions(recentTx);

        summary.setAccounts(accounts.stream().map(a -> {
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
        }).toList());

        return summary;
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    private UserDto toDto(User user) {
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
}
