import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Lock,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user, refreshProfile } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileError(null);
    setProfileLoading(true);

    try {
      const res = await api.put('/profile', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
      });

      if (res.data.success) {
        setProfileMsg('Personal portfolio details updated successfully.');
        await refreshProfile();
      }
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);
    setPwdError(null);

    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 10) {
      setPwdError('New password must contain at least 10 characters.');
      return;
    }

    setPwdLoading(true);
    try {
      const res = await api.put('/profile/password', {
        currentPassword,
        newPassword,
      });

      if (res.data.success) {
        setPwdMsg('Master password successfully updated.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setPwdError(err.message || 'Failed to change password. Current password may be incorrect.');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      {/* Editorial Header */}
      <div className="pb-4 border-b border-heritage-border flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-sans tracking-widest text-copper font-bold block mb-1">
            Account Governance
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-medium text-forest-deep tracking-tight">
            Client Profile & Identity
          </h1>
          <p className="text-xs text-heritage-secondary mt-1">
            Manage your personal client registry details and authentication credentials.
          </p>
        </div>
      </div>

      {/* Profile Details Section */}
      <div className="bg-heritage-paper p-6 sm:p-8 rounded-sm border border-heritage-border shadow-heritage-sm space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-heritage-border">
          <div className="w-8 h-8 rounded-sm bg-forest-50 border border-forest-200 text-forest-600 flex items-center justify-center">
            <User className="w-4 h-4 text-forest-600" />
          </div>
          <div>
            <h2 className="font-serif font-medium text-lg text-forest-deep">
              Client Registry Details
            </h2>
            <p className="text-xs text-heritage-secondary font-sans">
              Personal contact metadata on file with the institution
            </p>
          </div>
        </div>

        {profileMsg && (
          <div className="p-3.5 bg-status-success-bg border border-status-success-border text-status-success text-xs rounded-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{profileMsg}</span>
          </div>
        )}

        {profileError && (
          <div className="p-3.5 bg-status-danger-bg border border-status-danger-border text-status-danger text-xs rounded-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-heritage-dark mb-1">First Legal Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-ivory border border-heritage-border rounded-sm focus:outline-none focus:border-forest-600"
              />
            </div>
            <div>
              <label className="block font-medium text-heritage-dark mb-1">Last Legal Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-ivory border border-heritage-border rounded-sm focus:outline-none focus:border-forest-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-heritage-dark mb-1">
              Primary Account Email (Immutable Identity)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-heritage-muted absolute left-3.5 top-3" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full pl-10 pr-3.5 py-2.5 bg-heritage-surface border border-heritage-border text-heritage-secondary rounded-sm cursor-not-allowed font-mono text-xs"
              />
            </div>
            <p className="text-[10px] text-heritage-muted mt-1">
              Official email address cannot be modified via self-service for security compliance.
            </p>
          </div>

          <div>
            <label className="block font-medium text-heritage-dark mb-1">Telephone Contact</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-heritage-muted absolute left-3.5 top-3" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-3.5 py-2.5 bg-ivory border border-heritage-border rounded-sm focus:outline-none focus:border-forest-600"
              />
            </div>
          </div>

          <div className="pt-3 text-right">
            <button
              type="submit"
              disabled={profileLoading}
              className="py-2.5 px-6 bg-forest-600 hover:bg-forest-500 text-ivory rounded-sm font-sans uppercase tracking-widest text-xs font-semibold shadow-heritage-sm disabled:opacity-50 transition-colors"
            >
              {profileLoading ? 'Committing...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Password Change Section */}
      <div className="bg-heritage-paper p-6 sm:p-8 rounded-sm border border-heritage-border shadow-heritage-sm space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-heritage-border">
          <div className="w-8 h-8 rounded-sm bg-forest-50 border border-forest-200 text-copper flex items-center justify-center">
            <Lock className="w-4 h-4 text-copper" />
          </div>
          <div>
            <h2 className="font-serif font-medium text-lg text-forest-deep">
              Update Master Password
            </h2>
            <p className="text-xs text-heritage-secondary font-sans">
              Re-encrypt your authentication key with BCrypt(12) key derivation
            </p>
          </div>
        </div>

        {pwdMsg && (
          <div className="p-3.5 bg-status-success-bg border border-status-success-border text-status-success text-xs rounded-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{pwdMsg}</span>
          </div>
        )}

        {pwdError && (
          <div className="p-3.5 bg-status-danger-bg border border-status-danger-border text-status-danger text-xs rounded-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{pwdError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block font-medium text-heritage-dark mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-ivory border border-heritage-border rounded-sm focus:outline-none focus:border-forest-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-heritage-dark mb-1">New Fortified Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 10 characters with symbols"
                className="w-full px-3.5 py-2.5 bg-ivory border border-heritage-border rounded-sm focus:outline-none focus:border-forest-600"
              />
            </div>
            <div>
              <label className="block font-medium text-heritage-dark mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-3.5 py-2.5 bg-ivory border border-heritage-border rounded-sm focus:outline-none focus:border-forest-600"
              />
            </div>
          </div>

          <div className="pt-3 text-right">
            <button
              type="submit"
              disabled={pwdLoading}
              className="py-2.5 px-6 bg-terracotta hover:bg-terracotta-hover text-ivory rounded-sm font-sans uppercase tracking-widest text-xs font-semibold shadow-heritage-sm disabled:opacity-50 transition-colors"
            >
              {pwdLoading ? 'Validating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
