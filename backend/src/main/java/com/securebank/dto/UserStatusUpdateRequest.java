package com.securebank.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class UserStatusUpdateRequest {

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(ACTIVE|SUSPENDED|LOCKED)$", message = "Status must be ACTIVE, SUSPENDED, or LOCKED")
    private String status;

    public UserStatusUpdateRequest() {}

    public UserStatusUpdateRequest(String status) {
        this.status = status;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
