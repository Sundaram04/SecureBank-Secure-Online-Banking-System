export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: string;
  mfaEnabled: boolean;
  roles: string[];
  createdAt: string;
}

export interface BankAccount {
  id: number;
  accountNumber: string;
  maskedAccountNumber: string;
  accountType: 'SAVINGS' | 'CURRENT';
  balance: number;
  currency: string;
  status: 'ACTIVE' | 'FROZEN' | 'CLOSED';
  createdAt: string;
}

export interface Beneficiary {
  id: number;
  beneficiaryAccountNumber: string;
  maskedAccountNumber: string;
  beneficiaryName: string;
  bankName: string;
  email?: string;
  nickname?: string;
  createdAt: string;
}

export interface Transaction {
  id: number;
  transactionReference: string;
  sourceAccountNumber?: string;
  maskedSourceAccountNumber?: string;
  destinationAccountNumber?: string;
  maskedDestinationAccountNumber?: string;
  amount: number;
  currency: string;
  transactionType: 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL';
  status: 'COMPLETED' | 'FAILED' | 'PENDING' | 'REVERSED';
  description?: string;
  failureReason?: string;
  debit?: boolean;
  isDebit?: boolean;
  createdAt: string;
}

export interface LedgerEntry {
  id: number;
  transactionReference: string;
  accountNumber: string;
  entryType: 'DEBIT' | 'CREDIT';
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

export interface SecurityEvent {
  id: number;
  eventType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  username: string;
  description: string;
  reviewStatus: 'NEW' | 'UNDER_INVESTIGATION' | 'RESOLVED' | 'DISMISSED';
  resolvedBy?: string;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  actorUsername: string;
  action: string;
  targetResource: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';
  details: string;
  correlationId: string;
  timestamp: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'SECURITY' | 'TRANSACTION' | 'ACCOUNT' | 'SYSTEM';
  read: boolean;
  createdAt: string;
}

export interface UserSession {
  id: number;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  lastActivity: string;
  current: boolean;
  createdAt: string;
}

export interface LoginAttempt {
  id: number;
  email: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
  attemptTime: string;
}

export interface DashboardSummary {
  totalBalance: number;
  savingsBalance: number;
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  activeAccountsCount: number;
  beneficiariesCount: number;
  unreadNotificationsCount: number;
  mfaEnabled: boolean;
  securityScore: string;
  recentTransactions: Transaction[];
  accounts: BankAccount[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}
