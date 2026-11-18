import {
  DEMO_USERS,
  INITIAL_APPOINTMENTS,
  INITIAL_DEPARTMENTS,
  INITIAL_DOCTORS,
  INITIAL_HOSPITALS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PATIENTS,
  INITIAL_QUEUE_EVENTS,
} from '../src/services/mockStore/seedData.js';
import bcrypt from 'bcryptjs';

function json(value) {
  return JSON.stringify(value ?? null);
}

export async function seedDatabase(pool) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const hospital of INITIAL_HOSPITALS) {
      await client.query(
        `INSERT INTO hospitals
          (id, name, code, city, address, phone, emergency_status, departments_count, active_doctors_count)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO NOTHING`,
        [
          hospital.id, hospital.name, hospital.code, hospital.city, hospital.address,
          hospital.phone, hospital.emergencyStatus, hospital.departmentsCount,
          hospital.activeDoctorsCount,
        ],
      );
    }

    for (const department of INITIAL_DEPARTMENTS) {
      await client.query(
        `INSERT INTO departments
          (id, hospital_id, name, code, floor, icon, head_doctor, color, description, avg_wait_time_min, active_queues)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (id) DO NOTHING`,
        [
          department.id, department.hospitalId, department.name, department.code,
          department.floor, department.icon, department.headDoctor, department.color,
          department.description, department.avgWaitTimeMin, department.activeQueues,
        ],
      );
    }

    const userSeeds = new Map();
    for (const user of Object.values(DEMO_USERS)) {
      userSeeds.set(user.userId, user);
    }
    for (const patient of INITIAL_PATIENTS) {
      if (!userSeeds.has(patient.userId)) {
        userSeeds.set(patient.userId, {
          userId: patient.userId,
          name: patient.name,
          email: patient.email,
          role: 'PATIENT',
        });
      }
    }
    for (const doctor of INITIAL_DOCTORS) {
      if (!userSeeds.has(doctor.userId)) {
        userSeeds.set(doctor.userId, {
          userId: doctor.userId,
          name: doctor.name,
          role: 'DOCTOR',
        });
      }
    }

    for (const user of userSeeds.values()) {
      await client.query(
        `INSERT INTO users (id, name, email, role, avatar, details)
         VALUES ($1,$2,$3,$4,$5,$6::jsonb)
         ON CONFLICT (id) DO NOTHING`,
        [
          user.userId, user.name, user.email || null, user.role, user.avatar || null, json(user),
        ],
      );
    }

    if (!process.env.DEMO_USER_PASSWORD || process.env.DEMO_USER_PASSWORD.length < 12) {
      throw new Error('DEMO_USER_PASSWORD must be at least 12 characters for seeded demo accounts.');
    }
    const demoPasswordHash = await bcrypt.hash(process.env.DEMO_USER_PASSWORD, 12);
    for (const user of Object.values(DEMO_USERS)) {
      await client.query(
        'UPDATE users SET password_hash = $2 WHERE id = $1',
        [user.userId, demoPasswordHash],
      );
    }

    for (const patient of INITIAL_PATIENTS) {
      await client.query(
        `INSERT INTO patients
          (id, user_id, mrn, name, age, gender, phone, email, blood_group, allergies, emergency_contact, registered_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11::jsonb,$12)
         ON CONFLICT (id) DO NOTHING`,
        [
          patient.id, patient.userId, patient.mrn, patient.name, patient.age, patient.gender,
          patient.phone, patient.email, patient.bloodGroup, json(patient.allergies),
          json(patient.emergencyContact), patient.registeredDate,
        ],
      );
    }

    for (const doctor of INITIAL_DOCTORS) {
      await client.query(
        `INSERT INTO doctors
          (id, user_id, department_id, hospital_id, name, title, department_name, room,
           qualification, experience_years, avatar, avg_consult_time_min, fee, rating,
           reviews_count, status, today_total_tokens, today_served_tokens, schedule, bio)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19::jsonb,$20)
         ON CONFLICT (id) DO NOTHING`,
        [
          doctor.id, doctor.userId, doctor.departmentId, doctor.hospitalId, doctor.name,
          doctor.title, doctor.departmentName, doctor.room, doctor.qualification,
          doctor.experienceYears, doctor.avatar, doctor.avgConsultTimeMin, doctor.fee,
          doctor.rating, doctor.reviewsCount, doctor.status, doctor.todayTotalTokens,
          doctor.todayServedTokens, json(doctor.schedule), doctor.bio,
        ],
      );
    }

    for (const appointment of INITIAL_APPOINTMENTS) {
      await client.query(
        `INSERT INTO appointments
          (id, token_number, doctor_id, patient_id, patient_name, patient_phone, patient_age,
           appointment_date, scheduled_time, status, appointment_type, is_priority, reason,
           doctor_notes, checked_in_at, called_at, consultation_start_time, consultation_end_time, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
         ON CONFLICT (id) DO NOTHING`,
        [
          appointment.id, appointment.tokenNumber, appointment.doctorId, appointment.patientId,
          appointment.patientName, appointment.patientPhone, appointment.patientAge,
          appointment.date, appointment.scheduledTime, appointment.status, appointment.type,
          appointment.isPriority, appointment.reason, appointment.doctorNotes || null,
          appointment.checkedInAt || null, appointment.calledAt || null,
          appointment.consultationStartTime || null, appointment.consultationEndTime || null,
          appointment.createdAt,
        ],
      );
    }

    for (const event of INITIAL_QUEUE_EVENTS) {
      await client.query(
        `INSERT INTO queue_events
          (id, appointment_id, doctor_id, token_number, event_type, previous_status, new_status, event_timestamp, actor_role, actor_name)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (id) DO NOTHING`,
        [
          event.id, event.appointmentId, event.doctorId, event.tokenNumber, event.eventType,
          event.previousStatus, event.newStatus, event.timestamp, event.actorRole, event.actorName,
        ],
      );
    }

    for (const notification of INITIAL_NOTIFICATIONS) {
      await client.query(
        `INSERT INTO notifications
          (id, user_id, title, message, type, appointment_id, is_read, notification_timestamp)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (id) DO NOTHING`,
        [
          notification.id, notification.userId, notification.title, notification.message,
          notification.type, notification.appointmentId, notification.read, notification.timestamp,
        ],
      );
    }

    const settings = {
      approachingTurnThreshold: 2,
      defaultConsultTimeMin: 12,
      enableSoundChime: true,
      enableAutoCallPrompt: true,
    };
    await client.query(
      `INSERT INTO app_settings (setting_key, setting_value)
       VALUES ('hospital', $1::jsonb)
       ON CONFLICT (setting_key) DO NOTHING`,
      [json(settings)],
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
