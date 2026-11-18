import React from 'react';
import { Badge } from '../common/Badge';
import { formatWaitRange, formatTime } from '../../utils/formatters';
import { Clock, MapPin, User, Stethoscope, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Signature Token Stub Component
 * Physical perforated ticket aesthetic adhering to §7.3
 * Variants: 'full' (patient confirmation/live), 'row' (staff queue), 'compact' (public zero-PII board)
 */
export function TokenStub({
  appointment,
  doctor,
  variant = 'full', // 'full' | 'row' | 'compact'
  patientsAhead = 0,
  onAction,
  actionLabel,
  actionIcon: ActionIcon,
  className = '',
}) {
  if (!appointment) return null;

  const {
    tokenNumber,
    status,
    scheduledTime,
    patientName,
    patientPhone,
    reason,
    isPriority,
    type,
    id,
  } = appointment;

  const docName = doctor?.name || 'Assigned Physician';
  const docRoom = doctor?.room || 'Clinical Suite';
  const deptName = doctor?.departmentName || 'Medical Department';
  const waitEstimate = formatWaitRange(patientsAhead, doctor?.avgConsultTimeMin || 12);

  // --- VARIANT 1: COMPACT (Public Display / Zero PII Strict) ---
  if (variant === 'compact') {
    const isNowCalled = status === 'CALLED';
    return (
      <div
        className={`relative overflow-hidden rounded-2xl transition-all duration-500 ease-spring p-3 sm:p-4 border ${
          isNowCalled
            ? 'bg-amber-light border-amber-border ring-2 ring-amber/40 shadow-bezel'
            : 'bg-surface border-border shadow-bezel-sm'
        } ${className}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className={`font-mono text-lg sm:text-2xl font-bold tracking-tight ${
                isNowCalled ? 'text-amber-900' : 'text-ink'
              }`}
            >
              {tokenNumber}
            </span>
            {isPriority && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber/20 text-amber-900 font-semibold uppercase">
                Priority
              </span>
            )}
          </div>
          <Badge status={status} size="sm" pulse={isNowCalled} />
        </div>

        <div className="mt-2.5 pt-2 border-t border-dashed border-border flex items-center justify-between text-xs text-ink-muted">
          <span className="truncate max-w-[120px] font-medium text-ink">{docRoom}</span>
          <span className="font-mono text-[11px]">{scheduledTime || 'Walk-in'}</span>
        </div>
      </div>
    );
  }

  // --- VARIANT 2: ROW (Doctor & Receptionist Queue Tables) ---
  if (variant === 'row') {
    return (
      <div
        className={`group relative rounded-2xl bg-surface border border-border p-3.5 sm:p-4 shadow-bezel-sm hover:border-primary/40 hover:shadow-bezel transition-all duration-300 ease-spring ${
          status === 'CALLED' ? 'border-amber ring-2 ring-amber/20 bg-amber-light/30' : ''
        } ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Identity Left */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-canvas-subtle flex flex-col items-center justify-center border border-border shrink-0">
              <span className="font-mono font-bold text-sm text-ink">{tokenNumber}</span>
              <span className="text-[9px] font-mono text-ink-muted uppercase">{type || 'REG'}</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-ink">{patientName}</h4>
                {isPriority && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-light text-amber-800 border border-amber-border font-bold">
                    PRIORITY
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-muted flex items-center gap-2 mt-0.5">
                <span className="truncate max-w-[180px]">{reason || 'Consultation'}</span>
                <span>•</span>
                <span className="font-mono">{scheduledTime}</span>
              </p>
            </div>
          </div>

          {/* Status & Actions Right */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
            <Badge status={status} size="sm" />
            {onAction && actionLabel && (
              <button
                type="button"
                onClick={onAction}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium font-sans bg-primary text-white hover:bg-primary-hover transition-all duration-200 active:scale-95 shadow-bezel-sm flex items-center gap-1.5"
              >
                {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
                <span>{actionLabel}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- VARIANT 3: FULL (Patient Confirmation & Live Queue Hero) ---
  return (
    <div className={`double-bezel-outer max-w-xl mx-auto ${className}`}>
      <div className="double-bezel-inner relative overflow-hidden bg-surface">
        {/* Ticket Header & Status Tag */}
        <div className="flex items-center justify-between pb-3 border-b border-border/70">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-ink-muted">
              Official Token Receipt
            </span>
          </div>
          <Badge status={status} size="md" pulse={status === 'CALLED'} />
        </div>

        {/* Identity & Hero Token Number */}
        <div className="py-5 text-center">
          <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-1">
            Token Identifier
          </p>
          <div className="font-mono text-5xl sm:text-6xl font-bold tracking-tight text-ink">
            {tokenNumber}
          </div>
          {isPriority && (
            <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-light text-amber-900 border border-amber-border text-xs font-medium">
              <Sparkles className="w-3 h-3 text-amber" />
              <span>Priority Pass</span>
            </div>
          )}
        </div>

        {/* Physical Perforation Divider */}
        <div className="ticket-perforation" />

        {/* Clinical Routing & Doctor Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <Stethoscope className="w-3.5 h-3.5 text-primary" />
              <span>Attending Physician</span>
            </div>
            <p className="text-sm font-semibold text-ink">{docName}</p>
            <p className="text-xs text-ink-muted">{deptName}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>Consultation Room</span>
            </div>
            <p className="text-sm font-semibold text-ink">{docRoom}</p>
            <p className="text-xs text-ink-muted">AuraFlow Central Medical</p>
          </div>
        </div>

        {/* Live Queue Dynamics Bar */}
        <div className="mt-4 p-3.5 rounded-2xl bg-canvas-subtle border border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center text-primary shadow-bezel-sm">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-ink-muted font-medium">
                Estimated Wait
              </p>
              <p className="text-sm font-mono font-semibold text-ink">{waitEstimate}</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wider text-ink-muted font-medium">
              Patients Ahead
            </p>
            <p className="text-sm font-mono font-semibold text-ink">
              {patientsAhead > 0 ? `${patientsAhead} in queue` : 'You are next!'}
            </p>
          </div>
        </div>

        {/* Navigation Quick Links */}
        <div className="mt-5 pt-3 flex items-center justify-between text-xs border-t border-border/60">
          <Link
            to={`/patient/qr/${id}`}
            className="font-medium text-primary hover:text-primary-hover flex items-center gap-1 hover:underline"
          >
            <span>View Privacy QR Pass</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          <Link
            to={`/patient/queue/${id}`}
            className="font-medium text-ink-muted hover:text-ink flex items-center gap-1 hover:underline"
          >
            <span>Live Queue Status</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
