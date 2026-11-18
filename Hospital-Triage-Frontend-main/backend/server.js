import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { initializeSchema, pool } from './db.js';
import { seedDatabase } from './seed.js';

const app = express();
const port = Number(process.env.API_PORT || 4000);
const sessionCookie = 'hospital_session';
const sessionDurationMs = 7 * 24 * 60 * 60 * 1000;
const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);
const today = () => new Date().toISOString().slice(0, 10);
const newId = (prefix) => `${prefix}_${Date.now()}_${randomUUID().slice(0, 8)}`;

const appointmentColumns = `
  a.id,
  a.token_number AS "tokenNumber",
  a.doctor_id AS "doctorId",
  a.patient_id AS "patientId",
  a.patient_name AS "patientName",
  a.patient_phone AS "patientPhone",
  a.patient_age AS "patientAge",
  a.appointment_date::text AS date,
  a.scheduled_time AS "scheduledTime",
  a.status,
  a.appointment_type AS type,
  a.is_priority AS "isPriority",
  a.reason,
  a.doctor_notes AS "doctorNotes",
  a.checked_in_at AS "checkedInAt",
  a.called_at AS "calledAt",
  a.consultation_start_time AS "consultationStartTime",
  a.consultation_end_time AS "consultationEndTime",
  a.created_at AS "createdAt"`;

const patientColumns = `
  p.id, p.user_id AS "userId", p.mrn, p.name, p.age, p.gender, p.phone, p.email,
  p.blood_group AS "bloodGroup", p.allergies, p.emergency_contact AS "emergencyContact",
  p.registered_date::text AS "registeredDate"`;

const doctorColumns = `
  d.id, d.user_id AS "userId", d.name, d.title,
  d.department_id AS "departmentId", d.department_name AS "departmentName",
  d.hospital_id AS "hospitalId", d.room, d.qualification,
  d.experience_years AS "experienceYears", d.avatar,
  d.avg_consult_time_min AS "avgConsultTimeMin", d.fee, d.rating,
  d.reviews_count AS "reviewsCount", d.status,
  d.today_total_tokens AS "todayTotalTokens", d.today_served_tokens AS "todayServedTokens",
  d.schedule, d.bio`;

