import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQueue } from '../../context/QueueContext';
import { mockStore } from '../../services/mockStore';
import { PageContainer } from '../../components/layout/PageContainer';
import { TokenStub } from '../../components/queue/TokenStub';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { ConsultationModal } from '../../components/forms/ConsultationModal';
import {
  Bell,
  SkipForward,
  RotateCcw,
  Play,
  CheckCircle2,
  Filter,
  Sparkles,
  Clock,
} from 'lucide-react';

export function TodaysQueue() {
  const { user } = useAuth();
  const { callNext, skipPatient, recallPatient, startConsultation, completeConsultation, queuesVersion } = useQueue();

  const [appointments, setAppointments] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [activeConsultApt, setActiveConsultApt] = useState(null);
  const [consultModalOpen, setConsultModalOpen] = useState(false);

  const docId = user?.doctorId || 'doc_1';

  useEffect(() => {
    const doc = mockStore.getDoctorById(docId);
    setDoctor(doc || null);

    const today = new Date().toISOString().split('T')[0];
    const list = mockStore.getAppointments(docId, today);
    setAppointments(list);
  }, [docId, queuesVersion]);

  const filtered =
    filterStatus === 'ALL'
      ? appointments
      : appointments.filter((a) => a.status === filterStatus);

  const handleStart = async (apt) => {
    await startConsultation(apt.id, { role: 'DOCTOR', name: doctor?.name });
    setActiveConsultApt(apt);
    setConsultModalOpen(true);
  };

  return (
    <PageContainer
      eyebrow="Live Queue Control"
      title="Today's Patient Queue"
      subtitle="Complete queue orchestration: call next in line, start consultations, skip no-shows, or recall patients."
      actions={
        <Button
          variant="amber"
          size="md"
          icon={Bell}
          onClick={() => callNext(docId, { role: 'DOCTOR', name: doctor?.name })}
          trailingIcon
        >
          Call Next Patient
        </Button>
      }
    >
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4">
        {['ALL', 'CHECKED_IN', 'CALLED', 'IN_PROGRESS', 'WAITING', 'SKIPPED', 'COMPLETED'].map(
          (status) => {
            const count =
              status === 'ALL'
                ? appointments.length
                : appointments.filter((a) => a.status === status).length;
            const isSelected = filterStatus === status;

            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  isSelected
                    ? 'bg-primary text-white font-semibold shadow-bezel-sm'
                    : 'bg-surface hover:bg-canvas-subtle text-ink-muted border border-border'
                }`}
              >
                {status.replace('_', ' ')} ({count})
              </button>
            );
          }
        )}
      </div>

      {/* Queue List */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((apt) => (
            <div
              key={apt.id}
              className={`p-4 rounded-2xl bg-surface border transition-all duration-200 ${
                apt.status === 'CALLED'
                  ? 'border-amber ring-2 ring-amber/30 bg-amber-light/30'
                  : apt.status === 'IN_PROGRESS'
                  ? 'border-primary ring-2 ring-primary/20 bg-primary-light/20'
                  : 'border-border'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left Patient Info */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-canvas-subtle flex flex-col items-center justify-center font-mono border border-border shrink-0">
                    <span className="text-base font-bold text-ink">{apt.tokenNumber}</span>
                    <span className="text-[9px] text-ink-muted uppercase">{apt.type}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-ink">{apt.patientName}</h4>
                      {apt.isPriority && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-light text-amber-900 border border-amber-border text-[10px] font-mono font-bold">
                          PRIORITY
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {apt.patientAge} yrs • {apt.patientPhone} • {apt.reason || 'General Consultation'}
                    </p>
                    <p className="text-[11px] font-mono text-ink-muted mt-1">
                      Slot: {apt.scheduledTime}
                    </p>
                  </div>
                </div>

                {/* Right Status & Action Controls */}
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <Badge status={apt.status} size="sm" />

                  {apt.status === 'CHECKED_IN' && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Bell}
                      onClick={() => callNext(docId, { role: 'DOCTOR', name: doctor?.name })}
                    >
                      Call In
                    </Button>
                  )}

                  {apt.status === 'CALLED' && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Play}
                        onClick={() => handleStart(apt)}
                      >
                        Start
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={SkipForward}
                        onClick={() => skipPatient(apt.id, { role: 'DOCTOR', name: doctor?.name })}
                      >
                        Skip
                      </Button>
                    </div>
                  )}

                  {apt.status === 'IN_PROGRESS' && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={CheckCircle2}
                      onClick={() => {
                        setActiveConsultApt(apt);
                        setConsultModalOpen(true);
                      }}
                    >
                      Complete
                    </Button>
                  )}

                  {apt.status === 'SKIPPED' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={RotateCcw}
                      onClick={() => recallPatient(apt.id, { role: 'DOCTOR', name: doctor?.name })}
                    >
                      Recall
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon={Clock}
            title="No tokens in this status"
            description="There are currently no patient tokens matching the selected filter."
          />
        )}
      </div>

      {/* Consultation Modal */}
      {activeConsultApt && (
        <ConsultationModal
          isOpen={consultModalOpen}
          onClose={() => setConsultModalOpen(false)}
          appointment={activeConsultApt}
          doctor={doctor}
        />
      )}
    </PageContainer>
  );
}
