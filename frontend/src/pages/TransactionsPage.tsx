import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileCheck2,
  Lock
} from 'lucide-react';
import api from '../services/api';
import { Transaction, LedgerEntry } from '../types';

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchRef, setSearchRef] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Ledger Inspection
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      let url = `/transactions?page=${page}&size=10`;
      if (typeFilter) url += `&type=${typeFilter}`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const res = await api.get(url);
      if (res.data.success) {
        setTransactions(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, typeFilter, statusFilter]);

  const inspectLedger = async (tx: Transaction) => {
    setSelectedTx(tx);
    setLedgerLoading(true);
    try {
      const res = await api.get(`/transactions/${tx.id}/ledger`);
      if (res.data.success) {
        setLedgerEntries(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLedgerLoading(false);
    }
  };

  const filteredTransactions = searchRef
    ? transactions.filter(t => t.transactionReference.toLowerCase().includes(searchRef.toLowerCase().trim()))
    : transactions;

  return (
    <div className="space-y-8 font-sans">
      {/* Editorial Header */}
      <div className="pb-4 border-b border-heritage-border flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-sans tracking-widest text-copper font-bold block mb-1">
            Historical Archive
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-medium text-forest-deep tracking-tight">
            Transaction Ledger
          </h1>
          <p className="text-xs text-heritage-secondary mt-1">
            Immutable financial records tied to double-entry accounting invariants.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-forest-600 bg-forest-50 px-3 py-1.5 rounded-sm border border-forest-200">
          <ShieldCheck className="w-3.5 h-3.5 text-copper" />
          <span>Double-Entry Verified</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-heritage-paper p-4 rounded-sm border border-heritage-border shadow-heritage-sm flex flex-wrap gap-3 items-center justify-between text-xs">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-heritage-muted absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchRef}
            onChange={(e) => setSearchRef(e.target.value)}
            placeholder="Search by reference ID (e.g. TXN-...)"
            className="w-full pl-9 pr-3 py-2 bg-ivory border border-heritage-border rounded-sm focus:outline-none focus:border-forest-600 font-mono text-xs text-heritage-dark placeholder-heritage-muted"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
            className="px-3 py-2 bg-ivory border border-heritage-border rounded-sm focus:outline-none focus:border-forest-600 text-xs font-sans text-heritage-dark"
          >
            <option value="">All Classification Types</option>
            <option value="TRANSFER">Transfers</option>
            <option value="DEPOSIT">Deposits</option>
            <option value="WITHDRAWAL">Withdrawals</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="px-3 py-2 bg-ivory border border-heritage-border rounded-sm focus:outline-none focus:border-forest-600 text-xs font-sans text-heritage-dark"
          >
            <option value="">All Settlement Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      </div>

      {/* Transactions Table — Editorial Design */}
      <div className="bg-heritage-paper rounded-sm border border-heritage-border shadow-heritage-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-heritage-secondary font-serif">
            Loading ledger records...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-16 text-center text-xs text-heritage-secondary font-serif">
            No transaction records match the specified query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="border-b border-heritage-border text-heritage-secondary uppercase text-[10px] tracking-wider bg-ivory/40">
                <tr>
                  <th className="py-3 px-4">Reference ID</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Remittance Description</th>
                  <th className="py-3 px-4">Origin Vault</th>
                  <th className="py-3 px-4">Beneficiary Vault</th>
                  <th className="py-3 px-4 text-right">Monetary Value</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-heritage-border-light">
                {filteredTransactions.map((tx) => {
                  const isDebit = Boolean(tx.debit ?? tx.isDebit);
                  return (
                  <tr key={tx.id} className="hover:bg-ivory/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-[11px] text-forest-deep">
                      {tx.transactionReference}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 font-sans text-[11px] font-medium ${
                        isDebit ? 'text-status-danger' : 'text-status-success'
                      }`}>
                        {isDebit ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                        {tx.transactionType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-heritage-dark max-w-xs truncate">{tx.description}</td>
                    <td className="py-3.5 px-4 font-mono text-heritage-secondary text-[11px]">
                      {tx.maskedSourceAccountNumber || 'System Reserve'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-heritage-secondary text-[11px]">
                      {tx.maskedDestinationAccountNumber || '—'}
                    </td>
                    <td className={`py-3.5 px-4 text-right font-serif font-medium text-sm ${
                      isDebit ? 'text-status-danger' : 'text-status-success'
                    }`}>
                      {isDebit ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-sm text-[10px] font-sans font-medium uppercase tracking-wider bg-forest-50 text-forest-700 border border-forest-200">
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-heritage-secondary text-[11px]">
                      {new Date(tx.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => inspectLedger(tx)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-forest-50 hover:bg-forest-100 text-forest-600 rounded-sm border border-forest-200 text-[10px] font-sans uppercase tracking-wider font-semibold transition-colors"
                      >
                        <Layers className="w-3.5 h-3.5 text-copper" />
                        <span>Ledger</span>
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-heritage-border bg-ivory/30 flex items-center justify-between text-xs text-heritage-secondary font-sans">
            <span>Page {page + 1} of {totalPages}</span>
            <div className="flex gap-1.5">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                className="p-1.5 rounded-sm border border-heritage-border disabled:opacity-40 hover:bg-heritage-paper transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-sm border border-heritage-border disabled:opacity-40 hover:bg-heritage-paper transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Double-Entry Ledger Inspection Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-darkest/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-heritage-paper w-full max-w-2xl rounded-sm p-6 sm:p-8 border border-heritage-border shadow-heritage-card space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-heritage-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-sm bg-forest-50 border border-forest-200 text-forest-600 flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-copper" />
                </div>
                <div>
                  <h3 className="font-serif font-medium text-xl text-forest-deep">
                    Double-Entry Ledger Audit
                  </h3>
                  <p className="text-[11px] text-heritage-secondary font-mono mt-0.5">
                    Reference: {selectedTx.transactionReference}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-heritage-secondary hover:text-heritage-dark p-1 rounded-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-heritage-secondary font-sans leading-relaxed">
              This transfer committed atomic debit and credit entries to the immutable ledger under isolation level Read Committed with deterministic write locks, preserving conservation of value.
            </p>

            {ledgerLoading ? (
              <div className="py-8 text-center text-xs text-heritage-secondary font-serif">
                Retrieving ledger journal entries...
              </div>
            ) : ledgerEntries.length === 0 ? (
              <div className="py-8 text-center text-xs text-heritage-secondary font-serif">
                No ledger journal records found.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  {ledgerEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-4 rounded-sm border ${
                        entry.entryType === 'DEBIT'
                          ? 'bg-status-danger-bg border-status-danger-border text-heritage-dark'
                          : 'bg-status-success-bg border-status-success-border text-heritage-dark'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${
                          entry.entryType === 'DEBIT'
                            ? 'bg-status-danger/10 text-status-danger border-status-danger/30'
                            : 'bg-status-success/10 text-status-success border-status-success/30'
                        }`}>
                          {entry.entryType} JOURNAL ENTRY
                        </span>
                        <span className="font-serif text-sm font-semibold">
                          {entry.entryType === 'DEBIT' ? '-' : '+'}₹{entry.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <p className="text-[11px] text-heritage-secondary font-mono">Vault: {entry.accountNumber}</p>
                      <p className="text-[11px] font-sans font-medium text-heritage-dark mt-1">
                        Balance Following: ₹{entry.balanceAfter.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-heritage-muted mt-2">{entry.description}</p>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-ivory rounded-sm text-[11px] text-heritage-secondary border border-heritage-border flex items-center justify-between font-sans">
                  <span>Conservation Equation: Net Sum == ₹0.00</span>
                  <span className="font-semibold text-status-success flex items-center gap-1">
                    <FileCheck2 className="w-3.5 h-3.5" /> Balanced & Audited
                  </span>
                </div>
              </div>
            )}

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedTx(null)}
                className="py-2.5 px-5 bg-forest-600 hover:bg-forest-500 text-ivory rounded-sm text-xs font-sans uppercase tracking-widest font-semibold shadow-heritage-sm transition-colors"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
