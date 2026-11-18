import React, { useState, useEffect } from 'react';
import { useQueue } from '../../context/QueueContext';
import { mockStore } from '../../services/mockStore';
import { PageContainer } from '../../components/layout/PageContainer';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Search, UserCheck, CheckCircle2, Clock } from 'lucide-react';

export function CheckInStation() {
  const { checkIn, queuesVersion } = useQueue();
  const [searchQuery, setSearchQuery] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loadingAptId, setLoadingAptId] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const list = mockStore.getAppointments(null, today);
    setAppointments(list);
  }, [queuesVersion]);

  const filtered = appointments.filter((a) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      a.tokenNumber.toLowerCase().includes(q) ||
      a.patientName.toLowerCase().includes(q) ||
      (a.patientPhone && a.patientPhone.replace(/\D/g, '').includes(q.replace(/\D/g, '')))
    );
  });

  const handleCheckIn = async (appointmentId) => {
    setLoadingAptId(appointmentId);
    try {
      await checkIn(appointmentId, { role: 'RECEPTIONIST', name: 'Front Desk' });
    } finally {
      setLoadingAptId(null);
    }
  };

  return (
    <PageContainer
      eyebrow="Triage Intake"
      title="Patient Check-In Terminal"
      subtitle="Search scheduled tokens to mark patient physical presence in waiting suites."
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <Input
            placeholder="Search Token (e.g. T-103), Patient Name, or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
            className="flex-1"
          />
        </div>

        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((apt) => {
              const doctor = mockStore.getDoctorById(apt.doctorId);
              const isWaiting = apt.status === 'WAITING';

              return (
                <div key={apt.id} className="double-bezel-outer">
                  <div className="double-bezel-inner bg-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                          {apt.patientPhone} • Room: <span className="font-semibold text-ink">{doctor?.room}</span> ({doctor?.name})
                        </p>
                        <p className="text-[11px] font-mono text-ink-muted mt-0.5">
                          Slot: {apt.scheduledTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <Badge status={apt.status} size="sm" />

                      {isWaiting ? (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={UserCheck}
                          loading={loadingAptId === apt.id}
                          onClick={() => handleCheckIn(apt.id)}
                        >
                          Check In
                        </Button>
                      ) : (
                        <span className="text-xs text-success font-semibold font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Admitted</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState
              icon={Clock}
              title="No patients found"
              description={`No appointment records match "${searchQuery}".`}
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
