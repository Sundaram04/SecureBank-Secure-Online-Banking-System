package com.securebank.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ReviewSecurityEventRequest {

    @NotBlank(message = "Review status is required")
    @Pattern(regexp = "^(NEW|UNDER_INVESTIGATION|RESOLVED|DISMISSED)$", message = "Status must be NEW, UNDER_INVESTIGATION, RESOLVED, or DISMISSED")
    private String reviewStatus;

    @Size(max = 255)
    private String notes;

    public ReviewSecurityEventRequest() {}

    public String getReviewStatus() { return reviewStatus; }
    public void setReviewStatus(String reviewStatus) { this.reviewStatus = reviewStatus; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
