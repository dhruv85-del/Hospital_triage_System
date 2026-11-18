import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { DepartmentCard } from '../../components/cards/DepartmentCard';
import { DoctorCard } from '../../components/cards/DoctorCard';
import { StatCard } from '../../components/cards/StatCard';
import { mockStore } from '../../services/mockStore';
import {
  Activity,
  Search,
  Calendar,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Tv,
  Users,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
} from 'lucide-react';

export function Home() {
  const navigate = useNavigate();
  const [tokenSearch, setTokenSearch] = useState('');
  const [searchError, setSearchError] = useState('');

  const departments = mockStore.getDepartments().slice(0, 4);
  const featuredDoctors = mockStore.getDoctors().slice(0, 3);
  const hospitals = mockStore.getHospitals();

  const handleTrackToken = (e) => {
    e.preventDefault();
    setSearchError('');
    if (!tokenSearch.trim()) return;

    const clean = tokenSearch.trim().toUpperCase();
    const apt = mockStore.data.appointments.find((a) => a.tokenNumber.toUpperCase() === clean);
    if (apt) {
      navigate(`/patient/queue/${apt.id}`);
    } else {
      setSearchError(`Token "${tokenSearch}" was not found in today's active directory.`);
    }
  };

  return (
    <div className="space-y-20 sm:space-y-32">
      {/* Cinematic Hero Section */}
      <section className="relative pt-6 sm:pt-12 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-border shadow-bezel-sm text-xs font-mono text-ink-muted mb-6 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span>Synchronous Clinical Queue Engine v1.0</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-bold text-ink tracking-tight leading-[1.08]">
          Intelligent patient flow for{' '}
          <span className="text-primary underline decoration-primary/30 decoration-wavy underline-offset-8">
            modern healthcare.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed">
          Eliminate physical waiting room congestion. Synchronous digital token booking, live wait-time
          telemetry, and seamless physician triage across all clinical departments.
        </p>

        {/* Hero Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <Link to="/find-doctor">
            <Button size="lg" variant="primary" icon={Calendar} trailingIcon>
              Book a Consultation Token
            </Button>
          </Link>
          <Link to="/live-display">
            <Button size="lg" variant="secondary" icon={Tv}>
              Public Waiting TV Board
            </Button>
          </Link>
        </div>

        {/* Quick Token Tracking Card (Double-Bezel) */}
        <div className="mt-12 max-w-xl mx-auto double-bezel-outer">
          <div className="double-bezel-inner bg-surface text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-ink-muted font-medium flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-primary" />
                <span>Instant Token Live Tracker</span>
              </span>
              <span className="text-[11px] text-primary font-mono font-semibold">Zero-Login Needed</span>
            </div>

            <form onSubmit={handleTrackToken} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Token ID (e.g. T-103 or T-104)..."
                value={tokenSearch}
                onChange={(e) => setTokenSearch(e.target.value)}
                className="flex-1 bg-canvas-pure border border-border rounded-xl px-4 py-2.5 text-sm font-mono text-ink placeholder-ink-light focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
              />
              <Button type="submit" variant="primary" size="md" trailingIcon>
                Track Live
              </Button>
            </form>
            {searchError && <p className="text-xs text-alert font-medium mt-2">{searchError}</p>}
          </div>
        </div>
      </section>

      {/* Live Hospital Metrics Bento Grid */}
      <section className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="eyebrow-tag mb-2">Hospital Telemetry</span>
          <h2 className="text-2xl sm:text-4xl font-display font-bold text-ink">
            Real-time Waiting Room Pulse
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Avg Consultation Wait"
            value="14.5m"
            trend="-3.2m"
            trendType="up"
            trendLabel="vs last week"
            icon={Clock}
          />
          <StatCard
            title="Active Physicians On Duty"
            value="12 Doctors"
            subtitle="Across 8 clinical wings"
            icon={Stethoscope}
          />
          <StatCard
            title="Patients Served Today"
            value="42 Visits"
            trend="+18%"
            trendType="up"
            icon={CheckCircle2}
          />
          <StatCard
            title="Emergency Care Status"
            value="NORMAL"
            subtitle="Central Campus Atrium"
            icon={HeartPulse}
          />
        </div>
      </section>

      {/* Specialties Overview */}
      <section className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="eyebrow-tag mb-2">Clinical Departments</span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink">
              Multi-Specialty Care Centers
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              Select a clinical discipline to inspect physician schedules and live queues.
            </p>
          </div>
          <Link
            to="/services"
            className="text-xs font-medium text-primary hover:text-primary-hover flex items-center gap-1 shrink-0"
          >
            <span>View all 8 departments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {departments.map((dept) => (
            <DepartmentCard key={dept.id} department={dept} />
          ))}
        </div>
      </section>

      {/* Featured Physicians Section */}
      <section className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="eyebrow-tag mb-2">Available Physicians</span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink">
              Consult with Senior Medical Specialists
            </h2>
          </div>
          <Link
            to="/find-doctor"
            className="text-xs font-medium text-primary hover:text-primary-hover flex items-center gap-1 shrink-0"
          >
            <span>Browse all doctors</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredDoctors.map((doc) => (
            <DoctorCard key={doc.id} doctor={doc} />
          ))}
        </div>
      </section>
    </div>
  );
}
