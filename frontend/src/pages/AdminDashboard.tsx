import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  History,
  AlertTriangle,
  UserCheck,
  FileText,
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';
import { SecurityEvent } from '../types';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/overview');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-forest-600 border-t-copper rounded-full animate-spin" />
      </div>
    );
  }

  const recentEvents: SecurityEvent[] = stats?.recentSecurityEvents || [];

  return (
    <div className="space-y-8 font-sans">
      {/* Operations Console Editorial Header */}
      <div className="pb-4 border-b border-heritage-border flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-sans tracking-widest text-copper font-bold">
              Operations & Risk Control
            </span>
            <span className="text-heritage-muted text-xs">•</span>
            <span className="text-xs text-heritage-secondary font-sans">Master Administrator Session</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-medium text-forest-deep tracking-tight">
            Administrative Operations Console
          </h1>
          <p className="text-xs text-heritage-secondary mt-1">
            Cluster telemetry, rule-based fraud detection triggers, and forensic ledger inspection.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/security-events"
            className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta hover:bg-terracotta-hover text-ivory rounded-sm text-xs font-sans uppercase tracking-widest font-semibold shadow-heritage-sm transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Triage Alerts</span>
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid — Information Dense */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-heritage-paper rounded-sm border border-heritage-border shadow-heritage-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-sans tracking-widest text-heritage-secondary font-bold">
              Registered Clients
            </span>
            <Users className="w-4 h-4 text-forest-600" />
          </div>
          <p className="text-3xl font-serif font-medium text-forest-deep mt-2">{stats?.totalUsers || 0}</p>
          <Link
            to="/admin/customers"
            className="text-xs text-terracotta font-sans font-medium hover:underline mt-2 inline-flex items-center gap-1"
          >
            <span>Customer Registry</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-5 bg-heritage-paper rounded-sm border border-heritage-border shadow-heritage-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-sans tracking-widest text-heritage-secondary font-bold">
              Ledger Transactions
            </span>
            <History className="w-4 h-4 text-forest-600" />
          </div>
          <p className="text-3xl font-serif font-medium text-forest-deep mt-2">{stats?.totalTransactions || 0}</p>
          <Link
            to="/admin/transactions"
            className="text-xs text-terracotta font-sans font-medium hover:underline mt-2 inline-flex items-center gap-1"
          >
            <span>Ledger Audit Monitor</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-5 bg-heritage-paper rounded-sm border border-heritage-border shadow-heritage-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-sans tracking-widest text-heritage-secondary font-bold">
              Security Incidents
            </span>
            <AlertTriangle className="w-4 h-4 text-status-warning" />
          </div>
          <p className="text-3xl font-serif font-medium text-forest-deep mt-2">{stats?.newSecurityEvents || 0}</p>
          <p className="text-[11px] text-copper font-sans mt-2">
            {stats?.underInvestigationEvents || 0} active investigations
          </p>
        </div>

        <div className="p-5 bg-heritage-paper rounded-sm border border-heritage-border shadow-heritage-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-sans tracking-widest text-heritage-secondary font-bold">
              Forensic Audit Entries
            </span>
            <FileText className="w-4 h-4 text-forest-600" />
          </div>
          <p className="text-3xl font-serif font-medium text-forest-deep mt-2">{stats?.recentAuditLogsCount || 0}</p>
          <Link
            to="/admin/audit-logs"
            className="text-xs text-terracotta font-sans font-medium hover:underline mt-2 inline-flex items-center gap-1"
          >
            <span>Forensic Log Stream</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Latest Rule-Based Security Detections */}
      <div className="bg-heritage-paper p-6 sm:p-7 rounded-sm border border-heritage-border shadow-heritage-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-heritage-border">
          <div>
            <h3 className="font-serif font-medium text-lg text-forest-deep flex items-center gap-2">
              <Activity className="w-4 h-4 text-copper" />
              Automated Fraud & Threat Monitoring Telemetry
            </h3>
            <p className="text-xs text-heritage-secondary font-sans mt-0.5">
              Rule triggers: Consecutive failed logins, velocity thresholds, abnormal transfer sums, and IDOR probes
            </p>
          </div>
          <Link
            to="/admin/security-events"
            className="text-xs font-sans font-medium text-terracotta hover:text-terracotta-hover flex items-center gap-1 transition-colors"
          >
            <span>Open Incident Queue</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentEvents.length === 0 ? (
          <div className="py-12 text-center text-xs text-heritage-secondary font-serif">
            No security anomalies currently flagged by the rule engine.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="border-b border-heritage-border text-heritage-secondary uppercase text-[10px] tracking-wider bg-ivory/40">
                <tr>
                  <th className="py-2.5 px-3">Event Signature</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Associated Actor</th>
                  <th className="py-2.5 px-3">Incident Description</th>
                  <th className="py-2.5 px-3">Review Status</th>
                  <th className="py-2.5 px-3 text-right">Detected At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-heritage-border-light">
                {recentEvents.slice(0, 6).map((e) => (
                  <tr key={e.id} className="hover:bg-ivory/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[11px] text-forest-deep">
                      {e.eventType}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-sm text-[9px] font-sans font-bold uppercase tracking-wider border ${
                        e.severity === 'CRITICAL' ? 'bg-status-danger-bg text-status-danger border-status-danger-border' :
                        e.severity === 'HIGH' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                        e.severity === 'MEDIUM' ? 'bg-status-warning-bg text-status-warning border-status-warning-border' :
                        'bg-forest-50 text-forest-700 border-forest-200'
                      }`}>
                        {e.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-heritage-dark">{e.username}</td>
                    <td className="py-3 px-3 text-heritage-secondary max-w-sm truncate">{e.description}</td>
                    <td className="py-3 px-3 font-medium text-heritage-dark">{e.reviewStatus}</td>
                    <td className="py-3 px-3 text-right text-heritage-secondary text-[11px]">
                      {new Date(e.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
