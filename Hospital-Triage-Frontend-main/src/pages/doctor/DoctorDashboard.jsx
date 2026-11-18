import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQueue } from '../../context/QueueContext';
import { mockStore } from '../../services/mockStore';
import { PageContainer } from '../../components/layout/PageContainer';
import { StatCard } from '../../components/cards/StatCard';
import { TokenStub } from '../../components/queue/TokenStub';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ConsultationModal } from '../../components/forms/ConsultationModal';
import {
  Users,
  Clock,
  CheckCircle2,
  Bell,
  Stethoscope,
  Play,
  SkipForward,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function DoctorDashboard() {
  const { user } = useAuth();
  const { callNext, skipPatient, recallPatient, startConsultation, queuesVersion } = useQueue();

  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [consultModalOpen, setConsultModalOpen] = useState(false);
  const [activeConsultApt, setActiveConsultApt] = useState(null);
  const [callingNext, setCallingNext] = useState(false);

  const docId = user?.doctorId || 'doc_1';

  useEffect(() => {
    const doc = mockStore.getDoctorById(docId);
    setDoctor(doc || null);

    const today = new Date().toISOString().split('T')[0];
    const list = mockStore.getAppointments(docId, today);
    setAppointments(list);
  }, [docId, queuesVersion]);

  const currentlyCalled = appointments.find((a) => a.status === 'CALLED');
  const currentlyInProgress = appointments.find((a) => a.status === 'IN_PROGRESS');
  const waitingPatients = appointments.filter((a) => a.status === 'CHECKED_IN' || a.status === 'WAITING');
  const completedPatients = appointments.filter((a) => a.status === 'COMPLETED');
  const skippedPatients = appointments.filter((a) => a.status === 'SKIPPED');

  const handleCallNext = async () => {
    setCallingNext(true);
    try {
      await callNext(docId, { role: 'DOCTOR', name: doctor?.name || 'Dr. Specialist' });
    } finally {
      setCallingNext(false);
    }
  };

  const handleStartConsultation = async (apt) => {
    await startConsultation(apt.id, { role: 'DOCTOR', name: doctor?.name || 'Doctor' });
    setActiveConsultApt(apt);
    setConsultModalOpen(true);
  };

  return (
    <PageContainer
      eyebrow="Clinical Station"
      title={`${doctor?.name || 'Dr. Rajeshwar Sharma'} — OPD Console`}
      subtitle={`${doctor?.departmentName || 'Cardiology'} • ${doctor?.room || 'Room 204 (Wing B)'}`}
      actions={
        <div className="flex items-center gap-3">
          <Button
            variant="amber"
            size="md"
            icon={Bell}
            loading={callingNext}
            onClick={handleCallNext}
            trailingIcon
          >
            Call Next Patient
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* KPI Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Tokens Today"
            value={appointments.length}
            subtitle="Scheduled + Walk-ins"
            icon={Users}
          />
          <StatCard
            title="Waiting in Queue"
            value={waitingPatients.length}
            subtitle={`${waitingPatients.filter((a) => a.status === 'CHECKED_IN').length} checked in`}
            icon={Clock}
          />
          <StatCard
            title="Completed Consults"
            value={completedPatients.length}
            subtitle="Recorded visits"
            icon={CheckCircle2}
          />
          <StatCard
            title="Avg Duration"
            value={`~${doctor?.avgConsultTimeMin || 14}m`}
            subtitle="Target pace"
            icon={Stethoscope}
          />
        </div>

        {/* Active Consultation Hero Card (If CALLED or IN_PROGRESS) */}
        {(currentlyCalled || currentlyInProgress) && (
          <div className="double-bezel-outer">
            <div className="double-bezel-inner bg-surface space-y-4 border-l-4 border-amber">
              <div className="flex items-center justify-between">
                <span className="eyebrow-tag">
                  {currentlyInProgress ? 'Consultation In Progress' : 'Patient Called into Room'}
                </span>
                <Badge
                  status={currentlyInProgress ? 'IN_PROGRESS' : 'CALLED'}
                  size="md"
                  pulse
                />
              </div>

              {/* Patient details */}
              {(() => {
                const current = currentlyInProgress || currentlyCalled;
                return (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-amber-light border border-amber-border flex flex-col items-center justify-center font-mono">
                        <span className="text-xl font-bold text-amber-900">
                          {current.tokenNumber}
                        </span>
                        <span className="text-[10px] text-amber-800 uppercase">{current.type}</span>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-ink">{current.patientName}</h3>
                        <p className="text-xs text-ink-muted">
                          {current.patientAge} yrs • {current.patientPhone} • {current.reason || 'General Visit'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {currentlyCalled && (
                        <>
                          <Button
                            variant="primary"
                            size="md"
                            icon={Play}
                            onClick={() => handleStartConsultation(currentlyCalled)}
                            trailingIcon
                          >
                            Start Consultation
                          </Button>
                          <Button
                            variant="outline"
                            size="md"
                            icon={SkipForward}
                            onClick={() => skipPatient(currentlyCalled.id, { role: 'DOCTOR', name: doctor?.name })}
                          >
                            Skip (No Show)
                          </Button>
                        </>
                      )}

                      {currentlyInProgress && (
                        <Button
                          variant="primary"
                          size="md"
                          icon={CheckCircle2}
                          onClick={() => {
                            setActiveConsultApt(currentlyInProgress);
                            setConsultModalOpen(true);
                          }}
                          trailingIcon
                        >
                          Complete / Enter Notes
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Live Queue Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-display font-semibold text-ink flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Today's Live Queue ({appointments.length} Patients)</span>
            </h2>
            <Link
              to="/doctor/queue"
              className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
            >
              <span>Manage Full Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {appointments.map((apt) => (
              <TokenStub
                key={apt.id}
                appointment={apt}
                doctor={doctor}
                variant="row"
                actionLabel={
                  apt.status === 'CHECKED_IN'
                    ? 'Call In'
                    : apt.status === 'SKIPPED'
                    ? 'Recall'
                    : null
                }
                actionIcon={apt.status === 'CHECKED_IN' ? Bell : RotateCcw}
                onAction={
                  apt.status === 'CHECKED_IN'
                    ? () => callNext(docId, { role: 'DOCTOR', name: doctor?.name })
                    : apt.status === 'SKIPPED'
                    ? () => recallPatient(apt.id, { role: 'DOCTOR', name: doctor?.name })
                    : null
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* Consultation Live Timer Modal */}
      {activeConsultApt && (
        <ConsultationModal
          isOpen={consultModalOpen}
          onClose={() => setConsultModalOpen(false)}
          appointment={activeConsultApt}
          doctor={doctor}
          onCompleted={() => setConsultModalOpen(false)}
        />
      )}
    </PageContainer>
  );
}
