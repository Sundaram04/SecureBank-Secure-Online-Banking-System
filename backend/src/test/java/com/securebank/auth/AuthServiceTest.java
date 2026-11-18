package com.securebank.auth;

import com.securebank.dto.LoginRequest;
import com.securebank.dto.RegisterRequest;
import com.securebank.dto.UserDto;
import com.securebank.entity.Role;
import com.securebank.entity.User;
import com.securebank.exception.AccountLockedException;
import com.securebank.exception.DuplicateResourceException;
import com.securebank.repository.*;
import com.securebank.security.AesEncryptionService;
import com.securebank.security.RateLimiterService;
import com.securebank.security.TotpService;
import com.securebank.service.AuditService;
import com.securebank.service.AuthService;
import com.securebank.service.NotificationService;
import com.securebank.service.SecurityMonitoringService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private BankAccountRepository bankAccountRepository;
    @Mock private LoginAttemptRepository loginAttemptRepository;
    @Mock private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock private UserSessionRepository userSessionRepository;
    @Mock private MfaSettingRepository mfaSettingRepository;
    @Mock private RecoveryCodeRepository recoveryCodeRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private RateLimiterService rateLimiterService;
    @Mock private AuditService auditService;
    @Mock private SecurityMonitoringService securityMonitoringService;
    @Mock private NotificationService notificationService;
    @Mock private TotpService totpService;
    @Mock private AesEncryptionService aesEncryptionService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                roleRepository,
                bankAccountRepository,
                loginAttemptRepository,
                passwordResetTokenRepository,
                userSessionRepository,
                mfaSettingRepository,
                recoveryCodeRepository,
                passwordEncoder,
                authenticationManager,
                rateLimiterService,
                auditService,
                securityMonitoringService,
                notificationService,
                totpService,
                aesEncryptionService
        );
    }

    @Test
    @DisplayName("Should successfully register a new user with hashed password and initial bank accounts")
    void registerSuccess() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("newuser@securebank.com");
        request.setPassword("StrongPass@123");
        request.setFirstName("John");
        request.setLastName("Doe");

        when(rateLimiterService.tryConsume(anyString(), anyLong(), any())).thenReturn(true);
        when(userRepository.existsByUsername("newuser@securebank.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$12$hashedPassword");
        when(roleRepository.findByName("ROLE_CUSTOMER")).thenReturn(Optional.of(new Role("ROLE_CUSTOMER")));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(10L);
            return u;
        });

        MockHttpServletRequest httpRequest = new MockHttpServletRequest();
        UserDto result = authService.register(request, httpRequest);

        assertNotNull(result);
        assertEquals("newuser@securebank.com", result.getEmail());
        verify(passwordEncoder).encode("StrongPass@123");
        verify(bankAccountRepository, times(2)).save(any());
        verify(notificationService).createNotification(any(), anyString(), anyString(), eq("SYSTEM"));
    }

    @Test
    @DisplayName("Should reject registration when email already exists")
    void registerDuplicateEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("existing@securebank.com");
        request.setPassword("StrongPass@123");
        request.setFirstName("Jane");
        request.setLastName("Doe");

        when(rateLimiterService.tryConsume(anyString(), anyLong(), any())).thenReturn(true);
        when(userRepository.existsByUsername("existing@securebank.com")).thenReturn(true);

        MockHttpServletRequest httpRequest = new MockHttpServletRequest();
        assertThrows(DuplicateResourceException.class, () -> authService.register(request, httpRequest));
    }

    @Test
    @DisplayName("Should reject login with bad credentials and increment failed attempts counter")
    void loginInvalidPassword() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@securebank.com");
        request.setPassword("WrongPassword@123");

        User user = new User();
        user.setId(5L);
        user.setUsername("user@securebank.com");
        user.setPasswordHash("$2a$12$correctHash");
        user.setFailedLoginAttempts(1);

        when(rateLimiterService.tryConsumeLogin(anyString())).thenReturn(true);
        when(userRepository.findByUsername("user@securebank.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword@123", "$2a$12$correctHash")).thenReturn(false);

        MockHttpServletRequest httpRequest = new MockHttpServletRequest();
        assertThrows(BadCredentialsException.class, () -> authService.login(request, httpRequest));

        assertEquals(2, user.getFailedLoginAttempts());
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("Should lock account and reject login when consecutive failed attempts reach threshold")
    void loginAccountLockout() {
        LoginRequest request = new LoginRequest();
        request.setEmail("locked@securebank.com");
        request.setPassword("AnyPassword@123");

        User user = new User();
        user.setId(7L);
        user.setUsername("locked@securebank.com");
        user.setPasswordHash("$2a$12$someHash");
        user.setLockoutUntil(OffsetDateTime.now().plusMinutes(10));

        when(rateLimiterService.tryConsumeLogin(anyString())).thenReturn(true);
        when(userRepository.findByUsername("locked@securebank.com")).thenReturn(Optional.of(user));

        MockHttpServletRequest httpRequest = new MockHttpServletRequest();
        assertThrows(AccountLockedException.class, () -> authService.login(request, httpRequest));
    }
}