const transitions = {
  WAITING: ['CHECKED_IN', 'CANCELLED'],
  CHECKED_IN: ['CALLED', 'CANCELLED'],
  CALLED: ['IN_PROGRESS', 'SKIPPED', 'NO_SHOW', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED'],
  SKIPPED: ['CHECKED_IN', 'CALLED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: ['CHECKED_IN', 'CALLED'],
};

app.use(cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin is not allowed by the local API server.'));
  },
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function getDoctor(doctorId, queryable = pool) {
  const result = await queryable.query(
    `SELECT ${doctorColumns} FROM doctors d WHERE d.id = $1`,
    [doctorId],
  );
  return result.rows[0] || null;
}

async function getPatient(patientId, queryable = pool) {
  const result = await queryable.query(
    `SELECT ${patientColumns} FROM patients p WHERE p.id = $1`,
    [patientId],
  );
  return result.rows[0] || null;
}

async function getAppointment(appointmentId, queryable = pool) {
  const result = await queryable.query(
    `SELECT ${appointmentColumns} FROM appointments a WHERE a.id = $1`,
    [appointmentId],
  );
  return result.rows[0] || null;
}

async function inTransaction(action) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await action(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

function hashSessionToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function setSessionCookie(response, token) {
  response.cookie(sessionCookie, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api',
    maxAge: sessionDurationMs,
  });
}

function clearSessionCookie(response) {
  response.clearCookie(sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api',
  });
}

async function getSessionUser(userId) {
  const result = await pool.query(
    `SELECT u.id AS "userId", u.name, u.email, u.role, u.avatar, u.details,
            p.id AS "patientId", p.mrn, p.phone, p.age, p.gender,
            p.blood_group AS "bloodGroup", p.allergies,
            p.emergency_contact AS "emergencyContact",
            p.registered_date::text AS "registeredDate", d.id AS "doctorId",
            d.department_name AS department, d.room
     FROM users u
     LEFT JOIN patients p ON p.user_id = u.id
     LEFT JOIN doctors d ON d.user_id = u.id
     WHERE u.id = $1`,
    [userId],
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    ...(row.details || {}),
    userId: row.userId,
    name: row.name,
    email: row.email,
    role: row.role,
    avatar: row.avatar,
    ...(row.patientId ? {
      patientId: row.patientId,
      mrn: row.mrn,
      phone: row.phone,
      age: row.age,
      gender: row.gender,
      bloodGroup: row.bloodGroup,
      allergies: row.allergies,
      emergencyContact: row.emergencyContact,
      registeredDate: row.registeredDate,
    } : {}),
    ...(row.doctorId ? {
      doctorId: row.doctorId,
      department: row.department,
      room: row.room,
    } : {}),
  };
}

async function createSession(userId, response) {
  const token = randomBytes(32).toString('base64url');
  await pool.query(
    `INSERT INTO auth_sessions (token_hash, user_id, expires_at)
     VALUES ($1,$2,now() + interval '7 days')`,
    [hashSessionToken(token), userId],
  );
  setSessionCookie(response, token);
}

async function authenticate(request, response, next) {
  const token = request.cookies[sessionCookie];
  if (!token) {
    response.status(401).json({ success: false, error: { message: 'Authentication required.' } });
    return;
  }
  const result = await pool.query(
    `SELECT user_id AS "userId"
     FROM auth_sessions
     WHERE token_hash = $1 AND expires_at > now()`,
    [hashSessionToken(token)],
  );
  const user = result.rowCount ? await getSessionUser(result.rows[0].userId) : null;
  if (!user) {
    clearSessionCookie(response);
    response.status(401).json({ success: false, error: { message: 'Session expired. Sign in again.' } });
    return;
  }
  request.authUser = user;
  next();
}

function requireRole(...roles) {
  return (request, response, next) => {
    if (!roles.includes(request.authUser?.role)) {
      response.status(403).json({ success: false, error: { message: 'You do not have permission for this action.' } });
      return;
    }
    next();
  };
}

function canAccessPatient(user, patientId) {
  return user.role === 'ADMIN' ||
    user.role === 'RECEPTIONIST' ||
    (user.role === 'PATIENT' && user.patientId === patientId);
}

function canAccessDoctor(user, doctorId) {
  return user.role === 'ADMIN' ||
    user.role === 'RECEPTIONIST' ||
    (user.role === 'DOCTOR' && user.doctorId === doctorId);
}

async function transitionAppointment(client, appointmentId, newStatus, actor = {}, notes = null) {
  const current = await getAppointment(appointmentId, client);
  if (!current) throw httpError('Appointment not found.', 404);
  const allowed = transitions[current.status] || [];
  if (!allowed.includes(newStatus)) {
    throw httpError(
      `Cannot move token ${current.tokenNumber} from ${current.status} to ${newStatus}.`,
      409,
    );
  }

  const result = await client.query(
    `UPDATE appointments
     SET status = $2,
         doctor_notes = COALESCE($3, doctor_notes),
         checked_in_at = CASE WHEN $2 = 'CHECKED_IN' THEN now() ELSE checked_in_at END,
         called_at = CASE WHEN $2 = 'CALLED' THEN now() ELSE called_at END,
         consultation_start_time = CASE
           WHEN $2 = 'IN_PROGRESS' THEN to_char(now(), 'HH12:MI AM')
           ELSE consultation_start_time
         END,
         consultation_end_time = CASE
           WHEN $2 = 'COMPLETED' THEN to_char(now(), 'HH12:MI AM')
           ELSE consultation_end_time
         END
     WHERE id = $1
     RETURNING id`,
    [appointmentId, newStatus, notes],
  );
  const appointment = await getAppointment(result.rows[0].id, client);

  await client.query(
    `INSERT INTO queue_events
      (id, appointment_id, doctor_id, token_number, event_type, previous_status, new_status, actor_role, actor_name)
     VALUES ($1,$2,$3,$4,'STATUS_CHANGE',$5,$6,$7,$8)`,
    [
      newId('evt'), appointment.id, appointment.doctorId, appointment.tokenNumber,
      current.status, newStatus, actor.role || 'STAFF', actor.name || 'Staff User',
    ],
  );

  if (newStatus === 'CALLED') {
    const patient = await getPatient(appointment.patientId, client);
    await client.query(
      `INSERT INTO notifications (id, user_id, title, message, type, appointment_id)
       VALUES ($1,$2,$3,$4,'CALL',$5)`,
      [
        newId('notif'), patient?.userId || null, 'Your Token is CALLED!',
        `Token ${appointment.tokenNumber} has been called. Please proceed to the doctor's room.`,
        appointment.id,
      ],
    );
  }
  return appointment;
}

async function createAppointment(data, type) {
  return inTransaction(async (client) => {
    const doctorResult = await client.query(
      'SELECT id FROM doctors WHERE id = $1 FOR UPDATE',
      [data.doctorId],
    );
    if (!doctorResult.rowCount) throw httpError('A valid doctorId is required.', 400);

    let patient = data.patientId ? await getPatient(data.patientId, client) : null;
    if (data.patientId && !patient) throw httpError('The selected patient does not exist.', 400);

    if (!patient) {
      if (!data.patientName || !data.patientPhone) {
        throw httpError('patientName and patientPhone are required for an unregistered patient.', 400);
      }
      const patientId = data.patientId || newId('pat');
      const userId = data.userId || newId('user');
      const user = await client.query(
        `INSERT INTO users (id, name, email, role)
         VALUES ($1,$2,$3,'PATIENT')
         RETURNING id`,
        [userId, data.patientName, data.patientEmail || null],
      );
      const patientResult = await client.query(
        `INSERT INTO patients (id, user_id, mrn, name, age, phone, email, registered_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7,CURRENT_DATE)
         RETURNING id`,
        [
          patientId, user.rows[0].id, `MRN-${randomUUID().slice(0, 8).toUpperCase()}`,
          data.patientName, Number.parseInt(data.patientAge, 10) || null,
          data.patientPhone, data.patientEmail || null,
        ],
      );
      patient = await getPatient(patientResult.rows[0].id, client);
    }

    const date = type === 'WALK_IN' ? today() : data.date || today();
    const tokenPrefix = `T-${Number.parseInt(data.doctorId.replace(/^doc_/, ''), 10) || 1}`;
    const priorAppointments = await client.query(
      `SELECT token_number FROM appointments
       WHERE doctor_id = $1 AND appointment_date = $2`,
      [data.doctorId, date],
    );
    const maxSequence = priorAppointments.rows.reduce((max, row) => {
      if (!row.token_number.startsWith(tokenPrefix)) return max;
      const sequence = Number.parseInt(row.token_number.slice(tokenPrefix.length), 10);
      return Number.isNaN(sequence) ? max : Math.max(max, sequence);
    }, 0);
    const tokenNumber = `${tokenPrefix}${String(Math.max(maxSequence + 1, priorAppointments.rowCount + 1)).padStart(2, '0')}`;
    const status = type === 'WALK_IN' && data.autoCheckIn !== false ? 'CHECKED_IN' : 'WAITING';
    const appointmentId = newId('apt');
    const inserted = await client.query(
      `INSERT INTO appointments
        (id, token_number, doctor_id, patient_id, patient_name, patient_phone, patient_age,
         appointment_date, scheduled_time, status, appointment_type, is_priority, reason, checked_in_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,
               CASE WHEN $10 = 'CHECKED_IN' THEN now() ELSE NULL END)
       RETURNING id`,
      [
        appointmentId, tokenNumber, data.doctorId, patient.id, patient.name, patient.phone,
        patient.age || Number.parseInt(data.patientAge, 10) || null, date,
        data.scheduledTime || new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        status, type, Boolean(data.isPriority),
        data.reason || (type === 'WALK_IN' ? 'Walk-in Consultation' : 'General Consultation'),
      ],
    );
    return getAppointment(inserted.rows[0].id, client);
  });
}

async function queueFor(doctorId, date = today()) {
  const result = await pool.query(
    `SELECT ${appointmentColumns}
     FROM appointments a
     WHERE a.doctor_id = $1 AND a.appointment_date = $2
     ORDER BY a.created_at`,
    [doctorId, date],
  );
  const items = result.rows;
  return {
    success: true,
    doctorId,
    doctor: await getDoctor(doctorId),
    date,
    total: items.length,
    waiting: items.filter((appointment) => appointment.status === 'WAITING').length,
    checkedIn: items.filter((appointment) => appointment.status === 'CHECKED_IN').length,
    called: items.find((appointment) => appointment.status === 'CALLED') || null,
    inProgress: items.find((appointment) => appointment.status === 'IN_PROGRESS') || null,
    completed: items.filter((appointment) => appointment.status === 'COMPLETED').length,
    skipped: items.filter((appointment) => appointment.status === 'SKIPPED').length,
    items,
  };
}

app.get('/api/health', async (_request, response) => {
  await pool.query('SELECT 1');
  response.json({ success: true, service: 'hospital-queue-api', database: 'connected' });
});

app.post('/api/auth/login', async (request, response) => {
  const email = String(request.body?.email || '').trim().toLowerCase();
  const password = request.body?.password;
  if (!email || typeof password !== 'string') {
    response.status(400).json({
      success: false,
      error: { message: 'Email and password are required.' },
    });
    return;
  }
  if (Buffer.byteLength(password, 'utf8') > 72) {
    response.status(400).json({
      success: false,
      error: { message: 'Password must be no more than 72 bytes.' },
    });
    return;
  }
  const result = await pool.query(
    `SELECT id, password_hash FROM users WHERE lower(email) = $1`,
    [email],
  );
  const userRecord = result.rows[0];
  const validPassword = userRecord?.password_hash
    ? await bcrypt.compare(password, userRecord.password_hash)
    : false;
  if (!validPassword) {
    response.status(401).json({ success: false, error: { message: 'Invalid email or password.' } });
    return;
  }
  await createSession(userRecord.id, response);
  response.json({ success: true, user: await getSessionUser(userRecord.id) });
});

app.get('/api/auth/session', async (request, response) => {
  const token = request.cookies[sessionCookie];
  if (!token) {
    response.json({ success: true, user: null });
    return;
  }
  const result = await pool.query(
    `SELECT user_id AS "userId"
     FROM auth_sessions
     WHERE token_hash = $1 AND expires_at > now()`,
    [hashSessionToken(token)],
  );
  const user = result.rowCount ? await getSessionUser(result.rows[0].userId) : null;
  if (!user) {
    await pool.query('DELETE FROM auth_sessions WHERE token_hash = $1', [hashSessionToken(token)]);
    clearSessionCookie(response);
  }
  response.json({ success: true, user });
});

app.post('/api/auth/logout', async (request, response) => {
  const token = request.cookies[sessionCookie];
  if (token) {
    await pool.query('DELETE FROM auth_sessions WHERE token_hash = $1', [hashSessionToken(token)]);
  }
  clearSessionCookie(response);
  response.json({ success: true });
});

app.post('/api/auth/register', async (request, response) => {
  const data = request.body || {};
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const email = String(data.email || '').trim().toLowerCase();
  const phone = typeof data.phone === 'string' ? data.phone.trim() : '';
  const phoneDigits = phone.replace(/\D/g, '');
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      phoneDigits.length < 10 || typeof data.password !== 'string') {
    response.status(400).json({
      success: false,
      error: { message: 'Enter a name, valid email, phone with at least 10 digits, and password.' },
    });
    return;
  }
  if (data.password.length < 12 || Buffer.byteLength(data.password, 'utf8') > 72) {
    response.status(400).json({
      success: false,
      error: { message: 'Password must be at least 12 characters and no more than 72 bytes.' },
    });
    return;
  }
  const passwordHash = await bcrypt.hash(data.password, 12);
  let patient;
  try {
    patient = await inTransaction(async (client) => {
      const userId = newId('user');
      const patientId = newId('pat');
      const mrn = `MRN-${randomUUID().slice(0, 8).toUpperCase()}`;
      await client.query(
        `INSERT INTO users (id, name, email, role, password_hash)
         VALUES ($1,$2,$3,'PATIENT',$4)`,
        [userId, name, email, passwordHash],
      );
      const result = await client.query(
        `INSERT INTO patients
          (id, user_id, mrn, name, age, gender, phone, email, blood_group, allergies, emergency_contact)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11::jsonb)
         RETURNING id`,
        [
          patientId, userId, mrn, name, Number.parseInt(data.age, 10) || 30,
          data.gender || 'Other', phone, email, data.bloodGroup || 'Unknown',
          JSON.stringify(data.allergies ? [data.allergies] : []),
          JSON.stringify({
            name: data.emergencyName || 'Family Contact',
            phone: data.emergencyPhone || phone,
          }),
        ],
      );
      return getPatient(result.rows[0].id, client);
    });
  } catch (error) {
    if (error.code === '23505' &&
        ['users_email_key', 'users_email_lower_idx'].includes(error.constraint)) {
      response.status(409).json({
        success: false,
        error: { message: 'An account with this email already exists.' },
      });
      return;
    }
    throw error;
  }
  const existingToken = request.cookies[sessionCookie];
  if (existingToken) {
    await pool.query('DELETE FROM auth_sessions WHERE token_hash = $1', [hashSessionToken(existingToken)]);
    clearSessionCookie(response);
  }
  response.status(201).json({
    success: true,
    user: {
      userId: patient.userId,
      patientId: patient.id,
      name: patient.name,
      role: 'PATIENT',
      email: patient.email,
      mrn: patient.mrn,
      phone: patient.phone,
      age: patient.age,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      allergies: patient.allergies,
      emergencyContact: patient.emergencyContact,
      registeredDate: patient.registeredDate,
    },
  });
});

