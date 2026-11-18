import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Clock,
  Edit,
  Lock
} from 'lucide-react';
import api from '../services/api';
import { SecurityEvent } from '../types';

export const SecurityEventsPage: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Review Modal
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [newStatus, setNewStatus] = useState<string>('UNDER_INVESTIGATION');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let url = `/admin/security-events?page=${page}&size=15`;
      if (severityFilter) url += `&severity=${severityFilter}`;
      if (statusFilter) url += `&reviewStatus=${statusFilter}`;

      const res = await api.get(url);
      if (res.data.success) {
        setEvents(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, severityFilter, statusFilter]);

  const openReviewModal = (e: SecurityEvent) => {
    setSelectedEvent(e);
    setNewStatus(e.reviewStatus === 'NEW' ? 'UNDER_INVESTIGATION' : e.reviewStatus);
    setNotes('');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    setSubmitting(true);

    try {
      const res = await api.put(`/admin/security-events/${selectedEvent.id}`, {
        reviewStatus: newStatus,
        notes: notes.trim() || undefined,
      });

      if (res.data.success) {
        setEvents(prev => prev.map(ev => ev.id === selectedEvent.id ? res.data.data : ev));
        setSelectedEvent(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update event review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Editorial Header */}
      <div className="pb-4 border-b border-heritage-border flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-sans tracking-widest text-copper font-bold block mb-1">
            Threat Intelligence
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-medium text-forest-deep tracking-tight">
            Security Incident Queue
          </h1>
          <p className="text-xs text-heritage-secondary mt-1">
            Rule-based anomaly detection engine flags: Brute-force bursts, transfer sum anomalies, velocity violations, and IDOR attacks.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-heritage-paper p-4 rounded-sm border border-heritage-border shadow-heritage-sm flex flex-wrap gap-3 items-center justify-between text-xs font-sans">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-copper" />
          <span className="font-semibold text-heritage-dark uppercase text-[10px] tracking-wider">
            Filter Incidents:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={severityFilter}
            onChange={(e) => { setSeverityFilter(e.target.value); setPage(0); }}
            className="px-3 py-2 bg-ivory border border-heritage-border rounded-sm focus:outline-none focus:border-forest-600 text-xs text-heritage-dark"
          >
            <option value="">All Severity Tiers</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="px-3 py-2 bg-ivory border border-heritage-border rounded-sm focus:outline-none focus:border-forest-600 text-xs text-heritage-dark"
          >
            <option value="">All Triage Statuses</option>
            <option value="NEW">New (Unreviewed)</option>
            <option value="UNDER_INVESTIGATION">Under Investigation</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-heritage-paper rounded-sm border border-heritage-border shadow-heritage-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-heritage-secondary font-serif">
            Streaming security incidents...
          </div>
        ) : events.length === 0 ? (
          <div className="py-16 text-center text-xs text-heritage-secondary font-serif">
            No security incidents match the specified filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="border-b border-heritage-border text-heritage-secondary uppercase text-[10px] tracking-wider bg-ivory/40">
                <tr>
                  <th className="py-3 px-4">Event Signature</th>
                  <th className="py-3 px-4">Severity Tier</th>
                  <th className="py-3 px-4">Target Actor</th>
                  <th className="py-3 px-4">Forensic Description</th>
                  <th className="py-3 px-4">Triage Status</th>
                  <th className="py-3 px-4">Adjudicator</th>
                  <th className="py-3 px-4">Detected At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-heritage-border-light">
                {events.map((e) => (
                  <tr key={e.id} className="hover:bg-ivory/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[11px] text-forest-deep">
                      {e.eventType}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-sm text-[9px] font-sans font-bold uppercase tracking-wider border ${
                        e.severity === 'CRITICAL' ? 'bg-status-danger-bg text-status-danger border-status-danger-border' :
                        e.severity === 'HIGH' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                        e.severity === 'MEDIUM' ? 'bg-status-warning-bg text-status-warning border-status-warning-border' :
                        'bg-forest-50 text-forest-700 border-forest-200'
                      }`}>
                        {e.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-heritage-dark">{e.username || 'System Actor'}</td>
                    <td className="py-3.5 px-4 text-heritage-secondary max-w-sm truncate" title={e.description}>
                      {e.description}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[11px] text-heritage-dark">{e.reviewStatus}</span>
                    </td>
                    <td className="py-3.5 px-4 text-heritage-secondary">{e.resolvedBy || '—'}</td>
                    <td className="py-3.5 px-4 text-heritage-secondary text-[11px]">
                      {new Date(e.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openReviewModal(e)}
                        className="p-1.5 bg-forest-50 hover:bg-forest-100 text-forest-600 rounded-sm border border-forest-200 text-xs transition-colors"
                        title="Triage & Update Status"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
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

      {/* Review Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-darkest/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-heritage-paper w-full max-w-md rounded-sm p-6 sm:p-8 border border-heritage-border shadow-heritage-card space-y-5 text-xs font-sans">
            <div className="flex justify-between items-center pb-3 border-b border-heritage-border">
              <div>
                <span className="text-[10px] uppercase font-sans tracking-widest text-copper font-bold block">
                  Incident Triage
                </span>
                <h3 className="font-serif font-medium text-xl text-forest-deep">
                  Investigate Event #{selectedEvent.id}
                </h3>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-heritage-secondary hover:text-heritage-dark p-1 rounded-sm">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-ivory rounded-sm border border-heritage-border space-y-1">
              <p className="font-mono font-bold text-forest-deep">{selectedEvent.eventType} ({selectedEvent.severity})</p>
              <p className="text-heritage-secondary text-[11px] leading-relaxed">{selectedEvent.description}</p>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block font-medium text-heritage-dark mb-1">Set Adjudication Status:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-ivory border border-heritage-border rounded-sm focus:outline-none focus:border-forest-600 text-xs"
                >
                  <option value="NEW">New (Unreviewed)</option>
                  <option value="UNDER_INVESTIGATION">Under Investigation</option>
                  <option value="RESOLVED">Resolved (Action Taken)</option>
                  <option value="DISMISSED">Dismissed (False Positive)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-heritage-dark mb-1">Investigation / Adjudication Notes:</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Verified customer location, confirmed legitimate transaction authorization."
                  className="w-full px-3 py-2 bg-ivory border border-heritage-border rounded-sm focus:outline-none focus:border-forest-600 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-heritage-border">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 py-2.5 px-3 bg-heritage-paper hover:bg-ivory text-heritage-secondary border border-heritage-border rounded-sm font-sans uppercase tracking-widest text-[11px] font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 px-3 bg-forest-600 hover:bg-forest-500 text-ivory rounded-sm font-sans uppercase tracking-widest text-[11px] font-semibold transition-colors shadow-heritage-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Commit Adjudication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
