import React, { useState, useEffect } from 'react';
import { mockStore } from '../../services/mockStore';
import { PageContainer } from '../../components/layout/PageContainer';
import { Input } from '../../components/common/Input';
import { Search, Users, Phone, Calendar, Heart, Shield } from 'lucide-react';

export function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setPatients(mockStore.getPatients());
  }, []);

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery)
  );

  return (
    <PageContainer
      eyebrow="Master Directory"
      title="Patient Electronic Health Directory"
      subtitle="Master registry of registered hospital patients, medical record numbers, and clinical visits."
    >
      <div className="space-y-6">
        <Input
          placeholder="Search by MRN (e.g. MRN-849201), Name, or Phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={Search}
          className="max-w-md"
        />

        <div className="space-y-3">
          {filtered.map((patient) => {
            const patientApts = mockStore.data.appointments.filter((a) => a.patientId === patient.id);
            return (
              <div key={patient.id} className="double-bezel-outer">
                <div className="double-bezel-inner bg-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-canvas-subtle flex items-center justify-center text-primary font-mono font-bold text-xs border border-border">
                      {patient.bloodGroup || 'O+'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-ink">{patient.name}</h4>
                        <span className="font-mono text-xs text-primary font-semibold">
                          ({patient.mrn})
                        </span>
                      </div>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {patient.age} yrs • {patient.gender} • {patient.phone} • {patient.email}
                      </p>
                      {patient.allergies && patient.allergies.length > 0 && (
                        <p className="text-[11px] text-alert font-medium mt-0.5">
                          Allergies: {patient.allergies.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-canvas-subtle border border-border text-ink font-semibold">
                      {patientApts.length} Encounters
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
