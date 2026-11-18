import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useNotifications();

  if (toasts.length === 0) return null;

  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-success shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-alert shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber shrink-0" />,
    alert: <AlertCircle className="w-5 h-5 text-amber shrink-0 animate-bounce" />,
    info: <Info className="w-5 h-5 text-primary shrink-0" />,
  };

  return (
    <div
      aria-live="assertive"
      className="fixed top-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto rounded-2xl bg-surface/95 backdrop-blur-md border border-border shadow-bezel-lg p-4 flex items-start justify-between gap-3 animate-fade-in transition-all duration-300 ring-1 ring-black/[0.05]"
        >
          <div className="flex items-start gap-3">
            {iconMap[toast.type] || iconMap.info}
            <div>
              <h5 className="text-xs font-display font-semibold text-ink">{toast.title}</h5>
              <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-ink-muted hover:text-ink p-1 rounded-lg hover:bg-canvas-subtle transition-colors shrink-0"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
