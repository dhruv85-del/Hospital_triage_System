import {
  INITIAL_HOSPITALS,
  INITIAL_DEPARTMENTS,
  INITIAL_DOCTORS,
  INITIAL_PATIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_QUEUE_EVENTS,
  INITIAL_NOTIFICATIONS,
  DEMO_USERS,
} from './seedData';

const STORAGE_KEY = 'auraflow_mock_store_v3';

class MockStore {
  constructor() {
    this.data = this.loadFromStorage();
  }

  loadFromStorage() {
    if (typeof window === 'undefined') {
      return this.getInitialState();
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load mockStore from localStorage, using seed data:', e);
    }
    return this.getInitialState();
  }

  getInitialState() {
    return {
      hospitals: [...INITIAL_HOSPITALS],
      departments: [...INITIAL_DEPARTMENTS],
      doctors: [...INITIAL_DOCTORS],
      patients: [...INITIAL_PATIENTS],
      appointments: [...INITIAL_APPOINTMENTS],
      queueEvents: [...INITIAL_QUEUE_EVENTS],
      notifications: [...INITIAL_NOTIFICATIONS],
      settings: {
        approachingTurnThreshold: 2,
        defaultConsultTimeMin: 12,
        enableSoundChime: true,
        enableAutoCallPrompt: true,
      },
    };
  }

  save() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch (e) {
        console.error('Failed to persist mockStore to localStorage:', e);
      }
    }
  }

  resetToDefault() {
    this.data = this.getInitialState();
    this.save();
    return this.data;
  }

  // --- Entity Accessors ---
  getHospitals() {
    return this.data.hospitals;
  }

  getDepartments(hospitalId) {
    if (hospitalId) {
      return this.data.departments.filter((d) => d.hospitalId === hospitalId);
    }
    return this.data.departments;
  }

  getDoctors(departmentId) {
    if (departmentId) {
      return this.data.doctors.filter((d) => d.departmentId === departmentId);
    }
    return this.data.doctors;
  }

  getDoctorById(doctorId) {
    return this.data.doctors.find((d) => d.id === doctorId);
  }

  getPatients() {
    return this.data.patients;
  }

  getPatientById(patientId) {
    return this.data.patients.find((p) => p.id === patientId);
  }

  getPatientByPhoneOrMrn(query) {
    const clean = query.trim().toLowerCase();
    return this.data.patients.find(
      (p) =>
        p.phone.replace(/\D/g, '').includes(clean.replace(/\D/g, '')) ||
        p.mrn.toLowerCase() === clean ||
        p.name.toLowerCase().includes(clean)
    );
  }

  getAppointments(doctorId, date) {
    return this.data.appointments.filter((apt) => {
      let match = true;
      if (doctorId) match = match && apt.doctorId === doctorId;
      if (date) match = match && apt.date === date;
      return match;
    });
  }

  getAppointmentById(appointmentId) {
    return this.data.appointments.find((apt) => apt.id === appointmentId);
  }

  getPatientAppointments(patientId) {
    return this.data.appointments
      .filter((apt) => apt.patientId === patientId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  addAppointment(appointment) {
    this.data.appointments.push(appointment);
    this.save();
    return appointment;
  }

  updateAppointment(appointmentId, updates) {
    const index = this.data.appointments.findIndex((a) => a.id === appointmentId);
    if (index !== -1) {
      this.data.appointments[index] = {
        ...this.data.appointments[index],
        ...updates,
      };
      this.save();
      return this.data.appointments[index];
    }
    return null;
  }

  addPatient(patient) {
    this.data.patients.push(patient);
    this.save();
    return patient;
  }

  addQueueEvent(event) {
    this.data.queueEvents.unshift({
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...event,
      timestamp: new Date().toISOString(),
    });
    // Keep max 200 events in memory
    if (this.data.queueEvents.length > 200) {
      this.data.queueEvents.pop();
    }
    this.save();
  }

  getQueueEvents(doctorId) {
    if (doctorId) {
      return this.data.queueEvents.filter((e) => e.doctorId === doctorId);
    }
    return this.data.queueEvents;
  }

  getNotifications(userId) {
    if (userId) {
      return this.data.notifications.filter((n) => n.userId === userId);
    }
    return this.data.notifications;
  }

  addNotification(notification) {
    const newNotif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    };
    this.data.notifications.unshift(newNotif);
    this.save();
    return newNotif;
  }

  markNotificationRead(notificationId) {
    const n = this.data.notifications.find((item) => item.id === notificationId);
    if (n) {
      n.read = true;
      this.save();
    }
  }

  getSettings() {
    return this.data.settings;
  }

  updateSettings(newSettings) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.save();
    return this.data.settings;
  }
}

export const mockStore = new MockStore();
