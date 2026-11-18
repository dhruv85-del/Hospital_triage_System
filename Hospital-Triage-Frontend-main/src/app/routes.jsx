import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RoleShell } from '../components/layout/RoleShell';
import { FloatingNav } from '../components/layout/FloatingNav';
import { Footer } from '../components/layout/Footer';

// Public Pages
import { Home } from '../pages/public/Home';
import { FindDoctor } from '../pages/public/FindDoctor';
import { LiveDisplay } from '../pages/public/LiveDisplay';
import { About } from '../pages/public/About';
import { Services } from '../pages/public/Services';
import { Contact } from '../pages/public/Contact';
import { Login } from '../pages/public/Login';
import { Register } from '../pages/public/Register';

// Patient Pages
import { PatientDashboard } from '../pages/patient/PatientDashboard';
import { DoctorProfile } from '../pages/patient/DoctorProfile';
import { BookToken } from '../pages/patient/BookToken';
import { TokenConfirmation } from '../pages/patient/TokenConfirmation';
import { LiveQueue } from '../pages/patient/LiveQueue';
import { QRToken } from '../pages/patient/QRToken';
import { PatientNotifications } from '../pages/patient/PatientNotifications';
import { PatientHistory } from '../pages/patient/PatientHistory';
import { PatientProfile } from '../pages/patient/PatientProfile';

// Doctor Pages
import { DoctorDashboard } from '../pages/doctor/DoctorDashboard';
import { TodaysQueue } from '../pages/doctor/TodaysQueue';
import { DoctorSchedule } from '../pages/doctor/DoctorSchedule';
import { DoctorHistory } from '../pages/doctor/DoctorHistory';

// Receptionist Pages
import { ReceptionistDashboard } from '../pages/receptionist/ReceptionistDashboard';
import { PatientRegistration } from '../pages/receptionist/PatientRegistration';
import { WalkInToken } from '../pages/receptionist/WalkInToken';
import { CheckInStation } from '../pages/receptionist/CheckInStation';
import { QueueMonitor } from '../pages/receptionist/QueueMonitor';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { DoctorManagement } from '../pages/admin/DoctorManagement';
import { DepartmentManagement } from '../pages/admin/DepartmentManagement';
import { PatientManagement } from '../pages/admin/PatientManagement';
import { Analytics } from '../pages/admin/Analytics';
import { SystemSettings } from '../pages/admin/SystemSettings';

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <FloatingNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full">{children}</main>
      </div>
      <Footer />
    </div>
  );
}

const dashboardPaths = {
  PATIENT: '/patient/dashboard',
  DOCTOR: '/doctor/dashboard',
  RECEPTIONIST: '/receptionist/dashboard',
  ADMIN: '/admin/dashboard',
};

function ProtectedRole({ role, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-ink-muted">Loading your session…</div>;
  }
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user.role !== role) {
    return <Navigate to={dashboardPaths[user.role] || '/'} replace />;
  }
  return <RoleShell role={role}>{children}</RoleShell>;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/find-doctor" element={<PublicLayout><FindDoctor /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />

      {/* Public Live Waiting TV Board (No header/footer wrapper for TV mode) */}
      <Route path="/live-display" element={<LiveDisplay />} />
      <Route path="/live-display/:doctorId" element={<LiveDisplay />} />

      {/* Patient Domain */}
      <Route path="/patient/dashboard" element={<ProtectedRole role="PATIENT"><PatientDashboard /></ProtectedRole>} />
      <Route path="/patient/doctor/:doctorId" element={<PublicLayout><DoctorProfile /></PublicLayout>} />
      <Route path="/patient/book/:doctorId" element={<ProtectedRole role="PATIENT"><BookToken /></ProtectedRole>} />
      <Route path="/patient/confirmation/:appointmentId" element={<ProtectedRole role="PATIENT"><TokenConfirmation /></ProtectedRole>} />
      <Route path="/patient/queue/:appointmentId" element={<ProtectedRole role="PATIENT"><LiveQueue /></ProtectedRole>} />
      <Route path="/patient/qr/:appointmentId" element={<ProtectedRole role="PATIENT"><QRToken /></ProtectedRole>} />
      <Route path="/patient/notifications" element={<ProtectedRole role="PATIENT"><PatientNotifications /></ProtectedRole>} />
      <Route path="/patient/history" element={<ProtectedRole role="PATIENT"><PatientHistory /></ProtectedRole>} />
      <Route path="/patient/profile" element={<ProtectedRole role="PATIENT"><PatientProfile /></ProtectedRole>} />

      {/* Doctor Domain */}
      <Route path="/doctor/dashboard" element={<ProtectedRole role="DOCTOR"><DoctorDashboard /></ProtectedRole>} />
      <Route path="/doctor/queue" element={<ProtectedRole role="DOCTOR"><TodaysQueue /></ProtectedRole>} />
      <Route path="/doctor/schedule" element={<ProtectedRole role="DOCTOR"><DoctorSchedule /></ProtectedRole>} />
      <Route path="/doctor/history" element={<ProtectedRole role="DOCTOR"><DoctorHistory /></ProtectedRole>} />

      {/* Receptionist Domain */}
      <Route path="/receptionist/dashboard" element={<ProtectedRole role="RECEPTIONIST"><ReceptionistDashboard /></ProtectedRole>} />
      <Route path="/receptionist/register" element={<ProtectedRole role="RECEPTIONIST"><PatientRegistration /></ProtectedRole>} />
      <Route path="/receptionist/walk-in" element={<ProtectedRole role="RECEPTIONIST"><WalkInToken /></ProtectedRole>} />
      <Route path="/receptionist/check-in" element={<ProtectedRole role="RECEPTIONIST"><CheckInStation /></ProtectedRole>} />
      <Route path="/receptionist/monitor" element={<ProtectedRole role="RECEPTIONIST"><QueueMonitor /></ProtectedRole>} />

      {/* Admin Domain */}
      <Route path="/admin/dashboard" element={<ProtectedRole role="ADMIN"><AdminDashboard /></ProtectedRole>} />
      <Route path="/admin/doctors" element={<ProtectedRole role="ADMIN"><DoctorManagement /></ProtectedRole>} />
      <Route path="/admin/departments" element={<ProtectedRole role="ADMIN"><DepartmentManagement /></ProtectedRole>} />
      <Route path="/admin/patients" element={<ProtectedRole role="ADMIN"><PatientManagement /></ProtectedRole>} />
      <Route path="/admin/analytics" element={<ProtectedRole role="ADMIN"><Analytics /></ProtectedRole>} />
      <Route path="/admin/settings" element={<ProtectedRole role="ADMIN"><SystemSettings /></ProtectedRole>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
