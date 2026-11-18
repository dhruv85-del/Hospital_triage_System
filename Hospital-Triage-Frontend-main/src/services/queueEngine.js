import { mockStore } from './mockStore';
import { realtime } from './realtime';

/**
 * Pure Queue State Machine & Transition Rules
 * Enforces: WAITING -> CHECKED_IN -> CALLED -> IN_PROGRESS -> COMPLETED
 * Branches: SKIPPED, CANCELLED, NO_SHOW
 */

export const VALID_TRANSITIONS = {
  WAITING: ['CHECKED_IN', 'CANCELLED'],
  CHECKED_IN: ['CALLED', 'CANCELLED'],
  CALLED: ['IN_PROGRESS', 'SKIPPED', 'NO_SHOW', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED'],
  SKIPPED: ['CHECKED_IN', 'CALLED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: ['CHECKED_IN', 'CALLED'], // Patient arrived late, staff can re-admit
};

/**
 * Validates and executes a status transition
 */
export function transition(appointmentId, targetStatus, actor = { role: 'SYSTEM', name: 'Queue Engine' }) {
  const appointment = mockStore.getAppointmentById(appointmentId);
  if (!appointment) {
    throw new Error(`Appointment ${appointmentId} does not exist`);
  }

  const currentStatus = appointment.status;
  const allowedNext = VALID_TRANSITIONS[currentStatus] || [];

  if (!allowedNext.includes(targetStatus)) {
    throw new Error(
      `Illegal transition: Cannot move token ${appointment.tokenNumber} from ${currentStatus} to ${targetStatus}. Allowed: [${allowedNext.join(', ')}]`
    );
  }

  const updates = {
    status: targetStatus,
  };

  const nowIso = new Date().toISOString();
  const timeFormatted = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  if (targetStatus === 'CHECKED_IN') {
    updates.checkedInAt = nowIso;
  } else if (targetStatus === 'CALLED') {
    updates.calledAt = nowIso;
  } else if (targetStatus === 'IN_PROGRESS') {
    updates.consultationStartTime = timeFormatted;
  } else if (targetStatus === 'COMPLETED') {
    updates.consultationEndTime = timeFormatted;
  }

  const updatedAppointment = mockStore.updateAppointment(appointmentId, updates);

  // Append Audit Event
  mockStore.addQueueEvent({
    appointmentId,
    doctorId: updatedAppointment.doctorId,
    tokenNumber: updatedAppointment.tokenNumber,
    eventType: 'STATUS_CHANGE',
    previousStatus: currentStatus,
    newStatus: targetStatus,
    actorRole: actor.role || 'STAFF',
    actorName: actor.name || 'Staff User',
  });

  // Trigger Notifications if token was called or updated
  if (targetStatus === 'CALLED') {
    mockStore.addNotification({
      userId: updatedAppointment.patientId === 'pat_1' ? 'user_pat_1' : `user_${updatedAppointment.patientId}`,
      title: 'Your Token is CALLED!',
      message: `Token ${updatedAppointment.tokenNumber} has been called for consultation. Please proceed to the doctor's room.`,
      type: 'CALL',
      appointmentId: updatedAppointment.id,
    });
  }

  // Publish to realtime bus
  realtime.publish(`queue:${updatedAppointment.doctorId}`, {
    type: 'QUEUE_UPDATED',
    appointment: updatedAppointment,
    previousStatus: currentStatus,
    newStatus: targetStatus,
  });

  realtime.publish('hospital:all', {
    type: 'QUEUE_UPDATED',
    appointment: updatedAppointment,
  });

  return updatedAppointment;
}

/**
 * Assign sequential token number for doctor on date (e.g. T-108, T-204)
 */
export function assignNextToken(doctorId, date = new Date().toISOString().split('T')[0]) {
  const existing = mockStore.getAppointments(doctorId, date);
  const doctor = mockStore.getDoctorById(doctorId);
  const docIndex = doctor ? parseInt(doctorId.replace('doc_', ''), 10) || 1 : 1;
  const prefix = `T-${docIndex}`;

  let maxSeq = 0;
  existing.forEach((apt) => {
    if (apt.tokenNumber && apt.tokenNumber.startsWith(prefix)) {
      const seq = parseInt(apt.tokenNumber.replace(`${prefix}`, ''), 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  });

  const nextSeq = Math.max(maxSeq + 1, existing.length + 1);
  const padded = nextSeq < 10 ? `0${nextSeq}` : `${nextSeq}`;
  return `${prefix}${padded}`;
}

/**
 * Doctor calls the next eligible patient in queue
 * Priority tokens are called first, then regular in arrival order
 */
export function callNext(doctorId, actor = { role: 'DOCTOR', name: 'Doctor' }) {
  const today = new Date().toISOString().split('T')[0];
  const queue = mockStore.getAppointments(doctorId, today);

  // Check if there is already an active CALLED or IN_PROGRESS token
  const currentlyCalled = queue.find((a) => a.status === 'CALLED');
  if (currentlyCalled) {
    // If already called, prompt doctor to complete or skip previous, or auto-skip
  }

  // Find eligible tokens: status === 'CHECKED_IN'
  const eligible = queue
    .filter((a) => a.status === 'CHECKED_IN')
    .sort((a, b) => {
      // Priority first
      if (a.isPriority && !b.isPriority) return -1;
      if (!a.isPriority && b.isPriority) return 1;
      // Then check-in time or token sequence
      const timeA = new Date(a.checkedInAt || a.createdAt).getTime();
      const timeB = new Date(b.checkedInAt || b.createdAt).getTime();
      return timeA - timeB;
    });

  if (eligible.length === 0) {
    return { success: false, message: 'No checked-in patients waiting in queue.' };
  }

  const nextToCall = eligible[0];
  const transitioned = transition(nextToCall.id, 'CALLED', actor);

  return { success: true, appointment: transitioned };
}

/**
 * Doctor skips current patient (moves to SKIPPED)
 */
export function skip(appointmentId, actor = { role: 'DOCTOR', name: 'Doctor' }) {
  return transition(appointmentId, 'SKIPPED', actor);
}

/**
 * Recall a skipped patient
 */
export function recall(appointmentId, actor = { role: 'DOCTOR', name: 'Doctor' }) {
  return transition(appointmentId, 'CALLED', actor);
}

/**
 * Start consultation for called patient
 */
export function startConsultation(appointmentId, actor = { role: 'DOCTOR', name: 'Doctor' }) {
  return transition(appointmentId, 'IN_PROGRESS', actor);
}

/**
 * Complete consultation with notes
 */
export function completeConsultation(appointmentId, notes = '', actor = { role: 'DOCTOR', name: 'Doctor' }) {
  const appointment = mockStore.getAppointmentById(appointmentId);
  if (notes && appointment) {
    mockStore.updateAppointment(appointmentId, { doctorNotes: notes });
  }
  return transition(appointmentId, 'COMPLETED', actor);
}

/**
 * Cancel appointment
 */
export function cancel(appointmentId, actor = { role: 'PATIENT', name: 'Patient' }) {
  return transition(appointmentId, 'CANCELLED', actor);
}

/**
 * Check-in arriving patient
 */
export function checkIn(appointmentId, actor = { role: 'RECEPTIONIST', name: 'Receptionist' }) {
  return transition(appointmentId, 'CHECKED_IN', actor);
}

/**
 * Calculates estimated wait time range for a specific token
 */
export function estimateWait(doctorId, tokenNumber, date = new Date().toISOString().split('T')[0]) {
  const queue = mockStore.getAppointments(doctorId, date);
  const doctor = mockStore.getDoctorById(doctorId);
  const avgTime = doctor ? doctor.avgConsultTimeMin : 12;

  const targetApt = queue.find((a) => a.tokenNumber === tokenNumber);
  if (!targetApt) {
    return { aheadCount: 0, minWait: 0, maxWait: 0, waitRange: 'Unknown' };
  }

  if (targetApt.status === 'CALLED') {
    return { aheadCount: 0, minWait: 0, maxWait: 0, waitRange: 'Now Calling' };
  }

  if (targetApt.status === 'IN_PROGRESS') {
    return { aheadCount: 0, minWait: 0, maxWait: 0, waitRange: 'In Consultation' };
  }

  if (targetApt.status === 'COMPLETED' || targetApt.status === 'CANCELLED') {
    return { aheadCount: 0, minWait: 0, maxWait: 0, waitRange: '--' };
  }

  // Count how many checked-in / waiting are ahead
  const activeAhead = queue.filter(
    (a) =>
      (a.status === 'CHECKED_IN' || a.status === 'CALLED' || a.status === 'IN_PROGRESS') &&
      a.id !== targetApt.id &&
      new Date(a.createdAt).getTime() < new Date(targetApt.createdAt).getTime()
  );

  const aheadCount = activeAhead.length;
  if (aheadCount === 0) {
    return { aheadCount: 0, minWait: 1, maxWait: 5, waitRange: '1–5 min (Next)' };
  }

  const minWait = Math.max(3, aheadCount * (avgTime - 2));
  const maxWait = aheadCount * (avgTime + 4);
  return {
    aheadCount,
    minWait,
    maxWait,
    waitRange: `${minWait}–${maxWait} min`,
  };
}
