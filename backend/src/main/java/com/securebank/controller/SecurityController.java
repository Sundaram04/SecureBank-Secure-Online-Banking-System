package com.securebank.controller;

import com.securebank.dto.ApiResponse;
import com.securebank.dto.LoginAttemptDto;
import com.securebank.dto.MfaSetupResponse;
import com.securebank.dto.MfaVerifyRequest;
import com.securebank.dto.UserSessionDto;
import com.securebank.service.ProfileService;
import com.securebank.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/security")
@PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
public class SecurityController {

    private final ProfileService profileService;

    public SecurityController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @PostMapping("/mfa/setup")
    public ResponseEntity<ApiResponse<MfaSetupResponse>> setupMfa() {
        String username = SecurityUtils.getCurrentUsername();
        MfaSetupResponse response = profileService.setupMfa(username);
        return ResponseEntity.ok(ApiResponse.success("MFA setup generated. Scan the QR code or enter secret key.", response));
    }

    @PostMapping("/mfa/enable")
    public ResponseEntity<ApiResponse<Void>> enableMfa(@Valid @RequestBody MfaVerifyRequest request) {
        String username = SecurityUtils.getCurrentUsername();
        profileService.enableMfa(username, request.getCode());
        return ResponseEntity.ok(ApiResponse.success("Multi-Factor Authentication enabled successfully.", null));
    }

    @PostMapping("/mfa/disable")
    public ResponseEntity<ApiResponse<Void>> disableMfa(@RequestBody Map<String, String> payload) {
        String username = SecurityUtils.getCurrentUsername();
        String password = payload.get("password");
        if (password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Password is required to disable MFA."));
        }
        profileService.disableMfa(username, password);
        return ResponseEntity.ok(ApiResponse.success("Multi-Factor Authentication disabled.", null));
    }

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<UserSessionDto>>> getSessions(HttpServletRequest request) {
        String username = SecurityUtils.getCurrentUsername();
        HttpSession session = request.getSession(false);
        String currentSessionId = session != null ? session.getId() : "";
        List<UserSessionDto> sessions = profileService.getActiveSessions(username, currentSessionId);
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<Void>> revokeSession(@PathVariable Long sessionId) {
        String username = SecurityUtils.getCurrentUsername();
        profileService.revokeSession(username, sessionId);
        return ResponseEntity.ok(ApiResponse.success("Session revoked successfully.", null));
    }

    @GetMapping("/login-history")
    public ResponseEntity<ApiResponse<List<LoginAttemptDto>>> getLoginHistory() {
        String username = SecurityUtils.getCurrentUsername();
        List<LoginAttemptDto> history = profileService.getLoginHistory(username);
        return ResponseEntity.ok(ApiResponse.success(history));
    }
}
