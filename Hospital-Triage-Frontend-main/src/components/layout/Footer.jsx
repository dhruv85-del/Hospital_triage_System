import React from 'react';
import { Activity, ShieldCheck, Heart, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/80 bg-surface text-ink-muted py-12 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
              <Activity className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-lg text-ink">AuraFlow Systems</span>
          </div>
          <p className="text-xs text-ink-muted max-w-sm leading-relaxed">
            Next-generation patient-flow and synchronous queue management architecture engineered
            for multi-department hospital centers.
          </p>
          <div className="flex items-center gap-2 text-[11px] font-mono text-primary pt-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero-PII Public Display Privacy Verified</span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-ink font-semibold mb-3">
            Quick Navigation
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/find-doctor" className="hover:text-primary transition-colors">
                Find Physician
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-primary transition-colors">
                Specialties & Clinics
              </Link>
            </li>
            <li>
              <Link to="/live-display" className="hover:text-primary transition-colors">
                Public Live Board
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-primary transition-colors">
                Queue Methodology
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-ink font-semibold mb-3">
            Clinical Portals
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/patient/dashboard" className="hover:text-primary transition-colors">
                Patient Portal
              </Link>
            </li>
            <li>
              <Link to="/doctor/dashboard" className="hover:text-primary transition-colors">
                Physician Station
              </Link>
            </li>
            <li>
              <Link to="/receptionist/dashboard" className="hover:text-primary transition-colors">
                Triage & Reception
              </Link>
            </li>
            <li>
              <Link to="/admin/dashboard" className="hover:text-primary transition-colors">
                Hospital Command Center
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-ink-muted">
        <p>© 2026 AuraFlow Medical. Built as a high-fidelity frontend prototype.</p>
        <p className="flex items-center gap-1">
          Designed with <Heart className="w-3.5 h-3.5 text-primary fill-primary" /> for clinical
          clarity & accessibility.
        </p>
      </div>
    </footer>
  );
}
