# Frontend Build Brief — Smart Hospital Patient Flow & Queue Management System
## Phase 1: Frontend-Only Prototype (Mock Data)

**Purpose of this document:** hand this to Claude Code as a standalone brief to build the **frontend only**, right now, on mock data — no backend, no database, no real auth. It is a distilled, build-ready extract of four longer planning docs (PRD, Architecture, Security, Frontend Spec, Ticket List), which the developer is keeping for the full-stack build later. Everything here is written so that the Phase 2 backend can be wired in later **without a rewrite** — that constraint shapes several decisions below, so don't optimize it away for short-term simplicity.

---

## 1. What This Product Is

A hospital queue system with four roles:

- **Patient** — books a digital token (or gets one as a walk-in), tracks live queue position, gets notified as their turn approaches, views history, gives feedback.
- **Doctor** — runs their queue: calls next patient, skips, starts/completes consultations, manages schedule.
- **Receptionist** — registers walk-ins, generates tokens, checks patients in, monitors queues.
- **Admin** — manages hospitals/departments/doctors/patients, views analytics.

It's a **patient-flow and queue system**, explicitly **not** a clinical triage or diagnostic tool, and is being built/presented as a **student prototype**, not a production medical system.

---

## 2. Phase 1 Scope — Build This Now

**Build:** a fully interactive React SPA where all four roles can be role-switched into and used end-to-end, backed entirely by mock/in-memory data that behaves like a real backend would.

**Do NOT build right now:** any real server, database, JWT auth, password hashing, or real Socket.IO connection. Simulate all of it (details in §5). Do not skip simulating it, either — the simulation needs to be structurally honest (see §5) so Phase 2 is a swap, not a rewrite.

