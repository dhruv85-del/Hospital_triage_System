# Local PostgreSQL API

The API uses PostgreSQL 18 in the machine's Ubuntu WSL distribution. The database is `hospital_queue`, with an application role named `hospital_app`. The `.env` file contains the connection URL and is ignored by Git; do not commit it or use real patient information.

Start the API from the project root:

```powershell
npm run server
```

The startup script starts the WSL PostgreSQL cluster if needed, resolves its current WSL IP, and adds a password-authenticated `pg_hba.conf` rule for the Windows host. The server creates the schema and inserts demo seed data if those records are not already present. The API listens at `http://127.0.0.1:4000/api`.

The database schema is in `schema.sql`; the initial seeded hospitals, departments, doctors, patients, queues, users, and notifications come from the frontend seed data. Set `DEMO_USER_PASSWORD` in the ignored `.env` file to configure the shared password for the four seeded demo accounts; their emails are in `src/services/mockStore/seedData.js`.

Example endpoints:

- `GET /health`
- `POST /auth/login` with email/password; the API issues an HttpOnly session cookie
- `GET /auth/session` to restore the current session; `POST /auth/logout` to revoke it
- `POST /auth/register` to create a patient account with a password
- `GET /doctors`, `GET /departments`, `GET /hospitals`
- `POST /appointments`, `POST /walk-ins`
- `GET /queues`, `GET /queues/:doctorId`
- `POST /queues/:doctorId/call-next`
- `POST /appointments/:appointmentId/check-in|skip|recall|start|complete|cancel`
- `GET /patients`, `GET /patients/:patientId/appointments`
- `GET /notifications`, `PATCH /notifications/:notificationId/read`
- `GET /analytics`, `GET/PATCH /settings`

Authenticated API routes enforce roles and patient/doctor ownership. This remains a local prototype: use only synthetic data and do not expose this API publicly. Most non-authentication frontend screens still use the mock store and must be integrated with the API separately before their data is persisted.
