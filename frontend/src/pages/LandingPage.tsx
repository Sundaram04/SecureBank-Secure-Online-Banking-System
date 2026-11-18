import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Database,
  KeyRound,
  ArrowRight,
  ShieldAlert,
  Server,
  Layers,
  Award,
  CheckCircle2,
  FileCheck2
} from 'lucide-react';
import { Navbar } from '../components/Navbar';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-ivory text-heritage-dark flex flex-col font-sans selection:bg-forest-600 selection:text-ivory">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-heritage-border bg-ivory-light">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-forest-50 border border-forest-200 text-forest-600 text-xs font-serif tracking-wider mb-6 shadow-heritage-sm">
            <Award className="w-4 h-4 text-copper" />
            <span>Chartered Educational Banking Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif font-medium tracking-tight leading-tight text-forest-deep">
            Private Banking Integrity. <br />
            <span className="italic font-normal text-terracotta">Fortified Web Security.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-heritage-secondary max-w-2xl mx-auto leading-relaxed font-sans">
            SecureBank pairs the discretion and prestige of traditional heritage banking with an uncompromising modern defense against OWASP vulnerabilities, race conditions, and financial ledger inconsistencies.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              className="px-6 py-3.5 text-xs font-sans uppercase tracking-widest font-semibold rounded-sm bg-forest-600 hover:bg-forest-500 text-ivory shadow-heritage-card flex items-center gap-2 transition-all duration-150"
            >
              Access Member Portal <ArrowRight className="w-4 h-4 text-copper" />
            </Link>
            <Link
              to="/vulnerability-demo"
              className="px-6 py-3.5 text-xs font-sans uppercase tracking-widest font-semibold rounded-sm bg-heritage-paper hover:bg-ivory text-terracotta border border-heritage-border flex items-center gap-2 shadow-heritage-sm transition-all duration-150"
            >
              <ShieldAlert className="w-4 h-4 text-terracotta" />
              Security Laboratory
            </Link>
          </div>
        </div>
      </section>

      {/* Demonstration Credentials Card */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 border-b border-heritage-border bg-ivory">
        <div className="max-w-4xl mx-auto bg-heritage-paper rounded-sm p-6 sm:p-8 border border-heritage-border shadow-heritage">
          <div className="flex items-center justify-between border-b border-heritage-border pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-sm bg-forest-50 text-forest-600 border border-forest-200">
                <KeyRound className="w-4 h-4 text-forest-600" />
              </div>
              <div>
                <h3 className="font-serif font-medium text-base text-forest-deep">
                  Standard Demonstration Credentials
                </h3>
                <p className="text-xs text-heritage-secondary font-sans">
                  Pre-configured accounts for authorized local testing
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-sans tracking-widest text-copper font-bold bg-forest-50 px-2 py-1 rounded-sm border border-forest-100 hidden sm:inline-block">
              Local Sandbox
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
            {/* Admin */}
            <div className="bg-ivory-light p-4 rounded-sm border border-heritage-border">
              <span className="text-[10px] font-bold uppercase tracking-widest text-terracotta">
                System Administrator
              </span>
              <p className="font-serif font-medium text-sm text-forest-deep mt-1">admin@securebank.com</p>
              <p className="text-heritage-secondary mt-1">
                Password: <code className="text-forest-600 font-mono font-semibold">AdminPassword@123</code>
              </p>
              <p className="text-[11px] text-heritage-secondary/80 mt-2 border-t border-heritage-border-light pt-2">
                Audit logs, customer suspension, security event triage.
              </p>
            </div>

            {/* Customer 1 */}
            <div className="bg-ivory-light p-4 rounded-sm border border-heritage-border">
              <span className="text-[10px] font-bold uppercase tracking-widest text-forest-600">
                Customer A (Alice)
              </span>
              <p className="font-serif font-medium text-sm text-forest-deep mt-1">customera@securebank.com</p>
              <p className="text-heritage-secondary mt-1">
                Password: <code className="text-forest-600 font-mono font-semibold">CustomerA@123</code>
              </p>
              <p className="text-[11px] text-heritage-secondary/80 mt-2 border-t border-heritage-border-light pt-2">
                Savings: ₹15,000. Beneficiary Bob pre-linked for transfer testing.
              </p>
            </div>

            {/* Customer 2 */}
            <div className="bg-ivory-light p-4 rounded-sm border border-heritage-border">
              <span className="text-[10px] font-bold uppercase tracking-widest text-copper">
                Customer B (Bob)
              </span>
              <p className="font-serif font-medium text-sm text-forest-deep mt-1">customerb@securebank.com</p>
              <p className="text-heritage-secondary mt-1">
                Password: <code className="text-forest-600 font-mono font-semibold">CustomerB@123</code>
              </p>
              <p className="text-[11px] text-heritage-secondary/80 mt-2 border-t border-heritage-border-light pt-2">
                Savings: ₹8,500 | Current: ₹25,000. Recipient account holder.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Architecture Pillars */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs uppercase font-sans tracking-widest text-copper font-bold">
            Guaranteed Solvency & Security
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-medium text-forest-deep mt-1">
            Engineered Defensive Safeguards
          </h2>
          <div className="w-12 h-0.5 bg-terracotta mx-auto mt-3" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-sm bg-heritage-paper border border-heritage-border shadow-heritage-sm hover:border-forest-400 transition-colors">
            <div className="w-10 h-10 rounded-sm bg-forest-50 border border-forest-200 flex items-center justify-center text-forest-600 mb-4">
              <Database className="w-5 h-5 text-forest-600" />
            </div>
            <h3 className="font-serif font-medium text-base text-forest-deep mb-2">
              Double-Entry Financial Ledger
            </h3>
            <p className="text-xs text-heritage-secondary leading-relaxed font-sans">
              Transfers execute inside atomic transactions with deterministic row-level locks, ensuring balanced debits and credits with zero double-spending.
            </p>
          </div>

          <div className="p-6 rounded-sm bg-heritage-paper border border-heritage-border shadow-heritage-sm hover:border-forest-400 transition-colors">
            <div className="w-10 h-10 rounded-sm bg-forest-50 border border-forest-200 flex items-center justify-center text-forest-600 mb-4">
              <Lock className="w-5 h-5 text-copper" />
            </div>
            <h3 className="font-serif font-medium text-base text-forest-deep mb-2">
              Cryptographic Hygiene
            </h3>
            <p className="text-xs text-heritage-secondary leading-relaxed font-sans">
              Passwords salted and hashed using BCrypt(12). Two-Factor TOTP secret keys protected with AES-256-GCM authenticated encryption at rest.
            </p>
          </div>

          <div className="p-6 rounded-sm bg-heritage-paper border border-heritage-border shadow-heritage-sm hover:border-forest-400 transition-colors">
            <div className="w-10 h-10 rounded-sm bg-forest-50 border border-forest-200 flex items-center justify-center text-forest-600 mb-4">
              <Layers className="w-5 h-5 text-terracotta" />
            </div>
            <h3 className="font-serif font-medium text-base text-forest-deep mb-2">
              IDOR & Injection Immunity
            </h3>
            <p className="text-xs text-heritage-secondary leading-relaxed font-sans">
              Object references verified against the authenticated session principal on every query. Parameterized PreparedStatement bindings eliminate SQL injection.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-4 border-t border-heritage-border bg-ivory-cream text-center text-xs text-heritage-secondary font-sans">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-forest-deep">SecureBank</span>
            <span>—</span>
            <span>Chartered Educational Banking Simulation</span>
          </div>
          <div className="text-[11px] text-heritage-muted">
            Strictly Local Development Environment • No Real Monetary Instruments
          </div>
        </div>
      </footer>
    </div>
  );
};
