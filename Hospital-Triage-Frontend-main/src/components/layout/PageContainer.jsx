import React from 'react';

export function PageContainer({
  title,
  subtitle,
  eyebrow,
  actions,
  children,
  className = '',
}) {
  return (
    <div className={`space-y-6 sm:space-y-8 animate-fade-in ${className}`}>
      {/* Header Banner */}
      {(title || eyebrow || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
          <div>
            {eyebrow && <span className="eyebrow-tag mb-2">{eyebrow}</span>}
            {title && (
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink tracking-tight">
                {title}
              </h1>
            )}
            {subtitle && <p className="text-xs sm:text-sm text-ink-muted mt-1 leading-relaxed">{subtitle}</p>}
          </div>

          {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
        </div>
      )}

      {/* Main Content Area */}
      <div>{children}</div>
    </div>
  );
}
