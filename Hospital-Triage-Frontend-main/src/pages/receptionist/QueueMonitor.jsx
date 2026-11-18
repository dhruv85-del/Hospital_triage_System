import React, { useState, useEffect } from 'react';
import { mockStore } from '../../services/mockStore';
import { useQueue } from '../../context/QueueContext';
import { PageContainer } from '../../components/layout/PageContainer';
import { TokenStub } from '../../components/queue/TokenStub';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Activity, Clock, Users, Bell, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export function QueueMonitor() {
  const { queuesVersion } = useQueue();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDoctors(mockStore.getDoctors());
    setDepartments(mockStore.getDepartments());
    setAppointments(mockStore.getAppointments(null, today));
  }, [queuesVersion]);

  const filteredDoctors = selectedDept
    ? doctors.filter((d) => d.departmentId === selectedDept)
    : doctors;

  return (
    <PageContainer
      eyebrow="Central Triage Monitor"
      title="Multi-Clinic Queue Oversight"
      subtitle="Live multi-department patient flow board across all active outpatient doctor suites."
      actions={
        <Link to="/live-display">
          <Button variant="secondary" size="md" icon={Activity}>
            Open Waiting TV Screen
          </Button>
        </Link>
      }
    >
      {/* Department Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4">
        <button
          onClick={() => setSelectedDept('')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
            !selectedDept
              ? 'bg-primary text-white font-semibold shadow-bezel-sm'
              : 'bg-surface hover:bg-canvas-subtle text-ink-muted border border-border'
          }`}
        >
          All Departments ({doctors.length} Clinics)
        </button>
        {departments.map((dept) => (
          <button
            key={dept.id}
            onClick={() => setSelectedDept(dept.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedDept === dept.id
                ? 'bg-primary text-white font-semibold shadow-bezel-sm'
                : 'bg-surface hover:bg-canvas-subtle text-ink-muted border border-border'
            }`}
          >
            {dept.name}
          </button>
        ))}
      </div>

      {/* Multi-Clinic Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDoctors.map((doc) => {
          const docApts = appointments.filter((a) => a.doctorId === doc.id);
          const called = docApts.find((a) => a.status === 'CALLED');
          const inProgress = docApts.find((a) => a.status === 'IN_PROGRESS');
          const waitingList = docApts.filter(
            (a) => a.status === 'CHECKED_IN' || a.status === 'WAITING'
          );

          return (
            <div key={doc.id} className="double-bezel-outer">
              <div className="double-bezel-inner bg-surface space-y-4">
                {/* Clinic Header */}
                <div className="flex items-start justify-between pb-3 border-b border-border/70">
                  <div className="flex items-center gap-3">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      className="w-10 h-10 rounded-xl object-cover border border-border"
                    />
                    <div>
                      <h3 className="font-display font-semibold text-sm text-ink">{doc.name}</h3>
                      <p className="text-xs text-primary font-medium">{doc.departmentName}</p>
                    </div>
                  </div>

                  <span className="font-mono text-xs px-2.5 py-1 rounded-xl bg-canvas-subtle border border-border text-ink font-semibold">
                    {doc.room}
                  </span>
                </div>

                {/* Active Status Row */}
                <div className="p-3 rounded-2xl bg-canvas-subtle flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-ink-muted">Now Serving:</span>
                    {called ? (
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-lg bg-amber-light text-amber-900 border border-amber-border">
                        {called.tokenNumber} (CALLED)
                      </span>
                    ) : inProgress ? (
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-lg bg-primary-light text-primary border border-primary/20">
                        {inProgress.tokenNumber} (IN ROOM)
                      </span>
                    ) : (
                      <span className="text-xs text-ink-muted font-mono">Idle</span>
                    )}
                  </div>

                  <span className="font-mono text-xs text-ink font-semibold">
                    {waitingList.length} in queue
                  </span>
                </div>

                {/* Queue Rows */}
                <div className="space-y-2">
                  {docApts.slice(0, 4).map((apt) => (
                    <TokenStub key={apt.id} appointment={apt} doctor={doc} variant="row" />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}
