import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Send,
  ShieldCheck,
  CreditCard,
  Users,
  CheckCircle2,
  AlertCircle,
  Printer,
  RotateCcw,
  KeyRound,
  ArrowRight,
  Lock,
  FileCheck2,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';
import { BankAccount, Beneficiary, Transaction } from '../types';

export const TransferPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [sourceAccountId, setSourceAccountId] = useState<number | ''>('');
  const [destinationAccountNumber, setDestinationAccountNumber] = useState('');
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);
  const [showReview, setShowReview] = useState(false);

  const initData = async () => {
    try {
      const [accRes, benRes] = await Promise.all([
        api.get('/accounts'),
        api.get('/beneficiaries'),
      ]);
      if (accRes.data.success && accRes.data.data.length > 0) {
        setAccounts(accRes.data.data);
        setSourceAccountId(accRes.data.data[0].id);
      }
      if (benRes.data.success) {
        setBeneficiaries(benRes.data.data);
        const recipientParam = searchParams.get('recipient');
        if (recipientParam) {
          setDestinationAccountNumber(recipientParam);
          const match = benRes.data.data.find((b: Beneficiary) => b.beneficiaryAccountNumber === recipientParam);
          if (match) setSelectedBeneficiaryId(String(match.id));
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize transfer metadata.');
    }
  };

  const generateNewIdempotencyKey = () => {
    const key = 'IDEMP-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now();
    setIdempotencyKey(key);
  };

  useEffect(() => {
    initData();
    generateNewIdempotencyKey();
  }, [searchParams]);

  const handleBeneficiarySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedBeneficiaryId(val);
    if (val) {
      const ben = beneficiaries.find(b => b.id.toString() === val);
      if (ben) {
        setDestinationAccountNumber(ben.beneficiaryAccountNumber);
      }
    } else {
      setDestinationAccountNumber('');
    }
  };

  const validateDraft = () => {
    setError(null);
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please specify a positive monetary transfer value.');
      return false;
    }
    if (!destinationAccountNumber.trim()) {
      setError('Please select or specify a recipient account identifier.');
      return false;
    }
    const selectedAcc = accounts.find(a => a.id === Number(sourceAccountId));
    if (selectedAcc && numAmount > selectedAcc.balance) {
      setError(`Insufficient liquidity. Selected vault contains ₹${selectedAcc.balance.toLocaleString('en-IN')}.`);
      return false;
    }
    return true;
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateDraft()) {
      setShowReview(true);
    }
  };

  const handleExecuteTransfer = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/transfers', {
        sourceAccountId: Number(sourceAccountId),
        destinationAccountNumber: destinationAccountNumber.trim(),
        amount: parseFloat(amount),
        description: description.trim() || undefined,
        idempotencyKey,
      });

      if (res.data.success) {
        setCompletedTx(res.data.data);
        setShowReview(false);
        const accRes = await api.get('/accounts');
        if (accRes.data.success) {
          setAccounts(accRes.data.data);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Transfer failed.');
      setShowReview(false);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCompletedTx(null);
    setAmount('');
    setDescription('');
    setSelectedBeneficiaryId('');
    setDestinationAccountNumber('');
    setShowReview(false);
    generateNewIdempotencyKey();
    setError(null);
  };

  const selectedSource = accounts.find(a => a.id === Number(sourceAccountId));

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      {/* Editorial Header */}
      <div className="pb-4 border-b border-heritage-border flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-sans tracking-widest text-copper font-bold block mb-1">
            Fiduciary Execution
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-medium text-forest-deep tracking-tight">
            Atomic Fund Transfer
          </h1>
          <p className="text-xs text-heritage-secondary mt-1">
            Account-to-account funds dispatch guaranteed by double-entry ledger balancing and pessimistic row locks.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-forest-600 bg-forest-50 px-3 py-1.5 rounded-sm border border-forest-200">
          <Lock className="w-3.5 h-3.5 text-copper" />
          <span>Deterministic Lock Ordering Active</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-sm bg-status-danger-bg border border-status-danger-border text-status-danger text-xs flex items-start gap-3 shadow-heritage-sm animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="leading-relaxed font-sans">{error}</div>
        </div>
      )}

      {/* Completed Transaction Official Certificate */}
      {completedTx ? (
        <div className="bg-heritage-paper p-8 sm:p-10 rounded-sm border border-heritage-border shadow-heritage-card space-y-8 print:shadow-none print:border-none">
          {/* Bank Header Seal */}
          <div className="flex flex-col items-center text-center pb-8 border-b border-heritage-border">
            <div className="w-14 h-14 rounded-sm bg-forest-50 border border-forest-200 text-status-success flex items-center justify-center mb-4 shadow-heritage-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="text-[10px] font-sans uppercase tracking-widest text-copper font-bold">
              Official Dispatch Certificate
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-medium text-forest-deep mt-1">
              Transfer Committed & Settled
            </h2>
            <p className="text-xs text-heritage-secondary mt-1">
              Reference: <span className="font-mono font-bold text-forest-deep">{completedTx.transactionReference}</span>
            </p>
            <div className="mt-4 text-3xl sm:text-4xl font-serif font-medium text-forest-deep">
              ₹{completedTx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div className="p-4 bg-ivory rounded-sm border border-heritage-border-light">
              <span className="text-[10px] uppercase font-sans tracking-widest text-heritage-secondary font-bold block mb-1">
                Debited Origin Vault
              </span>
              <p className="font-mono font-semibold text-sm text-forest-deep">
                {completedTx.sourceAccountNumber || completedTx.maskedSourceAccountNumber}
              </p>
            </div>

            <div className="p-4 bg-ivory rounded-sm border border-heritage-border-light">
              <span className="text-[10px] uppercase font-sans tracking-widest text-heritage-secondary font-bold block mb-1">
                Credited Beneficiary Vault
              </span>
              <p className="font-mono font-semibold text-sm text-forest-deep">
                {completedTx.destinationAccountNumber || completedTx.maskedDestinationAccountNumber}
              </p>
            </div>

            <div className="p-4 bg-ivory rounded-sm border border-heritage-border-light">
              <span className="text-[10px] uppercase font-sans tracking-widest text-heritage-secondary font-bold block mb-1">
                Ledger Settlement Posture
              </span>
              <p className="font-medium text-status-success flex items-center gap-1.5 mt-0.5">
                <FileCheck2 className="w-4 h-4 text-status-success" />
                Double-Entry Verified ({completedTx.status})
              </p>
            </div>

            <div className="p-4 bg-ivory rounded-sm border border-heritage-border-light">
              <span className="text-[10px] uppercase font-sans tracking-widest text-heritage-secondary font-bold block mb-1">
                Execution Timestamp
              </span>
              <p className="font-medium text-heritage-dark mt-0.5">
                {new Date(completedTx.createdAt).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
            </div>
          </div>

          {completedTx.description && (
            <div className="p-4 bg-ivory rounded-sm border border-heritage-border-light text-xs">
              <span className="text-[10px] uppercase font-sans tracking-widest text-heritage-secondary font-bold block mb-1">
                Fiduciary Remittance Note
              </span>
              <p className="text-heritage-dark font-serif italic text-sm">{completedTx.description}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-heritage-border print:hidden">
            <button
              onClick={() => window.print()}
              className="flex-1 py-3 px-4 bg-heritage-paper hover:bg-ivory text-heritage-dark border border-heritage-border rounded-sm text-xs font-sans uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-heritage-sm transition-colors"
            >
              <Printer className="w-4 h-4 text-heritage-secondary" />
              <span>Print Official Receipt</span>
            </button>
            <button
              onClick={resetForm}
              className="flex-1 py-3 px-4 bg-forest-600 hover:bg-forest-500 text-ivory rounded-sm text-xs font-sans uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-heritage-card transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-copper" />
              <span>Initiate New Transfer</span>
            </button>
          </div>
        </div>
      ) : (
        /* Multi-Section Transfer Experience */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleReview} className="space-y-6">
              {/* Step 1: Origin Vault */}
              <div className="p-6 bg-heritage-paper rounded-sm border border-heritage-border shadow-heritage-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-heritage-border">
                  <span className="w-5 h-5 rounded-sm bg-forest-600 text-ivory flex items-center justify-center text-xs font-serif font-bold">
                    1
                  </span>
                  <h3 className="font-serif font-medium text-base text-forest-deep">
                    Select Origin Vault
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-sans font-medium text-heritage-dark mb-1.5">
                    Debit from Account
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-heritage-muted absolute left-3.5 top-3" />
                    <select
                      value={sourceAccountId}
                      onChange={(e) => setSourceAccountId(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-2.5 bg-ivory-light border border-heritage-border rounded-sm text-xs text-heritage-dark focus:outline-none focus:border-forest-600"
                    >
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.accountNumber} ({acc.accountType}) — Available: ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedSource && (
                    <p className="text-[11px] text-copper mt-1.5 font-medium font-sans">
                      Verified Available Liquidity: ₹{selectedSource.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
              </div>

              {/* Step 2: Beneficiary & Recipient */}
              <div className="p-6 bg-heritage-paper rounded-sm border border-heritage-border shadow-heritage-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-heritage-border">
                  <span className="w-5 h-5 rounded-sm bg-forest-600 text-ivory flex items-center justify-center text-xs font-serif font-bold">
                    2
                  </span>
                  <h3 className="font-serif font-medium text-base text-forest-deep">
                    Specify Beneficiary Counterparty
                  </h3>
                </div>

                {beneficiaries.length > 0 && (
                  <div>
                    <label className="block text-xs font-sans font-medium text-heritage-dark mb-1.5">
                      Select Verified Beneficiary (Optional Shortcut)
                    </label>
                    <div className="relative">
                      <Users className="w-4 h-4 text-heritage-muted absolute left-3.5 top-3" />
                      <select
                        value={selectedBeneficiaryId}
                        onChange={handleBeneficiarySelect}
                        className="w-full pl-10 pr-4 py-2.5 bg-ivory-light border border-heritage-border rounded-sm text-xs text-heritage-dark focus:outline-none focus:border-forest-600"
                      >
                        <option value="">-- Choose a pre-enrolled contact or specify below --</option>
                        {beneficiaries.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.beneficiaryName} ({b.beneficiaryAccountNumber})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-sans font-medium text-heritage-dark mb-1.5">
                    Destination Vault Identifier
                  </label>
                  <input
                    type="text"
                    required
                    value={destinationAccountNumber}
                    onChange={(e) => {
                      setDestinationAccountNumber(e.target.value);
                      setSelectedBeneficiaryId('');
                    }}
                    placeholder="e.g. 1002-SAV-739201"
                    className="w-full px-3.5 py-2.5 bg-ivory-light border border-heritage-border rounded-sm text-xs text-heritage-dark font-mono placeholder-heritage-muted focus:outline-none focus:border-forest-600"
                  />
                  <p className="text-[11px] text-heritage-secondary mt-1">
                    Demo Recipient: <code className="text-terracotta font-mono font-bold">1002-SAV-739201</code> (Bob Smith)
                  </p>
                </div>
              </div>

              {/* Step 3: Monetary Value & Purpose */}
              <div className="p-6 bg-heritage-paper rounded-sm border border-heritage-border shadow-heritage-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-heritage-border">
                  <span className="w-5 h-5 rounded-sm bg-forest-600 text-ivory flex items-center justify-center text-xs font-serif font-bold">
                    3
                  </span>
                  <h3 className="font-serif font-medium text-base text-forest-deep">
                    Transfer Value & Remittance Note
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-sans font-medium text-heritage-dark mb-1.5">
                    Monetary Amount (INR ₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-base font-serif text-heritage-muted">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      max="100000"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-2.5 bg-ivory-light border border-heritage-border rounded-sm text-base font-serif font-medium text-forest-deep focus:outline-none focus:border-forest-600"
                    />
                  </div>
                  <p className="text-[11px] text-heritage-secondary mt-1">
                    Institutional transaction limit: ₹1,00,000.00 | Daily limit: ₹5,00,000.00
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-sans font-medium text-heritage-dark mb-1.5">
                    Fiduciary Description (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={255}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Settlement of professional advisory services"
                    className="w-full px-3.5 py-2.5 bg-ivory-light border border-heritage-border rounded-sm text-xs text-heritage-dark placeholder-heritage-muted focus:outline-none focus:border-forest-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-forest-600 hover:bg-forest-500 text-ivory rounded-sm font-sans uppercase tracking-widest text-xs font-semibold shadow-heritage-card transition-all flex items-center justify-center gap-2"
              >
                <span>Review & Authorize Transfer</span>
                <ArrowRight className="w-4 h-4 text-copper" />
              </button>
            </form>
          </div>

          {/* Right Security & Audit Sidebar */}
          <div className="space-y-6">
            <div className="bg-forest-deep text-ivory p-6 rounded-sm border border-forest-600/40 shadow-heritage-card space-y-4">
              <span className="text-[10px] uppercase font-sans tracking-widest text-copper font-bold block">
                Fiduciary Integrity
              </span>
              <h4 className="font-serif font-medium text-base text-ivory">
                Cryptographic Protection Standards
              </h4>
              <p className="text-xs font-sans text-ivory/70 leading-relaxed">
                Transfers execute under atomic ACID database transactions with ordered locks to eliminate race conditions and double-spending vulnerabilities.
              </p>

              <div className="pt-4 border-t border-forest-600/30 space-y-2 text-xs text-ivory/80">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-status-success shrink-0" />
                  <span>Pessimistic Row-Level Lock</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-status-success shrink-0" />
                  <span>Anti-Replay Idempotency Key</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-status-success shrink-0" />
                  <span>Double-Entry Balance Verification</span>
                </div>
              </div>

              {/* Idempotency Details */}
              <div className="pt-4 border-t border-forest-600/30">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-copper font-mono">Deduplication Token:</span>
                  <button
                    type="button"
                    onClick={generateNewIdempotencyKey}
                    className="text-ivory/70 hover:text-copper underline text-[10px]"
                  >
                    Regenerate
                  </button>
                </div>
                <div className="p-2 bg-forest-900 rounded-sm font-mono text-[10px] text-ivory/70 break-all select-all">
                  {idempotencyKey}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal Dialog */}
      {showReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-darkest/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-heritage-paper w-full max-w-lg rounded-sm p-6 sm:p-8 border border-heritage-border shadow-heritage-card space-y-6">
            <div className="border-b border-heritage-border pb-4">
              <span className="text-[10px] uppercase font-sans tracking-widest text-copper font-bold block mb-1">
                Fiduciary Pre-Flight Check
              </span>
              <h3 className="font-serif font-medium text-2xl text-forest-deep">
                Authorize Transaction
              </h3>
              <p className="text-xs text-heritage-secondary mt-1">
                Verify the transfer parameters before committing to the immutable ledger.
              </p>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div className="flex justify-between p-3 bg-ivory rounded-sm border border-heritage-border-light">
                <span className="text-heritage-secondary">Transfer Amount:</span>
                <span className="font-serif font-medium text-base text-forest-deep">
                  ₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-ivory rounded-sm border border-heritage-border-light">
                <span className="text-heritage-secondary">Origin Vault:</span>
                <span className="font-mono font-medium text-forest-deep">{selectedSource?.accountNumber}</span>
              </div>
              <div className="flex justify-between p-3 bg-ivory rounded-sm border border-heritage-border-light">
                <span className="text-heritage-secondary">Destination Vault:</span>
                <span className="font-mono font-medium text-forest-deep">{destinationAccountNumber}</span>
              </div>
              {description && (
                <div className="flex justify-between p-3 bg-ivory rounded-sm border border-heritage-border-light">
                  <span className="text-heritage-secondary">Remittance Note:</span>
                  <span className="text-forest-deep font-serif italic">{description}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowReview(false)}
                className="flex-1 py-3 px-4 bg-heritage-paper hover:bg-ivory text-heritage-secondary border border-heritage-border rounded-sm text-xs font-sans uppercase tracking-widest font-semibold transition-colors"
              >
                Modify Parameters
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleExecuteTransfer}
                className="flex-1 py-3 px-4 bg-terracotta hover:bg-terracotta-hover text-ivory rounded-sm text-xs font-sans uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-heritage-sm transition-colors"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-ivory border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Commit & Sign <ArrowRight className="w-4 h-4 text-copper" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
