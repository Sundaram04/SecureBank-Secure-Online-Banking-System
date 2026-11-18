import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  Send,
  Users,
  History,
  Shield,
  UserCheck,
  AlertTriangle,
  FileText,
  Sliders,
  ShieldAlert,
  Lock,
  X,
  HelpCircle,
  Activity,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { user, isAdmin } = useAuth();

  const customerNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Accounts & Vaults', path: '/accounts', icon: CreditCard },
    { name: 'Transfer Funds', path: '/transfer', icon: Send },
    { name: 'Beneficiaries', path: '/beneficiaries', icon: Users },
    { name: 'Transactions', path: '/transactions', icon: History },
    { name: 'Security & 2FA', path: '/security', icon: Shield },
    { name: 'Profile & Settings', path: '/profile', icon: Sliders },
  ];

  const adminNav = [
    { name: 'Admin Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Customer Directory', path: '/admin/customers', icon: UserCheck },
    { name: 'Ledger Operations', path: '/admin/transactions', icon: History },
    { name: 'Security Incidents', path: '/admin/security-events', icon: AlertTriangle },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
  ];

  const navItems = isAdmin ? adminNav : customerNav;

  const content = (
    <div className="flex flex-col justify-between h-full bg-forest-deep text-ivory select-none">
      {/* Top Header & Brand */}
      <div className="p-5 space-y-6">
        {/* Mobile Header & Close button (hidden on desktop to avoid duplicate header below Navbar) */}
        <div className="flex items-center justify-between pb-4 border-b border-forest-600/30 md:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-forest-light border border-copper/40 flex items-center justify-center shadow-heritage-sm">
              <span className="font-serif text-base font-bold text-copper tracking-wider">SB</span>
            </div>
            <div>
              <span className="font-serif text-base tracking-wide font-medium text-ivory block leading-tight">
                SecureBank
              </span>
              <span className="text-[10px] uppercase font-sans tracking-widest text-copper/90 block">
                Private Banking
              </span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded text-ivory/70 hover:text-ivory hover:bg-forest-light/40 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* User Card */}
        {user && (
          <div className="bg-forest-800/80 border border-forest-600/40 rounded-sm p-3.5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-copper/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-sm bg-terracotta/20 border border-terracotta/40 text-terracotta-light flex items-center justify-center font-serif font-bold text-sm shrink-0">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="overflow-hidden min-w-0">
                <h4 className="text-xs font-serif font-medium text-ivory truncate tracking-wide">
                  {user.firstName} {user.lastName}
                </h4>
                <p className="text-[11px] font-sans text-ivory/60 truncate">{user.email}</p>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-status-success font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
                  <span className="tracking-wide">{isAdmin ? 'Master Administrator' : 'Privilege Member'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Section */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[10px] font-sans font-bold text-ivory/50 uppercase tracking-widest">
              {isAdmin ? 'Administrative Operations' : 'Banking Portfolio'}
            </span>
            <div className="h-px bg-forest-600/30 flex-1 ml-3" />
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard' || item.path === '/admin'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-sm text-xs font-sans tracking-wide transition-all duration-150 relative ${
                    isActive
                      ? 'bg-forest-light text-ivory font-semibold shadow-inner'
                      : 'text-ivory/70 hover:text-ivory hover:bg-forest-light/30'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active Left Indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-terracotta rounded-r-sm" />
                    )}
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-terracotta-light' : 'text-ivory/60'}`} />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Security Lab Link */}
        <div className="pt-3 border-t border-forest-600/30">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[10px] font-sans font-bold text-copper/80 uppercase tracking-widest">
              Security Testing
            </span>
            <div className="h-px bg-forest-600/30 flex-1 ml-3" />
          </div>
          <NavLink
            to="/vulnerability-demo"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-sm text-xs font-sans tracking-wide transition-all duration-150 border ${
                isActive
                  ? 'bg-terracotta/20 border-terracotta text-terracotta-light font-semibold'
                  : 'bg-forest-900/60 border-forest-600/30 text-copper/90 hover:text-copper hover:bg-forest-light/30'
              }`
            }
          >
            <ShieldAlert className="w-4 h-4 shrink-0 text-copper" />
            <span>Vulnerability Lab</span>
          </NavLink>
        </div>
      </div>

      {/* Footer / Assurance Seal */}
      <div className="p-4 border-t border-forest-600/30 bg-forest-darkest/70">
        <div className="flex items-start gap-2.5">
          <div className="p-1 rounded-sm bg-forest-light/60 text-status-success mt-0.5">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-serif tracking-wide text-ivory font-medium">
              Fortified Protection
            </p>
            <p className="text-[10px] font-sans text-ivory/50 leading-tight">
              Pessimistic Locking • Double-Entry
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-forest-600/30 shrink-0 sticky top-16 h-[calc(100vh-4rem)] z-30">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-forest-darkest/70 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
