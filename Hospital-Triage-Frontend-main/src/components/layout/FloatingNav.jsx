import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from '../notifications/NotificationBell';
import {
  Activity,
  Search,
  User,
  LogOut,
  Menu,
  X,
  Stethoscope,
  Tv,
  Calendar,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { Button } from '../common/Button';

export function FloatingNav() {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const publicLinks = [
    { label: 'Find Doctor', path: '/find-doctor' },
    { label: 'Specialties', path: '/services' },
    { label: 'Live Board', path: '/live-display' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const getDashboardPath = () => {
    switch (role) {
      case 'DOCTOR':
        return '/doctor/dashboard';
      case 'RECEPTIONIST':
        return '/receptionist/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      case 'PATIENT':
      default:
        return '/patient/dashboard';
    }
  };

  return (
    <header className="sticky top-4 z-40 px-4 sm:px-8 max-w-7xl mx-auto w-full pointer-events-none">
      <nav
        aria-label="Main Navigation"
        className="pointer-events-auto rounded-full bg-surface/90 backdrop-blur-xl border border-white/70 shadow-bezel px-4 sm:px-6 py-3 flex items-center justify-between transition-all duration-300 ring-1 ring-black/[0.04]"
      >
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white shadow-bezel-sm group-hover:scale-105 transition-transform duration-300">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-lg text-ink tracking-tight flex items-center gap-1">
              AuraFlow
              <span className="text-primary text-xs font-mono font-normal uppercase tracking-wider px-1.5 py-0.2 rounded bg-primary-light border border-primary/20">
                MED
              </span>
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1 bg-canvas-subtle/70 px-3 py-1.5 rounded-full border border-border/50">
          {publicLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-surface text-primary shadow-bezel-sm font-semibold'
                    : 'text-ink-muted hover:text-ink hover:bg-surface/50'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Section: Role Actions + Notifications + Profile */}
        <div className="flex items-center gap-2.5">
          <NotificationBell />

          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-surface border border-border hover:border-primary/40 shadow-bezel-sm transition-all duration-200"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128'}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-border"
                />
                <span className="text-xs font-semibold text-ink hidden sm:block truncate max-w-[90px]">
                  {user.name.split(' ')[0]}
                </span>
                <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-full bg-primary-light text-primary hidden sm:block">
                  {role}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-surface border border-border shadow-bezel-lg p-2 z-50 animate-fade-in">
                  <div className="px-3 py-2 border-b border-border/60">
                    <p className="text-xs font-semibold text-ink">{user.name}</p>
                    <p className="text-[11px] text-ink-muted truncate">{user.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      to={getDashboardPath()}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-ink hover:bg-canvas-subtle transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5 text-primary" />
                      <span>{role} Dashboard</span>
                    </Link>

                    {role === 'PATIENT' && (
                      <Link
                        to="/patient/history"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-ink hover:bg-canvas-subtle transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span>My Tokens & History</span>
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-border/60">
                    <button
                      onClick={() => {
                        logout().catch((error) => console.error('Unable to revoke the server session:', error));
                        setProfileDropdownOpen(false);
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-alert hover:bg-alert-light transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login">
              <Button variant="primary" size="sm" trailingIcon>
                Portal Login
              </Button>
            </Link>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full bg-surface border border-border text-ink-muted hover:text-ink"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Expanded Overlay Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 pointer-events-auto rounded-3xl bg-surface/95 backdrop-blur-2xl border border-white/60 shadow-bezel-lg p-4 space-y-2 animate-fade-in ring-1 ring-black/[0.05]">
          {publicLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-canvas-subtle transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <Link
              to={getDashboardPath()}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-primary bg-primary-light border border-primary/20"
            >
              Go to {role} Console
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
