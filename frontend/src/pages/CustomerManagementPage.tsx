import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Shield,
  Ban,
  CheckCircle,
  Eye,
  AlertCircle,
  X,
  CreditCard,
  Lock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';
import { User, BankAccount } from '../types';

export const CustomerManagementPage: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Customer Detail Modal
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [customerAccounts, setCustomerAccounts] = useState<BankAccount[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Status Change Dialog
  const [statusTarget, setStatusTarget] = useState<User | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      let url = `/admin/customers?page=${page}&size=10`;
      if (search.trim()) url += `&query=${encodeURIComponent(search.trim())}`;
      const res = await api.get(url);
      if (res.data.success) {
        setCustomers(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  const viewCustomer = async (cust: User) => {
    setSelectedCustomer(cust);
    setDetailLoading(true);
    try {
      const res = await api.get(`/admin/customers/${cust.id}`);
      if (res.data.success) {
        setCustomerAccounts(res.data.data.accounts || []);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const executeStatusChange = async () => {
    if (!statusTarget) return;
    const newStatus = statusTarget.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

    setActionLoading(true);
    try {
      const res = await api.put(`/admin/customers/${statusTarget.id}/status`, { status: newStatus });
      if (res.data.success) {
        setCustomers(prev => prev.map(c => c.id === statusTarget.id ? { ...c, status: newStatus } : c));
        if (selectedCustomer?.id === statusTarget.id) {
          setSelectedCustomer(prev => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update customer status.');
    } finally {
      setActionLoading(false);
      setStatusTarget(null);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Editorial Header */}
      <div className="pb-4 border-b border-heritage-border flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-sans tracking-widest text-copper font-bold block mb-1">
            Registry Oversight
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-medium text-forest-deep tracking-tight">
            Customer Directory
          </h1>
          <p className="text-xs text-heritage-secondary mt-1">
            Search registered bank clients, inspect provisioned vaults, and manage fiduciary status.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-sm bg-status-danger-bg border border-status-danger-border text-status-danger text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-heritage-paper p-4 rounded-sm border border-heritage-border shadow-heritage-sm flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-heritage-muted absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search by legal name or registered email..."
            className="w-full pl-10 pr-4 py-2 bg-ivory border border-heritage-border rounded-sm text-xs text-heritage-dark placeholder-heritage-muted focus:outline-none focus:border-forest-600"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-heritage-paper rounded-sm border border-heritage-border shadow-heritage-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-heritage-secondary font-serif">
            Loading client directory...
          </div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center text-xs text-heritage-secondary font-serif">
            No registered clients match your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="border-b border-heritage-border text-heritage-secondary uppercase text-[10px] tracking-wider bg-ivory/40">
                <tr>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Telephone</th>
                  <th className="py-3 px-4">Authorizations</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">2FA Posture</th>
                  <th className="py-3 px-4">Enrolment Date</th>
                  <th className="py-3 px-4 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-heritage-border-light">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-ivory/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-serif font-medium text-xs text-forest-deep">{c.firstName} {c.lastName}</p>
                      <p className="text-[11px] text-heritage-secondary font-mono">{c.email}</p>
                    </td>
                    <td className="py-3.5 px-4 text-heritage-secondary">{c.phone || '—'}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {c.roles.map(r => (
                          <span key={r} className="px-2 py-0.5 rounded-sm text-[9px] font-sans font-bold uppercase tracking-wider bg-forest-50 text-forest-700 border border-forest-200">
                            {r.replace('ROLE_', '')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-sans font-medium uppercase tracking-wider ${
                        c.status === 'ACTIVE'
                          ? 'bg-status-success-bg text-status-success border border-status-success-border'
                          : 'bg-status-danger-bg text-status-danger border border-status-danger-border'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-sans font-medium ${
                        c.mfaEnabled ? 'text-status-success' : 'text-heritage-muted'
                      }`}>
                        <Shield className="w-3.5 h-3.5" />
                        {c.mfaEnabled ? 'Enforced' : 'Optional'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-heritage-secondary text-[11px]">
                      {new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => viewCustomer(c)}
                          className="p-1.5 bg-forest-50 hover:bg-forest-100 text-forest-600 rounded-sm border border-forest-200 text-xs transition-colors"
                          title="Inspect Client Vaults"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setStatusTarget(c)}
                          disabled={actionLoading || c.roles.includes('ROLE_ADMIN')}
                          className={`p-1.5 rounded-sm text-xs border transition-colors ${
                            c.status === 'ACTIVE'
                              ? 'bg-status-danger-bg hover:bg-red-100 text-status-danger border-status-danger-border'
                              : 'bg-status-success-bg hover:bg-green-100 text-status-success border-status-success-border'
                          } disabled:opacity-30`}
                          title={c.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account'}
                        >
                          {c.status === 'ACTIVE' ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-darkest/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-heritage-paper w-full max-w-xl rounded-sm p-6 sm:p-8 border border-heritage-border shadow-heritage-card space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-heritage-border">
              <div>
                <span className="text-[10px] uppercase font-sans tracking-widest text-copper font-bold block">
                  Client Profile
                </span>
                <h3 className="font-serif font-medium text-2xl text-forest-deep">
                  {selectedCustomer.firstName} {selectedCustomer.lastName}
                </h3>
                <p className="text-[11px] text-heritage-secondary font-mono mt-0.5">
                  {selectedCustomer.email} • Status: {selectedCustomer.status}
                </p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-heritage-secondary hover:text-heritage-dark p-1 rounded-sm">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="font-serif font-medium text-sm text-forest-deep">
                Associated Custodial Vaults:
              </h4>
              {detailLoading ? (
                <div className="py-8 text-center text-xs text-heritage-secondary font-serif">
                  Inspecting customer vaults...
                </div>
              ) : customerAccounts.length === 0 ? (
                <div className="py-8 text-center text-xs text-heritage-secondary font-serif">
                  No bank accounts provisioned for this user.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {customerAccounts.map(acc => (
                    <div key={acc.id} className="p-4 bg-ivory rounded-sm border border-heritage-border flex items-center justify-between text-xs font-sans">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-copper" />
                        <div>
                          <p className="font-mono font-semibold text-xs text-forest-deep">{acc.accountNumber}</p>
                          <p className="text-[10px] text-heritage-secondary uppercase">{acc.accountType} | {acc.status}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-serif font-medium text-sm text-forest-deep">
                          ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] text-copper uppercase font-sans font-bold">{acc.currency}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 text-right border-t border-heritage-border">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="py-2.5 px-5 bg-forest-600 hover:bg-forest-500 text-ivory rounded-sm text-xs font-sans uppercase tracking-widest font-semibold shadow-heritage-sm transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Confirmation Dialog */}
      {statusTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-darkest/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-heritage-paper w-full max-w-sm rounded-sm p-6 border border-heritage-border shadow-heritage-card space-y-4">
            <h3 className="font-serif font-medium text-lg text-forest-deep">
              Modify Client Account Status
            </h3>
            <p className="text-xs text-heritage-secondary font-sans leading-relaxed">
              Are you sure you wish to set the status of <strong>{statusTarget.email}</strong> to{' '}
              <span className="font-bold text-forest-deep">
                {statusTarget.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'}
              </span>
              ? Suspended clients cannot authenticate or initiate fund transfers.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusTarget(null)}
                className="flex-1 py-2 px-3 bg-heritage-paper hover:bg-ivory text-heritage-secondary border border-heritage-border rounded-sm text-xs font-sans font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeStatusChange}
                disabled={actionLoading}
                className="flex-1 py-2 px-3 bg-terracotta hover:bg-terracotta-hover text-ivory rounded-sm text-xs font-sans font-medium shadow-heritage-sm transition-colors"
              >
                {actionLoading ? 'Updating...' : 'Confirm Change'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
