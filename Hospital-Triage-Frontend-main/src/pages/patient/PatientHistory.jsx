import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../services/mockStore';
import { PageContainer } from '../../components/layout/PageContainer';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { History, Star, FileText, QrCode, MessageSquare, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PatientHistory() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    const list = mockStore.getPatientAppointments(user?.patientId || 'pat_1');
    setAppointments(list);
  }, [user]);

  const openFeedback = (apt) => {
    setSelectedApt(apt);
    setRating(5);
    setFeedbackText('');
    setFeedbackSubmitted(false);
    setFeedbackModalOpen(true);
  };

  const handleSendFeedback = (e) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackModalOpen(false);
    }, 1200);
  };

  return (
    <PageContainer
      eyebrow="Clinical Archive"
      title="Past Consultations & Care History"
      subtitle="Complete ledger of completed, skipped, and past appointment tokens."
    >
      <div className="space-y-4 max-w-3xl mx-auto">
        {appointments.length > 0 ? (
          appointments.map((apt) => {
            const doctor = mockStore.getDoctorById(apt.doctorId);
            const isCompleted = apt.status === 'COMPLETED';

            return (
              <div
                key={apt.id}
                className="double-bezel-outer"
              >
                <div className="double-bezel-inner bg-surface space-y-4">
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-base font-bold text-ink px-3 py-1 rounded-xl bg-canvas-subtle border border-border">
                        {apt.tokenNumber}
                      </span>
                      <div>
                        <h4 className="text-sm font-semibold text-ink">{doctor?.name}</h4>
                        <p className="text-xs text-ink-muted">{doctor?.departmentName} • {apt.date}</p>
                      </div>
                    </div>
                    <Badge status={apt.status} size="sm" />
                  </div>

                  {/* Body Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-ink-muted">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider block text-ink-muted">
                        Chief Complaint
                      </span>
                      <p className="text-ink font-medium mt-0.5">{apt.reason || 'General Consultation'}</p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider block text-ink-muted">
                        Consultation Time
                      </span>
                      <p className="text-ink font-mono mt-0.5">
                        {apt.consultationStartTime ? `${apt.consultationStartTime} – ${apt.consultationEndTime || 'Done'}` : apt.scheduledTime}
                      </p>
                    </div>
                  </div>

                  {/* Doctor Notes if available */}
                  {apt.doctorNotes && (
                    <div className="p-3 rounded-xl bg-canvas-subtle/80 border border-border text-xs">
                      <span className="font-semibold text-ink block mb-0.5">Physician Clinical Remarks:</span>
                      <p className="text-ink-muted leading-relaxed">{apt.doctorNotes}</p>
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="pt-2 flex items-center justify-between gap-3 border-t border-border/60">
                    <Link
                      to={`/patient/confirmation/${apt.id}`}
                      className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>View Token Receipt</span>
                    </Link>

                    {isCompleted && (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={MessageSquare}
                        onClick={() => openFeedback(apt)}
                      >
                        Leave Feedback
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState
            icon={History}
            title="No past consultation records"
            description="Your past outpatient records and doctor notes will appear here once consultations conclude."
          />
        )}
      </div>

      {/* Feedback Modal */}
      <Modal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        title="Consultation Feedback"
        subtitle={selectedApt ? `Review with ${mockStore.getDoctorById(selectedApt.doctorId)?.name}` : ''}
      >
        {feedbackSubmitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle className="w-12 h-12 text-success mx-auto" />
            <h4 className="font-display font-semibold text-ink">Thank you for your feedback!</h4>
            <p className="text-xs text-ink-muted">Your review helps improve our clinical care quality.</p>
          </div>
        ) : (
          <form onSubmit={handleSendFeedback} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-2 font-sans">
                Experience Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-2 rounded-xl bg-canvas-subtle hover:bg-amber-light transition-colors"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating ? 'fill-amber text-amber' : 'text-border'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1.5 font-sans">
                Comments & Suggestions
              </label>
              <textarea
                rows={3}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="How was your waiting time experience and doctor communication?"
                className="w-full bg-canvas-pure border border-border rounded-xl p-3 text-sm text-ink focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
              />
            </div>

            <Button type="submit" variant="primary" size="md" className="w-full">
              Submit Review
            </Button>
          </form>
        )}
      </Modal>
    </PageContainer>
  );
}
