import React from 'react';
import { getStatusConfig } from '../../utils/formatters';

/**
 * Strict Clinical Status Badge
 * Never relies on color alone - always pairs with exact status text label
 */
export function Badge({ status, size = 'md', pulse = false, className = '' }) {
  const config = getStatusConfig(status);

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <span
      className={`inline-flex items-center font-sans font-medium rounded-full border select-none ${config.bg} ${config.border} ${config.text} ${sizeClasses[size]} ${className}`}
      title={config.description}
    >
      <span
        className={`rounded-full shrink-0 ${config.dot} ${dotSizes[size]} ${
          pulse || status === 'CALLED' ? 'animate-ping opacity-75' : ''
        }`}
      />
      <span>{config.label}</span>
    </span>
  );
}
