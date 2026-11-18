import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Accessible Backdrop-Blur Modal Dialog
 */
export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dimmed backdrop with blur */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Double Bezel Modal Window */}
      <div
        className={`relative z-10 w-full ${maxWidth} double-bezel-outer transition-all duration-300 ease-spring`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="double-bezel-inner">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 mb-4 border-b border-border/70">
            <div>
              <h2 id="modal-title" className="text-xl font-display font-semibold text-ink">
                {title}
              </h2>
              {subtitle && <p className="text-xs text-ink-muted mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-ink-muted hover:text-ink rounded-full hover:bg-canvas-subtle transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="max-h-[75vh] overflow-y-auto pr-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
