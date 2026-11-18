import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, AlertCircle, CheckCircle2, ArrowRight, KeyRound } from 'lucide-react';
import api from '../services/api';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [simulatedToken, setSimulatedToken] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSimulatedToken(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/password/forgot', { email });
      if (res.data.success) {
        setMessage('Password reset token generated. In a production environment, this is sent exclusively to the verified email inbox.');
        if (res.data.data && typeof res.data.data === 'string' && res.data.data.length > 20) {
          setSimulatedToken(res.data.data);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch reset instructions.');
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
            Emergency Credential Recovery & Authentication Protocol
          </h2>
          <p className="mt-4 text-xs font-sans text-ivory/70 leading-relaxed">
            Reset requests issue time-limited single-use cryptographic tokens. In production, tokens are dispatched via encrypted channel; in this local sandbox, the token is provided for verification.
          </p>
        </div>

        <div className="relative z-10 pt-6 border-t border-forest-600/30 text-[11px] text-ivory/50">
          Chartered Private Banking Simulation • Fiduciary Protection
        </div>
      </div>

      {/* Right Column: Warm Ivory Form */}
      <div className="lg:w-7/12 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-ivory-light">
        <div className="w-full max-w-md space-y-6">
          <div>
            <span className="text-[10px] uppercase font-sans tracking-widest text-copper font-bold block mb-1">
              Account Recovery
            </span>
            <h1 className="text-3xl font-serif font-medium text-forest-deep tracking-tight">
              Forgot Your Password?
            </h1>
            <p className="mt-1 text-xs text-heritage-secondary font-sans">
              Enter your registered email address to generate an authorized reset token.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-sm bg-status-danger-bg border border-status-danger-border text-status-danger text-xs flex items-start gap-3 shadow-heritage-sm animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-sans">{error}</div>
            </div>
          )}

          {message && (
            <div className="p-4 rounded-sm bg-status-success-bg border border-status-success-border text-status-success text-xs flex items-start gap-3 shadow-heritage-sm animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-sans">{message}</div>
            </div>
          )}

          {simulatedToken && (
            <div className="p-4 bg-forest-50 border border-forest-200 rounded-sm text-xs space-y-3">
              <div className="flex items-center gap-2 text-forest-deep font-serif font-medium">
                <KeyRound className="w-4 h-4 text-copper" />
                <span>Simulated Sandbox Reset Token</span>
              </div>
              <p className="text-heritage-secondary text-[11px] font-sans">
                Because this instance runs locally without external SMTP routing, your single-use recovery token is presented below:
              </p>
              <div className="p-2.5 bg-heritage-paper rounded-sm font-mono text-[11px] text-forest-deep break-all select-all border border-forest-200">
                {simulatedToken}
              </div>
              <button
                onClick={() => navigate(`/reset-password?token=${simulatedToken}`)}
                className="w-full py-2.5 px-3 bg-forest-600 hover:bg-forest-500 text-ivory rounded-sm font-sans uppercase tracking-widest text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-heritage-sm"
              >
                Proceed to Reset Password <ArrowRight className="w-3.5 h-3.5 text-copper" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-sans font-medium text-heritage-dark mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-heritage-muted absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@securebank.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-heritage-paper border border-heritage-border rounded-sm text-xs text-heritage-dark placeholder-heritage-muted focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600 shadow-heritage-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-sm font-sans uppercase tracking-widest text-xs font-semibold text-ivory bg-forest-600 hover:bg-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-heritage-card"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-ivory border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Generate Recovery Token <ArrowRight className="w-4 h-4 text-copper" /></>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-heritage-secondary font-sans pt-2">
            Remembered your credentials?{' '}
            <Link to="/login" className="font-medium text-forest-600 hover:underline">
              Return to client sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