app.get('/api/hospitals', async (_request, response) => {
  const result = await pool.query(
    `SELECT id, name, code, city, address, phone, emergency_status AS "emergencyStatus",
            departments_count AS "departmentsCount", active_doctors_count AS "activeDoctorsCount"
     FROM hospitals ORDER BY name`,
  );
  response.json({ success: true, hospitals: result.rows });
});

app.get('/api/departments', async (request, response) => {
  const result = await pool.query(
    `SELECT id, hospital_id AS "hospitalId", name, code, floor, icon,
            head_doctor AS "headDoctor", color, description,
            avg_wait_time_min AS "avgWaitTimeMin", active_queues AS "activeQueues"
     FROM departments
     WHERE $1::text IS NULL OR hospital_id = $1
     ORDER BY name`,
    [request.query.hospitalId || null],
  );
  response.json({ success: true, departments: result.rows });
});

app.get('/api/doctors', async (request, response) => {
  const result = await pool.query(
    `SELECT ${doctorColumns} FROM doctors d
     WHERE $1::text IS NULL OR d.department_id = $1
     ORDER BY d.name`,
    [request.query.departmentId || null],
  );
  response.json({ success: true, doctors: result.rows });
});

app.get('/api/doctors/:doctorId', async (request, response) => {
  const doctor = await getDoctor(request.params.doctorId);
  if (!doctor) {
    response.status(404).json({ success: false, error: { message: 'Doctor not found.' } });
    return;
  }
  const department = await pool.query(
    `SELECT id, hospital_id AS "hospitalId", name, code, floor, icon, head_doctor AS "headDoctor",
            color, description, avg_wait_time_min AS "avgWaitTimeMin", active_queues AS "activeQueues"
     FROM departments WHERE id = $1`,
    [doctor.departmentId],
  );
  response.json({ success: true, doctor, department: department.rows[0] || null });
});

