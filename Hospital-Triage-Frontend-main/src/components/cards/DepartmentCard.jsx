import React from 'react';
import {
  HeartPulse,
  Bone,
  Brain,
  Baby,
  Stethoscope,
  Sparkles,
  Eye,
  Ear,
  Clock,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ICON_MAP = {
  HeartPulse,
  Bone,
  Brain,
  Baby,
  Stethoscope,
  Sparkles,
  Eye,
  Ear,
};

export function DepartmentCard({ department, className = '' }) {
  if (!department) return null;

  const IconComponent = ICON_MAP[department.icon] || Stethoscope;

  return (
    <Link
      to={`/find-doctor?dept=${department.id}`}
      className={`double-bezel-outer group block hover:-translate-y-1 transition-all duration-300 ${className}`}
    >
      <div className="double-bezel-inner bg-surface h-full flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center border border-primary/20 shadow-bezel-sm group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <IconComponent className="w-6 h-6" />
            </div>
            <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-canvas-subtle border border-border text-ink-muted">
              {department.floor}
            </span>
          </div>

          <h3 className="text-base font-display font-semibold text-ink group-hover:text-primary transition-colors">
            {department.name}
          </h3>
          <p className="text-xs text-ink-muted mt-1 line-clamp-2 leading-relaxed">
            {department.description}
          </p>
        </div>

        <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-ink-muted">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>Avg Wait: ~{department.avgWaitTimeMin}m</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span>{department.activeQueues} Live Clinics</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
