package com.securebank.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class BeneficiaryRequest {

    @NotBlank(message = "Account number is required")
    @Size(min = 5, max = 32, message = "Account number must be between 5 and 32 characters")
    @Pattern(regexp = "^[A-Za-z0-9-]+$", message = "Account number can only contain alphanumeric characters and hyphens")
    private String beneficiaryAccountNumber;

    @NotBlank(message = "Beneficiary name is required")
    @Size(min = 2, max = 100, message = "Beneficiary name must be between 2 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\s.'-]+$", message = "Beneficiary name contains invalid characters")
    private String beneficiaryName;

    @Size(max = 100, message = "Bank name must not exceed 100 characters")
    private String bankName = "SecureBank";

    @Email(message = "Invalid email format")
    @Size(max = 255)
    private String email;

    @Size(max = 100, message = "Nickname must not exceed 100 characters")
    private String nickname;

    public BeneficiaryRequest() {}

    public String getBeneficiaryAccountNumber() { return beneficiaryAccountNumber; }
    public void setBeneficiaryAccountNumber(String beneficiaryAccountNumber) { this.beneficiaryAccountNumber = beneficiaryAccountNumber; }

    public String getBeneficiaryName() { return beneficiaryName; }
    public void setBeneficiaryName(String beneficiaryName) { this.beneficiaryName = beneficiaryName; }

    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }
}
