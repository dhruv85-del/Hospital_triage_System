import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useQueue } from '../../context/QueueContext';
import { Clock, Stethoscope, CheckCircle2, FileText, Pill } from 'lucide-react';

export function ConsultationModal({ isOpen, onClose, appointment, doctor, onCompleted }) {
  const { completeConsultation } = useQueue();
  const [seconds, setSeconds] = useState(0);
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isOpen) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!appointment) return null;

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const fullNotes = notes + (prescription ? `\n[Prescription: ${prescription}]` : '');
      const res = await completeConsultation(appointment.id, fullNotes, {
        role: 'DOCTOR',
        name: doctor?.name || 'Doctor',
      });
      if (onCompleted) onCompleted(res);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Active Consultation — ${appointment.patientName}`}
      subtitle={`Token: ${appointment.tokenNumber} • Reason: ${appointment.reason || 'General Checkup'}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Live Timer Banner */}
        <div className="p-4 rounded-2xl bg-primary-light border border-primary/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-bezel-sm">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
                Elapsed Consultation Time
              </p>
              <p className="font-mono text-2xl font-bold text-ink">{formatTimer(seconds)}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border text-xs font-mono text-ink">
              <span className="w-2 h-2 rounded-full bg-success animate-ping" />
              <span>Session In-Progress</span>
            </span>
          </div>
        </div>

        {/* Clinical Notes Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1.5 font-sans flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span>Clinical Observations & Diagnosis</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter patient diagnosis, vital signs, physical exam findings, and clinical remarks..."
              className="w-full bg-canvas-pure border border-border rounded-xl p-3 text-sm text-ink placeholder-ink-light focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1.5 font-sans flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-primary" />
              <span>Prescription & Follow-up Instructions</span>
            </label>
            <textarea
              rows={2}
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              placeholder="E.g. Tab Metoprolol 25mg 1-0-1 for 30 days. Review in 4 weeks."
              className="w-full bg-canvas-pure border border-border rounded-xl p-3 text-sm text-ink placeholder-ink-light focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-border/70 flex items-center justify-between">
          <Button variant="secondary" size="md" onClick={onClose}>
            Keep Open in Background
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={CheckCircle2}
            loading={loading}
            onClick={handleFinish}
            trailingIcon
          >
            Complete Consultation
          </Button>
        </div>
      </div>
    </Modal>
  );
}
