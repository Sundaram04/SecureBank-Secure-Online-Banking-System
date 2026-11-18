import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, KeyRound, AlertCircle, ArrowRight, Award, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password, mfaRequired ? mfaCode : undefined);
      if (res.mfaRequired) {
        setMfaRequired(true);
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const autofill = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setMfaRequired(false);
    setMfaCode('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-ivory text-heritage-dark flex flex-col lg:flex-row selection:bg-forest-600 selection:text-ivory font-sans">
      {/* Left Column: Forest-Green Editorial Branding */}
      <div className="lg:w-5/12 bg-forest-deep text-ivory p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-forest-600/40">
        {/* Subtle decorative background motif */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-copper/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-forest-light/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Brand */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
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

        {/* Center Editorial Quote */}
        <div className="my-12 lg:my-0 relative z-10 max-w-md">
          <div className="w-8 h-0.5 bg-copper mb-6" />
          <h2 className="text-2xl sm:text-3xl font-serif font-medium leading-snug tracking-tight text-ivory">
            "Fiduciary excellence preserved through mathematical certainty."
          </h2>
          <p className="mt-4 text-xs font-sans text-ivory/70 leading-relaxed">
            Our online portal enforces cryptographic hygiene, pessimistic row-level transaction locks, and zero-trust session boundaries.
          </p>

          <div className="mt-8 space-y-2.5 pt-6 border-t border-forest-600/40 text-xs text-ivory/80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
              <span>Multi-Factor Authentication (RFC 6238 TOTP)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
              <span>Double-Submit CSRF & Token-Bucket Rate Limiting</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
              <span>Double-Entry Immutable Financial Ledger</span>
            </div>
          </div>
        </div>

        {/* Bottom Charter Note */}
        <div className="relative z-10 pt-6 border-t border-forest-600/30 flex items-center justify-between text-[11px] text-ivory/50">
          <span>Chartered Simulation Edition</span>
          <span>Port 8080 • Port 5173</span>
        </div>
      </div>

      {/* Right Column: Warm Ivory Form Section */}
      <div className="lg:w-7/12 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-ivory-light">
        <div className="w-full max-w-md space-y-8">
          <div>
            <span className="text-[10px] uppercase font-sans tracking-widest text-copper font-bold block mb-1">
              Member Authentication
            </span>
            <h1 className="text-3xl font-serif font-medium text-forest-deep tracking-tight">
              Sign In to Private Banking
            </h1>
            <p className="mt-2 text-xs text-heritage-secondary font-sans">
              Enter your registered credentials to access your vaults and portfolios.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-sm bg-status-danger-bg border border-status-danger-border text-status-danger text-xs flex items-start gap-3 shadow-heritage-sm animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-sans">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!mfaRequired ? (
              <>
                <div>
                  <label className="block text-xs font-sans font-medium text-heritage-dark mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-heritage-muted absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@securebank.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-heritage-paper border border-heritage-border rounded-sm text-xs text-heritage-dark placeholder-heritage-muted focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600 shadow-heritage-sm transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-sans font-medium text-heritage-dark">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-terracotta hover:text-terracotta-hover font-sans transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-heritage-muted absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-heritage-paper border border-heritage-border rounded-sm text-xs text-heritage-dark placeholder-heritage-muted focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600 shadow-heritage-sm transition-colors"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="p-5 bg-forest-50 rounded-sm border border-forest-200 space-y-3">
                <div className="flex items-center gap-2 text-forest-deep font-serif font-medium text-sm">
                  <KeyRound className="w-4 h-4 text-terracotta" />
                  <span>Two-Factor Authentication Required</span>
                </div>
                <p className="text-xs text-heritage-secondary font-sans leading-relaxed">
                  Enter the 6-digit verification code from your authenticator application or an 8-character emergency recovery code.
                </p>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={9}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="123456 or ABCD-EFGH"
                  className="w-full text-center tracking-widest text-lg font-mono py-2.5 bg-heritage-paper border border-forest-300 rounded-sm text-forest-deep placeholder-heritage-muted focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-sm font-sans uppercase tracking-widest text-xs font-semibold text-ivory bg-forest-600 hover:bg-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:ring-offset-2 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-heritage-card"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-ivory border-t-transparent rounded-full animate-spin" />
              ) : mfaRequired ? (
                <>Verify & Open Session <ArrowRight className="w-4 h-4 text-copper" /></>
              ) : (
                <>Authenticate Session <ArrowRight className="w-4 h-4 text-copper" /></>
              )}
            </button>
          </form>

          {/* Quick Fill Testing Box */}
          <div className="pt-6 border-t border-heritage-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-sans uppercase tracking-widest text-heritage-secondary font-bold">
                Quick Demonstration Fill
              </span>
              <span className="text-[10px] text-heritage-muted">Local Testing</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => autofill('admin@securebank.com', 'AdminPassword@123')}
                className="py-2 px-2 bg-heritage-paper hover:bg-ivory rounded-sm text-[11px] font-sans font-medium text-terracotta border border-heritage-border hover:border-terracotta transition-colors shadow-heritage-sm"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => autofill('customera@securebank.com', 'CustomerA@123')}
                className="py-2 px-2 bg-heritage-paper hover:bg-ivory rounded-sm text-[11px] font-sans font-medium text-forest-600 border border-heritage-border hover:border-forest-600 transition-colors shadow-heritage-sm"
              >
                Customer A
              </button>
              <button
                type="button"
                onClick={() => autofill('customerb@securebank.com', 'CustomerB@123')}
                className="py-2 px-2 bg-heritage-paper hover:bg-ivory rounded-sm text-[11px] font-sans font-medium text-copper-dark border border-heritage-border hover:border-copper transition-colors shadow-heritage-sm"
              >
                Customer B
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-heritage-secondary font-sans">
              Prospective client?{' '}
              <Link to="/register" className="font-medium text-terracotta hover:underline">
                Establish a new account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
