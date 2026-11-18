import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../services/mockStore';
import { PageContainer } from '../../components/layout/PageContainer';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Search, History, FileText, CheckCircle } from 'lucide-react';

export function DoctorHistory() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const docId = user?.doctorId || 'doc_1';

  useEffect(() => {
    const list = mockStore.getAppointments(docId);
    setAppointments(list);
  }, [docId]);

  const filtered = appointments.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.tokenNumber.toLowerCase().includes(q) ||
      a.patientName.toLowerCase().includes(q) ||
      (a.doctorNotes && a.doctorNotes.toLowerCase().includes(q)) ||
      (a.reason && a.reason.toLowerCase().includes(q))
    );
  });

  return (
    <PageContainer
      eyebrow="Clinical Ledger"
      title="Consultation History & Patient Records"
      subtitle="Comprehensive audit trail of completed outpatient encounters and medical notes."
    >
      <div className="space-y-6">
        <Input
          placeholder="Search by Token, Patient Name, Diagnosis, or Medical remarks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={Search}
          className="max-w-md"
        />

        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((apt) => (
              <div key={apt.id} className="double-bezel-outer">
                <div className="double-bezel-inner bg-surface space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-ink px-2.5 py-1 rounded-xl bg-canvas-subtle border border-border">
                        {apt.tokenNumber}
                      </span>
                      <div>
                        <h4 className="text-sm font-semibold text-ink">{apt.patientName}</h4>
                        <p className="text-xs text-ink-muted">
                          {apt.patientAge} yrs • {apt.patientPhone} • Date: {apt.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-ink-muted">{apt.scheduledTime}</span>
                      <Badge status={apt.status} size="sm" />
                    </div>
                  </div>

                  <div className="text-xs text-ink-muted">
                    <p className="text-ink font-medium">Chief Complaint: {apt.reason || 'General Checkup'}</p>
                    {apt.doctorNotes && (
                      <div className="mt-2 p-3 rounded-xl bg-canvas-subtle border border-border">
                        <span className="font-semibold text-ink block mb-0.5">Clinical Remarks & Prescription:</span>
                        <p className="leading-relaxed">{apt.doctorNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon={History}
              title="No consultation records match"
              description="Try adjusting your search criteria."
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
