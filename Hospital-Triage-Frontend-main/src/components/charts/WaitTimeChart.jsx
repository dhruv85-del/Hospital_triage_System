import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export function WaitTimeChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-ink-muted">
        No wait time telemetry available.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl bg-ink text-white p-2.5 text-xs shadow-bezel font-sans">
          <p className="font-mono text-[11px] text-canvas-subtle mb-1">{label}</p>
          <p className="font-semibold text-primary-light">
            Avg Wait: <span className="font-mono text-white">{payload[0].value} mins</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorWait" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2B6E63" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#2B6E63" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DCE3E0" />
          <XAxis
            dataKey="hour"
            tick={{ fill: '#5B6B65', fontSize: 11, fontFamily: 'IBM Plex Mono' }}
            axisLine={{ stroke: '#DCE3E0' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#5B6B65', fontSize: 11, fontFamily: 'IBM Plex Mono' }}
            axisLine={false}
            tickLine={false}
            unit="m"
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="avgWait"
            stroke="#2B6E63"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorWait)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
