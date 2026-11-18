import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQueue } from '../../context/QueueContext';
import { mockStore } from '../../services/mockStore';
import { TokenStub } from '../../components/queue/TokenStub';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  QrCode,
  ArrowRight,
  Stethoscope,
  Activity,
  History,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { estimateWait } from '../../services/queueEngine';

export function PatientDashboard() {
  const { user } = useAuth();
  const { queuesVersion } = useQueue();
  const [appointments, setAppointments] = useState([]);
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [activeDoctor, setActiveDoctor] = useState(null);
  const [waitEstimate, setWaitEstimate] = useState({ aheadCount: 0, waitRange: '--' });

  useEffect(() => {
    const patientId = user?.patientId || 'pat_1';
    const list = mockStore.getPatientAppointments(patientId);
    setAppointments(list);

    // Identify active (non-completed, non-cancelled) token
    const active = list.find(
      (a) => a.status === 'CALLED' || a.status === 'IN_PROGRESS' || a.status === 'CHECKED_IN' || a.status === 'WAITING'
    );

    setActiveAppointment(active || null);

    if (active) {
      const doc = mockStore.getDoctorById(active.doctorId);
      setActiveDoctor(doc || null);
      const est = estimateWait(active.doctorId, active.tokenNumber, active.date);
      setWaitEstimate(est);
    }
  }, [user, queuesVersion]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Patient Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
        <div>
          <span className="eyebrow-tag mb-2">Patient Care Portal</span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink tracking-tight">
            Welcome back, {user?.name || 'Neha'}
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Medical Record Number:{' '}
            <span className="font-mono font-semibold text-ink">{user?.mrn || 'MRN-849201'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/find-doctor">
            <Button variant="primary" size="md" icon={Calendar} trailingIcon>
              Book New Token
            </Button>
          </Link>
        </div>
      </div>

      {/* Active Token Hero Section */}
      {activeAppointment ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-display font-semibold text-ink flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <span>Today's Active Token</span>
            </h2>
            <Link
              to={`/patient/queue/${activeAppointment.id}`}
              className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
            >
              <span>Full Live Queue View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <TokenStub
            appointment={activeAppointment}
            doctor={activeDoctor}
            variant="full"
            patientsAhead={waitEstimate.aheadCount}
          />
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No upcoming tokens today"
          description="You don't have any active tokens in queue today. Browse clinical departments to schedule a consultation."
          actionLabel="Find a Doctor & Book"
          actionIcon={Stethoscope}
          onAction={() => (window.location.href = '/find-doctor')}
        />
      )}

      {/* Recent Appointment History */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-display font-semibold text-ink flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <span>Consultation History & Records</span>
          </h2>
          <Link
            to="/patient/history"
            className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
          >
            <span>View All Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {appointments.slice(0, 4).map((apt) => {
            const doc = mockStore.getDoctorById(apt.doctorId);
            return (
              <div
                key={apt.id}
                className="p-4 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-bezel-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-canvas-subtle flex flex-col items-center justify-center border border-border shrink-0 font-mono">
                    <span className="font-bold text-sm text-ink">{apt.tokenNumber}</span>
                    <span className="text-[9px] text-ink-muted">{apt.date?.slice(5)}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-ink">
                      {doc?.name || 'Physician'} ({doc?.departmentName || 'OPD'})
                    </h4>
                    <p className="text-xs text-ink-muted">{apt.reason || 'General Consultation'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <Badge status={apt.status} size="sm" />
                  <Link
                    to={`/patient/confirmation/${apt.id}`}
                    className="p-2 rounded-xl bg-canvas-subtle hover:bg-primary hover:text-white transition-colors text-ink-muted"
                    title="View Receipt"
                  >
                    <QrCode className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
