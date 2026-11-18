import React from 'react';
import { Button } from './Button';

/**
 * Contextual Empty State with Actionable CTA
 */
export function EmptyState({
  icon: Icon,
  title = 'No records found',
  description = 'There are currently no items to display in this view.',
  actionLabel,
  onAction,
  actionIcon,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl bg-canvas-subtle/50 border border-dashed border-border/80 ${className}`}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center text-ink-muted shadow-bezel-sm mb-4 ring-1 ring-black/[0.04]">
          <Icon className="w-7 h-7 text-primary" />
        </div>
      )}
      <h3 className="text-base font-display font-semibold text-ink mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-ink-muted max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" icon={actionIcon} onClick={onAction} trailingIcon>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
