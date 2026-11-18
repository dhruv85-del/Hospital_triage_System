import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQueue } from '../../context/QueueContext';
import { mockStore } from '../../services/mockStore';
import { PageContainer } from '../../components/layout/PageContainer';
import { StatCard } from '../../components/cards/StatCard';
import { Button } from '../../components/common/Button';
import { CheckInModal } from '../../components/forms/CheckInModal';
import { Badge } from '../../components/common/Badge';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  FileText,
  Clock,
  CheckCircle2,
  Search,
  Activity,
  Tv,
  ArrowRight,
} from 'lucide-react';

export function ReceptionistDashboard() {
  const { user } = useAuth();
  const { queuesVersion } = useQueue();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setAppointments(mockStore.getAppointments(null, today));
    setDoctors(mockStore.getDoctors());
  }, [queuesVersion]);

  const totalTokens = appointments.length;
  const waitingTokens = appointments.filter((a) => a.status === 'WAITING').length;
  const checkedInTokens = appointments.filter((a) => a.status === 'CHECKED_IN').length;
  const completedTokens = appointments.filter((a) => a.status === 'COMPLETED').length;
  const walkInTokens = appointments.filter((a) => a.type === 'WALK_IN').length;

  return (
    <PageContainer
      eyebrow="Triage & Front Desk Console"
      title="Receptionist Command Station"
      subtitle="Manage walk-in intake, check in arriving patients, and oversee multi-department waiting rooms."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            icon={Search}
            onClick={() => setCheckInModalOpen(true)}
            trailingIcon
          >
            Rapid Check-In
          </Button>

          <Link to="/receptionist/walk-in">
            <Button variant="secondary" size="md" icon={FileText}>
              Issue Walk-In
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Tokens Today"
            value={totalTokens}
            subtitle={`${walkInTokens} walk-in passes issued`}
            icon={Users}
          />
          <StatCard
            title="Checked In & Waiting"
            value={checkedInTokens}
            subtitle="Present in waiting area"
            icon={Clock}
          />
          <StatCard
            title="Awaiting Arrival"
            value={waitingTokens}
            subtitle="Pre-booked, not yet checked-in"
            icon={UserPlus}
          />
          <StatCard
            title="Completed Visits"
            value={completedTokens}
            subtitle="Discharged successfully"
            icon={CheckCircle2}
          />
        </div>

        {/* Quick Action Navigation Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/receptionist/walk-in"
            className="double-bezel-outer group hover:-translate-y-0.5 transition-all"
          >
            <div className="double-bezel-inner bg-surface p-5 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-primary-light text-primary flex items-center justify-center shadow-bezel-sm">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-display font-semibold text-ink group-hover:text-primary transition-colors">
                Dispense Walk-In Token
              </h3>
              <p className="text-xs text-ink-muted">
                Register unscheduled patients and print official ticket slips.
              </p>
            </div>
          </Link>

          <button
            onClick={() => setCheckInModalOpen(true)}
            className="double-bezel-outer group text-left hover:-translate-y-0.5 transition-all"
          >
            <div className="double-bezel-inner bg-surface p-5 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-primary-light text-primary flex items-center justify-center shadow-bezel-sm">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-display font-semibold text-ink group-hover:text-primary transition-colors">
                Patient Arrival Check-In
              </h3>
              <p className="text-xs text-ink-muted">
                Instant search by Token #, Phone, or Name to mark patient arrival.
              </p>
            </div>
          </button>

          <Link
            to="/receptionist/monitor"
            className="double-bezel-outer group hover:-translate-y-0.5 transition-all"
          >
            <div className="double-bezel-inner bg-surface p-5 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-primary-light text-primary flex items-center justify-center shadow-bezel-sm">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-display font-semibold text-ink group-hover:text-primary transition-colors">
                Multi-Queue Monitor
              </h3>
              <p className="text-xs text-ink-muted">
                Live oversight grid across all 8 specialty OPD clinical rooms.
              </p>
            </div>
          </Link>
        </div>

        {/* Live Clinic Queues Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-display font-semibold text-ink flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <span>Active Clinic Queues</span>
            </h2>
            <Link
              to="/receptionist/monitor"
              className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
            >
              <span>Full Multi-Doctor Monitor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map((doc) => {
              const docApts = appointments.filter((a) => a.doctorId === doc.id);
              const called = docApts.find((a) => a.status === 'CALLED');
              const waiting = docApts.filter(
                (a) => a.status === 'CHECKED_IN' || a.status === 'WAITING'
              );

              return (
                <div key={doc.id} className="double-bezel-outer">
                  <div className="double-bezel-inner bg-surface p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-ink">{doc.name}</h4>
                        <p className="text-xs text-ink-muted">{doc.departmentName} • {doc.room}</p>
                      </div>
                      <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-canvas-subtle border border-border">
                        {waiting.length} Waiting
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-canvas-subtle flex items-center justify-between">
                      <span className="text-xs text-ink-muted">Currently Called:</span>
                      {called ? (
                        <span className="font-mono font-bold text-sm text-amber-900 bg-amber-light px-2 py-0.5 rounded-lg border border-amber-border">
                          {called.tokenNumber} ({called.patientName.split(' ')[0]})
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-ink-muted">--</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rapid Check-In Modal */}
      <CheckInModal
        isOpen={checkInModalOpen}
        onClose={() => setCheckInModalOpen(false)}
        onSuccess={() => setCheckInModalOpen(false)}
      />
    </PageContainer>
  );
}
