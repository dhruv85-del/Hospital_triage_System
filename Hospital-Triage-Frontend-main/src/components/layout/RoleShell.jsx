import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  Settings,
  Activity,
  FileText,
  UserPlus,
  Tv,
  Stethoscope,
  Building,
  BarChart3,
  LogOut,
  ChevronRight,
  Menu,
  X,
  History,
  QrCode,
  HeartPulse,
} from 'lucide-react';
import { NotificationBell } from '../notifications/NotificationBell';

export function RoleShell({ role, children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Navigation items grouped by role
  const roleNavItems = {
    PATIENT: [
      { label: 'Overview', path: '/patient/dashboard', icon: LayoutDashboard },
      { label: 'Book Appointment', path: '/find-doctor', icon: Calendar },
      { label: 'Past Visits & History', path: '/patient/history', icon: History },
      { label: 'Notifications', path: '/patient/notifications', icon: Clock },
      { label: 'Medical Profile', path: '/patient/profile', icon: FileText },
    ],
    DOCTOR: [
      { label: 'Clinical Overview', path: '/doctor/dashboard', icon: LayoutDashboard },
      { label: "Today's Queue", path: '/doctor/queue', icon: Clock },
      { label: 'Weekly Schedule', path: '/doctor/schedule', icon: Calendar },
      { label: 'Consultation History', path: '/doctor/history', icon: History },
    ],
    RECEPTIONIST: [
      { label: 'Triage Overview', path: '/receptionist/dashboard', icon: LayoutDashboard },
      { label: 'Register Walk-in', path: '/receptionist/register', icon: UserPlus },
      { label: 'Dispense Token', path: '/receptionist/walk-in', icon: FileText },
      { label: 'Patient Check-In', path: '/receptionist/check-in', icon: Users },
      { label: 'Multi-Queue Monitor', path: '/receptionist/monitor', icon: Activity },
    ],
    ADMIN: [
      { label: 'System Overview', path: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Analytics & KPIs', path: '/admin/analytics', icon: BarChart3 },
      { label: 'Doctors Directory', path: '/admin/doctors', icon: Stethoscope },
      { label: 'Departments', path: '/admin/departments', icon: Building },
      { label: 'Patient Registry', path: '/admin/patients', icon: Users },
      { label: 'Hospital Settings', path: '/admin/settings', icon: Settings },
    ],
  };

  const currentNav = roleNavItems[role] || roleNavItems.PATIENT;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-canvas text-ink pb-24">
      {/* Mobile Top Bar */}
      <div className="md:hidden sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl bg-canvas-subtle border border-border text-ink-muted"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-display font-bold text-base text-ink">AuraFlow</span>
        </Link>
        <NotificationBell />
      </div>

      {/* Desktop & Mobile Drawer Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-surface border-r border-border p-5 flex flex-col justify-between transition-transform duration-300 ease-spring ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-5 border-b border-border/70 mb-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-primary flex items-center justify-center text-white shadow-bezel-sm">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-bold text-base text-ink block leading-none">
                  AuraFlow
                </span>
                <span className="text-[10px] font-mono text-ink-muted uppercase tracking-widest">
                  {role} PORTAL
                </span>
              </div>
            </Link>
          </div>

          {/* User Persona Pill */}
          {user && (
            <div className="mb-6 p-3 rounded-2xl bg-canvas-subtle border border-border flex items-center gap-3">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128'}
                alt={user.name}
                className="w-10 h-10 rounded-xl object-cover border border-border"
              />
              <div className="truncate">
                <p className="text-xs font-semibold text-ink truncate">{user.name}</p>
                <p className="text-[10px] font-mono text-primary font-medium">{user.role}</p>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            {currentNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-bezel-sm font-semibold'
                      : 'text-ink-muted hover:text-ink hover:bg-canvas-subtle'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-border/70 space-y-2">
          <Link
            to="/live-display"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-amber-900 bg-amber-light border border-amber-border hover:bg-amber-hover hover:text-ink transition-colors"
          >
            <Tv className="w-4 h-4 shrink-0 text-amber" />
            <span>Public Waiting TV</span>
          </Link>

          <button
            onClick={() => {
              logout().catch((error) => console.error('Unable to revoke the server session:', error));
              navigate('/login');
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-alert hover:bg-alert-light transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop overlay for mobile drawer */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-ink/30 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Page Area */}
      <main className="flex-1 w-full overflow-x-hidden p-4 sm:p-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
