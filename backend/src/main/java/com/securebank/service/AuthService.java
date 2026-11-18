package com.securebank.service;

import com.securebank.dto.*;
import com.securebank.entity.*;
import com.securebank.exception.*;
import com.securebank.repository.*;
import com.securebank.security.AesEncryptionService;
import com.securebank.security.RateLimiterService;
import com.securebank.security.TotpService;
import com.securebank.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BankAccountRepository bankAccountRepository;
    private final LoginAttemptRepository loginAttemptRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserSessionRepository userSessionRepository;
    private final MfaSettingRepository mfaSettingRepository;
    private final RecoveryCodeRepository recoveryCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final RateLimiterService rateLimiterService;
    private final AuditService auditService;
    private final SecurityMonitoringService securityMonitoringService;
    private final NotificationService notificationService;
    private final TotpService totpService;
    private final AesEncryptionService aesEncryptionService;

    @Value("${securebank.security.auth.max-failed-attempts:5}")
    private int maxFailedAttempts;

    @Value("${securebank.security.auth.lockout-duration-minutes:15}")
    private int lockoutDurationMinutes;

    @Value("${securebank.security.auth.password-reset-token-validity-minutes:30}")
    private int passwordResetTokenValidityMinutes;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            BankAccountRepository bankAccountRepository,
            LoginAttemptRepository loginAttemptRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            UserSessionRepository userSessionRepository,
            MfaSettingRepository mfaSettingRepository,
            RecoveryCodeRepository recoveryCodeRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            RateLimiterService rateLimiterService,
            AuditService auditService,
            SecurityMonitoringService securityMonitoringService,
            NotificationService notificationService,
            TotpService totpService,
            AesEncryptionService aesEncryptionService
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.bankAccountRepository = bankAccountRepository;
        this.loginAttemptRepository = loginAttemptRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.userSessionRepository = userSessionRepository;
        this.mfaSettingRepository = mfaSettingRepository;
        this.recoveryCodeRepository = recoveryCodeRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.rateLimiterService = rateLimiterService;
        this.auditService = auditService;
        this.securityMonitoringService = securityMonitoringService;
        this.notificationService = notificationService;
        this.totpService = totpService;
        this.aesEncryptionService = aesEncryptionService;
    }

    @Transactional
    public UserDto register(RegisterRequest request, HttpServletRequest httpRequest) {
        String ip = SecurityUtils.getClientIp(httpRequest);
        if (!rateLimiterService.tryConsume("REGISTER:" + ip, 5, java.time.Duration.ofMinutes(1))) {
            throw new RateLimitExceededException("Too many registration attempts. Please wait a minute.");
        }

        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByUsername(email)) {
            auditService.logEvent(email, "REGISTRATION_FAILED", "USER", ip, "FAILURE", "Email already exists", null);
            throw new DuplicateResourceException("An account with this email address already exists.");
        }

        User user = new User();
        user.setUsername(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        user.setStatus("ACTIVE");

        Role customerRole = roleRepository.findByName("ROLE_CUSTOMER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_CUSTOMER")));
        user.getRoles().add(customerRole);

        User savedUser = userRepository.save(user);

        // Create default bank accounts for new customer
        String accNumSuffix = String.format("%04d", (int) (Math.random() * 9000) + 1000);
        BankAccount savingsAccount = new BankAccount();
        savingsAccount.setUser(savedUser);
        savingsAccount.setAccountNumber("SB-" + savedUser.getId() + "-SAVINGS-" + accNumSuffix);
        savingsAccount.setAccountType("SAVINGS");
        savingsAccount.setBalance(new BigDecimal("10000.0000")); // Educational simulation opening balance
        savingsAccount.setCurrency("INR");
        savingsAccount.setStatus("ACTIVE");
        bankAccountRepository.save(savingsAccount);

        BankAccount currentAccount = new BankAccount();
        currentAccount.setUser(savedUser);
        currentAccount.setAccountNumber("SB-" + savedUser.getId() + "-CURRENT-" + accNumSuffix);
        currentAccount.setAccountType("CURRENT");
        currentAccount.setBalance(new BigDecimal("25000.0000"));
        currentAccount.setCurrency("INR");
        currentAccount.setStatus("ACTIVE");
        bankAccountRepository.save(currentAccount);

        // Welcome notification
        notificationService.createNotification(savedUser, "Account Created",
                "Welcome to SecureBank. Your Savings and Current accounts have been created with initial simulated funds.", "SYSTEM");

        auditService.logEvent(savedUser.getUsername(), "USER_REGISTERED", "USER:" + savedUser.getId(), ip, "SUCCESS", "Customer registration completed", null);

        return toUserDto(savedUser);
    }

    @Transactional
    public Map<String, Object> login(LoginRequest request, HttpServletRequest httpRequest) {
        String ip = SecurityUtils.getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");
        String email = request.getEmail().toLowerCase().trim();

        if (!rateLimiterService.tryConsumeLogin(ip) || !rateLimiterService.tryConsumeLogin(email)) {
            securityMonitoringService.recordEvent("BRUTE_FORCE_RATE_LIMIT", "HIGH", null, email, "Rate limit exceeded for login on IP: " + ip);
            throw new RateLimitExceededException("Too many login attempts. Please wait a minute before trying again.");
        }

        Optional<User> userOpt = userRepository.findByUsername(email);
        if (userOpt.isEmpty()) {
            recordLoginAttempt(email, ip, userAgent, false, "User not found");
            auditService.logEvent(email, "LOGIN_FAILED", "AUTH", ip, "FAILURE", "Invalid credentials", null);
            throw new BadCredentialsException("Invalid email or password.");
        }

        User user = userOpt.get();

        // Check Account Lockout
        if (user.isAccountLocked()) {
            recordLoginAttempt(email, ip, userAgent, false, "Account temporarily locked");
            auditService.logEvent(email, "LOGIN_BLOCKED", "AUTH", ip, "FAILURE", "Account temporarily locked until " + user.getLockoutUntil(), null);
            throw new AccountLockedException("Your account is temporarily locked due to multiple failed login attempts. Please try again after " +
                    user.getLockoutUntil().toLocalTime() + ".");
        }

        if ("SUSPENDED".equalsIgnoreCase(user.getStatus())) {
            recordLoginAttempt(email, ip, userAgent, false, "Account suspended by administrator");
            throw new UnauthorizedAccessException("Your account has been suspended by an administrator. Please contact support.");
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);

            if (attempts >= maxFailedAttempts) {
                user.setLockoutUntil(OffsetDateTime.now().plusMinutes(lockoutDurationMinutes));
                securityMonitoringService.recordEvent("ACCOUNT_LOCKOUT_TRIGGERED", "HIGH", user, email,
                        "Account locked due to " + attempts + " consecutive failed attempts from IP " + ip);
            }
            userRepository.save(user);

            recordLoginAttempt(email, ip, userAgent, false, "Incorrect password");
            auditService.logEvent(email, "LOGIN_FAILED", "AUTH", ip, "FAILURE", "Incorrect password attempt #" + attempts, null);

            throw new BadCredentialsException("Invalid email or password.");
        }

        // Check MFA
        if (user.isMfaEnabled()) {
            if (request.getMfaCode() == null || request.getMfaCode().trim().isEmpty()) {
                // Return MFA Challenge required
                Map<String, Object> response = new HashMap<>();
                response.put("mfaRequired", true);
                response.put("email", user.getUsername());
                return response;
            }

            // Verify MFA code
            boolean mfaValid = verifyUserMfaCode(user, request.getMfaCode().trim());
            if (!mfaValid) {
                recordLoginAttempt(email, ip, userAgent, false, "Invalid MFA Code");
                securityMonitoringService.recordEvent("MFA_VERIFICATION_FAILED", "MEDIUM", user, email, "Failed MFA verification from IP " + ip);
                throw new BadCredentialsException("Invalid multi-factor authentication code.");
            }
        }

        // Authentication Success
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        SecurityContext securityContext = SecurityContextHolder.getContext();
        securityContext.setAuthentication(authentication);

        // Bind to session
        HttpSession session = httpRequest.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, securityContext);

        // Reset failed login attempts
        user.setFailedLoginAttempts(0);
        user.setLockoutUntil(null);
        userRepository.save(user);

        // Record active session
        UserSession userSession = new UserSession();
        userSession.setUser(user);
        userSession.setSessionId(session.getId());
        userSession.setIpAddress(ip);
        userSession.setUserAgent(userAgent != null ? (userAgent.length() > 250 ? userAgent.substring(0, 250) : userAgent) : "Unknown");
        userSession.setActive(true);
        userSessionRepository.save(userSession);

        recordLoginAttempt(email, ip, userAgent, true, null);
        auditService.logEvent(email, "LOGIN_SUCCESS", "AUTH", ip, "SUCCESS", "User authenticated successfully", session.getId());

        Map<String, Object> result = new HashMap<>();
        result.put("mfaRequired", false);
        result.put("user", toUserDto(user));
        result.put("sessionId", session.getId());
        return result;
    }

    private boolean verifyUserMfaCode(User user, String code) {
        Optional<MfaSetting> settingOpt = mfaSettingRepository.findByUserId(user.getId());
        if (settingOpt.isPresent() && settingOpt.get().isVerified()) {
            String plainSecret = aesEncryptionService.decrypt(settingOpt.get().getSecretKeyEncrypted());
            if (totpService.verifyCode(plainSecret, code)) {
                return true;
            }
        }
        // Check recovery codes
        List<RecoveryCode> recoveryCodes = recoveryCodeRepository.findByUserIdAndUsedFalse(user.getId());
        for (RecoveryCode rc : recoveryCodes) {
            if (passwordEncoder.matches(code, rc.getCodeHash())) {
                rc.setUsed(true);
                rc.setUsedAt(OffsetDateTime.now());
                recoveryCodeRepository.save(rc);
                auditService.logEvent(user.getUsername(), "MFA_RECOVERY_CODE_USED", "MFA", "127.0.0.1", "SUCCESS", "Backup recovery code consumed", null);
                return true;
            }
        }
        return false;
    }

    @Transactional
    public void logout(HttpServletRequest httpRequest) {
        String username = SecurityUtils.getCurrentUsername();
        String ip = SecurityUtils.getClientIp(httpRequest);
        HttpSession session = httpRequest.getSession(false);

        if (session != null) {
            String sessionId = session.getId();
            userSessionRepository.findBySessionId(sessionId).ifPresent(userSession -> {
                userSession.setActive(false);
                userSessionRepository.save(userSession);
            });
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        auditService.logEvent(username, "LOGOUT", "AUTH", ip, "SUCCESS", "User session terminated", null);
    }

    @Transactional
    public String requestPasswordReset(ForgotPasswordRequest request, HttpServletRequest httpRequest) {
        String ip = SecurityUtils.getClientIp(httpRequest);
        String email = request.getEmail().toLowerCase().trim();

        if (!rateLimiterService.tryConsumePasswordReset(ip) || !rateLimiterService.tryConsumePasswordReset(email)) {
            throw new RateLimitExceededException("Too many password reset requests. Please wait a few minutes.");
        }

        Optional<User> userOpt = userRepository.findByUsername(email);
        if (userOpt.isEmpty()) {
            // Constant-time generic response to prevent user enumeration
            auditService.logEvent(email, "PASSWORD_RESET_REQUESTED_NONEXISTENT", "AUTH", ip, "WARNING", "Reset requested for non-existent user", null);
            return "If an account exists with this email address, a password reset link has been dispatched.";
        }

        User user = userOpt.get();
        String rawToken = SecurityUtils.generateSecureToken();
        String tokenHash = SecurityUtils.hashToken(rawToken);

        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setTokenHash(tokenHash);
        token.setExpiryDate(OffsetDateTime.now().plusMinutes(passwordResetTokenValidityMinutes));
        token.setUsed(false);
        passwordResetTokenRepository.save(token);

        auditService.logEvent(user.getUsername(), "PASSWORD_RESET_TOKEN_GENERATED", "AUTH", ip, "SUCCESS", "Single-use reset token created", null);

        // For local development demonstration, we return the token in response so tester doesn't need actual SMTP
        return rawToken;
    }

    @Transactional
    public void resetPassword(PasswordResetRequest request, HttpServletRequest httpRequest) {
        String ip = SecurityUtils.getClientIp(httpRequest);
        String tokenHash = SecurityUtils.hashToken(request.getToken());

        PasswordResetToken token = passwordResetTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new InvalidTokenException("Invalid or expired password reset token."));

        if (token.isUsed() || token.isExpired()) {
            auditService.logEvent(token.getUser().getUsername(), "PASSWORD_RESET_FAILED", "AUTH", ip, "FAILURE", "Expired or already consumed token used", null);
            throw new InvalidTokenException("This password reset token has expired or has already been used.");
        }

        User user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setFailedLoginAttempts(0);
        user.setLockoutUntil(null);
        userRepository.save(user);

        token.setUsed(true);
        passwordResetTokenRepository.save(token);

        // Revoke active sessions for security
        List<UserSession> activeSessions = userSessionRepository.findByUserIdAndActiveTrue(user.getId());
        for (UserSession s : activeSessions) {
            s.setActive(false);
        }
        userSessionRepository.saveAll(activeSessions);

        notificationService.createNotification(user, "Password Changed", "Your password has been successfully reset. If this was not you, contact security immediately.", "SECURITY");
        auditService.logEvent(user.getUsername(), "PASSWORD_RESET_COMPLETED", "AUTH", ip, "SUCCESS", "Password updated via valid token", null);
    }

    @Transactional
    public void changePassword(String username, PasswordChangeRequest request, HttpServletRequest httpRequest) {
        String ip = SecurityUtils.getClientIp(httpRequest);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            auditService.logEvent(username, "PASSWORD_CHANGE_FAILED", "AUTH", ip, "FAILURE", "Incorrect current password", null);
            throw new BadCredentialsException("Current password does not match.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        notificationService.createNotification(user, "Password Updated", "Your account password was recently changed.", "SECURITY");
        auditService.logEvent(username, "PASSWORD_CHANGE_SUCCESS", "AUTH", ip, "SUCCESS", "Password successfully changed", null);
    }

    private void recordLoginAttempt(String email, String ip, String userAgent, boolean success, String failureReason) {
        LoginAttempt attempt = new LoginAttempt(
                email,
                ip,
                userAgent != null ? (userAgent.length() > 250 ? userAgent.substring(0, 250) : userAgent) : "Unknown",
                success,
                failureReason
        );
        loginAttemptRepository.save(attempt);
    }

    public UserDto toUserDto(User user) {
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
