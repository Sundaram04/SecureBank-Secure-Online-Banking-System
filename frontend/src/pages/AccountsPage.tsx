import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Copy,
  Check,
  ShieldCheck,
  History,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  Award
} from 'lucide-react';
import api from '../services/api';
import { BankAccount, Transaction } from '../types';

export const AccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [revealedIds, setRevealedIds] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/accounts');
      if (res.data.success) {
        setAccounts(res.data.data);
        if (res.data.data.length > 0) {
          selectAccount(res.data.data[0]);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load accounts.');
    } finally {
      setLoading(false);
    }
  };

  const selectAccount = async (account: BankAccount) => {
    setSelectedAccount(account);
    setTxLoading(true);
    try {
      const res = await api.get(`/accounts/${account.id}/transactions`);
      if (res.data.success) {
        setTransactions(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setTxLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const copyToClipboard = (acc: BankAccount) => {
    navigator.clipboard.writeText(acc.accountNumber);
    setCopiedId(acc.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleReveal = (id: number) => {
    setRevealedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-forest-600 border-t-copper rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Editorial Header */}
      <div className="pb-4 border-b border-heritage-border flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-sans tracking-widest text-copper font-bold block mb-1">
            Fiduciary Custody
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-medium text-forest-deep tracking-tight">
            Accounts & Vaults
          </h1>
          <p className="text-xs text-heritage-secondary mt-1">
            Authenticated physical card vaults protected by backend principal ownership verification.
          </p>
        </div>
        <div className="text-right text-xs text-heritage-secondary font-sans hidden sm:block">
          <span>Total Vaults: {accounts.length}</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-sm bg-status-danger-bg border border-status-danger-border text-status-danger text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Account Cards Grid — Inspired by Premium Physical Banking Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acc, index) => {
          const isSelected = selectedAccount?.id === acc.id;
          const isRevealed = revealedIds[acc.id];
          const isSavings = acc.accountType === 'SAVINGS';

          return (
            <div
              key={acc.id}
              onClick={() => selectAccount(acc)}
              className={`p-6 sm:p-7 rounded-sm cursor-pointer transition-all duration-200 relative overflow-hidden border ${
                isSelected
                  ? 'bg-forest-deep text-ivory border-copper/60 shadow-heritage-card ring-1 ring-copper/40'
                  : 'bg-heritage-paper hover:bg-ivory text-heritage-dark border-heritage-border shadow-heritage-sm'
              }`}
            >
              {/* Subtle metallic watermarking */}
              <div className="absolute -right-12 -bottom-12 w-40 h-40 opacity-5 pointer-events-none">
                <svg viewBox="0 0 100 100" fill="currentColor">
                  <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M50 10 L50 90 M10 50 L90 50" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>

              {/* Card Top: Institutional Seal & Account Type */}
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <span className={`text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm border ${
                    isSelected
                      ? 'bg-forest-light text-copper border-copper/40'
                      : 'bg-ivory text-forest-deep border-heritage-border'
                  }`}>
                    {acc.accountType} VAULT
                  </span>
                  <p className={`text-[11px] font-serif tracking-wide mt-1 ${
                    isSelected ? 'text-ivory/70' : 'text-heritage-secondary'
                  }`}>
                    {isSavings ? 'Premier High-Yield Reserve' : 'Operational Clearing Facility'}
                  </p>
                </div>

                {/* EMV Microchip Emblem */}
                <div className="w-9 h-7 rounded-sm bg-copper/30 border border-copper/50 flex flex-col justify-center gap-0.5 px-1 shadow-inner">
                  <div className="h-0.5 bg-copper/60 rounded" />
                  <div className="h-0.5 bg-copper/60 rounded" />
                  <div className="h-0.5 bg-copper/60 rounded" />
                </div>
              </div>

              {/* Card Center: Account Number Masking & Copy */}
              <div className="my-6 relative z-10">
                <span className={`text-[10px] uppercase font-sans tracking-widest block mb-1 ${
                  isSelected ? 'text-ivory/50' : 'text-heritage-muted'
                }`}>
                  Custody Identifier
                </span>
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-sm tracking-wider font-semibold ${
                    isSelected ? 'text-ivory' : 'text-forest-deep'
                  }`}>
                    {isRevealed ? acc.accountNumber : acc.maskedAccountNumber}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleReveal(acc.id); }}
                    className={`p-1 rounded transition-colors ${
                      isSelected ? 'text-ivory/60 hover:text-copper' : 'text-heritage-secondary hover:text-forest-deep'
                    }`}
                    title={isRevealed ? 'Hide full number' : 'Show full number'}
                  >
                    {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); copyToClipboard(acc); }}
                    className={`p-1 rounded transition-colors ${
                      isSelected ? 'text-ivory/60 hover:text-copper' : 'text-heritage-secondary hover:text-forest-deep'
                    }`}
                    title="Copy identifier"
                  >
                    {copiedId === acc.id ? (
                      <Check className="w-3.5 h-3.5 text-status-success" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Card Bottom: Balance & Status */}
              <div className="mt-6 pt-4 border-t relative z-10 flex items-end justify-between border-opacity-30 border-current">
                <div>
                  <span className={`text-[10px] uppercase font-sans tracking-widest block ${
                    isSelected ? 'text-ivory/50' : 'text-heritage-secondary'
                  }`}>
                    Available Ledger Balance
                  </span>
                  <p className={`text-2xl font-serif font-medium mt-0.5 tracking-tight ${
                    isSelected ? 'text-ivory' : 'text-forest-deep'
                  }`}>
                    ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[10px] font-sans font-medium text-status-success">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
                    {acc.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Account Activity Ledger */}
      {selectedAccount && (
        <div className="bg-heritage-paper p-6 sm:p-7 rounded-sm border border-heritage-border shadow-heritage-sm mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-heritage-border">
            <div>
              <h3 className="font-serif font-medium text-lg text-forest-deep flex items-center gap-2">
                <History className="w-4 h-4 text-copper" />
                Ledger Statement: {selectedAccount.accountNumber}
              </h3>
              <p className="text-xs text-heritage-secondary font-sans mt-0.5">
                Official statement of account entries verified by the double-entry engine
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-serif font-medium text-forest-deep">
                Verified Balance: ₹{selectedAccount.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {txLoading ? (
            <div className="py-12 text-center text-xs text-heritage-secondary font-serif">
              Loading verified statement entries...
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-12 text-center text-xs text-heritage-secondary font-serif">
              No transactions on record for this specific vault.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="border-b border-heritage-border text-heritage-secondary uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Reference ID</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Description</th>
                    <th className="py-3 px-3">Counterparty</th>
                    <th className="py-3 px-3 text-right">Amount</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-heritage-border-light">
                  {transactions.map((tx) => {
                    const isDebit = Boolean(tx.debit ?? tx.isDebit);
                    return (
                    <tr key={tx.id} className="hover:bg-ivory/60 transition-colors">
                      <td className="py-3 px-3 font-mono text-[11px] text-forest-deep font-medium">
                        {tx.transactionReference}
                      </td>
                      <td className="py-3 px-3 font-medium">
                        {isDebit ? (
                          <span className="text-status-danger flex items-center gap-1 text-[11px]">
                            <ArrowUpRight className="w-3.5 h-3.5" /> Debit
                          </span>
                        ) : (
                          <span className="text-status-success flex items-center gap-1 text-[11px]">
                            <ArrowDownLeft className="w-3.5 h-3.5" /> Credit
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-heritage-dark">{tx.description}</td>
                      <td className="py-3 px-3 font-mono text-heritage-secondary text-[11px]">
                        {isDebit ? tx.maskedDestinationAccountNumber : tx.maskedSourceAccountNumber || 'Vault Credit'}
                      </td>
                      <td className={`py-3 px-3 text-right font-serif font-medium text-sm ${
                        isDebit ? 'text-status-danger' : 'text-status-success'
                      }`}>
                        {isDebit ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-sm text-[10px] font-sans font-medium uppercase tracking-wider bg-forest-50 text-forest-700 border border-forest-200">
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-heritage-secondary text-[11px]">
                        {new Date(tx.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