app.post('/api/doctors', authenticate, requireRole('ADMIN'), async (request, response) => {
  const data = request.body || {};
  if (!data.name || !data.departmentId || !data.hospitalId) {
    response.status(400).json({
      success: false,
      error: { message: 'name, departmentId, and hospitalId are required.' },
    });
    return;
  }
  const doctorId = newId('doc');
  const result = await pool.query(
    `INSERT INTO doctors
      (id, department_id, hospital_id, name, title, department_name, room,
       qualification, experience_years, avatar, avg_consult_time_min, fee, status, schedule, bio)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb,$15)
     RETURNING id`,
    [
      doctorId, data.departmentId, data.hospitalId, data.name, data.title || null,
      data.departmentName || null, data.room || null, data.qualification || null,
      Number.parseInt(data.experienceYears, 10) || null, data.avatar || null,
      Number.parseInt(data.avgConsultTimeMin, 10) || 12, Number(data.fee) || null,
      data.status || 'ACTIVE', JSON.stringify(data.schedule || {}), data.bio || null,
    ],
  );
  response.status(201).json({ success: true, doctor: await getDoctor(result.rows[0].id) });
});

app.patch('/api/doctors/:doctorId', authenticate, requireRole('ADMIN'), async (request, response) => {
  const fields = {
    status: 'status',
    schedule: 'schedule',
  };
  const updates = Object.entries(fields).filter(([key]) =>
    Object.prototype.hasOwnProperty.call(request.body || {}, key));
  if (!updates.length) {
    response.status(400).json({ success: false, error: { message: 'No supported doctor fields provided.' } });
    return;
  }
  const doctor = await getDoctor(request.params.doctorId);
  if (!doctor) {
    response.status(404).json({ success: false, error: { message: 'Doctor not found.' } });
    return;
  }
  if (Object.prototype.hasOwnProperty.call(request.body, 'status')) {
    await pool.query('UPDATE doctors SET status = $2 WHERE id = $1', [
      doctor.id, request.body.status,
    ]);
  }
  if (Object.prototype.hasOwnProperty.call(request.body, 'schedule')) {
    await pool.query('UPDATE doctors SET schedule = $2::jsonb WHERE id = $1', [
      doctor.id, JSON.stringify({ ...doctor.schedule, ...request.body.schedule }),
    ]);
  }
  response.json({ success: true, doctor: await getDoctor(doctor.id) });
});

