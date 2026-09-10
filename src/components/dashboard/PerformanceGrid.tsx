import React from 'react';
import { useTranslation } from 'react-i18next';
import { CognitivePanel } from './CognitivePanel';
import { InsightSummary } from './InsightSummary';
import type { GameCategory, GameSession } from '../../data/types';
import { EmptyState } from '../ui/EmptyState';
import { Puzzle } from 'lucide-react';

import { Skeleton } from '../ui/Skeleton';

interface PerformanceGridProps {
  sessions: Record<GameCategory, GameSession[]>;
  isLoading?: boolean;
}

export const PerformanceGrid: React.FC<PerformanceGridProps> = ({ sessions, isLoading }) => {
  const { t } = useTranslation();

  return (
    <section>
      <InsightSummary />
      <h2 style={{ fontFamily: 'Fraunces, serif', marginBottom: '16px', fontSize: '24px', color: '#1A1A1A' }}>
        {t('dashboard.title')}
      </h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '16px' 
      }}>
        {isLoading ? (
          <>
            <Skeleton style={{ height: '320px', borderRadius: '16px' }} />
            <Skeleton style={{ height: '320px', borderRadius: '16px' }} />
            <Skeleton style={{ height: '320px', borderRadius: '16px' }} />
            <Skeleton style={{ height: '320px', borderRadius: '16px' }} />
          </>
        ) : Object.keys(sessions).length === 0 ? (
          <EmptyState
            icon={<Puzzle size={32} color="#8A8A8A" />}
            message="No active sessions to display."
            style={{ gridColumn: '1 / -1' }}
          />
        ) : (
          Object.entries(sessions).map(([category, catSessions]) => (
            <CognitivePanel 
              key={category} 
              category={category as GameCategory} 
              sessions={catSessions} 
            />
          ))
        )}
      </div>
    </section>
  );
};
