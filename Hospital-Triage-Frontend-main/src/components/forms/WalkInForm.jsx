import React, { useState, useEffect } from 'react';
import { useQueue } from '../../context/QueueContext';
import { mockStore } from '../../services/mockStore';
import { Input, Select } from '../common/Input';
import { Button } from '../common/Button';
import { Sparkles, Printer, UserPlus, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export function WalkInForm({ onSuccess }) {
  const { bookWalkIn } = useQueue();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [reason, setReason] = useState('');
  const [isPriority, setIsPriority] = useState(false);
  const [autoCheckIn, setAutoCheckIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const allDocs = mockStore.getDoctors();
    const allDepts = mockStore.getDepartments();
    setDoctors(allDocs);
    setDepartments(allDepts);
    if (allDepts.length > 0) {
      setSelectedDept(allDepts[0].id);
      const firstDoc = allDocs.find((d) => d.departmentId === allDepts[0].id);
      if (firstDoc) setSelectedDoctorId(firstDoc.id);
    }
  }, []);

  const filteredDoctors = selectedDept
    ? doctors.filter((d) => d.departmentId === selectedDept)
    : doctors;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedDoctorId) {
      setError('Please select an active physician.');
      return;
    }
    if (!patientName.trim()) {
      setError('Patient name is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await bookWalkIn({
        doctorId: selectedDoctorId,
        patientName,
        patientPhone: patientPhone || '+1 (555) 000-0000',
        patientAge: parseInt(patientAge, 10) || 30,
        reason: reason || 'Walk-in Triage',
        isPriority,
        autoCheckIn,
      });

      try {
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      } catch (err) {}

      if (onSuccess) {
        onSuccess(res.appointment);
      }
    } catch (err) {
      setError(err.message || 'Failed to issue walk-in token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3.5 rounded-2xl bg-alert-light border border-alert-border text-xs text-alert font-medium">
          {error}
        </div>
      )}

      {/* Specialty and Doctor Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1.5 font-sans">
            Specialty Department
          </label>
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              const firstDoc = doctors.find((d) => d.departmentId === e.target.value);
              if (firstDoc) setSelectedDoctorId(firstDoc.id);
            }}
            className="w-full bg-canvas-pure border border-border rounded-xl py-2.5 px-3.5 text-sm text-ink focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
          >
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1.5 font-sans">
            Attending Physician
          </label>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="w-full bg-canvas-pure border border-border rounded-xl py-2.5 px-3.5 text-sm text-ink focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
            required
          >
            {filteredDoctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} ({doc.room})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient Information */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <Input
            label="Patient Full Name"
            placeholder="E.g. Amit Kulkarni"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            required
          />
        </div>
        <div>
          <Input
            label="Age"
            type="number"
            placeholder="35"
            value={patientAge}
            onChange={(e) => setPatientAge(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Contact Phone"
          placeholder="+91 98765 43210"
          value={patientPhone}
          onChange={(e) => setPatientPhone(e.target.value)}
        />
        <Input
          label="Chief Complaint / Reason"
          placeholder="E.g. Fever, wound dressing, joint ache"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>

      {/* Triage Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <label className="p-3 rounded-2xl bg-canvas-subtle border border-border flex items-center justify-between cursor-pointer">
          <div>
            <span className="text-xs font-semibold text-ink block">Instant Check-In</span>
            <span className="text-[11px] text-ink-muted">Patient is already in waiting area</span>
          </div>
          <input
            type="checkbox"
            checked={autoCheckIn}
            onChange={(e) => setAutoCheckIn(e.target.checked)}
            className="w-4 h-4 text-primary rounded"
          />
        </label>

        <label className="p-3 rounded-2xl bg-canvas-subtle border border-border flex items-center justify-between cursor-pointer">
          <div>
            <span className="text-xs font-semibold text-ink flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber" />
              <span>Priority Pass</span>
            </span>
            <span className="text-[11px] text-ink-muted">Emergency / Elderly fast-track</span>
          </div>
          <input
            type="checkbox"
            checked={isPriority}
            onChange={(e) => setIsPriority(e.target.checked)}
            className="w-4 h-4 text-primary rounded"
          />
        </label>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        className="w-full"
        icon={Printer}
        trailingIcon
      >
        Issue Walk-In Token & Print Slip
      </Button>
    </form>
  );
}
