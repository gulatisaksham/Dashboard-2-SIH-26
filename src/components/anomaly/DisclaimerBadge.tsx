import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const DisclaimerBadge: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '8px 12px',
      backgroundColor: 'var(--bgSurfaceAlt, #F3F1EE)',
      borderLeft: '4px solid var(--accent, #1A6B5A)',
      color: 'var(--textMuted, #8A8A8A)',
      fontSize: '0.875rem',
      borderRadius: '4px',
      marginBottom: '16px'
    }}>
      <AlertTriangle size={16} style={{ marginRight: '8px', color: 'var(--alertAmber, #B7791F)' }} />
      <span style={{ fontFamily: 'Inter, sans-serif' }}>{t('anomaly.disclaimer')}</span>
    </div>
  );
};
