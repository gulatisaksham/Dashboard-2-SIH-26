// ============================================================
// MemoryLane — Core Data Types
// ============================================================

/** Game categories tracked in the dashboard */
export type GameCategory =
  | 'reminiscence'
  | 'daily-routine'
  | 'attention'
  | 'pattern-recognition';

/** Risk assessment derived from engagement trends */
export type RiskTier = 'stable' | 'monitor' | 'attention-needed';

/** Alert delivery status */
export type AlertStatus = 'sent' | 'acknowledged' | 'missed';

/** Alert type categories */
export type AlertType = 'medicine' | 'hydration' | 'appointment' | 'engagement';

/** Anomaly type flags */
export type AnomalyType =
  | 'face-recognition-delay'
  | 'place-recognition-confusion'
  | 'sequence-recall-degrading'
  | 'attention-pattern-variance';

/** Severity level for anomaly flags */
export type AnomalySeverity = 'low' | 'moderate' | 'high';

// ============================================================
// Patient
// ============================================================

export interface Patient {
  id: string;
  name: string;
  initials: string;
  age: number;
  avatarColor: string;
  riskTier: RiskTier;
  daysSinceLastSession: number;
  totalSessions: number;
  enrolledDate: string;
}

// ============================================================
// Adaptive Difficulty (SM-2 style)
// ============================================================

export interface AdaptiveDifficulty {
  /** Current difficulty level (1–5) */
  level: number;
  /** Ease factor (1.3–2.5), higher = easier recall */
  easeFactor: number;
  /** Days until next scheduled session for this category */
  interval: number;
  /** Number of consecutive correct repetitions */
  repetitions: number;
}

// ============================================================
// Game Session Data
// ============================================================

export interface GameSession {
  sessionId: string;
  sessionNumber: number;
  date: string;
  category: GameCategory;
  /** Response time in milliseconds */
  responseTimeMs: number;
  /** Recall accuracy as percentage (0–100) */
  accuracyPercent: number;
  /** Dwell time on prompts in milliseconds */
  dwellTimeMs: number;
  /** Adaptive difficulty state at end of session */
  difficulty: AdaptiveDifficulty;
}

// ============================================================
// Anomaly Detection
// ============================================================

export interface AnomalyFlag {
  type: AnomalyType;
  severity: AnomalySeverity;
  /** Human-readable description of the pattern signal */
  description: string;
  /** Session range where the anomaly is detected */
  sessionRange: [number, number];
  /** Z-score or threshold value that triggered the flag */
  zScore: number;
  /** Is this anomaly currently active/flagged? */
  isActive: boolean;
}

export interface AnomalyDataPoint {
  sessionNumber: number;
  date: string;
  value: number;
  baseline: number;
  /** Upper bound of deviation band */
  upperBound: number;
  /** Lower bound of deviation band */
  lowerBound: number;
  /** Rolling z-score at this point */
  zScore: number;
  /** Whether this point crosses the anomaly threshold */
  isFlagged: boolean;
}

export interface AnomalySeries {
  type: AnomalyType;
  label: string;
  data: AnomalyDataPoint[];
  flag: AnomalyFlag | null;
}

// ============================================================
// Caregiver Alerts
// ============================================================

export interface CaregiverAlert {
  id: string;
  type: AlertType;
  message: string;
  status: AlertStatus;
  scheduledAt: string;
  acknowledgedAt?: string;
}

export interface AlertThreshold {
  metric: string;
  condition: string;
  threshold: number;
  currentValue: number;
  isTriggered: boolean;
}

// ============================================================
// Complete Patient Data Bundle
// ============================================================

export interface PatientData {
  patient: Patient;
  sessions: Record<GameCategory, GameSession[]>;
  anomalies: AnomalySeries[];
  alerts: CaregiverAlert[];
  thresholds: AlertThreshold[];
}

/** Labels and icons for each game category */
export const CATEGORY_META: Record<GameCategory, { label: string; i18nKey: string; icon: string }> = {
  'reminiscence': { label: 'Reminiscence', i18nKey: 'categories.reminiscence', icon: 'Camera' },
  'daily-routine': { label: 'Daily Routine Recall', i18nKey: 'categories.dailyRoutine', icon: 'CalendarClock' },
  'attention': { label: 'Attention & Concentration', i18nKey: 'categories.attention', icon: 'Focus' },
  'pattern-recognition': { label: 'Pattern Recognition', i18nKey: 'categories.patternRecognition', icon: 'Puzzle' },
};

export const ANOMALY_META: Record<AnomalyType, { label: string; i18nKey: string }> = {
  'face-recognition-delay': { label: 'Face/Person Recognition Delay', i18nKey: 'anomalies.faceDelay' },
  'place-recognition-confusion': { label: 'Place Recognition Confusion', i18nKey: 'anomalies.placeConfusion' },
  'sequence-recall-degrading': { label: 'Event/Sequence Recall Degrading', i18nKey: 'anomalies.sequenceRecall' },
  'attention-pattern-variance': { label: 'Attention Pattern Variance', i18nKey: 'anomalies.attentionVariance' },
};
