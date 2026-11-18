import React, { useState, useEffect } from 'react';
import { History, Search, ArrowUpRight, ArrowDownLeft, ShieldCheck, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import api from '../services/api';
import { Transaction } from '../types';

export const AdminTransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/transactions?page=${page}&size=15`);
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
  }, [page]);

  return (
    <div className="space-y-8 font-sans">
      {/* Editorial Header */}
      <div className="pb-4 border-b border-heritage-border flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-sans tracking-widest text-copper font-bold block mb-1">
            Cluster Ledger Monitor
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-medium text-forest-deep tracking-tight">
            System-Wide Transactions
          </h1>
          <p className="text-xs text-heritage-secondary mt-1">
            Live telemetry stream of all inter-account transfers executed across the banking cluster.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-forest-600 bg-forest-50 px-3 py-1.5 rounded-sm border border-forest-200">
          <Lock className="w-3.5 h-3.5 text-copper" />
          <span>Double-Entry Invariants Enforced</span>
        </div>
      </div>

      <div className="bg-heritage-paper rounded-sm border border-heritage-border shadow-heritage-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-heritage-secondary font-serif">
            Streaming transactions from cluster nodes...
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center text-xs text-heritage-secondary font-serif">
            No transactions recorded across the cluster yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="border-b border-heritage-border text-heritage-secondary uppercase text-[10px] tracking-wider bg-ivory/40">
                <tr>
                  <th className="py-3 px-4">Reference ID</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Origin Account</th>
                  <th className="py-3 px-4">Destination Account</th>
                  <th className="py-3 px-4 text-right">Settled Amount</th>
                  <th className="py-3 px-4">Ledger Status</th>
                  <th className="py-3 px-4">Fiduciary Description</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-heritage-border-light">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-ivory/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-[11px] text-forest-deep">
                      {tx.transactionReference}
                    </td>
                    <td className="py-3.5 px-4 font-sans font-medium text-heritage-dark">
                      {tx.transactionType}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-heritage-secondary text-[11px]">
                      {tx.sourceAccountNumber || 'System Opening'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-heritage-secondary text-[11px]">
                      {tx.destinationAccountNumber}
                    </td>
                    <td className="py-3.5 px-4 text-right font-serif font-medium text-sm text-forest-deep">
                      ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-sm text-[10px] font-sans font-medium uppercase tracking-wider bg-forest-50 text-forest-700 border border-forest-200">
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-heritage-secondary max-w-xs truncate">
                      {tx.description}
                    </td>
                    <td className="py-3.5 px-4 text-right text-heritage-secondary text-[11px]">
                      {new Date(tx.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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
    </div>
  );
};
