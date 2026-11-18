import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Lock
} from 'lucide-react';
import api from '../services/api';
import { AuditLog } from '../types';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [actorFilter, setActorFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let url = `/admin/audit-logs?page=${page}&size=20`;
      if (actorFilter.trim()) url += `&actor=${encodeURIComponent(actorFilter.trim())}`;
      if (actionFilter.trim()) url += `&action=${encodeURIComponent(actionFilter.trim())}`;
      if (statusFilter.trim()) url += `&status=${encodeURIComponent(statusFilter.trim())}`;

      const res = await api.get(url);
      if (res.data.success) {
        setLogs(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actorFilter, actionFilter, statusFilter]);

  return (
    <div className="space-y-8 font-sans">
      {/* Editorial Header */}
      <div className="pb-4 border-b border-heritage-border flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-sans tracking-widest text-copper font-bold block mb-1">
            Forensic Telemetry
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-medium text-forest-deep tracking-tight">
            Security Audit Logs
          </h1>
          <p className="text-xs text-heritage-secondary mt-1">
            Immutable forensic activity journal tracing authentication, money transfers, administrative modifications, and security anomalies.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-forest-600 bg-forest-50 px-3 py-1.5 rounded-sm border border-forest-200">
          <Lock className="w-3.5 h-3.5 text-copper" />
          <span>Non-Repudiation Guaranteed</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-heritage-paper p-4 rounded-sm border border-heritage-border shadow-heritage-sm flex flex-wrap gap-3 items-center justify-between text-xs font-sans">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="w-4 h-4 text-heritage-muted absolute left-3 top-2.5" />
          <input
            type="text"
            value={actorFilter}
            onChange={(e) => { setActorFilter(e.target.value); setPage(0); }}
            placeholder="Filter by Actor username..."
            className="w-full pl-9 pr-3 py-2 bg-ivory border border-heritage-border rounded-sm focus:outline-none focus:border-forest-600 text-xs text-heritage-dark placeholder-heritage-muted"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
            className="px-3 py-2 bg-ivory border border-heritage-border rounded-sm focus:outline-none focus:border-forest-600 text-xs text-heritage-dark"
          >
            <option value="">All Forensic Actions</option>
            <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
            <option value="LOGIN_FAILED">LOGIN_FAILED</option>
            <option value="TRANSFER_COMPLETED">TRANSFER_COMPLETED</option>
            <option value="IDOR_ATTEMPT">IDOR_ATTEMPT</option>
            <option value="PASSWORD_CHANGE_SUCCESS">PASSWORD_CHANGE_SUCCESS</option>
            <option value="MFA_ENABLED">MFA_ENABLED</option>
            <option value="BENEFICIARY_ADDED">BENEFICIARY_ADDED</option>
            <option value="ADMIN_CUSTOMER_STATUS_UPDATED">ADMIN_STATUS_UPDATED</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="px-3 py-2 bg-ivory border border-heritage-border rounded-sm focus:outline-none focus:border-forest-600 text-xs text-heritage-dark"
          >
            <option value="">All Verification Outcomes</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILURE">FAILURE</option>
            <option value="WARNING">WARNING</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-heritage-paper rounded-sm border border-heritage-border shadow-heritage-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-heritage-secondary font-serif">
            Streaming immutable audit entries...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-xs text-heritage-secondary font-serif">
            No audit records match the current filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="border-b border-heritage-border text-heritage-secondary uppercase text-[10px] tracking-wider bg-ivory/40">
                <tr>
                  <th className="py-3 px-4">Outcome</th>
                  <th className="py-3 px-4">Action Signature</th>
                  <th className="py-3 px-4">Actor Principal</th>
                  <th className="py-3 px-4">Target Resource</th>
                  <th className="py-3 px-4">Network IP</th>
                  <th className="py-3 px-4">Audit Metadata</th>
                  <th className="py-3 px-4">Correlation ID</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-heritage-border-light">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-ivory/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[9px] font-sans font-bold uppercase tracking-wider border ${
                        log.status === 'SUCCESS' ? 'bg-status-success-bg text-status-success border-status-success-border' :
                        log.status === 'FAILURE' ? 'bg-status-danger-bg text-status-danger border-status-danger-border' :
                        'bg-status-warning-bg text-status-warning border-status-warning-border'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[11px] text-forest-deep">{log.action}</td>
                    <td className="py-3.5 px-4 text-heritage-dark font-medium">{log.actorUsername}</td>
                    <td className="py-3.5 px-4 font-mono text-heritage-secondary text-[11px]">{log.targetResource || '—'}</td>
                    <td className="py-3.5 px-4 font-mono text-heritage-secondary text-[11px]">{log.ipAddress}</td>
                    <td className="py-3.5 px-4 text-heritage-secondary max-w-xs truncate" title={log.details}>
                      {log.details || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-heritage-muted text-[10px]">{log.correlationId || '—'}</td>
                    <td className="py-3.5 px-4 text-right text-heritage-secondary text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
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
