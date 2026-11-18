/**
 * Clinical Data & Queue Formatting Utilities
 */

/**
 * Returns estimated wait time range (e.g. "32–41 min")
 * Never returns a false-precise single number as per specification.
 */
export function formatWaitRange(patientsAhead, avgConsultTime = 12) {
  if (patientsAhead <= 0) {
    return 'Immediate / Next';
  }
  const minWait = Math.max(1, (patientsAhead - 1) * avgConsultTime + 4);
  const maxWait = patientsAhead * (avgConsultTime + 4) + 6;
  return `${minWait}–${maxWait} min`;
}

export function formatTime(isoOrTimeString) {
  if (!isoOrTimeString) return '--:--';
  if (typeof isoOrTimeString === 'string' && isoOrTimeString.includes(':') && !isoOrTimeString.includes('T')) {
    // Already in HH:MM format
    return isoOrTimeString;
  }
  const d = new Date(isoOrTimeString);
  if (isNaN(d.getTime())) return isoOrTimeString;
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function formatDate(isoString) {
  if (!isoString) return '--';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatRelativeTime(isoString) {
  if (!isoString) return '';
  const now = new Date();
  const d = new Date(isoString);
  const diffMs = now - d;
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return 'Just now';
  if (diffMin === 1) return '1 min ago';
  if (diffMin < 60) return `${diffMin} mins ago`;
  const diffHours = Math.round(diffMin / 60);
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  return formatDate(isoString);
}

/**
 * Strict status configuration adhering to design tokens.
 * Single source of truth across all 4 roles.
 */
export function getStatusConfig(status) {
  switch (status) {
    case 'CALLED':
      return {
        label: 'Now Calling',
        color: 'amber',
        bg: 'bg-amber-light',
        border: 'border-amber-border',
        text: 'text-amber-800',
        dot: 'bg-amber',
        glow: 'ring-2 ring-amber/30 animate-pulse',
        description: 'Patient should proceed directly to consultation room',
      };
    case 'IN_PROGRESS':
      return {
        label: 'In Consultation',
        color: 'primary',
        bg: 'bg-primary-light',
        border: 'border-primary/30',
        text: 'text-primary-hover',
        dot: 'bg-primary',
        glow: 'ring-2 ring-primary/20',
        description: 'Consultation currently in progress with doctor',
      };
    case 'CHECKED_IN':
      return {
        label: 'Checked In',
        color: 'success',
        bg: 'bg-success-light',
        border: 'border-success-border',
        text: 'text-success-800',
        dot: 'bg-success',
        glow: '',
        description: 'Patient present in waiting room, eligible to be called',
      };
    case 'COMPLETED':
      return {
        label: 'Completed',
        color: 'success',
        bg: 'bg-success-light',
        border: 'border-success-border',
        text: 'text-success-800',
        dot: 'bg-success',
        glow: '',
        description: 'Consultation finished successfully',
      };
    case 'SKIPPED':
      return {
        label: 'Skipped (Recallable)',
        color: 'alert',
        bg: 'bg-alert-light',
        border: 'border-alert-border',
        text: 'text-alert-800',
        dot: 'bg-alert',
        glow: '',
        description: 'Patient was not present when called; can be recalled by staff',
      };
    case 'NO_SHOW':
      return {
        label: 'No Show',
        color: 'alert',
        bg: 'bg-alert-light',
        border: 'border-alert-border',
        text: 'text-alert-800',
        dot: 'bg-alert',
        glow: '',
        description: 'Patient missed appointment window',
      };
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        color: 'alert',
        bg: 'bg-alert-light',
        border: 'border-alert-border',
        text: 'text-alert-800',
        dot: 'bg-alert',
        glow: '',
        description: 'Appointment cancelled prior to consultation',
      };
    case 'WAITING':
    default:
      return {
        label: 'Waiting',
        color: 'waiting',
        bg: 'bg-canvas-subtle',
        border: 'border-border',
        text: 'text-ink-muted',
        dot: 'bg-waiting',
        glow: '',
        description: 'Token confirmed, awaiting arrival check-in',
      };
  }
}
