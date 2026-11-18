import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export function PeakHoursChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-ink-muted">
        No hourly volume telemetry available.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl bg-ink text-white p-2.5 text-xs shadow-bezel font-sans">
          <p className="font-mono text-[11px] text-canvas-subtle mb-1">{label}</p>
          {payload.map((entry, idx) => (
            <p key={idx} style={{ color: entry.color }} className="font-medium">
              {entry.name}: <span className="font-mono font-bold text-white">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'IBM Plex Sans' }} />
          <Bar dataKey="tokens" name="Tokens Issued" fill="#2B6E63" radius={[4, 4, 0, 0]} />
          <Bar dataKey="completed" name="Served" fill="#3E8E5C" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
