import React from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { mockStore } from '../../services/mockStore';
import { MapPin, Phone, Mail, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';

export function Contact() {
  const hospitals = mockStore.getHospitals();

  return (
    <PageContainer
      eyebrow="Emergency & Assistance"
      title="Hospital Locations & Triage Desks"
      subtitle="Reach central dispatch or direct inquiries to specific clinical campus wings."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {hospitals.map((hosp) => (
          <div key={hosp.id} className="double-bezel-outer">
            <div className="double-bezel-inner bg-surface h-full flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-primary-light text-primary font-bold">
                    {hosp.code}
                  </span>
                  <span className="text-[11px] font-mono text-success flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    <span>Open 24/7</span>
                  </span>
                </div>

                <h3 className="text-base font-display font-semibold text-ink">{hosp.name}</h3>

                <div className="space-y-2.5 mt-4 text-xs text-ink-muted">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{hosp.address}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-mono font-medium text-ink">{hosp.phone}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary shrink-0" />
                    <span>OPD Hours: 08:00 AM – 06:00 PM</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/60">
                <a
                  href={`tel:${hosp.phone.replace(/\D/g, '')}`}
                  className="block text-center py-2 px-4 rounded-xl text-xs font-semibold bg-canvas-subtle hover:bg-primary hover:text-white transition-colors text-ink"
                >
                  Call Reception Desk
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Emergency Alert Banner */}
      <div className="mt-8 p-6 rounded-3xl bg-alert-light border border-alert-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-alert text-white flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-alert-900">Life-Threatening Emergency?</h4>
            <p className="text-xs text-alert-800 mt-0.5">
              Please proceed immediately to the Emergency Trauma Center or dial 112 / 108 (National Emergency Helpline). Digital queue tokens are for scheduled & outpatient triage only.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
