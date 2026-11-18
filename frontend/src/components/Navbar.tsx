import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Bell, LogOut, ShieldAlert, Check, Menu, ChevronDown, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Notification } from '../types';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, isAdmin, logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/profile/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.data.filter((n: Notification) => !n.read).length);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const markAllRead = async () => {
    try {
      await api.put('/profile/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-forest-deep border-b border-forest-600/40 text-ivory shadow-heritage-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 rounded-sm text-ivory/80 hover:text-ivory hover:bg-forest-light/40 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-sm bg-forest-light border border-copper/50 flex items-center justify-center shadow-sm group-hover:border-copper transition-colors">
              <span className="font-serif font-bold text-copper text-base">SB</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg tracking-wide font-medium text-ivory">SecureBank</span>
                <span className="text-[9px] uppercase font-sans font-bold tracking-widest bg-forest-light/60 text-copper px-1.5 py-0.5 rounded-sm border border-copper/30">
                  Est. 2026
                </span>
              </div>
              <p className="text-[10px] font-sans tracking-wider text-ivory/60 uppercase hidden sm:block">
                Private Banking & Trust
              </p>
            </div>
          </Link>
        </div>

        {/* Center / Right Section */}
        <div className="flex items-center space-x-3">
          {/* Security Demonstration Playground Pill */}
          <Link
            to="/vulnerability-demo"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans tracking-wide text-copper bg-forest-800/80 border border-copper/40 rounded-sm hover:bg-forest-700/80 hover:border-copper transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-terracotta" />
            <span>Security Laboratory</span>
          </Link>

          {/* Notifications Dropdown */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-sm text-ivory/80 hover:text-ivory hover:bg-forest-light/30 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-terracotta text-ivory text-[9px] font-sans font-bold rounded-full flex items-center justify-center border-2 border-forest-deep shadow-sm">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-heritage-paper text-heritage-dark rounded-sm shadow-heritage-lg border border-heritage-border py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2.5 border-b border-heritage-border flex items-center justify-between">
                    <div>
                      <h3 className="font-serif font-medium text-sm text-heritage-dark">Notices & Dispatches</h3>
                      <p className="text-[10px] text-heritage-secondary font-sans">Official bank communications</p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-terracotta hover:text-terracotta-hover font-sans flex items-center gap-1 font-medium transition-colors"
                      >
                        <Check className="w-3 h-3" /> Mark read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-heritage-border-light">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Lock className="w-6 h-6 text-heritage-muted mx-auto mb-2 opacity-50" />
                        <p className="text-xs text-heritage-secondary font-serif">No unread notices on file</p>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          className={`p-3.5 hover:bg-ivory/50 transition-colors ${!n.read ? 'bg-ivory/80' : ''}`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-serif font-medium text-xs text-heritage-dark">{n.title}</span>
                            <span className="text-[10px] font-sans text-heritage-secondary shrink-0">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs font-sans text-heritage-secondary mt-1 leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile & Logout */}
          {user ? (
            <div className="flex items-center space-x-3 pl-3 border-l border-forest-600/40">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-serif font-medium text-ivory tracking-wide">
                  {user.firstName} {user.lastName}
                </p>
                <span className="text-[10px] font-sans tracking-wider text-copper uppercase">
                  {isAdmin ? 'System Administrator' : 'Privilege Member'}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans text-ivory/80 hover:text-terracotta-light hover:bg-forest-light/40 rounded-sm border border-transparent hover:border-forest-600/40 transition-all"
                title="Sign out of banking session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-sans font-medium text-ivory hover:text-copper transition-colors"
              >
                Client Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-sans font-medium text-ivory bg-terracotta hover:bg-terracotta-hover rounded-sm shadow-heritage-sm transition-colors"
              >
                Open Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
