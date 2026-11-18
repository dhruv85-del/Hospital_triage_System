import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQueue } from '../../context/QueueContext';
import { mockStore } from '../../services/mockStore';
import { Input, Select } from '../common/Input';
import { Button } from '../common/Button';
import { formatTime } from '../../utils/formatters';
import { Calendar, Clock, Stethoscope, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export function BookingForm({ initialDoctorId, onSuccess }) {
  const { user } = useAuth();
  const { bookToken } = useQueue();

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialDoctorId || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM');
  const [reason, setReason] = useState('');
  const [isPriority, setIsPriority] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Available slots for demo
  const timeSlots = [
    '09:00 AM', '09:20 AM', '09:40 AM',
    '10:00 AM', '10:20 AM', '10:40 AM',
    '11:00 AM', '11:20 AM', '11:40 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM'
  ];

  useEffect(() => {
    const allDocs = mockStore.getDoctors();
    const allDepts = mockStore.getDepartments();
    setDoctors(allDocs);
    setDepartments(allDepts);

    if (initialDoctorId) {
      const doc = allDocs.find((d) => d.id === initialDoctorId);
      if (doc) {
        setSelectedDept(doc.departmentId);
        setSelectedDoctorId(doc.id);
      }
    } else if (allDepts.length > 0) {
      setSelectedDept(allDepts[0].id);
    }
  }, [initialDoctorId]);

  const filteredDoctors = selectedDept
    ? doctors.filter((d) => d.departmentId === selectedDept)
    : doctors;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedDoctorId) {
      setError('Please select a physician to book with.');
      return;
    }

    setLoading(true);
    try {
      const res = await bookToken({
        doctorId: selectedDoctorId,
        patientId: user?.patientId || 'pat_1',
        patientName: user?.name || 'Neha Sharma',
        patientPhone: user?.phone || '+91 98201 23456',
        date,
        scheduledTime: selectedSlot,
        reason: reason || 'Routine Clinical Consultation',
        isPriority,
      });

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (err) {
        // Safe fallback
      }

      if (onSuccess) {
        onSuccess(res.appointment);
      }
    } catch (err) {
      setError(err.message || 'Failed to book token. Please try another slot.');
    } finally {
      setLoading(false);
    }
  };

  const currentDoc = doctors.find((d) => d.id === selectedDoctorId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3.5 rounded-2xl bg-alert-light border border-alert-border text-xs text-alert font-medium">
          {error}
        </div>
      )}

      {/* Specialty and Physician Select */}
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
                {dept.name} ({dept.floor})
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
                {doc.name} — {doc.room} (₹{doc.fee})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Doctor Summary Pill */}
      {currentDoc && (
        <div className="p-3.5 rounded-2xl bg-primary-light/60 border border-primary/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={currentDoc.avatar}
              alt={currentDoc.name}
              className="w-10 h-10 rounded-xl object-cover border border-border"
            />
            <div>
              <p className="text-xs font-semibold text-ink">{currentDoc.name}</p>
              <p className="text-[11px] text-ink-muted">{currentDoc.room}</p>
            </div>
          </div>
          <div className="text-right font-mono text-xs text-ink font-semibold">
            <span>Fee: ₹{currentDoc.fee}</span>
          </div>
        </div>
      )}

      {/* Date & Time Slot Picker */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Appointment Date"
            type="date"
            value={date}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1.5 font-sans">
              Selected Time Window
            </label>
            <div className="py-2.5 px-3.5 rounded-xl bg-canvas-pure border border-border text-sm font-mono text-ink">
              {selectedSlot} (Estimated)
            </div>
          </div>
        </div>

        {/* Slot Grid */}
        <div>
          <p className="text-xs font-medium text-ink-muted uppercase tracking-wider mb-2 font-sans">
            Available Slot Schedule
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {timeSlots.map((slot) => {
              const isSelected = selectedSlot === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2 px-1 rounded-xl text-xs font-mono font-medium transition-all duration-200 active:scale-95 ${
                    isSelected
                      ? 'bg-primary text-white shadow-bezel-sm font-semibold'
                      : 'bg-canvas-subtle hover:bg-canvas text-ink border border-border/70'
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reason for Visit */}
      <div>
        <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1.5 font-sans">
          Chief Complaint / Reason for Visit
        </label>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="E.g., Heart palpitations after workout, prescription renewal, routine blood pressure check..."
          className="w-full bg-canvas-pure border border-border rounded-xl p-3.5 text-sm text-ink placeholder-ink-light focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
        />
      </div>

      {/* Demo Priority Flag Toggle */}
      <div className="p-3.5 rounded-2xl bg-canvas-subtle border border-border flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber" />
            <span>Priority Queue Flag (Demo Helper)</span>
          </span>
          <p className="text-[11px] text-ink-muted">
            Simulates priority ordering for elderly / urgent case demonstration.
          </p>
        </div>
        <input
          type="checkbox"
          checked={isPriority}
          onChange={(e) => setIsPriority(e.target.checked)}
          className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        className="w-full"
        trailingIcon
      >
        Confirm & Generate Digital Token
      </Button>
    </form>
  );
}
