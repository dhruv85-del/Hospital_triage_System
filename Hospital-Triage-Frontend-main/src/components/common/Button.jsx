import React from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';

/**
 * High-End Agency "Island" Button with nested trailing circle glyph
 * Adheres strictly to Vanguard UI Architect specifications
 */
export function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'amber'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  trailingIcon = false,
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles =
    'group relative inline-flex items-center justify-center font-sans font-medium transition-all duration-300 ease-spring active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 rounded-full gap-2',
    md: 'text-sm px-5 py-2.5 rounded-full gap-2.5',
    lg: 'text-base px-6 py-3.5 rounded-full gap-3',
  };

  const variants = {
    primary:
      'bg-primary text-white hover:bg-primary-hover shadow-bezel border border-white/20 hover:shadow-subtle-glow',
    secondary:
      'bg-surface text-ink hover:bg-canvas-subtle border border-border shadow-bezel-sm text-ink-muted hover:text-ink',
    outline:
      'bg-transparent text-primary hover:bg-primary-light border border-primary/30',
    amber:
      'bg-amber text-ink font-semibold hover:bg-amber-hover shadow-bezel border border-amber-border',
    danger:
      'bg-alert text-white hover:bg-alert-hover shadow-bezel border border-white/20',
    ghost:
      'bg-transparent text-ink-muted hover:text-ink hover:bg-black/[0.04]',
  };

  const iconCircleVariants = {
    primary: 'bg-white/20 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5',
    secondary: 'bg-black/[0.05] text-ink-muted group-hover:text-ink group-hover:translate-x-0.5',
    outline: 'bg-primary/10 text-primary group-hover:translate-x-0.5',
    amber: 'bg-black/10 text-ink group-hover:translate-x-0.5',
    danger: 'bg-white/20 text-white group-hover:translate-x-0.5',
    ghost: 'bg-transparent text-current',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        Icon && <Icon className="w-4 h-4 shrink-0 transition-transform duration-300 ease-spring group-hover:scale-110" />
      )}

      <span>{children}</span>

      {trailingIcon && !loading && (
        <span
          className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-300 ease-spring ${iconCircleVariants[variant]}`}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      )}
    </button>
  );
}
