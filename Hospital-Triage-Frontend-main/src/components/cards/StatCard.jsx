import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = 'up', // 'up' | 'down' | 'neutral'
  trendLabel = 'vs last hour',
  color = 'primary',
  className = '',
}) {
  return (
    <div className={`double-bezel-outer ${className}`}>
      <div className="double-bezel-inner bg-surface h-full flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-ink-muted">{title}</p>
            <h3 className="text-2xl sm:text-3xl font-mono font-bold text-ink mt-1 tracking-tight">
              {value}
            </h3>
          </div>
          {Icon && (
            <div className="w-10 h-10 rounded-2xl bg-canvas-subtle flex items-center justify-center text-primary border border-border shadow-bezel-sm">
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
          {trend ? (
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-0.5 font-mono font-semibold ${
                  trendType === 'up' ? 'text-success' : trendType === 'down' ? 'text-alert' : 'text-ink-muted'
                }`}
              >
                {trendType === 'up' ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : trendType === 'down' ? (
                  <TrendingDown className="w-3.5 h-3.5" />
                ) : null}
                {trend}
              </span>
              <span className="text-ink-muted text-[11px]">{trendLabel}</span>
            </div>
          ) : (
            <span className="text-ink-muted text-[11px]">{subtitle || 'Live metric'}</span>
          )}
        </div>
      </div>
    </div>
  );
}
