import type { Patient, AnomalySeries, AnomalyFlag } from '../data/types';
import { ANOMALY_META } from '../data/types';
import type { TFunction } from 'i18next';

export function generateInsightSummary(patient: Patient, anomalies: AnomalySeries[], t: TFunction): { text: string, severity: 'stable' | 'alert' } {
  const activeFlags = anomalies
    .map(a => a.flag)
    .filter((f): f is AnomalyFlag => f !== null && f.isActive);

  if (patient.riskTier === 'stable' && activeFlags.length === 0) {
    return {
      text: t('summary.stable', { 
        patientName: patient.name,
        defaultValue: `This week, ${patient.name}'s engagement is stable across all categories.` 
      }),
      severity: 'stable'
    };
  }

  if (activeFlags.length > 0) {
    const severityOrder = { high: 3, moderate: 2, low: 1 };
    const mostSevere = activeFlags.reduce((prev, current) => 
      severityOrder[current.severity] > severityOrder[prev.severity] ? current : prev
    );

    const sessionCount = mostSevere.sessionRange[1] - mostSevere.sessionRange[0] + 1;
    const meta = ANOMALY_META[mostSevere.type];
    
    // We pass the translated anomaly label, ensuring lowercase for English if possible, 
    // but the translation key works best as it is handled by i18next.
    const rawLabel = meta ? t(meta.i18nKey) : mostSevere.description;
    // Lowercase it for the template if it's the beginning of the sentence in English, but here it's embedded in the middle.
    // Actually, in some languages lowercasing might not make sense, but it's safe to just pass the string.
    const anomalyLabel = rawLabel.toLowerCase();

    return {
      text: t('summary.anomalyDetected', { 
        patientName: patient.name, 
        anomalyLabel: anomalyLabel, 
        sessionCount: sessionCount,
        defaultValue: `${patient.name} has shown a new pattern — ${mostSevere.description.toLowerCase()} over the last ${sessionCount} sessions, worth a gentle check-in.`
      }),
      severity: 'alert'
    };
  }

  // Fallback if risk tier is not stable but no active flags (edge case)
  return {
    text: t('summary.stable', { 
      patientName: patient.name,
      defaultValue: `This week, ${patient.name}'s engagement is stable across all categories.`
    }),
    severity: 'stable'
  };
}
