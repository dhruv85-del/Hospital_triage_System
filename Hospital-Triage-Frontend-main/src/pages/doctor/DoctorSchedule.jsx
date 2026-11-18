import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../services/mockStore';
import { PageContainer } from '../../components/layout/PageContainer';
import { Button } from '../../components/common/Button';
import { Calendar, Clock, Save, Coffee, CheckCircle } from 'lucide-react';

export function DoctorSchedule() {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [status, setStatus] = useState('ACTIVE');
  const [slotDuration, setSlotDuration] = useState(15);
  const [saved, setSaved] = useState(false);

  const docId = user?.doctorId || 'doc_1';

  useEffect(() => {
    const doc = mockStore.getDoctorById(docId);
    if (doc) {
      setDoctor(doc);
      setStatus(doc.status || 'ACTIVE');
      setSlotDuration(doc.schedule?.slotDuration || 15);
    }
  }, [docId]);

  const handleSave = (e) => {
    e.preventDefault();
    if (doctor) {
      doctor.status = status;
      if (!doctor.schedule) doctor.schedule = {};
      doctor.schedule.slotDuration = slotDuration;
      mockStore.save();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const days = [
    { day: 'Monday', active: true, hours: '08:30 AM – 04:30 PM', tokens: 18 },
    { day: 'Tuesday', active: true, hours: '08:30 AM – 04:30 PM', tokens: 20 },
    { day: 'Wednesday', active: true, hours: '08:30 AM – 04:30 PM', tokens: 16 },
    { day: 'Thursday', active: true, hours: '08:30 AM – 04:30 PM', tokens: 18 },
    { day: 'Friday', active: true, hours: '08:30 AM – 02:30 PM', tokens: 12 },
    { day: 'Saturday', active: false, hours: 'Off Duty', tokens: 0 },
    { day: 'Sunday', active: false, hours: 'Off Duty', tokens: 0 },
  ];

  return (
    <PageContainer
      eyebrow="Availability Roster"
      title="Clinic Schedule & Duty Status"
      subtitle="Configure your OPD working hours, break periods, and average slot intervals."
    >
      <div className="max-w-3xl space-y-6">
        {saved && (
          <div className="p-3.5 rounded-2xl bg-success-light border border-success-border text-xs text-success-800 font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span>Schedule settings saved successfully.</span>
          </div>
        )}

        {/* Status Toggle Card */}
        <div className="double-bezel-outer">
          <div className="double-bezel-inner bg-surface space-y-4">
            <h3 className="text-base font-display font-semibold text-ink">
              Realtime Physician Duty Status
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { key: 'ACTIVE', label: 'On Duty (Active)', desc: 'Accepting tokens in queue', color: 'bg-success text-white' },
                { key: 'ON_BREAK', label: 'On Clinical Break', desc: 'Queue paused for 15-30m', color: 'bg-amber text-ink' },
                { key: 'OFFLINE', label: 'Off Duty', desc: 'Not taking patients today', color: 'bg-alert text-white' },
              ].map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStatus(s.key)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 ${
                    status === s.key
                      ? 'border-primary ring-2 ring-primary/20 bg-primary-light/40 shadow-bezel-sm'
                      : 'border-border bg-canvas-subtle/50 hover:bg-canvas-subtle'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-ink">{s.label}</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${status === s.key ? 'bg-primary' : 'bg-border'}`} />
                  </div>
                  <p className="text-[11px] text-ink-muted">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Roster Table */}
        <div className="double-bezel-outer">
          <div className="double-bezel-inner bg-surface space-y-4">
            <h3 className="text-base font-display font-semibold text-ink">
              Weekly OPD Roster
            </h3>

            <div className="divide-y divide-border/60">
              {days.map((d) => (
                <div key={d.day} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-ink">{d.day}</span>
                    <p className="text-ink-muted font-mono text-[11px]">{d.hours}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-medium text-ink">
                      {d.active ? `Max ${d.tokens} Tokens` : 'Closed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border/70 flex justify-end">
              <Button variant="primary" size="md" icon={Save} onClick={handleSave} trailingIcon>
                Save Schedule Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
