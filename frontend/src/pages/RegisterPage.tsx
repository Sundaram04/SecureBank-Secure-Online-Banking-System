import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, User, Phone, CheckCircle2, XCircle, AlertCircle, ArrowRight, Award } from 'lucide-react';
import api from '../services/api';

export const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Password rules validation
  const hasMinLength = password.length >= 10;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[@$!%*?&]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasDigit && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isPasswordValid) {
      setError('Password does not satisfy institutional complexity requirements.');
      return;
    }

    if (!passwordsMatch) {
      setError('Password confirmation does not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        password,
      });

      if (res.data.success) {
        setSuccess('Account established successfully. Initial simulated savings reserve provisioned. Redirecting to sign in...');
        setTimeout(() => navigate('/login'), 2200);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
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
            Establish a privilege membership with guaranteed solvency.
          </h2>
          <p className="mt-4 text-xs font-sans text-ivory/70 leading-relaxed">
            Every customer account is provisioned with double-entry ledger tracking, masked account identifiers, and encrypted session isolation.
          </p>

          <div className="mt-8 p-4 bg-forest-800/80 border border-forest-600/40 rounded-sm text-xs space-y-2">
            <span className="text-[10px] uppercase font-sans tracking-widest text-copper font-bold block">
              Default Provisioning
            </span>
            <p className="text-ivory/80">
              New accounts automatically receive a primary Savings Account with seed liquidity for transaction simulation.
            </p>
          </div>
        </div>

        <div className="relative z-10 pt-6 border-t border-forest-600/30 text-[11px] text-ivory/50">
          Chartered Private Banking Simulation • Zero External Transmission
        </div>
      </div>

      {/* Right Column: Warm Ivory Form */}
      <div className="lg:w-7/12 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-ivory-light">
        <div className="w-full max-w-md space-y-6">
          <div>
            <span className="text-[10px] uppercase font-sans tracking-widest text-copper font-bold block mb-1">
              New Client Enrolment
            </span>
            <h1 className="text-3xl font-serif font-medium text-forest-deep tracking-tight">
              Open a Secure Account
            </h1>
            <p className="mt-1 text-xs text-heritage-secondary font-sans">
              Enter your details to create an authenticated banking profile.
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-sans font-medium text-heritage-dark mb-1">First Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-heritage-muted absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Alice"
                    className="w-full pl-9 pr-3 py-2 bg-heritage-paper border border-heritage-border rounded-sm text-xs text-heritage-dark placeholder-heritage-muted focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600 shadow-heritage-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-sans font-medium text-heritage-dark mb-1">Last Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-heritage-muted absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Johnson"
                    className="w-full pl-9 pr-3 py-2 bg-heritage-paper border border-heritage-border rounded-sm text-xs text-heritage-dark placeholder-heritage-muted focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600 shadow-heritage-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-medium text-heritage-dark mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-heritage-muted absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@securebank.com"
                  className="w-full pl-9 pr-3 py-2 bg-heritage-paper border border-heritage-border rounded-sm text-xs text-heritage-dark placeholder-heritage-muted focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600 shadow-heritage-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-medium text-heritage-dark mb-1">
                Contact Phone (Optional)
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-heritage-muted absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 bg-heritage-paper border border-heritage-border rounded-sm text-xs text-heritage-dark placeholder-heritage-muted focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600 shadow-heritage-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-medium text-heritage-dark mb-1">Master Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-heritage-muted absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 10 characters with symbols"
                  className="w-full pl-9 pr-3 py-2 bg-heritage-paper border border-heritage-border rounded-sm text-xs text-heritage-dark placeholder-heritage-muted focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600 shadow-heritage-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-medium text-heritage-dark mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-heritage-muted absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-9 pr-3 py-2 bg-heritage-paper border border-heritage-border rounded-sm text-xs text-heritage-dark placeholder-heritage-muted focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600 shadow-heritage-sm"
                />
              </div>
            </div>

            {/* Password Verification Checklist */}
            <div className="p-3 bg-heritage-paper rounded-sm border border-heritage-border text-[11px] font-sans space-y-1">
              <span className="font-semibold text-heritage-secondary uppercase text-[9px] tracking-wider block mb-1">
                Cryptographic Policy Checklist:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-status-success font-medium' : 'text-heritage-muted'}`}>
                  {hasMinLength ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  <span>10+ characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUpperCase ? 'text-status-success font-medium' : 'text-heritage-muted'}`}>
                  {hasUpperCase ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  <span>Uppercase (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLowerCase ? 'text-status-success font-medium' : 'text-heritage-muted'}`}>
                  {hasLowerCase ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  <span>Lowercase (a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasDigit ? 'text-status-success font-medium' : 'text-heritage-muted'}`}>
                  {hasDigit ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  <span>Numeral (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-status-success font-medium' : 'text-heritage-muted'}`}>
                  {hasSpecial ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  <span>Special character</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-status-success font-medium' : 'text-heritage-muted'}`}>
                  {passwordsMatch ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  <span>Passwords match</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordValid || !passwordsMatch}
              className="w-full mt-3 py-3 px-4 rounded-sm font-sans uppercase tracking-widest text-xs font-semibold text-ivory bg-terracotta hover:bg-terracotta-hover focus:outline-none focus:ring-2 focus:ring-terracotta disabled:opacity-40 transition-all flex items-center justify-center gap-2 shadow-heritage-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-ivory border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Establish Account Portfolio <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-heritage-secondary font-sans pt-2">
            Already hold an account?{' '}
            <Link to="/login" className="font-medium text-forest-600 hover:underline">
              Sign in to banking session
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
