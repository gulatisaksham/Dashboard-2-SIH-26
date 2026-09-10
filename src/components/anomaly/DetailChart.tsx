import React from 'react';
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ReferenceArea } from 'recharts';
import type { AnomalySeries } from '../../data/types';

interface DetailChartProps {
  series: AnomalySeries;
}

export const DetailChart: React.FC<DetailChartProps> = ({ series }) => {
  const computedData = series.data.map((d) => ({
    ...d,
    band: [d.lowerBound, d.upperBound] as [number, number],
  }));

  const meanBaseline = series.data.length > 0
    ? series.data.reduce((acc, curr) => acc + curr.baseline, 0) / series.data.length
    : 0;

  const customDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy) return null;
    if (payload.isFlagged) {
      return <circle cx={cx} cy={cy} r={4} fill="#C53030" stroke="#fff" strokeWidth={1} />;
    }
    return <circle cx={cx} cy={cy} r={3} fill="#1A6B5A" stroke="none" />;
  };

  // Find flagged session range for ReferenceArea
  const flaggedSessions = series.data.filter((d) => d.isFlagged);
  const flagRangeStart = flaggedSessions.length > 0 ? flaggedSessions[0].sessionNumber : null;
  const flagRangeEnd = flaggedSessions.length > 0 ? flaggedSessions[flaggedSessions.length - 1].sessionNumber : null;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={computedData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E0DC" vertical={false} />
          <XAxis
            dataKey="sessionNumber"
            tick={{ fontSize: 11, fill: '#5C5C5C' }}
            axisLine={{ stroke: '#E2E0DC' }}
            tickLine={false}
            label={{ value: 'Session', position: 'insideBottomRight', offset: -5, style: { fontSize: 11, fill: '#8A8A8A' } }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#5C5C5C' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ borderRadius: '6px', border: '1px solid #E2E0DC', fontSize: '12px' }}
            formatter={(value: any, name: any) => {
              if (name === 'band') return [null, null];
              return [typeof value === 'number' ? value.toFixed(1) : value, name];
            }}
            labelFormatter={(label) => `Session ${label}`}
          />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#5C5C5C' }} />

          {/* Flagged range highlight */}
          {flagRangeStart !== null && flagRangeEnd !== null && (
            <ReferenceArea
              x1={flagRangeStart}
              x2={flagRangeEnd}
              fill="#C53030"
              fillOpacity={0.06}
            />
          )}

          <ReferenceLine y={meanBaseline} stroke="#4A7FB5" strokeDasharray="6 3" strokeWidth={1} label={{ value: 'Baseline', position: 'insideTopRight', style: { fontSize: 10, fill: '#4A7FB5' } }} />

          <Area type="monotone" dataKey="band" name="±1σ Band" stroke="none" fill="#1A6B5A" fillOpacity={0.1} />
          <Line type="monotone" dataKey="baseline" name="Baseline" stroke="#8A8A8A" strokeDasharray="4 4" dot={false} strokeWidth={1.5} />
          <Line type="monotone" dataKey="value" name="Actual" stroke="#1A6B5A" strokeWidth={2} dot={customDot} activeDot={{ r: 5, stroke: '#1A6B5A', strokeWidth: 2 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
