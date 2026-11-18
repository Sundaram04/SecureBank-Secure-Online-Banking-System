import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Lock, KeyRound, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../services/api';

export const PasswordResetPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('Password entries do not match.');
      return;
    }

    if (newPassword.length < 10) {
      setError('Password must contain at least 10 characters with uppercase, lowercase, numeral, and special symbol.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/password/reset', {
        token: token.trim(),
        newPassword,
      });

      if (res.data.success) {
        setSuccess('Master password successfully updated! All existing sessions have been terminated. Redirecting to sign in...');
        setTimeout(() => navigate('/login'), 2200);
      }
    } catch (err: any) {
      setError(err.message || 'Password reset failed. The authorization token may be expired or already consumed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory text-heritage-dark flex flex-col lg:flex-row selection:bg-forest-600 selection:text-ivory font-sans">
      {/* Left Column: Forest Green Editorial */}
      <div className="lg:w-5/12 bg-forest-deep text-ivory p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-forest-600/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-copper/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-11 h-11 rounded-sm bg-forest-light border border-copper/50 flex items-center justify-center shadow-sm">
              <span className="font-serif font-bold text-copper text-xl">SB</span>
            </div>
            <div>
              <span className="font-serif text-xl tracking-wide font-medium text-ivory block">
                SecureBank
              </span>
              <span className="text-[10px] uppercase font-sans tracking-widest text-copper block">
                Private Banking & Trust
              </span>
            </div>
          </Link>
        </div>

        <div className="my-10 lg:my-0 relative z-10 max-w-md">
          <div className="w-8 h-0.5 bg-copper mb-6" />
          <h2 className="text-2xl sm:text-3xl font-serif font-medium leading-snug tracking-tight text-ivory">
            Cryptographic Credential Revocation & Re-Issuance
          </h2>
          <p className="mt-4 text-xs font-sans text-ivory/70 leading-relaxed">
            Consuming this token recalculates your BCrypt blowfish hash and invalidates all current browser sessions to preserve total privacy.
          </p>
        </div>

        <div className="relative z-10 pt-6 border-t border-forest-600/30 text-[11px] text-ivory/50">
          Chartered Private Banking Simulation • Zero Plaintext Storage
        </div>
      </div>

      {/* Right Column: Warm Ivory Form */}
      <div className="lg:w-7/12 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-ivory-light">
        <div className="w-full max-w-md space-y-6">
          <div>
            <span className="text-[10px] uppercase font-sans tracking-widest text-copper font-bold block mb-1">
              Credential Re-Keying
            </span>
            <h1 className="text-3xl font-serif font-medium text-forest-deep tracking-tight">
              Establish New Password
            </h1>
            <p className="mt-1 text-xs text-heritage-secondary font-sans">
              Provide your single-use recovery token and choose a fortified password.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-sm bg-status-danger-bg border border-status-danger-border text-status-danger text-xs flex items-start gap-3 shadow-heritage-sm animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-sans">{error}</div>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-sm bg-status-success-bg border border-status-success-border text-status-success text-xs flex items-start gap-3 shadow-heritage-sm animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-sans">{success}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-sans font-medium text-heritage-dark mb-1">
                Authorization Reset Token
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-heritage-muted absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste your 64-character token"
                  className="w-full pl-10 pr-4 py-2.5 bg-heritage-paper border border-heritage-border rounded-sm text-xs text-heritage-dark placeholder-heritage-muted font-mono focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600 shadow-heritage-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-medium text-heritage-dark mb-1">
                New Master Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-heritage-muted absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 10 characters with symbols"
                  className="w-full pl-10 pr-4 py-2.5 bg-heritage-paper border border-heritage-border rounded-sm text-xs text-heritage-dark placeholder-heritage-muted focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600 shadow-heritage-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-medium text-heritage-dark mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-heritage-muted absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-4 py-2.5 bg-heritage-paper border border-heritage-border rounded-sm text-xs text-heritage-dark placeholder-heritage-muted focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600 shadow-heritage-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-sm font-sans uppercase tracking-widest text-xs font-semibold text-ivory bg-forest-600 hover:bg-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-heritage-card"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-ivory border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Commit New Password <ArrowRight className="w-4 h-4 text-copper" /></>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-heritage-secondary font-sans pt-2">
            Back to{' '}
            <Link to="/login" className="font-medium text-forest-600 hover:underline">
              Client Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
