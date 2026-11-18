package com.securebank.controller;

import com.securebank.dto.*;
import com.securebank.service.AuthService;
import com.securebank.service.NotificationService;
import com.securebank.service.ProfileService;
import com.securebank.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profile")
@PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
public class ProfileController {

    private final ProfileService profileService;
    private final AuthService authService;
    private final NotificationService notificationService;

    public ProfileController(ProfileService profileService, AuthService authService, NotificationService notificationService) {
        this.profileService = profileService;
        this.authService = authService;
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<UserDto>> getProfile() {
        String username = SecurityUtils.getCurrentUsername();
        UserDto profile = profileService.getProfile(username);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        String username = SecurityUtils.getCurrentUsername();
        UserDto updated = profileService.updateProfile(username, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody PasswordChangeRequest request,
            HttpServletRequest httpRequest
    ) {
        String username = SecurityUtils.getCurrentUsername();
        authService.changePassword(username, request, httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardSummaryDto>> getDashboardSummary() {
        String username = SecurityUtils.getCurrentUsername();
        DashboardSummaryDto summary = profileService.getDashboardSummary(username);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getNotifications() {
        String username = SecurityUtils.getCurrentUsername();
        UserDto profile = profileService.getProfile(username);
        List<NotificationDto> notifications = notificationService.getUserNotifications(profile.getId());
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markNotificationAsRead(@PathVariable Long id) {
        String username = SecurityUtils.getCurrentUsername();
        UserDto profile = profileService.getProfile(username);
        notificationService.markAsRead(id, profile.getId());
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }

    @PutMapping("/notifications/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllNotificationsAsRead() {
        String username = SecurityUtils.getCurrentUsername();
        UserDto profile = profileService.getProfile(username);
        notificationService.markAllAsRead(profile.getId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }
}
