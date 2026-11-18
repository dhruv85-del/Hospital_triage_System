import { mockStore } from '../mockStore';
import * as queueEngine from '../queueEngine';

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getQueue(doctorId, date = new Date().toISOString().split('T')[0]) {
  await delay(200);
  const appointments = mockStore.getAppointments(doctorId, date);
  const doctor = doctorId ? mockStore.getDoctorById(doctorId) : null;

  return {
    success: true,
    doctorId,
    doctor,
    date,
    total: appointments.length,
    waiting: appointments.filter((a) => a.status === 'WAITING').length,
    checkedIn: appointments.filter((a) => a.status === 'CHECKED_IN').length,
    called: appointments.find((a) => a.status === 'CALLED') || null,
    inProgress: appointments.find((a) => a.status === 'IN_PROGRESS') || null,
    completed: appointments.filter((a) => a.status === 'COMPLETED').length,
    skipped: appointments.filter((a) => a.status === 'SKIPPED').length,
    items: appointments,
  };
}

export async function getAllActiveQueues() {
  await delay(250);
  const doctors = mockStore.getDoctors();
  const today = new Date().toISOString().split('T')[0];

  const queues = doctors.map((doc) => {
    const apts = mockStore.getAppointments(doc.id, today);
    return {
      doctor: doc,
      totalToday: apts.length,
      currentCalled: apts.find((a) => a.status === 'CALLED') || null,
      currentInProgress: apts.find((a) => a.status === 'IN_PROGRESS') || null,
      waitingCount: apts.filter((a) => a.status === 'CHECKED_IN' || a.status === 'WAITING').length,
      completedCount: apts.filter((a) => a.status === 'COMPLETED').length,
      nextUp: apts.filter((a) => a.status === 'CHECKED_IN')[0] || null,
      items: apts,
    };
  });

  return { success: true, queues };
}

export async function callNextPatient(doctorId, actor) {
  await delay(300);
  return queueEngine.callNext(doctorId, actor);
}

export async function skipPatient(appointmentId, actor) {
  await delay(250);
  return queueEngine.skip(appointmentId, actor);
}

export async function recallPatient(appointmentId, actor) {
  await delay(250);
  return queueEngine.recall(appointmentId, actor);
}

export async function checkInPatient(appointmentId, actor) {
  await delay(300);
  return queueEngine.checkIn(appointmentId, actor);
}

export async function getEstimatedWait(doctorId, tokenNumber) {
  await delay(150);
  return queueEngine.estimateWait(doctorId, tokenNumber);
}
