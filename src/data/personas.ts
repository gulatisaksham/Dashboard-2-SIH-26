// ============================================================
// MemoryLane — Patient Personas
// ============================================================
// Four synthetic personas with distinct behavioral arcs for demo.
// ============================================================

import type { Patient, PatientData, RiskTier } from './types';
import { generatePatientData, type PersonaConfig, type GeneratedPatientData } from './generator';
import { generateAlerts, generateThresholds } from './alerts';

// ── Persona Configurations ───────────────────────────────────

const PERSONA_CONFIGS: PersonaConfig[] = [
  // 1. KAMALA DEVI — Stable across all categories
  {
    id: 'p-stable',
    name: 'Kamala Devi',
    age: 72,
    avatarColor: '#1A6B5A',
    sessionCount: 35,
    startDate: '2026-06-01',
    seed: 42,
    categories: {
      'reminiscence': {
        baseResponseTime: 1200, responseTimeStd: 80,
        baseAccuracy: 78, accuracyStd: 5,
        baseDwellTime: 2800, dwellTimeStd: 200,
      },
      'daily-routine': {
        baseResponseTime: 1000, responseTimeStd: 90,
        baseAccuracy: 82, accuracyStd: 4,
        baseDwellTime: 2400, dwellTimeStd: 180,
      },
      'attention': {
        baseResponseTime: 900, responseTimeStd: 70,
        baseAccuracy: 80, accuracyStd: 5,
        baseDwellTime: 2200, dwellTimeStd: 150,
      },
      'pattern-recognition': {
        baseResponseTime: 1100, responseTimeStd: 85,
        baseAccuracy: 75, accuracyStd: 6,
        baseDwellTime: 2600, dwellTimeStd: 200,
      },
    },
    anomalyChecks: [
      { type: 'face-recognition-delay', label: 'Face/Person Recognition Delay', category: 'reminiscence', metric: 'responseTimeMs', invert: false },
      { type: 'place-recognition-confusion', label: 'Place Recognition Confusion', category: 'reminiscence', metric: 'accuracyPercent', invert: true },
      { type: 'sequence-recall-degrading', label: 'Event/Sequence Recall Degrading', category: 'daily-routine', metric: 'accuracyPercent', invert: true },
      { type: 'attention-pattern-variance', label: 'Attention Pattern Variance', category: 'attention', metric: 'responseTimeMs', invert: false },
    ],
  },

  // 2. RAJESH BARUA — Emerging face-recognition delay
  {
    id: 'p-face-delay',
    name: 'Rajesh Barua',
    age: 68,
    avatarColor: '#4A7FB5',
    sessionCount: 40,
    startDate: '2026-05-15',
    seed: 137,
    categories: {
      'reminiscence': {
        baseResponseTime: 1150, responseTimeStd: 70,
        baseAccuracy: 76, accuracyStd: 5,
        baseDwellTime: 2700, dwellTimeStd: 180,
        // Key trend: response time increasing on people-photo prompts
        responseTimeDrift: 450,
        responseTimeInflection: { point: 20, steepness: 0.3, magnitude: 200 },
      },
      'daily-routine': {
        baseResponseTime: 950, responseTimeStd: 80,
        baseAccuracy: 80, accuracyStd: 4,
        baseDwellTime: 2300, dwellTimeStd: 160,
      },
      'attention': {
        baseResponseTime: 880, responseTimeStd: 65,
        baseAccuracy: 82, accuracyStd: 4,
        baseDwellTime: 2100, dwellTimeStd: 140,
      },
      'pattern-recognition': {
        baseResponseTime: 1050, responseTimeStd: 75,
        baseAccuracy: 77, accuracyStd: 5,
        baseDwellTime: 2500, dwellTimeStd: 190,
      },
    },
    anomalyChecks: [
      { type: 'face-recognition-delay', label: 'Face/Person Recognition Delay', category: 'reminiscence', metric: 'responseTimeMs', invert: false },
      { type: 'place-recognition-confusion', label: 'Place Recognition Confusion', category: 'reminiscence', metric: 'accuracyPercent', invert: true },
      { type: 'sequence-recall-degrading', label: 'Event/Sequence Recall Degrading', category: 'daily-routine', metric: 'accuracyPercent', invert: true },
      { type: 'attention-pattern-variance', label: 'Attention Pattern Variance', category: 'attention', metric: 'responseTimeMs', invert: false },
    ],
  },

  // 3. MEERA SHARMA — Declining routine recall
  {
    id: 'p-routine-decline',
    name: 'Meera Sharma',
    age: 75,
    avatarColor: '#B7791F',
    sessionCount: 38,
    startDate: '2026-05-20',
    seed: 256,
    categories: {
      'reminiscence': {
        baseResponseTime: 1300, responseTimeStd: 90,
        baseAccuracy: 74, accuracyStd: 6,
        baseDwellTime: 3000, dwellTimeStd: 220,
      },
      'daily-routine': {
        baseResponseTime: 1050, responseTimeStd: 85,
        baseAccuracy: 85, accuracyStd: 4,
        baseDwellTime: 2500, dwellTimeStd: 170,
        // Key trend: accuracy degrading with inflection
        accuracyDrift: -15,
        accuracyInflection: { point: 20, steepness: 0.4, magnitude: 18 },
      },
      'attention': {
        baseResponseTime: 920, responseTimeStd: 75,
        baseAccuracy: 79, accuracyStd: 5,
        baseDwellTime: 2300, dwellTimeStd: 160,
      },
      'pattern-recognition': {
        baseResponseTime: 1150, responseTimeStd: 80,
        baseAccuracy: 73, accuracyStd: 6,
        baseDwellTime: 2700, dwellTimeStd: 200,
      },
    },
    anomalyChecks: [
      { type: 'face-recognition-delay', label: 'Face/Person Recognition Delay', category: 'reminiscence', metric: 'responseTimeMs', invert: false },
      { type: 'place-recognition-confusion', label: 'Place Recognition Confusion', category: 'reminiscence', metric: 'accuracyPercent', invert: true },
      { type: 'sequence-recall-degrading', label: 'Event/Sequence Recall Degrading', category: 'daily-routine', metric: 'accuracyPercent', invert: true },
      { type: 'attention-pattern-variance', label: 'Attention Pattern Variance', category: 'attention', metric: 'responseTimeMs', invert: false },
    ],
  },

  // 4. ARUN GOGOI — Noisy but normal (false-alarm control)
  {
    id: 'p-noisy-normal',
    name: 'Arun Gogoi',
    age: 70,
    avatarColor: '#8B6BB5',
    sessionCount: 32,
    startDate: '2026-06-10',
    seed: 404,
    categories: {
      'reminiscence': {
        baseResponseTime: 1250, responseTimeStd: 150,
        baseAccuracy: 72, accuracyStd: 10,
        baseDwellTime: 2900, dwellTimeStd: 300,
      },
      'daily-routine': {
        baseResponseTime: 1080, responseTimeStd: 140,
        baseAccuracy: 78, accuracyStd: 9,
        baseDwellTime: 2600, dwellTimeStd: 280,
      },
      'attention': {
        baseResponseTime: 950, responseTimeStd: 130,
        baseAccuracy: 76, accuracyStd: 9,
        baseDwellTime: 2400, dwellTimeStd: 250,
      },
      'pattern-recognition': {
        baseResponseTime: 1200, responseTimeStd: 145,
        baseAccuracy: 70, accuracyStd: 10,
        baseDwellTime: 2800, dwellTimeStd: 300,
      },
    },
    anomalyChecks: [
      { type: 'face-recognition-delay', label: 'Face/Person Recognition Delay', category: 'reminiscence', metric: 'responseTimeMs', invert: false },
      { type: 'place-recognition-confusion', label: 'Place Recognition Confusion', category: 'reminiscence', metric: 'accuracyPercent', invert: true },
      { type: 'sequence-recall-degrading', label: 'Event/Sequence Recall Degrading', category: 'daily-routine', metric: 'accuracyPercent', invert: true },
      { type: 'attention-pattern-variance', label: 'Attention Pattern Variance', category: 'attention', metric: 'responseTimeMs', invert: false },
    ],
  },
];

