import React, { useState, useEffect } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { StatCard } from '../../components/cards/StatCard';
import { WaitTimeChart } from '../../components/charts/WaitTimeChart';
import { PeakHoursChart } from '../../components/charts/PeakHoursChart';
import { mockStore } from '../../services/mockStore';
import { getHospitalAnalytics } from '../../services/api/analyticsApi';
import { useQueue } from '../../context/QueueContext';
import { formatRelativeTime } from '../../utils/formatters';
import {
  Activity,
  Users,
  Clock,
  CheckCircle2,
  Stethoscope,
  Building,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';

export function AdminDashboard() {
  const { queuesVersion, resetDemoData } = useQueue();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHospitalAnalytics().then((res) => {
      setAnalytics(res);
      setLoading(false);
    });
  }, [queuesVersion]);

  return (
    <PageContainer
      eyebrow="Command & Telemetry Center"
      title="Hospital Operations Dashboard"
      subtitle="Executive oversight of patient flow throughput, queue velocity, and department utilization."
      actions={
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="md" icon={RotateCcw} onClick={resetDemoData}>
            Reset Seed Data
          </Button>
          <Link to="/admin/analytics">
            <Button variant="primary" size="md" icon={TrendingUp} trailingIcon>
              Detailed Analytics
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Tokens Today"
            value={analytics?.kpis?.totalTokensToday || 32}
            trend="+12%"
            trendType="up"
            trendLabel="vs yesterday"
            icon={Users}
          />
          <StatCard
            title="Average Wait Time"
            value={`${analytics?.kpis?.avgWaitTimeMinutes || 18.5}m`}
            trend="-3.4m"
            trendType="up"
            trendLabel="faster than target"
            icon={Clock}
          />
          <StatCard
            title="Consultations Done"
            value={analytics?.kpis?.completedToday || 18}
            subtitle="Completed today"
            icon={CheckCircle2}
          />
          <StatCard
            title="On-Duty Physicians"
            value={`${analytics?.kpis?.activeDoctorsCount || 12} Active`}
            subtitle="8 Specialty Wings"
            icon={Stethoscope}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="double-bezel-outer">
            <div className="double-bezel-inner bg-surface p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/70">
                <div>
                  <h3 className="font-display font-semibold text-sm text-ink">
                    Wait-Time Duration Curve (Today)
                  </h3>
                  <p className="text-xs text-ink-muted">Average waiting minutes by time of day</p>
                </div>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-primary-light text-primary font-bold">
                  Avg 18.5m
                </span>
              </div>
              <WaitTimeChart data={analytics?.hourlyTraffic} />
            </div>
          </div>

          <div className="double-bezel-outer">
            <div className="double-bezel-inner bg-surface p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/70">
                <div>
                  <h3 className="font-display font-semibold text-sm text-ink">
                    Patient Intake Volume
                  </h3>
                  <p className="text-xs text-ink-muted">Tokens dispensed vs consultations served</p>
                </div>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-success-light text-success font-bold">
                  High Throughput
                </span>
              </div>
              <PeakHoursChart data={analytics?.hourlyTraffic} />
            </div>
          </div>
        </div>

        {/* Real-time System Event Stream (QueueEvents) */}
        <div className="double-bezel-outer">
          <div className="double-bezel-inner bg-surface p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <h3 className="font-display font-semibold text-sm text-ink">
                  Real-time Queue Transition Audit Stream
                </h3>
              </div>
              <span className="text-[11px] font-mono text-ink-muted">Live Event Logger</span>
            </div>

            <div className="divide-y divide-border/60 max-h-64 overflow-y-auto pr-1">
              {analytics?.recentEvents && analytics.recentEvents.length > 0 ? (
                analytics.recentEvents.map((evt) => (
                  <div key={evt.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-ink px-2 py-0.5 rounded bg-canvas-subtle border border-border">
                        {evt.tokenNumber}
                      </span>
                      <p className="text-ink">
                        Moved from <span className="font-mono font-semibold">{evt.previousStatus}</span>{' '}
                        → <span className="font-mono font-semibold text-primary">{evt.newStatus}</span>{' '}
                        by <span className="text-ink-muted">({evt.actorName})</span>
                      </p>
                    </div>

                    <span className="font-mono text-[10px] text-ink-muted shrink-0">
                      {formatRelativeTime(evt.timestamp)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-ink-muted py-4 text-center">No recent event transitions logged.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
