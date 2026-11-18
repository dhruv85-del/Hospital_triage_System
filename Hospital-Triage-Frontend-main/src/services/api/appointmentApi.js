import { mockStore } from '../mockStore';
import * as queueEngine from '../queueEngine';
import { realtime } from '../realtime';

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export async function bookToken({ doctorId, patientId, patientName, patientPhone, date, scheduledTime, reason, isPriority = false }) {
  await delay(400);

  const tokenNumber = queueEngine.assignNextToken(doctorId, date);
  const now = new Date().toISOString();

  const newAppointment = {
    id: `apt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    tokenNumber,
    doctorId,
    patientId: patientId || 'pat_1',
    patientName: patientName || 'Patient',
    patientPhone: patientPhone || '+1 (555) 000-0000',
    date: date || now.split('T')[0],
    scheduledTime: scheduledTime || '10:00 AM',
    status: 'WAITING',
    type: 'ONLINE',
    isPriority: Boolean(isPriority),
    reason: reason || 'General Consultation',
    createdAt: now,
  };

  mockStore.addAppointment(newAppointment);

  // Notify realtime bus
  realtime.publish(`queue:${doctorId}`, {
    type: 'QUEUE_UPDATED',
    appointment: newAppointment,
  });

  return {
    success: true,
    appointment: newAppointment,
  };
}

export async function bookWalkIn({ doctorId, patientId, patientName, patientPhone, patientAge, reason, isPriority = false, autoCheckIn = true }) {
  await delay(350);

  const today = new Date().toISOString().split('T')[0];
  const tokenNumber = queueEngine.assignNextToken(doctorId, today);
  const now = new Date().toISOString();

  const newAppointment = {
    id: `apt_walkin_${Date.now()}`,
    tokenNumber,
    doctorId,
    patientId: patientId || `pat_${Date.now()}`,
    patientName,
    patientPhone,
    patientAge: parseInt(patientAge, 10) || 30,
    date: today,
    scheduledTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    status: autoCheckIn ? 'CHECKED_IN' : 'WAITING',
    type: 'WALK_IN',
    isPriority: Boolean(isPriority),
    reason: reason || 'Walk-in Consultation',
    checkedInAt: autoCheckIn ? now : null,
    createdAt: now,
  };

  mockStore.addAppointment(newAppointment);

  realtime.publish(`queue:${doctorId}`, {
    type: 'QUEUE_UPDATED',
    appointment: newAppointment,
  });

  return {
    success: true,
    appointment: newAppointment,
  };
}

export async function getAppointmentById(appointmentId) {
  await delay(200);
  const appointment = mockStore.getAppointmentById(appointmentId);
  if (!appointment) {
    throw new Error(`Appointment ${appointmentId} not found`);
  }
  const doctor = mockStore.getDoctorById(appointment.doctorId);
  const patient = mockStore.getPatientById(appointment.patientId);

  return {
    success: true,
    appointment,
    doctor,
    patient,
  };
}

export async function getPatientAppointments(patientId) {
  await delay(250);
  const appointments = mockStore.getPatientAppointments(patientId);
  const doctors = mockStore.getDoctors();

  const enriched = appointments.map((apt) => ({
    ...apt,
    doctor: doctors.find((d) => d.id === apt.doctorId) || null,
  }));

  return {
    success: true,
    appointments: enriched,
  };
}

export async function startConsultation(appointmentId, actor) {
  await delay(250);
  return queueEngine.startConsultation(appointmentId, actor);
}

export async function completeConsultation(appointmentId, notes, actor) {
  await delay(300);
  return queueEngine.completeConsultation(appointmentId, notes, actor);
}

export async function cancelAppointment(appointmentId, actor) {
  await delay(300);
  return queueEngine.cancel(appointmentId, actor);
}
