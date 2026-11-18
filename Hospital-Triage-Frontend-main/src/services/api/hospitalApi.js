import { mockStore } from '../mockStore';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getHospitals() {
  await delay(150);
  return { success: true, hospitals: mockStore.getHospitals() };
}

export async function getDepartments(hospitalId) {
  await delay(150);
  return { success: true, departments: mockStore.getDepartments(hospitalId) };
}

export async function getPatients() {
  await delay(200);
  return { success: true, patients: mockStore.getPatients() };
}

export async function addDoctor(doctorData) {
  await delay(300);
  const newDoc = {
    id: `doc_${Date.now()}`,
    ...doctorData,
  };
  mockStore.data.doctors.push(newDoc);
  mockStore.save();
  return { success: true, doctor: newDoc };
}

export async function addDepartment(deptData) {
  await delay(300);
  const newDept = {
    id: `dept_${Date.now()}`,
    ...deptData,
  };
  mockStore.data.departments.push(newDept);
  mockStore.save();
  return { success: true, department: newDept };
}
