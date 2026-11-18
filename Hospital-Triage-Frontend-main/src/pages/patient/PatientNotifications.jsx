import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { mockStore } from '../../services/mockStore';
import { PageContainer } from '../../components/layout/PageContainer';
import { EmptyState } from '../../components/common/EmptyState';
import { formatRelativeTime } from '../../utils/formatters';
import { Bell, CheckCheck, Clock } from 'lucide-react';

export function PatientNotifications() {
  const { user } = useAuth();
  const { markAsRead } = useNotifications();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const list = mockStore.getNotifications(user?.userId || 'user_pat_1');
    setNotifications(list);
  }, [user]);

  const handleMarkAllRead = () => {
    notifications.forEach((n) => markAsRead(n.id));
    setNotifications(mockStore.getNotifications(user?.userId || 'user_pat_1'));
  };

  return (
    <PageContainer
      eyebrow="Alerts & Turn Reminders"
      title="Notifications Feed"
      subtitle="Chronological trail of token announcements, queue advancements, and booking confirmations."
      actions={
        notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
        )
      }
    >
      <div className="max-w-2xl mx-auto space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                markAsRead(notif.id);
                setNotifications([...mockStore.getNotifications(user?.userId || 'user_pat_1')]);
              }}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                notif.read
                  ? 'bg-surface border-border opacity-70'
                  : 'bg-primary-light/40 border-primary/20 shadow-bezel-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      notif.read ? 'bg-canvas-subtle text-ink-muted' : 'bg-primary text-white'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-ink">{notif.title}</h4>
                    <p className="text-xs text-ink-muted mt-1 leading-relaxed">{notif.message}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-ink-muted shrink-0">
                  {formatRelativeTime(notif.timestamp)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon={Bell}
            title="No notifications received"
            description="You are all caught up! Updates regarding your doctor turn will appear here in real-time."
          />
        )}
      </div>
    </PageContainer>
  );
}
