import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  ShieldCheck,
  CreditCard,
  Users,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
  ArrowRight,
  Plus,
  Lock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../services/api';
import { DashboardSummary, Beneficiary } from '../types';
import { useAuth } from '../context/AuthContext';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(true);

  // Quick transfer form state
  const [quickAmount, setQuickAmount] = useState('');
  const [quickRecipient, setQuickRecipient] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sumRes, benRes] = await Promise.allSettled([
        api.get('/profile/dashboard'),
        api.get('/beneficiaries')
      ]);

      if (sumRes.status === 'fulfilled' && sumRes.value.data.success) {
        setSummary(sumRes.value.data.data);
      } else if (sumRes.status === 'rejected') {
        throw new Error('Failed to load dashboard summary');
      }

      if (benRes.status === 'fulfilled' && benRes.value.data.success) {
        setBeneficiaries(benRes.value.data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve banking portfolio.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[55vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-forest-600 border-t-copper rounded-full animate-spin" />
          <p className="text-xs font-serif text-heritage-secondary tracking-wide">
            Retrieving ledger balances & vault entries...
          </p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-4 rounded-sm bg-status-danger-bg border border-status-danger-border text-status-danger text-xs flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span className="font-sans">{error || 'Unable to load dashboard data.'}</span>
      </div>
    );
  }

  const currentDateFormatted = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const chartData = [
    { name: 'Monthly Inflow', amount: summary.monthlyIncome, fill: '#183D32' },
    { name: 'Monthly Outflow', amount: summary.monthlyExpenses, fill: '#B65F3C' },
    { name: 'Reserve Balance', amount: summary.savingsBalance, fill: '#C88762' },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Editorial Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-heritage-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-sans tracking-widest text-copper font-bold">
              Account Portfolio
            </span>
            <span className="text-heritage-muted text-xs">•</span>
            <span className="text-xs text-heritage-secondary font-sans">{currentDateFormatted}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-medium text-forest-deep tracking-tight">
            Welcome, {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-xs text-heritage-secondary mt-1">
            Private Banking Client #{user?.id ? String(user.id).padStart(5, '0') : '00001'} • Active Double-Entry Protection
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/transfer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest-600 hover:bg-forest-500 text-ivory rounded-sm text-xs font-sans uppercase tracking-widest font-semibold shadow-heritage-sm transition-all"
          >
            <Send className="w-3.5 h-3.5 text-copper" />
            <span>Transfer Funds</span>
          </Link>
          <Link
            to="/accounts"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-heritage-paper hover:bg-ivory text-heritage-dark border border-heritage-border rounded-sm text-xs font-sans font-medium transition-colors shadow-heritage-sm"
          >
            <CreditCard className="w-3.5 h-3.5 text-heritage-secondary" />
            <span>Vaults</span>
          </Link>
        </div>
      </div>

      {/* Primary Balance Section — Deep Forest Green Architectural Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deep Forest Green Vault Balance Card */}
        <div className="lg:col-span-2 bg-forest-deep text-ivory rounded-sm p-6 sm:p-8 relative overflow-hidden border border-forest-600/40 shadow-heritage-card flex flex-col justify-between">
          {/* Subtle Architectural SVG Filigree Motif */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 pointer-events-none flex items-center justify-end pr-4">
            <svg viewBox="0 0 200 200" className="w-64 h-64 text-copper stroke-current" fill="none" strokeWidth="1">
              <circle cx="100" cy="100" r="90" strokeDasharray="4 4" />
              <circle cx="100" cy="100" r="70" />
              <rect x="40" y="40" width="120" height="120" />
              <path d="M100 10 L100 190 M10 100 L190 100" />
              <polygon points="100,20 180,100 100,180 20,100" />
            </svg>
          </div>

          <div>
            <div className="flex items-center justify-between pb-4 border-b border-forest-600/30">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
                <span className="text-[11px] font-sans tracking-widest uppercase text-ivory/70">
                  Consolidated Liquid Balance
                </span>
              </div>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-ivory/60 hover:text-copper flex items-center gap-1.5 text-xs font-sans transition-colors"
                title={showBalance ? "Conceal monetary values" : "Reveal monetary values"}
              >
                {showBalance ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span className="text-[10px] hidden sm:inline">Conceal</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span className="text-[10px] hidden sm:inline">Reveal</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-6">
              <p className="text-4xl sm:text-5xl font-serif font-medium text-ivory tracking-tight">
                {showBalance ? (
                  <>₹{summary.totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>
                ) : (
                  <>₹••••••••</>
                )}
              </p>
              <p className="text-xs font-sans text-copper mt-2">
                Indian Rupee (INR) • Verified against Double-Entry Ledger
              </p>
            </div>
          </div>

          {/* Sub-vaults breakdown footer */}
          <div className="mt-8 pt-6 border-t border-forest-600/30 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-sans tracking-wider text-ivory/50 block">
                Savings Reserve
              </span>
              <p className="font-serif text-base text-ivory font-medium mt-0.5">
                {showBalance ? (
                  <>₹{summary.savingsBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</>
                ) : (
                  <>₹••••••</>
                )}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-sans tracking-wider text-ivory/50 block">
                Current Portfolio
              </span>
              <p className="font-serif text-base text-ivory font-medium mt-0.5">
                {showBalance ? (
                  <>₹{summary.currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</>
                ) : (
                  <>₹••••••</>
                )}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-sans tracking-wider text-ivory/50 block">
                Account Status
              </span>
              <p className="font-sans text-xs text-status-success font-medium mt-1 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Row-Locked Solvency
              </p>
            </div>
          </div>
        </div>

        {/* Security Posture Panel */}
        <div className="bg-heritage-paper rounded-sm p-6 border border-heritage-border shadow-heritage-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-heritage-border">
              <span className="text-[10px] uppercase font-sans tracking-widest text-copper font-bold">
                Security Assurance
              </span>
              <ShieldCheck className="w-4 h-4 text-forest-600" />
            </div>

            <div className="mt-4">
              <h3 className="font-serif text-lg font-medium text-forest-deep">
                Protection Level: {summary.securityScore}
              </h3>
              <p className="text-xs text-heritage-secondary font-sans mt-1">
                Active safeguards monitoring your session, transfers, and cryptographic tokens.
              </p>
            </div>

            <div className="mt-5 space-y-3 text-xs font-sans">
              <div className="flex items-center justify-between p-2.5 bg-ivory rounded-sm border border-heritage-border-light">
                <span className="text-heritage-dark">Two-Factor Authentication</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-sm ${
                  summary.mfaEnabled
                    ? 'bg-status-success-bg text-status-success border border-status-success-border'
                    : 'bg-status-warning-bg text-status-warning border border-status-warning-border'
                }`}>
                  {summary.mfaEnabled ? 'Enforced (TOTP)' : 'Recommended'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-ivory rounded-sm border border-heritage-border-light">
                <span className="text-heritage-dark">CSRF Double-Submit</span>
                <span className="text-[11px] text-status-success font-semibold flex items-center gap-1">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-ivory rounded-sm border border-heritage-border-light">
                <span className="text-heritage-dark">Session Tracking</span>
                <span className="text-[11px] text-forest-600 font-semibold">
                  HttpOnly / Lax
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-heritage-border">
            <Link
              to="/security"
              className="text-xs font-sans font-medium text-terracotta hover:text-terracotta-hover flex items-center justify-between group"
            >
              <span>Manage Security & 2FA Credentials</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Spending Analytics & Quick Transfer Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Minimal Editorial Financial Analytics */}
        <div className="lg:col-span-2 bg-heritage-paper p-6 sm:p-7 rounded-sm border border-heritage-border shadow-heritage-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-heritage-border">
            <div>
              <h3 className="font-serif font-medium text-lg text-forest-deep">
                Monthly Flow & Liquidity Distribution
              </h3>
              <p className="text-xs text-heritage-secondary font-sans">
                Simulated inflows vs expenditures recorded in the ledger
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-sans">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-forest-600" />
                <span className="text-heritage-secondary">Inflow</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-terracotta" />
                <span className="text-heritage-secondary">Outflow</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-copper" />
                <span className="text-heritage-secondary">Reserve</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#E4D8C7" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#777267' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#777267' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 'Balance']}
                  contentStyle={{
                    backgroundColor: '#FDFBF7',
                    border: '1px solid #E4D8C7',
                    borderRadius: '2px',
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '12px',
                    color: '#25251F'
                  }}
                />
                <Bar dataKey="amount" radius={[2, 2, 0, 0]} barSize={42} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Transfer Panel (Terracotta Inspired Accent) */}
        <div className="bg-terracotta-subtle/70 rounded-sm p-6 border border-copper/30 shadow-heritage-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-copper/30 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-sm bg-terracotta text-ivory">
                  <Send className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-serif font-medium text-base text-forest-deep">
                  Expedited Transfer
                </h3>
              </div>
              <span className="text-[10px] uppercase font-sans tracking-widest text-copper font-bold">
                Instant
              </span>
            </div>

            <p className="text-xs text-heritage-secondary font-sans mb-4">
              Quickly draft a money transfer to a verified saved beneficiary.
            </p>

            {/* Quick Beneficiary Shortcuts */}
            <div className="space-y-3 mb-5">
              <label className="block text-[11px] font-sans font-medium text-heritage-dark">
                Recent Beneficiaries:
              </label>
              {beneficiaries.length === 0 ? (
                <div className="p-3 bg-heritage-paper rounded-sm border border-copper/20 text-center text-xs text-heritage-secondary">
                  No beneficiaries enrolled.{' '}
                  <Link to="/beneficiaries" className="text-terracotta font-medium hover:underline">
                    Add contact
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {beneficiaries.slice(0, 3).map((b) => (
                    <Link
                      key={b.id}
                      to={`/transfer?recipient=${b.beneficiaryAccountNumber}`}
                      className="flex items-center justify-between p-2.5 bg-heritage-paper rounded-sm border border-copper/20 hover:border-terracotta hover:bg-ivory transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-sm bg-forest-50 border border-forest-200 text-forest-600 flex items-center justify-center font-serif text-xs font-bold">
                          {b.beneficiaryName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-serif font-medium text-heritage-dark group-hover:text-terracotta transition-colors">
                            {b.beneficiaryName}
                          </p>
                          <p className="text-[10px] font-mono text-heritage-secondary">
                            {b.maskedAccountNumber}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-heritage-muted group-hover:text-terracotta group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-copper/20">
            <Link
              to="/transfer"
              className="w-full py-2.5 px-4 rounded-sm font-sans uppercase tracking-widest text-xs font-semibold text-ivory bg-forest-600 hover:bg-forest-500 transition-colors flex items-center justify-center gap-2 shadow-heritage-sm"
            >
              <span>Launch Transfer Studio</span>
              <ArrowRight className="w-3.5 h-3.5 text-copper" />
            </Link>
          </div>
        </div>
      </div>

      {/* Elegant Recent Transactions Table with Refined Dividers */}
      <div className="bg-heritage-paper p-6 sm:p-7 rounded-sm border border-heritage-border shadow-heritage-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-heritage-border">
          <div>
            <h3 className="font-serif font-medium text-lg text-forest-deep">
              Recent Ledger Dispatches
            </h3>
            <p className="text-xs text-heritage-secondary font-sans">
              Cryptographically signed transaction history
            </p>
          </div>
          <Link
            to="/transactions"
            className="text-xs font-sans font-medium text-terracotta hover:text-terracotta-hover flex items-center gap-1 transition-colors"
          >
            <span>View Full Ledger Archive</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {summary.recentTransactions.length === 0 ? (
          <div className="text-center py-12 text-heritage-secondary text-xs font-serif">
            No transaction records found on this account yet.
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
                {summary.recentTransactions.map((tx) => {
                  const isDebit = Boolean(tx.debit ?? tx.isDebit);
                  return (
                  <tr key={tx.id} className="hover:bg-ivory/60 transition-colors">
                    <td className="py-3 px-3 font-mono text-[11px] text-forest-deep font-medium">
                      {tx.transactionReference}
                    </td>
                    <td className="py-3 px-3">
                      {isDebit ? (
                        <span className="text-status-danger flex items-center gap-1 font-medium text-[11px]">
                          <ArrowUpRight className="w-3.5 h-3.5" /> Debit
                        </span>
                      ) : (
                        <span className="text-status-success flex items-center gap-1 font-medium text-[11px]">
                          <ArrowDownLeft className="w-3.5 h-3.5" /> Credit
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-heritage-dark max-w-xs truncate">
                      {tx.description}
                    </td>
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
    </div>
  );
};
