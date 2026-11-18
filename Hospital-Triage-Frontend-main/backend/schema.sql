CREATE TABLE IF NOT EXISTS hospitals (
  id text PRIMARY KEY,
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  city text,
  address text,
  phone text,
  emergency_status text NOT NULL DEFAULT 'NORMAL',
  departments_count integer NOT NULL DEFAULT 0,
  active_doctors_count integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS departments (
  id text PRIMARY KEY,
  hospital_id text NOT NULL REFERENCES hospitals(id),
  name text NOT NULL,
  code text NOT NULL,
  floor text,
  icon text,
  head_doctor text,
  color text,
  description text,
  avg_wait_time_min integer NOT NULL DEFAULT 0,
  active_queues integer NOT NULL DEFAULT 0,
  UNIQUE (hospital_id, code)
);

CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE,
  role text NOT NULL CHECK (role IN ('PATIENT', 'DOCTOR', 'RECEPTIONIST', 'ADMIN')),
  avatar text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  password_hash text
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text;
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (lower(email))
WHERE email IS NOT NULL;

CREATE TABLE IF NOT EXISTS auth_sessions (
  token_hash text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS auth_sessions_expiry_idx ON auth_sessions (expires_at);

CREATE TABLE IF NOT EXISTS patients (
  id text PRIMARY KEY,
  user_id text UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  mrn text NOT NULL UNIQUE,
  name text NOT NULL,
  age integer,
  gender text,
  phone text,
  email text,
  blood_group text,
  allergies jsonb NOT NULL DEFAULT '[]'::jsonb,
  emergency_contact jsonb,
  registered_date date NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS doctors (
  id text PRIMARY KEY,
  user_id text UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  department_id text NOT NULL REFERENCES departments(id),
  hospital_id text NOT NULL REFERENCES hospitals(id),
  name text NOT NULL,
  title text,
  department_name text,
  room text,
  qualification text,
  experience_years integer,
  avatar text,
  avg_consult_time_min integer NOT NULL DEFAULT 12,
  fee numeric(10, 2),
  rating numeric(3, 2),
  reviews_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'ACTIVE',
  today_total_tokens integer NOT NULL DEFAULT 0,
  today_served_tokens integer NOT NULL DEFAULT 0,
  schedule jsonb NOT NULL DEFAULT '{}'::jsonb,
  bio text
);

CREATE TABLE IF NOT EXISTS appointments (
  id text PRIMARY KEY,
  token_number text NOT NULL,
  doctor_id text NOT NULL REFERENCES doctors(id),
  patient_id text NOT NULL REFERENCES patients(id),
  patient_name text NOT NULL,
  patient_phone text,
  patient_age integer,
  appointment_date date NOT NULL,
  scheduled_time text,
  status text NOT NULL CHECK (
    status IN ('WAITING', 'CHECKED_IN', 'CALLED', 'IN_PROGRESS', 'SKIPPED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')
  ),
  appointment_type text NOT NULL CHECK (appointment_type IN ('ONLINE', 'WALK_IN')),
  is_priority boolean NOT NULL DEFAULT false,
  reason text,
  doctor_notes text,
  checked_in_at timestamptz,
  called_at timestamptz,
  consultation_start_time text,
  consultation_end_time text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (doctor_id, appointment_date, token_number)
);

CREATE INDEX IF NOT EXISTS appointments_patient_date_idx
  ON appointments (patient_id, appointment_date DESC);
CREATE INDEX IF NOT EXISTS appointments_queue_idx
  ON appointments (doctor_id, appointment_date, status, is_priority DESC, created_at);

CREATE TABLE IF NOT EXISTS queue_events (
  id text PRIMARY KEY,
  appointment_id text REFERENCES appointments(id) ON DELETE SET NULL,
  doctor_id text REFERENCES doctors(id) ON DELETE SET NULL,
  token_number text,
  event_type text NOT NULL,
  previous_status text,
  new_status text,
  event_timestamp timestamptz NOT NULL DEFAULT now(),
  actor_role text,
  actor_name text
);

CREATE INDEX IF NOT EXISTS queue_events_timestamp_idx
  ON queue_events (event_timestamp DESC);

CREATE TABLE IF NOT EXISTS notifications (
  id text PRIMARY KEY,
  user_id text REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  appointment_id text REFERENCES appointments(id) ON DELETE SET NULL,
  is_read boolean NOT NULL DEFAULT false,
  notification_timestamp timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_timestamp_idx
  ON notifications (user_id, notification_timestamp DESC);

CREATE TABLE IF NOT EXISTS app_settings (
  setting_key text PRIMARY KEY,
  setting_value jsonb NOT NULL
);
