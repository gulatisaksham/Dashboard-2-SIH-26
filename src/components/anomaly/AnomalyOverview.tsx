import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AnomalySeries } from '../../data/types';
import { DisclaimerBadge } from './DisclaimerBadge';
import { SmallMultipleChart } from './SmallMultipleChart';
import { DetailChart } from './DetailChart';
import { EmptyState } from '../ui/EmptyState';
import { CheckCircle2 } from 'lucide-react';

import { Skeleton } from '../ui/Skeleton';

interface AnomalyOverviewProps {
  anomalies: AnomalySeries[];
  isLoading?: boolean;
}

export const AnomalyOverview: React.FC<AnomalyOverviewProps> = ({ anomalies, isLoading }) => {
  const { t } = useTranslation();

  // Default to first anomaly with an active flag
  const defaultIdx = anomalies?.findIndex((s) => s.flag?.isActive) ?? -1;
  const [selectedIndex, setSelectedIndex] = useState(defaultIdx >= 0 ? defaultIdx : 0);

  if (!isLoading && (!anomalies || anomalies.length === 0)) return null;

  const selectedSeries = isLoading ? null : anomalies[selectedIndex];

  return (
    <section>
      <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '20px', fontWeight: 600, color: '#1A1A1A', marginBottom: '8px' }}>
        {t('anomaly.title')}
      </h2>
      <DisclaimerBadge />

      <div style={{
        marginTop: '16px',
        marginBottom: '16px',
      }}>
        {isLoading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
          }}>
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} style={{ height: '186px', borderRadius: '8px' }} />
            ))}
          </div>
        ) : !anomalies.some(s => s.flag?.isActive) ? (
          <EmptyState
            icon={<CheckCircle2 size={32} color="#276749" />}
            message="No anomalies detected this week — engagement is within the expected range across all categories."
            className="w-full"
            style={{ height: '186px', backgroundColor: '#F3F1EE', border: '1px solid #E2E0DC', borderRadius: '8px' }}
          />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
          }}>
            {anomalies.map((series, idx) => (
              <SmallMultipleChart
                key={series.type}
                data={series.data}
                label={series.label}
                isActive={!!series.flag?.isActive}
                isSelected={idx === selectedIndex}
                onClick={() => setSelectedIndex(idx)}
              />
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <Skeleton style={{ height: '300px', width: '100%', borderRadius: '12px' }} />
      ) : selectedSeries ? (
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', margin: 0, fontSize: '16px', fontWeight: 600, color: '#1A1A1A' }}>
              {selectedSeries.label}
            </h3>
            {selectedSeries.flag && (
              <span style={{
                fontSize: '10px',
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: selectedSeries.flag.severity === 'high' ? '#C53030'
                  : selectedSeries.flag.severity === 'moderate' ? '#B7791F' : '#8A8A8A',
                color: '#fff',
                textTransform: 'uppercase',
              }}>
                z={selectedSeries.flag.zScore}
              </span>
            )}
          </div>
          <DetailChart series={selectedSeries} />
        </div>
      ) : null}
    </section>
  );
};