**Definition of done for Phase 1:** a person can walk through this without touching code —
1. Log in as a patient, find a doctor, book a token, see the confirmation + QR, watch the live queue update.
2. Log in as a receptionist, register a walk-in, generate a token, check someone in.
3. Log in as a doctor, see today's queue, call next, skip, start/complete a consultation.
4. Log in as admin, see the dashboard, manage a doctor record, view analytics charts.
5. All of the above reflects in the public Live Display and stays internally consistent (e.g. a token the doctor completes shows as `COMPLETED` in the patient's history).

---

## 3. Tech Stack (Phase 1)

| Layer | Choice |
|---|---|
| Framework | React + Vite |
| Routing | React Router |
| Styling | Tailwind CSS |
| State | React Context (Auth, Queue, Notifications) + local component state |
| Data | In-memory mock store + seed generator, wrapped in an async service layer (§5) |
| Charts | Recharts |
| Icons | lucide-react |
| Fonts | Space Grotesk (display), IBM Plex Sans (body), IBM Plex Mono (token/data numbers) — all free, Google Fonts |

No paid services anywhere. No backend calls of any kind in Phase 1.

---

## 4. Folder Structure

```
src/
├── app/
│   ├── App.jsx                # Root: providers + router
│   └── routes.jsx             # Route table (public / patient / doctor / receptionist / admin)
│
├── components/
│   ├── layout/                # Navbar, Sidebar, RoleShell, PageContainer
│   ├── queue/                 # TokenStub (see §7), LiveQueueTracker, QueueTable
│   ├── forms/                 # BookingForm, WalkInForm, LoginForm, RegisterForm
│   ├── cards/                 # DoctorCard, StatCard, AppointmentCard
│   ├── notifications/         # NotificationBell, NotificationList, Toast
│   ├── charts/                # WaitTimeChart, PeakHoursChart, UtilizationChart
│   └── common/                # Button, Modal, Input, EmptyState, LoadingSpinner, ErrorBanner
│
├── pages/
│   ├── public/                # Home, About, Services, FindDoctor, Login, Register, Contact, LiveDisplay
│   ├── patient/                # Dashboard, DoctorProfile, BookToken, TokenConfirmation,
│   │                           # LiveQueue, QRToken, Notifications, History, Profile
│   ├── doctor/                 # Dashboard, TodaysQueue, AppointmentDetail, Consultation, Schedule, History
│   ├── receptionist/           # Dashboard, PatientRegistration, WalkInToken, CheckIn, QueueMonitor
│   └── admin/                  # Dashboard, Hospitals, Departments, Doctors, Patients,
│                               # Appointments, Queues, Analytics, Settings
│
├── services/
│   ├── api/                    # authApi.js, queueApi.js, appointmentApi.js, doctorApi.js,
│   │                           # notificationApi.js, analyticsApi.js — see §5, this IS the backend-swap seam
│   ├── mockStore/              # In-memory data + seed generators
│   ├── queueEngine.js          # Pure functions: transitions, callNext, estimateWait (see §8)
│   └── realtime.js             # Pub-sub that mimics Socket.IO events (see §5.2)
│
├── context/
│   ├── AuthContext.jsx
│   ├── QueueContext.jsx
│   └── NotificationContext.jsx
│
├── hooks/
│   ├── useQueue.js, useAuth.js, useNotifications.js
│
├── utils/
│   ├── formatTime.js, validators.js, qrPayload.js, roleGuards.js
│
└── main.jsx
```

---

## 5. The Backend-Swap Seam (Critical — Read Before Building)

This is the single most important architectural rule in this brief, because it's what makes the *full* project (which comes later) reuse this frontend instead of replacing it.

### 5.1 Every service function returns a Promise, shaped like a future API call

```js
// services/api/queueApi.js
export async function getQueue(doctorId, date) {
  // Phase 1: read from mockStore, maybe add a small artificial delay
  // Phase 2 (later, NOT built now): return axios.get(`/api/queue/${doctorId}?date=${date}`)
  return mockStore.getQueue(doctorId, date);
}
```

Every function in `services/api/` must:
- Be `async` / return a Promise, even though Phase 1 has no real network call.
- Include a small artificial delay (e.g. 200-500ms via `setTimeout`) on at least the write operations, so loading states actually get exercised and tested now, not discovered as bugs later when real latency shows up.
- Occasionally reject/throw on an edge case (e.g. booking a slot that's already taken) so error states get built now too — don't only build the happy path.
- Never be called directly by a page/component — always go through this layer, never reach into `mockStore` directly from a component.

### 5.2 Realtime updates are simulated as a pub-sub with Socket.IO-shaped events

```js
// services/realtime.js
subscribe(doctorId, callback)   // component subscribes, gets called on updates
publish(doctorId, event)        // called internally after any queue mutation
```

- Use event names that match what a real Socket.IO implementation would use later: `QUEUE_UPDATED`, `NOTIFICATION`.
- `queueEngine.js` calls `publish()` after every mutating action (callNext, skip, complete, checkIn) so subscribed components re-render immediately.
- A light interval (~15s) publishing "ambient" updates is a reasonable way to make the Live Display and other dashboards feel alive during a demo, but the primary update path should be event-driven from user actions, not polling.

### 5.3 Auth is mocked, but shaped like a real session

- `AuthContext` holds `{ userId, name, role }` set by a mock login (pick from a seeded list of demo users per role, or a simple form that doesn't actually check a password).
- Shape this object the way a decoded JWT payload would look later (`userId`, `role`) — so swapping in real JWT-based auth later only changes *how* this object gets populated, not what anything downstream expects from it.
- No password hashing needed now — there's nothing real to hash yet.

**In short: build Phase 1 as if there's a real backend one HTTP call away, that just happens to always be mocked. Every future backend engineer (probably future-you) should be able to grep for `services/api/` and know exactly what to implement.**

---

## 6. Routes

```
Public:
/  /find-doctor  /about  /services  /contact  /login  /register
/live-display/:doctorId

Patient:
/patient/dashboard
/patient/doctor/:doctorId
/patient/book/:doctorId
/patient/confirmation/:appointmentId
/patient/queue/:appointmentId
/patient/qr/:appointmentId
/patient/notifications
/patient/history
/patient/profile

Doctor:
/doctor/dashboard
/doctor/queue
/doctor/appointment/:appointmentId
/doctor/consultation/:appointmentId
/doctor/schedule
/doctor/history

Receptionist:
/receptionist/dashboard
/receptionist/register
/receptionist/walk-in
/receptionist/check-in
/receptionist/monitor

Admin:
/admin/dashboard
/admin/hospitals
/admin/departments
/admin/doctors
/admin/patients
/admin/analytics
/admin/settings
```

Wrap role routes in a `RoleShell` (sidebar + nav for that role) and a `RequireRole` guard that checks `AuthContext.role` and redirects if mismatched.

---

## 7. Design System

### 7.1 Colors

| Name | Hex | Usage |
|---|---|---|
| `ink` | `#16221E` | Primary text |
| `ink-muted` | `#5B6B65` | Secondary text |
| `canvas` | `#F2F5F3` | Page background |
| `surface` | `#FFFFFF` | Cards/panels |
| `primary` | `#2B6E63` | Primary actions, active nav |
| `primary-hover` | `#215750` | Hover/pressed |
| `amber` | `#E2A33B` | Status: **Called** |
| `success` | `#3E8E5C` | Status: **Completed / Checked-in** |
| `alert` | `#C4523E` | Status: **Skipped / No-show / Cancelled**, errors |
| `waiting-grey` | `#B8C2BE` | Status: **Waiting** |
| `border` | `#DCE3E0` | Hairlines/dividers |

**Status colors are the single source of truth everywhere a token appears — never introduce a fifth status color, and never rely on color alone (always pair with a text label).**

### 7.2 Typography

| Role | Typeface |
|---|---|
| Display (page titles) | Space Grotesk, 600 weight |
| Body | IBM Plex Sans, 400 |
| Token numbers / timestamps / data | IBM Plex Mono, 500-600 |

### 7.3 The Token Stub — Signature Component

The one visual element reused everywhere a token/appointment appears (patient's own view, doctor queue rows, public display). Perforated-ticket look: dashed divider separating "identity" (token number + doctor/room) from "status" (position, wait estimate), plus a colored status tab (dot + label, using §7.1 colors only).

Three sizes:
- `stub-full` — patient's own confirmation/live-queue page (largest, most detail)
- `stub-row` — a line in a doctor/receptionist queue list
- `stub-compact` — public Live Display (token number + status only — **no patient name/phone/any PII**, see §9)

### 7.4 Layout

- App shell: top bar (logo, role indicator, notification bell, logout) + role-specific sidebar.
- 12-column grid, max width 1200px, single column on mobile.
- Breakpoints: mobile `<640px`, tablet `640-1024px`, desktop `>1024px`.
- **Patient screens are mobile-first** (most likely used on a phone in a waiting room). Staff dashboards can be desktop-first but must remain usable on a tablet.

### 7.5 Motion (used sparingly, on purpose)

Only three places: token status-change pulse (once, not looping), queue list reorder animation, toast enter/exit. Everything else stays instant. Respect `prefers-reduced-motion`.

### 7.6 Content & Voice

- Active voice, matched vocabulary: button says "Book Token," confirmation says "Token booked."
- Errors state what happened + what to do next — never a bare "Something went wrong."
- Empty states are an invitation with a CTA, not a dead end ("No upcoming appointments — find a doctor to book one").
- Estimated wait always shown as a range ("32–41 min"), never a false-precise single number.
- Public Live Display is terse — token numbers and counts only, nothing conversational.

---

## 8. Queue Engine Logic (build as pure, reusable functions)

### 8.1 Status Lifecycle

```
WAITING → CHECKED_IN → CALLED → IN_PROGRESS → COMPLETED
                ↘ SKIPPED ↗
       ↘ CANCELLED      ↘ NO_SHOW
```

| Status | Meaning |
|---|---|
| `WAITING` | Token booked, not yet checked in |
| `CHECKED_IN` | Patient has arrived, eligible to be called |
| `CALLED` | Doctor called this token |
| `IN_PROGRESS` | Consultation started |
| `COMPLETED` | Consultation finished |
| `SKIPPED` | Doctor skipped; recallable later |
| `CANCELLED` | Cancelled before being served |
| `NO_SHOW` | Called, not present after a grace period |

### 8.2 Core Functions (`services/queueEngine.js`)

```js
transition(appointmentId, event)     // enforces the lifecycle above; illegal transitions
                                      // must be rejected with a clear error, never silently no-op
assignNextToken(doctorId, date)      // sequential token number per doctor/date
callNext(doctorId)                   // next eligible CHECKED_IN token -> CALLED, publishes QUEUE_UPDATED
skip(appointmentId)                  // -> SKIPPED, recallable
recall(appointmentId)                // SKIPPED -> back into active queue
startConsultation(appointmentId)     // CALLED -> IN_PROGRESS
completeConsultation(appointmentId)  // IN_PROGRESS -> COMPLETED
cancel(appointmentId)                // WAITING/CHECKED_IN -> CANCELLED
estimateWait(doctorId, tokenNumber)  // patientsAhead * avgConsultTime, returns a {min, max} range
```

- Every transition should append an event record shaped like `{ appointmentId, doctorId, eventType, previousStatus, newStatus, timestamp, actorId }` to an in-memory log — this doubles as your audit trail and is exactly what will become the real `QueueEvent` collection later. Build this now even though it's just an array in memory; it costs little and the analytics screens can read from it.
- Priority flag: a boolean staff can set on a token that affects ordering — implement it, but label it in the UI as a demo convenience, not a clinical triage feature.

---

## 9. Privacy Rules (apply even though data is fake — build the habit now)

- The **public Live Display** and the **QR payload** must never render/encode patient name, phone, or any identifying detail — token number and status only.
- Patient-facing screens show only that patient's own data; doctor screens show only their own queue's patients. (In Phase 1 this is just filtering the mock store correctly — no real security boundary exists yet since there's no server, but building the filtering logic correctly now means Phase 2's server-side enforcement is adding a boundary around behavior that's already correct, not fixing leaky behavior.)

---

## 10. Screens to Build — Checklist

Each entry: purpose + must-have states (loading/empty/error beyond the happy path).

### Public
- [ ] Home — hero, links to Find Doctor / Login
- [ ] Find Doctor — filter, DoctorCard list — *loading, empty*
- [ ] About / Services / Contact — static
- [ ] Live Display — grid of `stub-compact` — *empty ("no active queue right now")*
- [ ] Login / Register — mock auth forms

### Patient
- [ ] Dashboard — active token as `stub-full`, quick links — *empty ("no upcoming appointments...")*
- [ ] Doctor Profile — detail + slots + Book CTA
- [ ] Book Token — slot picker + confirm step — *loading, error (slot taken → show alternatives)*
- [ ] Token Confirmation — `stub-full` + QR link
- [ ] Live Queue — position, wait range, auto-updating, `aria-live` region — *reconnecting, called (visually distinct)*
- [ ] QR Token — large QR + mono token number, no PII
- [ ] Notifications — chronological list — *empty*
- [ ] History — past appointments + feedback link — *empty*
- [ ] Profile — basic info edit

### Doctor
- [ ] Dashboard — today's count, next patient, quick Call Next — *empty*
- [ ] Today's Queue — `stub-row` list, Call Next/Skip prominent — *empty, "queue paused"*
- [ ] Appointment Detail — patient + relevant history only
- [ ] Consultation — start/complete, notes — *in-progress (timer), completing (confirm)*
- [ ] Schedule — weekly availability grid
- [ ] History — filterable table

### Receptionist
- [ ] Dashboard — active queues overview
- [ ] Patient Registration — form + duplicate-check — *duplicate-found*
- [ ] Walk-in Token — doctor/dept select → confirm → `stub-full`
- [ ] Check-in — search by name/phone/token — *not-found*
- [ ] Queue Monitor — multi-doctor grid of `stub-row`

### Admin
- [ ] Dashboard — StatCards + one trend chart — *loading, empty*
- [ ] Hospitals / Departments / Doctors / Patients — DataTable + modal CRUD — *loading, empty, validation error*
- [ ] Appointments / Queues — read-mostly oversight tables
- [ ] Analytics — wait time, peak hours, utilization charts — *no-data-yet*
- [ ] Settings — approaching-turn threshold, default consult time

---

## 11. Accessibility (non-negotiable, not a stretch goal)

- All text/background pairs meet WCAG AA contrast (check `ink-muted` on `canvas` specifically).
- Status is never color-only — always color + text label.
- Every interactive element keyboard-reachable with a visible focus ring (restyle `:focus`, never remove it).
- Live Queue screen uses `aria-live="polite"` for status changes.
- Respect `prefers-reduced-motion`.
- Minimum 44×44px touch targets on patient-facing mobile views.

---

## 12. Build Order (suggested, for a solo build)

1. Foundation: scaffold project, design tokens, core components, Token Stub, app shell/routing.
2. Mock auth + role switching.
3. Public pages + Find Doctor.
4. Patient flow end-to-end: book → confirmation → live queue → QR.
5. Doctor flow end-to-end: dashboard → queue → call next/skip → consultation.
6. Receptionist flow: registration → walk-in token → check-in → monitor.
7. Confirm walk-in and online tokens share one queue (this is an easy thing to accidentally build as two separate systems — verify it isn't).
8. Admin: master data CRUD → analytics (analytics last, since it needs the other flows generating data first).
9. Notifications + history + feedback across roles.
10. Accessibility and responsive pass (§11, mobile-first patient screens especially).
11. Seed a realistic demo dataset so the whole thing is demoable without manual setup.

---

## 13. What's Deliberately Deferred to Phase 2 (do not build now)

- Real Express/Node backend, MongoDB, Mongoose schemas.
- Real JWT auth, bcrypt password hashing, server-side role/row-level authorization enforcement.
- Real Socket.IO server/client.
- Server-side input validation, rate limiting, security headers (`helmet`), CORS config.
- Deployment (Vercel/Render/Atlas) — not needed until there's a backend to deploy.
- Optional ML wait-time prediction module.

These are fully specified already in the companion documents (Architecture, Security, full Ticket List) that the developer is retaining for the later full-stack build — this brief intentionally excludes them so Claude Code stays focused on a clean, honest frontend-only prototype right now.
