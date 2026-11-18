import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockStore } from '../../services/mockStore';
import { PageContainer } from '../../components/layout/PageContainer';
import { Button } from '../../components/common/Button';
import { Star, MapPin, Clock, Calendar, Stethoscope, ArrowLeft } from 'lucide-react';

export function DoctorProfile() {
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    const doc = mockStore.getDoctorById(doctorId);
    setDoctor(doc || null);
  }, [doctorId]);

  if (!doctor) {
    return (
      <PageContainer title="Doctor Profile Not Found">
        <Link to="/find-doctor">
          <Button variant="secondary">Back to Doctors Directory</Button>
        </Link>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      eyebrow="Specialist Profile"
      title={doctor.name}
      subtitle={doctor.title}
      actions={
        <Link to={`/patient/book/${doctor.id}`}>
          <Button variant="primary" size="md" trailingIcon>
            Book Consultation Token
          </Button>
        </Link>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Bio Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="double-bezel-outer">
            <div className="double-bezel-inner bg-surface space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <img
                  src={doctor.avatar}
                  alt={doctor.name}
                  className="w-24 h-24 rounded-3xl object-cover border border-border shadow-bezel"
                />
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-light text-amber-900 border border-amber-border text-xs font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber text-amber" />
                    <span>{doctor.rating.toFixed(1)}</span>
                    <span className="text-ink-muted">({doctor.reviewsCount} verified reviews)</span>
                  </div>
                  <h2 className="text-xl font-display font-bold text-ink">{doctor.name}</h2>
                  <p className="text-xs font-mono text-primary font-medium">
                    {doctor.qualification} • {doctor.experienceYears} Years Experience
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border/70">
                <h3 className="text-sm font-display font-semibold text-ink mb-2">
                  Clinical Background & Specialization
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">{doctor.bio}</p>
              </div>

              {/* Weekly Schedule Matrix */}
              <div className="pt-4 border-t border-border/70">
                <h3 className="text-sm font-display font-semibold text-ink mb-3">
                  Weekly Consultation Availability
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {doctor.schedule?.days?.map((day) => (
                    <div
                      key={day}
                      className="p-3 rounded-2xl bg-canvas-subtle border border-border text-center"
                    >
                      <span className="block font-mono font-bold text-xs text-ink">{day}</span>
                      <span className="text-[10px] text-ink-muted">{doctor.schedule?.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Action Panel */}
        <div className="space-y-6">
          <div className="double-bezel-outer">
            <div className="double-bezel-inner bg-surface space-y-4">
              <h3 className="text-sm font-display font-semibold text-ink pb-3 border-b border-border/70">
                Consultation Summary
              </h3>

              <div className="space-y-3 text-xs text-ink-muted">
                <div className="flex items-center justify-between">
                  <span>Specialty Wing</span>
                  <span className="font-semibold text-ink">{doctor.departmentName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Consultation Room</span>
                  <span className="font-semibold text-ink">{doctor.room}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Average Duration</span>
                  <span className="font-mono font-semibold text-ink">
                    ~{doctor.avgConsultTimeMin} mins
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <span>Consultation Fee</span>
                  <span className="font-mono text-lg font-bold text-ink">₹{doctor.fee}</span>
                </div>
              </div>

              <Link to={`/patient/book/${doctor.id}`} className="block pt-2">
                <Button variant="primary" size="lg" className="w-full" trailingIcon>
                  Book Token Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