app.post('/api/departments', authenticate, requireRole('ADMIN'), async (request, response) => {
  const data = request.body || {};
  if (!data.name || !data.hospitalId || !data.code) {
    response.status(400).json({
      success: false,
      error: { message: 'name, hospitalId, and code are required.' },
    });
    return;
  }
  const result = await pool.query(
    `INSERT INTO departments (id, hospital_id, name, code, floor, description, color)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING id, hospital_id AS "hospitalId", name, code, floor, description, color`,
    [
      newId('dept'), data.hospitalId, data.name, data.code, data.floor || null,
      data.description || null, data.color || null,
    ],
  );
  response.status(201).json({ success: true, department: result.rows[0] });
});

app.get('/api/patients', authenticate, requireRole('ADMIN', 'RECEPTIONIST'), async (_request, response) => {
  const result = await pool.query(
    `SELECT ${patientColumns} FROM patients p ORDER BY p.name`,
  );
  response.json({ success: true, patients: result.rows });
});

app.get('/api/patients/:patientId/appointments', authenticate, async (request, response) => {
  if (!canAccessPatient(request.authUser, request.params.patientId)) {
    response.status(403).json({ success: false, error: { message: 'You cannot view this patient’s appointments.' } });
    return;
  }
  const result = await pool.query(
    `SELECT ${appointmentColumns}, row_to_json(d.*) AS doctor
     FROM appointments a
     LEFT JOIN doctors d ON d.id = a.doctor_id
     WHERE a.patient_id = $1 ORDER BY a.created_at DESC`,
    [request.params.patientId],
  );
  response.json({ success: true, appointments: result.rows });
});

