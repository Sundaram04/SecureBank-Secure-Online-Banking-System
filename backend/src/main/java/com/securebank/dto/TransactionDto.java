package com.securebank.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public class TransactionDto {
    private Long id;
    private String transactionReference;
    private String sourceAccountNumber;
    private String maskedSourceAccountNumber;
    private String destinationAccountNumber;
    private String maskedDestinationAccountNumber;
    private BigDecimal amount;
    private String currency;
    private String transactionType;
    private String status;
    private String description;
    private String failureReason;
    private boolean isDebit;
    private OffsetDateTime createdAt;

    public TransactionDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTransactionReference() { return transactionReference; }
    public void setTransactionReference(String transactionReference) { this.transactionReference = transactionReference; }

    public String getSourceAccountNumber() { return sourceAccountNumber; }
    public void setSourceAccountNumber(String sourceAccountNumber) { this.sourceAccountNumber = sourceAccountNumber; }

    public String getMaskedSourceAccountNumber() { return maskedSourceAccountNumber; }
    public void setMaskedSourceAccountNumber(String maskedSourceAccountNumber) { this.maskedSourceAccountNumber = maskedSourceAccountNumber; }

    public String getDestinationAccountNumber() { return destinationAccountNumber; }
    public void setDestinationAccountNumber(String destinationAccountNumber) { this.destinationAccountNumber = destinationAccountNumber; }

    public String getMaskedDestinationAccountNumber() { return maskedDestinationAccountNumber; }
    public void setMaskedDestinationAccountNumber(String maskedDestinationAccountNumber) { this.maskedDestinationAccountNumber = maskedDestinationAccountNumber; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }

    public boolean isDebit() { return isDebit; }
    public void setDebit(boolean debit) { isDebit = debit; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
