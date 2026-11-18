import React from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { DepartmentCard } from '../../components/cards/DepartmentCard';
import { mockStore } from '../../services/mockStore';
import { HeartPulse, Stethoscope, Clock, ShieldCheck } from 'lucide-react';

export function Services() {
  const departments = mockStore.getDepartments();

  return (
    <PageContainer
      eyebrow="Clinical Portfolio"
      title="Hospital Specialties & Clinical Units"
      subtitle="Comprehensive tertiary outpatient disciplines operating synchronous digital queues."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {departments.map((dept) => (
          <DepartmentCard key={dept.id} department={dept} />
        ))}
      </div>
    </PageContainer>
  );
}