app.get('/api/appointments', authenticate, async (request, response) => {
  const { date } = request.query;
  const isPatient = request.authUser.role === 'PATIENT';
  const isDoctor = request.authUser.role === 'DOCTOR';
  if (!['PATIENT', 'DOCTOR', 'RECEPTIONIST', 'ADMIN'].includes(request.authUser.role)) {
    response.status(403).json({ success: false, error: { message: 'You cannot view appointments.' } });
    return;
  }
  if ((isPatient && !request.authUser.patientId) ||
      (isDoctor && !request.authUser.doctorId)) {
    response.status(403).json({ success: false, error: { message: 'This account is not linked to a patient or doctor record.' } });
    return;
  }
  const doctorId = isDoctor ? request.authUser.doctorId : request.query.doctorId;
  const patientId = isPatient ? request.authUser.patientId : request.query.patientId;
  const result = await pool.query(
    `SELECT ${appointmentColumns} FROM appointments a
     WHERE ($1::text IS NULL OR a.doctor_id = $1)
       AND ($2::date IS NULL OR a.appointment_date = $2)
       AND ($3::text IS NULL OR a.patient_id = $3)
     ORDER BY a.created_at`,
    [doctorId || null, date || null, patientId || null],
  );
  response.json({ success: true, appointments: result.rows });
});

app.post('/api/appointments', authenticate, requireRole('PATIENT'), async (request, response) => {
  const appointment = await createAppointment({
    ...(request.body || {}),
    patientId: request.authUser.patientId,
  }, 'ONLINE');
  response.status(201).json({ success: true, appointment });
});

app.post('/api/walk-ins', authenticate, requireRole('RECEPTIONIST', 'ADMIN'), async (request, response) => {
  const appointment = await createAppointment(request.body || {}, 'WALK_IN');
  response.status(201).json({ success: true, appointment });
});

app.get('/api/appointments/:appointmentId', authenticate, async (request, response) => {
  const appointment = await getAppointment(request.params.appointmentId);
  if (!appointment) {
    response.status(404).json({ success: false, error: { message: 'Appointment not found.' } });
    return;
  }
  const user = request.authUser;
  if (!(canAccessPatient(user, appointment.patientId) ||
        canAccessDoctor(user, appointment.doctorId))) {
    response.status(403).json({ success: false, error: { message: 'You cannot view this appointment.' } });
    return;
  }
  response.json({
    success: true,
    appointment,
    doctor: await getDoctor(appointment.doctorId),
    patient: await getPatient(appointment.patientId),
  });
});

app.get('/api/queues', authenticate, requireRole('DOCTOR', 'RECEPTIONIST', 'ADMIN'), async (request, response) => {
  const ownDoctorId = request.authUser.role === 'DOCTOR' ? request.authUser.doctorId : null;
  if (request.authUser.role === 'DOCTOR' && !ownDoctorId) {
    response.status(403).json({ success: false, error: { message: 'This account is not linked to a doctor record.' } });
    return;
  }
  const doctorResult = await pool.query(
    `SELECT ${doctorColumns} FROM doctors d
     WHERE $1::text IS NULL OR d.id = $1 ORDER BY d.name`,
    [ownDoctorId],
  );
  const queues = await Promise.all(doctorResult.rows.map(async (doctor) => {
    const queue = await queueFor(doctor.id, request.query.date || today());
    return {
      doctor,
      totalToday: queue.total,
      currentCalled: queue.called,
      currentInProgress: queue.inProgress,
      waitingCount: queue.checkedIn + queue.waiting,
      completedCount: queue.completed,
      nextUp: queue.items.find((appointment) => appointment.status === 'CHECKED_IN') || null,
      items: queue.items,
    };
  }));
  response.json({ success: true, queues });
});

app.get('/api/queues/:doctorId', authenticate, requireRole('DOCTOR', 'RECEPTIONIST', 'ADMIN'), async (request, response) => {
  if (!canAccessDoctor(request.authUser, request.params.doctorId)) {
    response.status(403).json({ success: false, error: { message: 'You cannot view this doctor’s queue.' } });
    return;
  }
  response.json(await queueFor(request.params.doctorId, request.query.date || today()));
});

