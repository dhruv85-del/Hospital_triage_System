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

export function DepartmentLoadChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-ink-muted">
        No department telemetry available.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl bg-ink text-white p-2.5 text-xs shadow-bezel font-sans">
          <p className="font-semibold text-white mb-1">{label}</p>
          {payload.map((entry, idx) => (
            <p key={idx} style={{ color: entry.color }} className="text-[11px]">
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
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#DCE3E0" />
          <XAxis
            type="number"
            tick={{ fill: '#5B6B65', fontSize: 11, fontFamily: 'IBM Plex Mono' }}
            axisLine={{ stroke: '#DCE3E0' }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="code"
            tick={{ fill: '#16221E', fontSize: 11, fontFamily: 'IBM Plex Mono', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            width={45}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'IBM Plex Sans' }} />
          <Bar dataKey="waiting" name="Waiting" fill="#E2A33B" radius={[0, 4, 4, 0]} stackId="a" />
          <Bar dataKey="completed" name="Completed" fill="#3E8E5C" radius={[0, 4, 4, 0]} stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
