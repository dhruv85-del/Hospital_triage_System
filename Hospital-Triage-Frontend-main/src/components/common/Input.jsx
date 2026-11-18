import React, { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    className = '',
    type = 'text',
    required = false,
    ...props
  },
  ref
) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1.5 font-sans">
          {label} {required && <span className="text-alert">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`w-full bg-canvas-pure border rounded-xl py-2.5 px-3.5 text-sm text-ink placeholder-ink-light transition-all duration-200 ease-spring focus:bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none ${
            Icon ? 'pl-10' : ''
          } ${error ? 'border-alert focus:border-alert focus:ring-alert/20' : 'border-border hover:border-ink-faint'}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-alert font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-ink-muted">{helperText}</p>}
    </div>
  );
});

export const Select = forwardRef(function Select(
  {
    label,
    error,
    helperText,
    options = [],
    className = '',
    required = false,
    children,
    ...props
  },
  ref
) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1.5 font-sans">
          {label} {required && <span className="text-alert">*</span>}
        </label>
      )}
      <select
        ref={ref}
        className={`w-full bg-canvas-pure border rounded-xl py-2.5 px-3.5 text-sm text-ink transition-all duration-200 ease-spring focus:bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none ${
          error ? 'border-alert focus:border-alert' : 'border-border hover:border-ink-faint'
        }`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-alert font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-ink-muted">{helperText}</p>}
    </div>
  );
});