app.get('/api/queues/:doctorId/estimate', authenticate, async (request, response) => {
  if (!['PATIENT', 'DOCTOR', 'RECEPTIONIST', 'ADMIN'].includes(request.authUser.role)) {
    response.status(403).json({ success: false, error: { message: 'You cannot view queue estimates.' } });
    return;
  }
  if (request.authUser.role === 'DOCTOR' &&
      request.authUser.doctorId !== request.params.doctorId) {
    response.status(403).json({ success: false, error: { message: 'You cannot view this queue estimate.' } });
    return;
  }
  const date = request.query.date || today();
  const queue = await queueFor(request.params.doctorId, date);
  const target = queue.items.find((appointment) => appointment.tokenNumber === request.query.tokenNumber);
  if (!target) {
    response.status(404).json({ success: false, error: { message: 'Token not found in this queue.' } });
    return;
  }
  if (request.authUser.role === 'PATIENT' &&
      request.authUser.patientId !== target.patientId) {
    response.status(403).json({ success: false, error: { message: 'You cannot view another patient’s estimate.' } });
    return;
  }
  if (target.status === 'CALLED') {
    response.json({ success: true, aheadCount: 0, minWait: 0, maxWait: 0, waitRange: 'Now Calling' });
    return;
  }
  if (target.status === 'IN_PROGRESS') {
    response.json({ success: true, aheadCount: 0, minWait: 0, maxWait: 0, waitRange: 'In Consultation' });
    return;
  }
  const activeAhead = queue.items.filter((appointment) =>
    ['CHECKED_IN', 'CALLED', 'IN_PROGRESS'].includes(appointment.status) &&
    appointment.id !== target.id &&
    new Date(appointment.createdAt) < new Date(target.createdAt));
  const avg = queue.doctor?.avgConsultTimeMin || 12;
  const minWait = Math.max(1, activeAhead.length * (avg - 2));
  const maxWait = activeAhead.length ? activeAhead.length * (avg + 4) : 5;
  response.json({
    success: true,
    aheadCount: activeAhead.length,
    minWait,
    maxWait,
    waitRange: activeAhead.length ? `${minWait}-${maxWait} min` : '1-5 min (Next)',
  });
});

app.post('/api/queues/:doctorId/call-next', authenticate, requireRole('DOCTOR', 'RECEPTIONIST', 'ADMIN'), async (request, response) => {
  if (!canAccessDoctor(request.authUser, request.params.doctorId)) {
    response.status(403).json({ success: false, error: { message: 'You cannot operate this doctor’s queue.' } });
    return;
  }
  const appointment = await inTransaction(async (client) => {
    const doctor = await client.query(
      'SELECT id FROM doctors WHERE id = $1 FOR UPDATE',
      [request.params.doctorId],
    );
    if (!doctor.rowCount) throw httpError('Doctor not found.', 404);
    const next = await client.query(
      `SELECT id FROM appointments
       WHERE doctor_id = $1 AND appointment_date = $2 AND status = 'CHECKED_IN'
       ORDER BY is_priority DESC, checked_in_at ASC NULLS LAST, created_at ASC
       LIMIT 1 FOR UPDATE`,
      [request.params.doctorId, today()],
    );
    if (!next.rowCount) return null;
    return transitionAppointment(client, next.rows[0].id, 'CALLED', request.authUser);
  });
  if (!appointment) {
    response.json({ success: false, message: 'No checked-in patients waiting in queue.' });
    return;
  }
  response.json({ success: true, appointment });
});

const appointmentActions = {
  'check-in': 'CHECKED_IN',
  skip: 'SKIPPED',
  recall: 'CALLED',
  start: 'IN_PROGRESS',
  complete: 'COMPLETED',
  cancel: 'CANCELLED',
};

for (const [action, targetStatus] of Object.entries(appointmentActions)) {
  app.post(`/api/appointments/:appointmentId/${action}`, authenticate, async (request, response) => {
    const appointmentBeforeUpdate = await getAppointment(request.params.appointmentId);
    if (!appointmentBeforeUpdate) {
      response.status(404).json({ success: false, error: { message: 'Appointment not found.' } });
      return;
    }
    const user = request.authUser;
    const patientOwnsAppointment =
      user.role === 'PATIENT' && user.patientId === appointmentBeforeUpdate.patientId;
    const doctorOwnsAppointment =
      user.role === 'DOCTOR' && user.doctorId === appointmentBeforeUpdate.doctorId;
    const allowed =
      user.role === 'ADMIN' ||
      (user.role === 'RECEPTIONIST' && ['check-in', 'cancel'].includes(action)) ||
      (patientOwnsAppointment && ['check-in', 'cancel'].includes(action)) ||
      (doctorOwnsAppointment && ['skip', 'recall', 'start', 'complete'].includes(action));
    if (!allowed) {
      response.status(403).json({ success: false, error: { message: 'You cannot perform this appointment action.' } });
      return;
    }
    const appointment = await inTransaction((client) =>
      transitionAppointment(
        client,
        request.params.appointmentId,
        targetStatus,
        user,
        action === 'complete' ? request.body?.notes || null : null,
      ));
    response.json({ success: true, appointment });
  });
}

app.get('/api/notifications', authenticate, async (request, response) => {
  const canViewAll = request.authUser.role === 'ADMIN';
  const userId = canViewAll ? request.query.userId || null : request.authUser.userId;
  const result = await pool.query(
    `SELECT id, user_id AS "userId", title, message, type, appointment_id AS "appointmentId",
            is_read AS read, notification_timestamp AS timestamp
     FROM notifications
     WHERE $1::text IS NULL OR user_id = $1
     ORDER BY notification_timestamp DESC`,
    [userId],
  );
  response.json({ success: true, notifications: result.rows });
});

