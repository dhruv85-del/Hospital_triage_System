import { mockStore } from '../mockStore';

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getDoctors(departmentId) {
  await delay(200);
  const doctors = mockStore.getDoctors(departmentId);
  return { success: true, doctors };
}

export async function getDoctorById(doctorId) {
  await delay(150);
  const doctor = mockStore.getDoctorById(doctorId);
  if (!doctor) {
    throw new Error(`Doctor ${doctorId} not found`);
  }
  const department = mockStore.getDepartments().find((d) => d.id === doctor.departmentId);
  return { success: true, doctor, department };
}

export async function updateDoctorStatus(doctorId, status) {
  await delay(200);
  const doctor = mockStore.getDoctorById(doctorId);
  if (doctor) {
    doctor.status = status;
    mockStore.save();
    return { success: true, doctor };
  }
  throw new Error(`Doctor ${doctorId} not found`);
}

export async function updateDoctorSchedule(doctorId, schedule) {
  await delay(250);
  const doctor = mockStore.getDoctorById(doctorId);
  if (doctor) {
    doctor.schedule = { ...doctor.schedule, ...schedule };
    mockStore.save();
    return { success: true, doctor };
  }
  throw new Error(`Doctor ${doctorId} not found`);
}
