import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Send,
  X,
  Search,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Beneficiary } from '../types';

export const BeneficiariesPage: React.FC = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirm Dialog State
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const fetchBeneficiaries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/beneficiaries');
      if (res.data.success) {
        setBeneficiaries(res.data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load beneficiaries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const handleAddBeneficiary = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const res = await api.post('/beneficiaries', {
        beneficiaryAccountNumber: accountNumber.trim(),
        beneficiaryName: name.trim(),
        nickname: nickname.trim() || undefined,
        email: email.trim() || undefined,
      });

      if (res.data.success) {
        setSuccess('Beneficiary contact successfully enrolled and validated.');
        setIsModalOpen(false);
        setAccountNumber('');
        setName('');
        setNickname('');
        setEmail('');
        fetchBeneficiaries();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to enroll beneficiary.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setError(null);
    setSuccess(null);

    try {
      const res = await api.delete(`/beneficiaries/${deleteTargetId}`);
      if (res.data.success) {
        setSuccess('Beneficiary contact removed from your authorized roster.');
        setBeneficiaries(prev => prev.filter(b => b.id !== deleteTargetId));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to remove beneficiary.');
    } finally {
      setDeleteTargetId(null);
    }
  };

  const filteredBeneficiaries = beneficiaries.filter(b => {
    const q = searchTerm.toLowerCase();
    return (
      b.beneficiaryName.toLowerCase().includes(q) ||
      b.beneficiaryAccountNumber.toLowerCase().includes(q) ||
      (b.nickname && b.nickname.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 font-sans">
      {/* Editorial Header */}
      <div className="pb-4 border-b border-heritage-border flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-sans tracking-widest text-copper font-bold block mb-1">
            Authorized Counterparties
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-medium text-forest-deep tracking-tight">
            Beneficiary Directory
          </h1>
          <p className="text-xs text-heritage-secondary mt-1">
            Pre-authorized transfer recipients verified against internal ledger identifiers.
          </p>
        </div>
        <button
          onClick={() => { setIsModalOpen(true); setError(null); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest-600 hover:bg-forest-500 text-ivory rounded-sm text-xs font-sans uppercase tracking-widest font-semibold shadow-heritage-sm transition-all"
        >
          <UserPlus className="w-3.5 h-3.5 text-copper" />
          <span>Add Beneficiary</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-sm bg-status-danger-bg border border-status-danger-border text-status-danger text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-sm bg-status-success-bg border border-status-success-border text-status-success text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Search & Counter Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-heritage-muted absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by legal name or account identifier..."
            className="w-full pl-10 pr-4 py-2 bg-heritage-paper border border-heritage-border rounded-sm text-xs text-heritage-dark placeholder-heritage-muted focus:outline-none focus:border-forest-600 shadow-heritage-sm"
          />
        </div>
        <div className="text-xs text-heritage-secondary font-sans">
          <span>{filteredBeneficiaries.length} verified counterparties</span>
        </div>
      </div>

      {/* Beneficiaries Table / Cards */}
      <div className="bg-heritage-paper rounded-sm border border-heritage-border shadow-heritage-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-heritage-secondary font-serif">
            Loading counterparty roster...
          </div>
        ) : filteredBeneficiaries.length === 0 ? (
          <div className="py-16 text-center text-xs text-heritage-secondary font-serif">
            {searchTerm ? 'No matching counterparties found.' : 'No beneficiaries enrolled yet. Add a verified contact to expedite transfers.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="border-b border-heritage-border text-heritage-secondary uppercase text-[10px] tracking-wider bg-ivory/40">
                <tr>
                  <th className="py-3 px-4">Beneficiary</th>
                  <th className="py-3 px-4">Account Identifier</th>
                  <th className="py-3 px-4">Financial Institution</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Enrolment Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-heritage-border-light">
                {filteredBeneficiaries.map((b) => (
                  <tr key={b.id} className="hover:bg-ivory/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-sm bg-terracotta/20 border border-terracotta/40 text-terracotta font-serif font-bold text-xs flex items-center justify-center shrink-0">
                          {b.beneficiaryName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-serif font-medium text-xs text-forest-deep">{b.beneficiaryName}</p>
                          {b.nickname && <p className="text-[10px] text-copper font-sans italic">"{b.nickname}"</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-xs text-heritage-dark">
                      {b.beneficiaryAccountNumber}
                    </td>
                    <td className="py-3.5 px-4 text-heritage-secondary">{b.bankName}</td>
                    <td className="py-3.5 px-4 text-heritage-secondary">{b.email || '—'}</td>
                    <td className="py-3.5 px-4 text-heritage-secondary text-[11px]">
                      {new Date(b.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          to={`/transfer?recipient=${b.beneficiaryAccountNumber}`}
                          className="p-1.5 bg-forest-50 hover:bg-forest-100 text-forest-600 rounded-sm border border-forest-200 transition-colors"
                          title="Dispatch Funds"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setDeleteTargetId(b.id)}
                          className="p-1.5 bg-status-danger-bg hover:bg-red-100 text-status-danger rounded-sm border border-status-danger-border transition-colors"
                          title="Revoke Beneficiary"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Beneficiary Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-darkest/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-heritage-paper w-full max-w-md rounded-sm p-6 sm:p-8 border border-heritage-border shadow-heritage-card space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-heritage-border">
              <div>
                <span className="text-[10px] uppercase font-sans tracking-widest text-copper font-bold block">
                  New Counterparty
                </span>
                <h3 className="font-serif font-medium text-xl text-forest-deep">
                  Enrol Beneficiary
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-heritage-secondary hover:text-heritage-dark p-1 rounded-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBeneficiary} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-medium text-heritage-dark mb-1">
                  Recipient Account Identifier
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 1002-SAV-739201"
                  className="w-full px-3 py-2 bg-ivory border border-heritage-border rounded-sm font-mono focus:outline-none focus:border-forest-600"
                />
                <p className="text-[10px] text-heritage-secondary mt-1">
                  Must correspond to an active account registered in SecureBank.
                </p>
              </div>

              <div>
                <label className="block font-medium text-heritage-dark mb-1">
                  Legal Account Holder Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Robert Smith"
                  className="w-full px-3 py-2 bg-ivory border border-heritage-border rounded-sm focus:outline-none focus:border-forest-600"
                />
              </div>

              <div>
                <label className="block font-medium text-heritage-dark mb-1">
                  Nickname (Optional)
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. Consulting Reserve"
                  className="w-full px-3 py-2 bg-ivory border border-heritage-border rounded-sm focus:outline-none focus:border-forest-600"
                />
              </div>

              <div>
                <label className="block font-medium text-heritage-dark mb-1">
                  Contact Email (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@counterparty.com"
                  className="w-full px-3 py-2 bg-ivory border border-heritage-border rounded-sm focus:outline-none focus:border-forest-600"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-heritage-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-3 bg-heritage-paper hover:bg-ivory text-heritage-secondary border border-heritage-border rounded-sm font-sans uppercase tracking-widest text-[11px] font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 px-3 bg-forest-600 hover:bg-forest-500 text-ivory rounded-sm font-sans uppercase tracking-widest text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-heritage-sm"
                >
                  {submitting ? 'Validating...' : 'Authorize Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTargetId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-darkest/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-heritage-paper w-full max-w-sm rounded-sm p-6 border border-heritage-border shadow-heritage-card space-y-4">
            <h3 className="font-serif font-medium text-lg text-forest-deep">
              Revoke Beneficiary
            </h3>
            <p className="text-xs text-heritage-secondary font-sans leading-relaxed">
              Are you sure you wish to remove this counterparty from your authorized list? Any scheduled transfers will require re-authorization.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 py-2 px-3 bg-heritage-paper hover:bg-ivory text-heritage-secondary border border-heritage-border rounded-sm text-xs font-sans font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2 px-3 bg-status-danger hover:bg-red-700 text-ivory rounded-sm text-xs font-sans font-medium shadow-heritage-sm transition-colors"
              >
                Revoke Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
