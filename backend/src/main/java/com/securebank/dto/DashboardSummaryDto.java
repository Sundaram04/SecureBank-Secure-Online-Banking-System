package com.securebank.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardSummaryDto {
    private BigDecimal totalBalance;
    private BigDecimal savingsBalance;
    private BigDecimal currentBalance;
    private BigDecimal monthlyIncome;
    private BigDecimal monthlyExpenses;
    private int activeAccountsCount;
    private int beneficiariesCount;
    private long unreadNotificationsCount;
    private boolean mfaEnabled;
    private String securityScore;
    private List<TransactionDto> recentTransactions;
    private List<BankAccountDto> accounts;

    public DashboardSummaryDto() {}

    public BigDecimal getTotalBalance() { return totalBalance; }
    public void setTotalBalance(BigDecimal totalBalance) { this.totalBalance = totalBalance; }

    public BigDecimal getSavingsBalance() { return savingsBalance; }
    public void setSavingsBalance(BigDecimal savingsBalance) { this.savingsBalance = savingsBalance; }

    public BigDecimal getCurrentBalance() { return currentBalance; }
    public void setCurrentBalance(BigDecimal currentBalance) { this.currentBalance = currentBalance; }

    public BigDecimal getMonthlyIncome() { return monthlyIncome; }
    public void setMonthlyIncome(BigDecimal monthlyIncome) { this.monthlyIncome = monthlyIncome; }

    public BigDecimal getMonthlyExpenses() { return monthlyExpenses; }
    public void setMonthlyExpenses(BigDecimal monthlyExpenses) { this.monthlyExpenses = monthlyExpenses; }

    public int getActiveAccountsCount() { return activeAccountsCount; }
    public void setActiveAccountsCount(int activeAccountsCount) { this.activeAccountsCount = activeAccountsCount; }

    public int getBeneficiariesCount() { return beneficiariesCount; }
    public void setBeneficiariesCount(int beneficiariesCount) { this.beneficiariesCount = beneficiariesCount; }

    public long getUnreadNotificationsCount() { return unreadNotificationsCount; }
    public void setUnreadNotificationsCount(long unreadNotificationsCount) { this.unreadNotificationsCount = unreadNotificationsCount; }

    public boolean isMfaEnabled() { return mfaEnabled; }
    public void setMfaEnabled(boolean mfaEnabled) { this.mfaEnabled = mfaEnabled; }

    public String getSecurityScore() { return securityScore; }
    public void setSecurityScore(String securityScore) { this.securityScore = securityScore; }

    public List<TransactionDto> getRecentTransactions() { return recentTransactions; }
    public void setRecentTransactions(List<TransactionDto> recentTransactions) { this.recentTransactions = recentTransactions; }

    public List<BankAccountDto> getAccounts() { return accounts; }
    public void setAccounts(List<BankAccountDto> accounts) { this.accounts = accounts; }
}
