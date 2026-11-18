import React from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { ShieldCheck, Cpu, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';

export function About() {
  return (
    <PageContainer
      eyebrow="Clinical Philosophy"
      title="Next-Generation Queue Architecture"
      subtitle="Engineering synchronous digital patient flow to reduce hospital congestion and anxiety."
    >
      <div className="space-y-12 max-w-4xl">
        {/* Core Mission Banner */}
        <div className="double-bezel-outer">
          <div className="double-bezel-inner bg-surface space-y-4">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-ink">
              Rethinking the Outpatient Experience
            </h2>
            <p className="text-sm text-ink-muted leading-relaxed">
              Traditional healthcare facilities suffer from physical crowding, opaque waiting
              durations, and unpredictable delays. AuraFlow introduces mathematical queue estimation,
              synchronous pub-sub state orchestration, and privacy-preserving public displays.
            </p>
            <p className="text-sm text-ink-muted leading-relaxed">
              Our system guarantees that walk-in patients and digital pre-booked appointments share a
              unified, transparent FIFO queue without friction.
            </p>
          </div>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="double-bezel-outer">
            <div className="double-bezel-inner bg-surface h-full">
              <div className="w-10 h-10 rounded-2xl bg-primary-light text-primary flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-display font-semibold text-ink">
                Wait-Time Estimation
              </h3>
              <p className="text-xs text-ink-muted mt-2 leading-relaxed">
                Adaptive range calculations based on actual physician consult speed rather than false-precise static clocks.
              </p>
            </div>
          </div>

          <div className="double-bezel-outer">
            <div className="double-bezel-inner bg-surface h-full">
              <div className="w-10 h-10 rounded-2xl bg-primary-light text-primary flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-display font-semibold text-ink">
                Strict PII Anonymity
              </h3>
              <p className="text-xs text-ink-muted mt-2 leading-relaxed">
                Public waiting room displays and mobile QR passes reveal zero personally identifiable data.
              </p>
            </div>
          </div>

          <div className="double-bezel-outer">
            <div className="double-bezel-inner bg-surface h-full">
              <div className="w-10 h-10 rounded-2xl bg-primary-light text-primary flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-display font-semibold text-ink">
                Synchronous State
              </h3>
              <p className="text-xs text-ink-muted mt-2 leading-relaxed">
                Immediate event broadcasts across patient mobile tokens, receptionist consoles, and doctor rooms.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 rounded-3xl bg-primary text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-bezel">
          <div>
            <h3 className="text-xl font-display font-bold">Ready to experience AuraFlow?</h3>
            <p className="text-xs text-primary-light mt-1">
              Sign in to your account or create a patient account to get started.
            </p>
          </div>
          <Link to="/login">
            <Button variant="secondary" size="md" trailingIcon>
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
