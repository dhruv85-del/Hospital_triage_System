import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';
import { Link } from 'react-router-dom';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full bg-surface border border-border text-ink hover:text-primary hover:border-primary/40 shadow-bezel-sm transition-all duration-200 active:scale-95"
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber text-ink font-mono text-[10px] font-bold flex items-center justify-center border-2 border-surface shadow-bezel-sm animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-surface border border-border shadow-bezel-lg p-4 z-50 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-display font-semibold text-ink">System Alerts</h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary-light text-primary font-bold">
                {unreadCount} New
              </span>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border/40 my-2">
            {notifications.length === 0 ? (
              <p className="py-6 text-center text-xs text-ink-muted">No notifications yet.</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`py-3 px-2 rounded-xl transition-colors cursor-pointer ${
                    notif.read ? 'opacity-70 hover:bg-canvas-subtle/50' : 'bg-primary-light/30 hover:bg-primary-light/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-xs font-semibold text-ink">{notif.title}</h5>
                    <span className="text-[10px] text-ink-muted shrink-0 font-mono">
                      {formatRelativeTime(notif.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed">{notif.message}</p>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-border/60 text-center">
            <Link
              to="/patient/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
            >
              <span>View all notifications</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
