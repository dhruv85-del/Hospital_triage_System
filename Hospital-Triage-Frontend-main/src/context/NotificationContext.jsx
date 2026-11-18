import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockStore } from '../services/mockStore';
import { realtime } from '../services/realtime';
import { playCallChime, playSuccessChime } from '../utils/sound';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Load existing notifications
    setNotifications(mockStore.getNotifications());

    // Subscribe to realtime global channel
    const unsub = realtime.subscribe('global', (event) => {
      if (event.type === 'QUEUE_UPDATED' && event.appointment) {
        if (event.appointment.status === 'CALLED') {
          playCallChime();
          addToast({
            title: `Token ${event.appointment.tokenNumber} CALLED`,
            message: `Please proceed to consultation room.`,
            type: 'alert',
            duration: 6000,
          });
        }
      }
    });

    return () => unsub();
  }, []);

  const addToast = ({ title, message, type = 'info', duration = 4500 }) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newToast = { id, title, message, type };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const markAsRead = (id) => {
    mockStore.markNotificationRead(id);
    setNotifications([...mockStore.getNotifications()]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value = {
    toasts,
    notifications,
    unreadCount,
    addToast,
    removeToast,
    markAsRead,
    refreshNotifications: () => setNotifications([...mockStore.getNotifications()]),
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
