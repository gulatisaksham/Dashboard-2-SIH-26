import type { GeneratedPatientData } from './generator';
import type { CaregiverAlert, AlertThreshold, AlertType, AlertStatus } from './types';

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateAlerts(patientId: string, seed: number): CaregiverAlert[] {
  const random = mulberry32(seed + 999);
  const alerts: CaregiverAlert[] = [];

  const types: AlertType[] = ['medicine', 'hydration', 'appointment', 'engagement'];
  const statuses: AlertStatus[] = ['sent', 'acknowledged', 'missed'];

  const messages: Record<AlertType, string[]> = {
    medicine: [
      'Morning medication — Donepezil 10mg',
      'Evening medication — Memantine 5mg',
      'Afternoon medication — Rivastigmine 4.6mg patch',
    ],
    hydration: [
      'Hydration reminder — 200ml water',
      'Hydration reminder — 250ml juice',
      'Hydration reminder — warm tea, 150ml',
    ],
    appointment: [
      'Dr. Borah follow-up appointment',
      'Physiotherapy session — GMCH',
      'Cognitive assessment — Dr. Das',
    ],
    engagement: [
      '3 sessions below baseline — engagement review needed',
      'No session completed in 4 days',
      'Reminiscence accuracy declining — schedule family call',
    ],
  };

  const numAlerts = 8 + Math.floor(random() * 5);
  const baseDate = new Date('2026-09-05T12:00:00Z');

  for (let i = 0; i < numAlerts; i++) {
    const type = types[Math.floor(random() * types.length)];
    const status = statuses[Math.floor(random() * statuses.length)];
    const message = messages[type][Math.floor(random() * messages[type].length)];

    const daysOffset = Math.floor(random() * 30);
    const hoursOffset = Math.floor(random() * 24);

    const scheduledAt = new Date(
      baseDate.getTime() - daysOffset * 86400000 - hoursOffset * 3600000
    );
    let acknowledgedAt: string | undefined;

    if (status === 'acknowledged') {
      const ackMinutes = 5 + Math.floor(random() * 55);
      acknowledgedAt = new Date(scheduledAt.getTime() + ackMinutes * 60000).toISOString();
    }

    alerts.push({
      id: `alert_${patientId}_${i}`,
      type,
      message,
      status,
      scheduledAt: scheduledAt.toISOString(),
      acknowledgedAt,
    });
  }

  return alerts.sort(
    (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
  );
}

export function generateThresholds(
  generatedData: GeneratedPatientData,
  _patientId: string
): AlertThreshold[] {

  const thresholds: AlertThreshold[] = [];

  // Check daily-routine accuracy
  const routineSessions = generatedData.sessions['daily-routine'] || [];
  const last3Routine = routineSessions.slice(-3);

  const baselineAccuracy =
    routineSessions.length > 5
      ? routineSessions.slice(0, 5).reduce((s, x) => s + x.accuracyPercent, 0) / 5
      : 80;

  thresholds.push({
    metric: 'Routine Recall Accuracy',
    condition: '3 consecutive sessions below baseline',
    threshold: 3,
    currentValue: last3Routine.filter((s) => s.accuracyPercent < baselineAccuracy).length,
    isTriggered: last3Routine.every((s) => s.accuracyPercent < baselineAccuracy),
  });

  // Check reminiscence response time
  const remSessions = generatedData.sessions['reminiscence'] || [];
  const last3Rem = remSessions.slice(-3);
  const baselineRT =
    remSessions.length > 5
      ? remSessions.slice(0, 5).reduce((s, x) => s + x.responseTimeMs, 0) / 5
      : 1200;
  const recentAbove = last3Rem.filter((s) => s.responseTimeMs > baselineRT * 1.3).length;

  thresholds.push({
    metric: 'Recognition Response Time',
    condition: '3 sessions 30%+ above baseline',
    threshold: 3,
    currentValue: recentAbove,
    isTriggered: recentAbove >= 3,
  });

  // Check attention consistency
  const attSessions = generatedData.sessions['attention'] || [];
  const last5Att = attSessions.slice(-5);
  const attAvg =
    last5Att.length > 0
      ? last5Att.reduce((s, x) => s + x.accuracyPercent, 0) / last5Att.length
      : 80;

  thresholds.push({
    metric: 'Attention Accuracy',
    condition: 'Average below 70% over 5 sessions',
    threshold: 70,
    currentValue: Math.round(attAvg * 10) / 10,
    isTriggered: attAvg < 70,
  });

  return thresholds;
}