app.patch('/api/notifications/:notificationId/read', authenticate, async (request, response) => {
  const isAdmin = request.authUser.role === 'ADMIN';
  const result = await pool.query(
    `UPDATE notifications SET is_read = true
     WHERE id = $1 AND ($2::boolean OR user_id = $3)
     RETURNING id, user_id AS "userId", title, message, type,
               appointment_id AS "appointmentId", is_read AS read,
               notification_timestamp AS timestamp`,
    [request.params.notificationId, isAdmin, request.authUser.userId],
  );
  if (!result.rowCount) {
    response.status(404).json({ success: false, error: { message: 'Notification not found.' } });
    return;
  }
  response.json({ success: true, notification: result.rows[0] });
});

app.get('/api/settings', authenticate, requireRole('ADMIN'), async (_request, response) => {
  const result = await pool.query(
    `SELECT setting_value FROM app_settings WHERE setting_key = 'hospital'`,
  );
  response.json({ success: true, settings: result.rows[0]?.setting_value || {} });
});

app.patch('/api/settings', authenticate, requireRole('ADMIN'), async (request, response) => {
  const current = await pool.query(
    `SELECT setting_value FROM app_settings WHERE setting_key = 'hospital'`,
  );
  const settings = { ...(current.rows[0]?.setting_value || {}), ...(request.body || {}) };
  await pool.query(
    `INSERT INTO app_settings (setting_key, setting_value)
     VALUES ('hospital', $1::jsonb)
     ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value`,
    [JSON.stringify(settings)],
  );
  response.json({ success: true, settings });
});

app.get('/api/analytics', authenticate, requireRole('ADMIN'), async (_request, response) => {
  const summary = await pool.query(
    `SELECT
       COUNT(*)::int AS "totalTokensToday",
       COUNT(*) FILTER (WHERE status = 'COMPLETED')::int AS "completedToday",
       COUNT(*) FILTER (WHERE status IN ('CHECKED_IN','WAITING','CALLED'))::int AS "activeQueued",
       COUNT(*) FILTER (WHERE status IN ('SKIPPED','NO_SHOW'))::int AS "skippedOrNoShow"
     FROM appointments WHERE appointment_date = $1`,
    [today()],
  );
  const activeDoctors = await pool.query(
    `SELECT COUNT(*)::int AS count FROM doctors WHERE status = 'ACTIVE'`,
  );
  const events = await pool.query(
    `SELECT id, appointment_id AS "appointmentId", doctor_id AS "doctorId",
            token_number AS "tokenNumber", event_type AS "eventType",
            previous_status AS "previousStatus", new_status AS "newStatus",
            event_timestamp AS timestamp, actor_role AS "actorRole", actor_name AS "actorName"
     FROM queue_events ORDER BY event_timestamp DESC LIMIT 15`,
  );
  const departments = await pool.query(
    `SELECT d.name, d.code, COUNT(a.id)::int AS total,
       COUNT(a.id) FILTER (WHERE a.status IN ('CHECKED_IN','WAITING'))::int AS waiting,
       COUNT(a.id) FILTER (WHERE a.status = 'COMPLETED')::int AS completed,
       d.avg_wait_time_min AS "avgWait"
     FROM departments d
     LEFT JOIN doctors doc ON doc.department_id = d.id
     LEFT JOIN appointments a ON a.doctor_id = doc.id AND a.appointment_date = $1
     GROUP BY d.id ORDER BY d.name`,
    [today()],
  );
  response.json({
    success: true,
    kpis: {
      ...summary.rows[0],
      avgWaitTimeMinutes: null,
      activeDoctorsCount: activeDoctors.rows[0].count,
      emergencyStatus: 'NORMAL',
    },
    hourlyTraffic: [],
    departmentStats: departments.rows,
    recentEvents: events.rows,
  });
});

app.use((request, response) => {
  response.status(404).json({
    success: false,
    error: { message: `No API route for ${request.method} ${request.path}.` },
  });
});

app.use((error, _request, response, _next) => {
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  response.status(status).json({
    success: false,
    error: { message: status >= 500 ? 'Unexpected API error.' : error.message },
  });
});

export async function startServer() {
  try {
    await initializeSchema();
    await seedDatabase(pool);
  } catch (error) {
    await pool.end();
    throw error;
  }
  return new Promise((resolve, reject) => {
    const server = app.listen(port, '127.0.0.1', () => {
      console.log(`Hospital queue API listening at http://127.0.0.1:${port}/api`);
      console.log('PostgreSQL database connection established and demo data seeded.');
      resolve(server);
    });
    server.once('error', reject);
  });
}
