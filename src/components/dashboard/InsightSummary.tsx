import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, MessageSquareHeart } from 'lucide-react';
import { usePatientData } from '../../hooks/usePatientData';
import { generateInsightSummary } from '../../utils/insightSummary';

export const InsightSummary: React.FC = () => {
  const { t } = useTranslation();
  const { currentData } = usePatientData();

  if (!currentData) return null;

  const { patient, anomalies } = currentData;
  const summary = generateInsightSummary(patient, anomalies, t);

  return (
    <div 
      className="insight-summary-card"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderLeft: '4px solid var(--color-accent)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
      }}
    >
      <div 
        style={{
          backgroundColor: 'var(--color-accent-light)',
          color: 'var(--color-accent)',
          padding: '12px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {summary.severity === 'stable' ? (
          <MessageSquareHeart size={24} />
        ) : (
          <Sparkles size={24} />
        )}
      </div>
      
      <div style={{ flex: 1, paddingTop: '2px' }}>
        <p 
          style={{ 
            fontSize: '17px', 
            lineHeight: '1.6',
            color: 'var(--color-text-primary)',
            margin: 0,
            fontWeight: 500
          }}
        >
          {summary.text}
        </p>
        
        {summary.severity === 'alert' && (
          <a 
            href="#anomaly-detection-panel" 
            style={{
              display: 'inline-block',
              marginTop: '10px',
              fontSize: '15px',
              color: 'var(--color-accent)',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            {t('summary.viewDetails', { defaultValue: 'View details' })} &rarr;
          </a>
        )}
      </div>
    </div>
  );
};
