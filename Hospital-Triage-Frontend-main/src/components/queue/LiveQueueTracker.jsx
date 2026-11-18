import React from 'react';
import { getStatusConfig, formatWaitRange } from '../../utils/formatters';
import { CheckCircle2, Clock, Bell, UserCheck, Stethoscope, AlertCircle } from 'lucide-react';

const STEPS = [
  { key: 'WAITING', label: 'Booked', desc: 'Token confirmed' },
  { key: 'CHECKED_IN', label: 'Checked In', desc: 'Arrived at clinic' },
  { key: 'CALLED', label: 'Now Calling', desc: 'Proceed to room' },
  { key: 'IN_PROGRESS', label: 'Consultation', desc: 'With physician' },
  { key: 'COMPLETED', label: 'Completed', desc: 'Consultation done' },
];

export function LiveQueueTracker({ appointment, doctor, patientsAhead = 0 }) {
  if (!appointment) return null;

  const currentStatus = appointment.status;
  const statusCfg = getStatusConfig(currentStatus);
  const isNowCalled = currentStatus === 'CALLED';

  // Calculate current step index
  let activeIndex = STEPS.findIndex((s) => s.key === currentStatus);
  if (currentStatus === 'SKIPPED' || currentStatus === 'CANCELLED' || currentStatus === 'NO_SHOW') {
    activeIndex = -1;
  }

  return (
    <div className="space-y-6">
      {/* Live Accessibility Announcement Region (§11 requirement) */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        Your current token status is {statusCfg.label}. Estimated wait time is {formatWaitRange(patientsAhead)}.
      </div>

      {/* Hero Live Counter Banner */}
      <div
        className={`rounded-3xl p-6 sm:p-8 transition-all duration-500 ease-spring border ${
          isNowCalled
            ? 'bg-amber-light border-amber-border ring-4 ring-amber/30 shadow-bezel'
            : 'bg-surface border-border shadow-bezel'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="eyebrow-tag">
              Live Queue Feed • {doctor?.departmentName || 'Clinic'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink mt-2">
              {isNowCalled ? (
                <span className="text-amber-900 flex items-center gap-2">
                  <Bell className="w-7 h-7 text-amber animate-bounce" />
                  Your turn has arrived!
                </span>
              ) : currentStatus === 'IN_PROGRESS' ? (
                'Consultation In Progress'
              ) : currentStatus === 'COMPLETED' ? (
                'Visit Completed'
              ) : (
                `Position: #${patientsAhead + 1} in line`
              )}
            </h2>
            <p className="text-sm text-ink-muted mt-1">
              {isNowCalled
                ? `Please head immediately to ${doctor?.room || 'the consultation room'}.`
                : currentStatus === 'IN_PROGRESS'
                ? 'Your consultation is actively being recorded.'
                : `There are currently ${patientsAhead} patient(s) ahead of your token.`}
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0 bg-canvas-subtle sm:bg-transparent p-4 sm:p-0 rounded-2xl">
            <p className="text-xs uppercase tracking-widest text-ink-muted font-mono">
              Estimated Wait
            </p>
            <div className="font-mono text-3xl font-bold text-ink mt-0.5">
              {isNowCalled
                ? 'Immediate'
                : formatWaitRange(patientsAhead, doctor?.avgConsultTimeMin || 12)}
            </div>
            <p className="text-[11px] text-ink-muted">Auto-updating in real-time</p>
          </div>
        </div>
      </div>

      {/* Progressive Step Track */}
      <div className="rounded-3xl bg-surface border border-border p-6 shadow-bezel-sm">
        <h4 className="text-xs font-mono uppercase tracking-wider text-ink-muted mb-6">
          Lifecycle Progression
        </h4>

        <div className="relative">
          {/* Progress Connecting Line */}
          <div className="hidden sm:block absolute top-5 left-8 right-8 h-0.5 bg-border -z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
            {STEPS.map((step, idx) => {
              const isPast = activeIndex > idx;
              const isCurrent = activeIndex === idx;

              let iconBg = 'bg-canvas-subtle text-ink-muted border-border';
              if (isCurrent) {
                iconBg = isNowCalled
                  ? 'bg-amber text-ink border-amber-border ring-4 ring-amber/30'
                  : 'bg-primary text-white border-primary shadow-subtle-glow';
              } else if (isPast) {
                iconBg = 'bg-success text-white border-success';
              }

              return (
                <div key={step.key} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border font-mono text-xs font-bold transition-all duration-300 ${iconBg}`}
                  >
                    {isPast ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-semibold ${
                        isCurrent ? 'text-ink font-bold' : isPast ? 'text-ink' : 'text-ink-muted'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-[11px] text-ink-muted hidden sm:block">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
