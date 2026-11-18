import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mockStore } from '../../services/mockStore';
import { DoctorCard } from '../../components/cards/DoctorCard';
import { Input } from '../../components/common/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { Search, Filter, Stethoscope, Sparkles } from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';

export function FindDoctor() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDept = searchParams.get('dept') || '';

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState(initialDept);

  useEffect(() => {
    setDoctors(mockStore.getDoctors());
    setDepartments(mockStore.getDepartments());
  }, []);

  const filteredDoctors = doctors.filter((doc) => {
    const matchesDept = selectedDept ? doc.departmentId === selectedDept : true;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !searchQuery ||
      doc.name.toLowerCase().includes(q) ||
      doc.departmentName.toLowerCase().includes(q) ||
      doc.title.toLowerCase().includes(q) ||
      doc.bio.toLowerCase().includes(q);

    return matchesDept && matchesQuery;
  });

  return (
    <PageContainer
      eyebrow="Clinical Directory"
      title="Find a Physician & Book a Token"
      subtitle="Search through certified clinical specialists across all outpatient hospital wings."
    >
      {/* Search & Department Filters Bar */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search physician by name, specialty, condition (e.g. Heart, Arthro, Sharma)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
            className="flex-1"
          />
        </div>

        {/* Department Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => {
              setSelectedDept('');
              setSearchParams({});
            }}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
              !selectedDept
                ? 'bg-primary text-white shadow-bezel-sm font-semibold'
                : 'bg-surface hover:bg-canvas-subtle text-ink-muted border border-border'
            }`}
          >
            All Specialties ({doctors.length})
          </button>

          {departments.map((dept) => {
            const isSelected = selectedDept === dept.id;
            const count = doctors.filter((d) => d.departmentId === dept.id).length;
            return (
              <button
                key={dept.id}
                onClick={() => {
                  setSelectedDept(dept.id);
                  setSearchParams({ dept: dept.id });
                }}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  isSelected
                    ? 'bg-primary text-white shadow-bezel-sm font-semibold'
                    : 'bg-surface hover:bg-canvas-subtle text-ink-muted border border-border'
                }`}
              >
                {dept.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <DoctorCard key={doc.id} doctor={doc} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Stethoscope}
          title="No physicians match your filter criteria"
          description={`We couldn't find any active doctors for "${searchQuery}". Try broadening your search or resetting department filters.`}
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedDept('');
            setSearchParams({});
          }}
        />
      )}
    </PageContainer>
  );
}
