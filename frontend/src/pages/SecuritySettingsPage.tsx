import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Shield,
  Smartphone,
  KeyRound,
  Laptop,
  Trash2,
  History,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  Copy,
  Check,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserSession, LoginAttempt } from '../types';

const formatUserAgent = (ua?: string) => {
  if (!ua) return 'Desktop Browser';
  let browser = 'Web Browser';
  let os = '';

  if (ua.includes('Edg/')) browser = 'Microsoft Edge';
  else if (ua.includes('Chrome/')) browser = 'Google Chrome';
  else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Apple Safari';

  if (ua.includes('Windows NT 10.0') || ua.includes('Windows NT 11.0')) os = 'Windows 10/11';
  else if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Macintosh') || ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return os ? `${browser} (${os})` : browser;
};

export const SecuritySettingsPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();

  // MFA State
  const [mfaData, setMfaData] = useState<{ secretKey: string; qrCodeDataUri: string; recoveryCodes: string[] } | null>(null);
  const [mfaVerifyCode, setMfaVerifyCode] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [mfaSuccess, setMfaSuccess] = useState<string | null>(null);
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Sessions State
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  // Login History State
  const [history, setHistory] = useState<LoginAttempt[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const initData = async () => {
    try {
      const [sessRes, histRes] = await Promise.all([
        api.get('/security/sessions'),
        api.get('/security/login-history'),
      ]);
      if (sessRes.data.success) setSessions(sessRes.data.data);
      if (histRes.data.success) setHistory(histRes.data.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSessionsLoading(false);
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  const handleSetupMfa = async () => {
    setMfaError(null);
    setMfaSuccess(null);
    setMfaLoading(true);

    try {
      const res = await api.post('/security/mfa/setup');
      if (res.data.success) {
        setMfaData(res.data.data);
      }
    } catch (err: any) {
      setMfaError(err.message || 'Failed to initialize MFA setup.');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleEnableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError(null);
    setMfaLoading(true);

    try {
      const res = await api.post('/security/mfa/enable', {
        code: mfaVerifyCode.trim()
      });
      if (res.data.success) {
        setMfaSuccess('Two-factor authentication has been successfully activated.');
        setMfaData(null);
        setMfaVerifyCode('');
        await refreshProfile();
      }
    } catch (err: any) {
      setMfaError(err.message || 'Verification code failed. Please check your authenticator clock.');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleDisableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError(null);
    setMfaLoading(true);

    try {
      const res = await api.post('/security/mfa/disable', { password: disablePassword });
      if (res.data.success) {
        setMfaSuccess('Two-factor authentication disabled.');
        setDisableModalOpen(false);
        setDisablePassword('');
        await refreshProfile();
      }
    } catch (err: any) {
      setMfaError(err.message || 'Incorrect master password.');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: number) => {
    try {
      const res = await api.delete(`/security/sessions/${sessionId}`);
      if (res.data.success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const copyRecoveryCodes = () => {
    if (mfaData?.recoveryCodes) {
      navigator.clipboard.writeText(mfaData.recoveryCodes.join('\n'));
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      {/* Editorial Header */}
      <div className="pb-4 border-b border-heritage-border flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-sans tracking-widest text-copper font-bold block mb-1">
            Access Hardening
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-medium text-forest-deep tracking-tight">
            Security & Authentication Center
          </h1>
          <p className="text-xs text-heritage-secondary mt-1">
            Enforce multi-factor verification, audit active session boundaries, and monitor authentication history.
          </p>
        </div>
      </div>

      {mfaSuccess && (
        <div className="p-4 bg-status-success-bg border border-status-success-border text-status-success text-xs rounded-sm flex items-center justify-between shadow-heritage-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{mfaSuccess}</span>
          </div>
          <button onClick={() => setMfaSuccess(null)} className="p-1 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {mfaError && (
        <div className="p-4 bg-status-danger-bg border border-status-danger-border text-status-danger text-xs rounded-sm flex items-center justify-between shadow-heritage-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{mfaError}</span>
          </div>
          <button onClick={() => setMfaError(null)} className="p-1 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Two-Factor Authentication Section */}
      <div className="bg-heritage-paper p-6 sm:p-8 rounded-sm border border-heritage-border shadow-heritage-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-heritage-border">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-sm flex items-center justify-center shrink-0 border ${
              user?.mfaEnabled
                ? 'bg-forest-50 border-forest-200 text-status-success'
                : 'bg-ivory border-heritage-border text-heritage-secondary'
            }`}>
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-medium text-lg text-forest-deep">
                Two-Factor Authentication (RFC 6238 TOTP)
              </h3>
              <p className="text-xs text-heritage-secondary font-sans mt-0.5">
                Generate dynamic 6-digit one-time passcodes using Google Authenticator, Microsoft Authenticator, or 1Password.
              </p>
            </div>
          </div>

          <div>
            {user?.mfaEnabled ? (
              <button
                onClick={() => setDisableModalOpen(true)}
                className="px-4 py-2 border border-status-danger-border text-status-danger hover:bg-status-danger-bg rounded-sm text-xs font-sans uppercase tracking-wider font-semibold transition-colors"
              >
                Disable 2FA
              </button>
            ) : (
              <button
                onClick={handleSetupMfa}
                disabled={mfaLoading || !!mfaData}
                className="px-5 py-2.5 bg-forest-600 hover:bg-forest-500 text-ivory rounded-sm text-xs font-sans uppercase tracking-widest font-semibold shadow-heritage-sm transition-colors"
              >
                {mfaLoading ? 'Generating Key...' : 'Enforce 2FA Protection'}
              </button>
            )}
          </div>
        </div>

        {/* Live Enrollment Step (QR Code + Backup Codes) */}
        {mfaData && (
          <div className="p-6 bg-ivory rounded-sm border border-heritage-border space-y-6 animate-in fade-in">
            <div className="flex items-center gap-2 text-forest-deep">
              <KeyRound className="w-4 h-4 text-copper" />
              <h4 className="font-serif font-medium text-base">Pair Authenticator Application</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* QR Code Container */}
              <div className="flex flex-col items-center p-4 bg-heritage-paper rounded-sm border border-heritage-border shadow-heritage-sm">
                <img
                  src={mfaData.qrCodeDataUri}
                  alt="MFA QR Code"
                  className="w-44 h-44 rounded-sm border border-heritage-border"
                />
                <p className="text-[11px] text-heritage-secondary mt-3 text-center font-sans">
                  Scan with your mobile authenticator app.
                </p>
                <div className="mt-2 text-center">
                  <span className="text-[10px] text-heritage-muted uppercase tracking-wider block">Manual Secret Key:</span>
                  <code className="text-xs font-mono font-bold text-forest-deep select-all">{mfaData.secretKey}</code>
                </div>
              </div>

              {/* Recovery Codes & Verification Form */}
              <div className="space-y-4 text-xs font-sans">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-heritage-dark uppercase text-[10px] tracking-wider">
                      Single-Use Emergency Recovery Codes:
                    </span>
                    <button
                      type="button"
                      onClick={copyRecoveryCodes}
                      className="text-terracotta hover:underline flex items-center gap-1 text-[11px] font-medium"
                    >
                      {copiedCodes ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCodes ? 'Copied' : 'Copy Codes'}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-3 bg-heritage-paper border border-heritage-border rounded-sm font-mono text-[11px] text-forest-deep">
                    {mfaData.recoveryCodes.map((code, idx) => (
                      <span key={idx} className="p-1 bg-ivory rounded-sm text-center border border-heritage-border-light">{code}</span>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleEnableMfa} className="space-y-3 pt-2">
                  <label className="block font-medium text-heritage-dark">
                    Enter 6-digit Code from Authenticator:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={mfaVerifyCode}
                      onChange={(e) => setMfaVerifyCode(e.target.value)}
                      placeholder="123456"
                      className="flex-1 px-3 py-2 bg-heritage-paper border border-heritage-border rounded-sm text-center font-mono text-base font-bold tracking-widest text-forest-deep focus:outline-none focus:border-forest-600"
                    />
                    <button
                      type="submit"
                      disabled={mfaLoading || mfaVerifyCode.length < 6}
                      className="px-5 py-2 bg-forest-600 hover:bg-forest-500 text-ivory rounded-sm font-sans uppercase tracking-widest text-xs font-semibold shadow-heritage-sm disabled:opacity-50 transition-colors"
                    >
                      Verify & Activate
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Sessions Inspection */}
      <div className="bg-heritage-paper p-6 sm:p-8 rounded-sm border border-heritage-border shadow-heritage-sm space-y-4">
        <div className="pb-3 border-b border-heritage-border flex justify-between items-center">
          <div>
            <h3 className="font-serif font-medium text-lg text-forest-deep">
              Active Browser Sessions
            </h3>
            <p className="text-xs text-heritage-secondary font-sans">
              Live sessions issued with HttpOnly cookie isolation and session migration guards
            </p>
          </div>
          <span className="text-xs text-heritage-secondary font-sans">{sessions.length} registered sessions</span>
        </div>

        {sessionsLoading ? (
          <div className="py-8 text-center text-xs text-heritage-secondary font-serif">
            Inspecting session registry...
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-8 text-center text-xs text-heritage-secondary font-serif">
            No external active sessions detected.
          </div>
        ) : (
          <div className="divide-y divide-heritage-border-light">
            {sessions.map((sess) => (
              <div key={sess.id} className="py-3 flex items-center justify-between text-xs font-sans">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-sm bg-forest-50 border border-forest-200 text-forest-600 flex items-center justify-center">
                    <Laptop className="w-4 h-4 text-copper" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-forest-deep" title={sess.userAgent}>
                        {formatUserAgent(sess.userAgent)}
                      </span>
                      {sess.current && (
                        <span className="text-[9px] uppercase font-sans tracking-wider font-bold bg-forest-50 text-status-success px-1.5 py-0.5 rounded-sm border border-forest-200">
                          Current Session
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-heritage-secondary mt-0.5 font-mono">
                      IP: {sess.ipAddress} • Last Activity: {new Date(sess.lastActivity).toLocaleString()}
                    </p>
                  </div>
                </div>

                {!sess.current && (
                  <button
                    onClick={() => handleRevokeSession(sess.id)}
                    className="p-1.5 bg-status-danger-bg hover:bg-red-100 text-status-danger rounded-sm border border-status-danger-border transition-colors"
                    title="Terminate Session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Login History Stream */}
      <div className="bg-heritage-paper p-6 sm:p-8 rounded-sm border border-heritage-border shadow-heritage-sm space-y-4">
        <div className="pb-3 border-b border-heritage-border">
          <h3 className="font-serif font-medium text-lg text-forest-deep">
            Authentication Audit Log
          </h3>
          <p className="text-xs text-heritage-secondary font-sans">
            Chronological audit stream of login attempts and security events
          </p>
        </div>

        {historyLoading ? (
          <div className="py-8 text-center text-xs text-heritage-secondary font-serif">
            Loading login history...
          </div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-xs text-heritage-secondary font-serif">
            No prior login attempts on record.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="border-b border-heritage-border text-heritage-secondary uppercase text-[10px] tracking-wider bg-ivory/40">
                <tr>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">IP Address</th>
                  <th className="py-2.5 px-3">Device / User Agent</th>
                  <th className="py-2.5 px-3">Failure Reason</th>
                  <th className="py-2.5 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-heritage-border-light">
                {history.slice(0, 10).map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-ivory/60 transition-colors">
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-sans font-medium uppercase tracking-wider ${
                        attempt.success
                          ? 'bg-status-success-bg text-status-success border border-status-success-border'
                          : 'bg-status-danger-bg text-status-danger border border-status-danger-border'
                      }`}>
                        {attempt.success ? 'SUCCESS' : 'FAILURE'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-heritage-dark">{attempt.ipAddress}</td>
                    <td className="py-2.5 px-3 text-heritage-secondary" title={attempt.userAgent}>
                      {formatUserAgent(attempt.userAgent)}
                    </td>
                    <td className="py-2.5 px-3 text-heritage-muted">{attempt.failureReason || '—'}</td>
                    <td className="py-2.5 px-3 text-right text-heritage-secondary">
                      {new Date(attempt.attemptTime).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Disable 2FA Modal */}
      {disableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-darkest/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-heritage-paper w-full max-w-sm rounded-sm p-6 border border-heritage-border shadow-heritage-card space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-heritage-border">
              <h3 className="font-serif font-medium text-lg text-forest-deep">
                Deactivate Two-Factor Authentication
              </h3>
              <button
                onClick={() => setDisableModalOpen(false)}
                className="text-heritage-secondary hover:text-heritage-dark p-1 rounded-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-heritage-secondary font-sans leading-relaxed">
              Confirm your master password to deactivate two-factor authentication. This will lower your account security score.
            </p>
            <form onSubmit={handleDisableMfa} className="space-y-4 text-xs font-sans">
              <input
                type="password"
                required
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                placeholder="Enter master password"
                className="w-full px-3.5 py-2.5 bg-ivory border border-heritage-border rounded-sm focus:outline-none focus:border-forest-600"
              />
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDisableModalOpen(false)}
                  className="flex-1 py-2 px-3 bg-heritage-paper hover:bg-ivory text-heritage-secondary border border-heritage-border rounded-sm text-xs font-sans font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mfaLoading}
                  className="flex-1 py-2 px-3 bg-status-danger hover:bg-red-700 text-ivory rounded-sm text-xs font-sans font-medium shadow-heritage-sm transition-colors"
                >
                  Confirm Deactivation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
