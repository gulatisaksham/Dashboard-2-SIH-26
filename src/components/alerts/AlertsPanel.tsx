import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pill, Droplets, Calendar, AlertTriangle, CheckCheck, ChevronDown } from 'lucide-react';
import type { CaregiverAlert, AlertThreshold, AlertStatus } from '../../data/types';
import { EmptyState } from '../ui/EmptyState';
import { Skeleton } from '../ui/Skeleton';

interface AlertsPanelProps {
  alerts: CaregiverAlert[];
  thresholds: AlertThreshold[];
  isLoading?: boolean;
  onUpdateStatus?: (alertId: string, newStatus: AlertStatus) => void;
}

const getAlertIcon = (type: CaregiverAlert['type']) => {
  switch (type) {
    case 'medicine': return <Pill size={15} color="#1A6B5A" />;
    case 'hydration': return <Droplets size={15} color="#4A7FB5" />;
    case 'appointment': return <Calendar size={15} color="#B7791F" />;
    case 'engagement': return <AlertTriangle size={15} color="#C53030" />;
    default: return <AlertTriangle size={15} color="#8A8A8A" />;
  }
};

const StatusBadge = ({ alertId, status, onUpdate }: { alertId: string, status: AlertStatus, onUpdate?: (id: string, st: AlertStatus) => void }) => {
  const colors: Record<string, string> = {
    sent: '#8A8A8A',
    acknowledged: '#276749',
    missed: '#C53030',
  };

  if (!onUpdate) {
    return (
      <span style={{
        backgroundColor: colors[status] || '#8A8A8A',
        color: 'white',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '10px',
        textTransform: 'uppercase',
        fontWeight: 600,
        letterSpacing: '0.3px',
      }}>
        {status}
      </span>
    );
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <select
        value={status}
        onChange={(e) => onUpdate(alertId, e.target.value as AlertStatus)}
        style={{
          appearance: 'none',
          backgroundColor: colors[status] || '#8A8A8A',
          color: 'white',
          padding: '2px 20px 2px 6px',
          borderRadius: '4px',
          fontSize: '10px',
          textTransform: 'uppercase',
          fontWeight: 600,
          letterSpacing: '0.3px',
          border: 'none',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        <option value="sent">SENT</option>
        <option value="acknowledged">ACKNOWLEDGED</option>
        <option value="missed">MISSED</option>
      </select>
      <ChevronDown 
        size={10} 
        color="white" 
        style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} 
      />
    </div>
  );
};

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, thresholds, isLoading, onUpdateStatus }) => {
  const { t } = useTranslation();

  return (
    <section>
      <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '20px', fontWeight: 600, color: '#1A1A1A', marginBottom: '16px' }}>
        {t('alerts.title')}
      </h2>

      {isLoading ? (
        <Skeleton style={{ width: '100%', height: '200px', marginBottom: '24px' }} />
      ) : alerts.length === 0 ? (
        <EmptyState
          icon={<CheckCheck size={32} color="#8A8A8A" />}
          message="No pending reminders right now."
          style={{ marginBottom: '24px', backgroundColor: '#FFFFFF', borderRadius: '6px' }}
        />
      ) : (
        <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #E2E0DC', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F3F1EE', borderBottom: '1px solid #E2E0DC', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#5C5C5C', letterSpacing: '0.3px' }}>{t('alerts.type')}</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#5C5C5C', letterSpacing: '0.3px' }}>{t('alerts.message')}</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#5C5C5C', letterSpacing: '0.3px' }}>{t('alerts.scheduled')}</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#5C5C5C', letterSpacing: '0.3px' }}>{t('alerts.status')}</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert, idx) => (
                <tr key={alert.id} style={{
                  backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F3F1EE',
                  height: '36px',
                  borderBottom: '1px solid #E2E0DC',
                }}>
                  <td style={{ padding: '6px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', backgroundColor: '#E6F2EF', borderRadius: '4px' }}>
                      {getAlertIcon(alert.type)}
                    </div>
                  </td>
                  <td style={{ padding: '6px 12px', color: '#1A1A1A' }}>{alert.message}</td>
                  <td style={{ padding: '6px 12px', color: '#5C5C5C', whiteSpace: 'nowrap' }}>
                    {new Date(alert.scheduledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}{' '}
                    {new Date(alert.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '6px 12px' }}>
                    <StatusBadge alertId={alert.id} status={alert.status} onUpdate={onUpdateStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Threshold Explainer */}
      <div style={{ padding: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E2E0DC', borderRadius: '6px' }}>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#1A1A1A' }}>
          {t('alerts.thresholdTitle')}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {thresholds.map((threshold, idx) => (
            <div key={idx} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: idx < thresholds.length - 1 ? '12px' : 0,
              borderBottom: idx < thresholds.length - 1 ? '1px solid #E2E0DC' : 'none',
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: threshold.isTriggered ? '#C53030' : '#1A1A1A' }}>
                  {threshold.metric}: {threshold.condition}
                </div>
                <div style={{ fontSize: '11px', color: '#5C5C5C', marginTop: '2px' }}>
                  Current: {threshold.currentValue} / {threshold.threshold}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: i < threshold.currentValue
                      ? (threshold.isTriggered ? '#C53030' : '#B7791F')
                      : '#E2E0DC',
                    borderRadius: '2px',
                  }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