// ── Risk Tier Calculation ────────────────────────────────────

function computeRiskTier(anomalies: GeneratedPatientData['anomalies']): RiskTier {
  const activeFlags = anomalies.filter(a => a.flag?.isActive);
  if (activeFlags.length === 0) return 'stable';
  const hasHigh = activeFlags.some(a => a.flag?.severity === 'high');
  const hasModerate = activeFlags.some(a => a.flag?.severity === 'moderate');
  if (hasHigh || activeFlags.length >= 2) return 'attention-needed';
  if (hasModerate) return 'monitor';
  return 'monitor';
}

// ── Build All Patient Data ───────────────────────────────────

function buildPatientData(config: PersonaConfig): PatientData {
  const generated = generatePatientData(config);
  const riskTier = computeRiskTier(generated.anomalies);

  // Calculate days since last session
  const allSessions = Object.values(generated.sessions).flat();
  const lastDate = allSessions.reduce((latest, s) => s.date > latest ? s.date : latest, '2026-01-01');
  const daysSince = Math.max(0, Math.floor((new Date('2026-09-05').getTime() - new Date(lastDate).getTime()) / 86400000));

  const patient: Patient = {
    id: config.id,
    name: config.name,
    initials: config.name.split(' ').map(n => n[0]).join('').toUpperCase(),
    age: config.age,
    avatarColor: config.avatarColor,
    riskTier,
    daysSinceLastSession: daysSince,
    totalSessions: config.sessionCount,
    enrolledDate: config.startDate,
  };

  const alerts = generateAlerts(config.id, config.seed);
  const thresholds = generateThresholds(generated, config.id);

  return {
    patient,
    sessions: generated.sessions,
    anomalies: generated.anomalies,
    alerts,
    thresholds,
  };
}

// ── Exported Data ────────────────────────────────────────────

let _cachedData: PatientData[] | null = null;

export function getAllPatientData(): PatientData[] {
  if (!_cachedData) {
    _cachedData = PERSONA_CONFIGS.map(buildPatientData);
  }
  return _cachedData;
}

export function getPatientById(id: string): PatientData | undefined {
  return getAllPatientData().find(p => p.patient.id === id);
}

export function getDefaultPatientId(): string {
  return 'p-face-delay'; // Rajesh — most interesting anomaly for default view
}
