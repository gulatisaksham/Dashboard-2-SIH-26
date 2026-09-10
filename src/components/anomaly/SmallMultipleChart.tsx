import React, { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis } from 'recharts';
import type { AnomalyDataPoint } from '../../data/types';

interface SmallMultipleChartProps {
  data: AnomalyDataPoint[];
  label: string;
  isActive: boolean;
  isSelected: boolean;
  onClick: () => void;
}

export const SmallMultipleChart: React.FC<SmallMultipleChartProps> = ({ data, label, isActive, isSelected, onClick }) => {
  const computedData = useMemo(() => {
    return data.map(d => ({
      ...d,
      band: [d.lowerBound, d.upperBound]
    }));
  }, [data]);

  return (
    <div 
      onClick={onClick}
      style={{
        border: isSelected ? '2px solid var(--accent, #1A6B5A)' : '1px solid var(--border, #E2E0DC)',
        backgroundColor: isSelected ? 'var(--bgSurfaceAlt, #F3F1EE)' : '#fff',
        borderRadius: '8px',
        padding: '12px',
        cursor: 'pointer',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        transition: 'all 0.2s ease-in-out'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
        <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--textSecondary, #5C5C5C)' }}>{label}</h4>
        {isActive && (
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--alertRed, #C53030)' }} />
        )}
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <ComposedChart data={computedData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <XAxis 
            dataKey="sessionNumber" 
            tickFormatter={(val, i) => (i === 0 || i === data.length - 1) ? val : ''} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#8A8A8A' }}
          />
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Area type="monotone" dataKey="band" stroke="none" fill="#E2E0DC" fillOpacity={0.5} />
          <Line type="monotone" dataKey="baseline" stroke="#8A8A8A" strokeDasharray="3 3" dot={false} strokeWidth={1} />
          <Line type="monotone" dataKey="value" stroke={isActive ? "var(--alertRed, #C53030)" : "var(--accent, #1A6B5A)"} dot={false} strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
