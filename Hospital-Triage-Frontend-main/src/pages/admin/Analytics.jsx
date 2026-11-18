import React, { useState, useEffect } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { StatCard } from '../../components/cards/StatCard';
import { WaitTimeChart } from '../../components/charts/WaitTimeChart';
import { PeakHoursChart } from '../../components/charts/PeakHoursChart';
import { DepartmentLoadChart } from '../../components/charts/DepartmentLoadChart';
import { getHospitalAnalytics } from '../../services/api/analyticsApi';
import { Clock, TrendingUp, Users, CheckCircle2, BarChart2 } from 'lucide-react';

export function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getHospitalAnalytics().then(setData);
  }, []);

  return (
    <PageContainer
      eyebrow="Intelligence & Reporting"
      title="Queue Velocity & Operational Analytics"
      subtitle="Detailed statistical metrics on wait times, no-show rates, and clinical throughput."
    >
      <div className="space-y-8">
        {/* KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Avg Consultation Wait"
            value="18.5m"
            trend="-14%"
            trendType="up"
            trendLabel="vs 30-day baseline"
            icon={Clock}
          />
          <StatCard
            title="Peak Room Intake"
            value="32 / hour"
            subtitle="Occurs 11:00 AM – 12:00 PM"
            icon={TrendingUp}
          />
          <StatCard
            title="No-Show / Skip Rate"
            value="3.2%"
            trend="-0.8%"
            trendType="up"
            icon={Users}
          />
          <StatCard
            title="Queue Compliance"
            value="98.4%"
            subtitle="FIFO schedule adherence"
            icon={CheckCircle2}
          />
        </div>

        {/* Charts Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="double-bezel-outer">
            <div className="double-bezel-inner bg-surface p-6 space-y-4">
              <h3 className="font-display font-semibold text-sm text-ink pb-3 border-b border-border/70">
                Hourly Wait-Time Fluctuations
              </h3>
              <WaitTimeChart data={data?.hourlyTraffic} />
            </div>
          </div>

          <div className="double-bezel-outer">
            <div className="double-bezel-inner bg-surface p-6 space-y-4">
              <h3 className="font-display font-semibold text-sm text-ink pb-3 border-b border-border/70">
                Departmental Queuing Breakdown
              </h3>
              <DepartmentLoadChart data={data?.departmentStats} />
            </div>
          </div>
        </div>

        {/* Full-Width Peak Hours Chart */}
        <div className="double-bezel-outer">
          <div className="double-bezel-inner bg-surface p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <div>
                <h3 className="font-display font-semibold text-sm text-ink">
                  Hourly Token Throughput vs Completed Consultations
                </h3>
                <p className="text-xs text-ink-muted">Tracking volume surges across morning and afternoon OPD shifts</p>
              </div>
            </div>
            <PeakHoursChart data={data?.hourlyTraffic} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
