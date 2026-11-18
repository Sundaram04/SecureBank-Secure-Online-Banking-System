package com.securebank.dto;

import java.time.OffsetDateTime;

public class LoginAttemptDto {
    private Long id;
    private String email;
    private String ipAddress;
    private String userAgent;
    private boolean success;
    private String failureReason;
    private OffsetDateTime attemptTime;

    public LoginAttemptDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }

    public OffsetDateTime getAttemptTime() { return attemptTime; }
    public void setAttemptTime(OffsetDateTime attemptTime) { this.attemptTime = attemptTime; }
}
