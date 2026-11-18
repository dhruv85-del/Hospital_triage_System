import React from 'react';
import { Star, Clock, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';

export function DoctorCard({ doctor, onBook, className = '' }) {
  if (!doctor) return null;

  const {
    id,
    name,
    title,
    departmentName,
    room,
    avatar,
    rating,
    reviewsCount,
    experienceYears,
    fee,
    status,
    schedule,
  } = doctor;

  const isAvailable = status === 'ACTIVE';

  return (
    <div className={`double-bezel-outer group hover:-translate-y-1 transition-all duration-300 ${className}`}>
      <div className="double-bezel-inner flex flex-col justify-between h-full bg-surface">
        <div>
          {/* Header row: Avatar + Status + Rating */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="relative">
              <img
                src={avatar}
                alt={name}
                className="w-16 h-16 rounded-2xl object-cover border border-border shadow-bezel-sm"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface ${
                  isAvailable ? 'bg-success' : 'bg-amber'
                }`}
                title={isAvailable ? 'On Duty' : 'On Break'}
              />
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-light text-amber-900 border border-amber-border text-xs font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber text-amber" />
                <span>{rating.toFixed(1)}</span>
                <span className="text-ink-muted font-normal">({reviewsCount})</span>
              </div>
              <p className="text-[11px] font-mono text-ink-muted mt-1">
                {experienceYears} yrs clinical exp
              </p>
            </div>
          </div>

          {/* Name & Specialty */}
          <h3 className="text-base font-display font-semibold text-ink group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-xs font-medium text-primary mt-0.5">{departmentName}</p>
          <p className="text-xs text-ink-muted line-clamp-2 mt-1 leading-relaxed">{title}</p>

          {/* Logistics */}
          <div className="mt-4 pt-3 border-t border-border/60 space-y-2 text-xs text-ink-muted">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>Location</span>
              </span>
              <span className="font-medium text-ink">{room}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Slot Duration</span>
              </span>
              <span className="font-mono text-ink">~{doctor.avgConsultTimeMin || 12} mins</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>Schedule</span>
              </span>
              <span className="text-ink font-medium truncate max-w-[130px]">
                {schedule?.days?.slice(0, 3).join(', ') || 'Mon-Fri'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-ink-muted block">
              Consult Fee
            </span>
            <span className="font-mono text-base font-bold text-ink">₹{fee}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/patient/doctor/${id}`}
              className="px-3 py-2 text-xs font-medium text-ink-muted hover:text-ink transition-colors"
            >
              Profile
            </Link>
            <Link to={`/patient/book/${id}`}>
              <Button size="sm" variant="primary" trailingIcon>
                Book Token
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
