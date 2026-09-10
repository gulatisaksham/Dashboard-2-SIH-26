// ============================================================
// MemoryLane — Synthetic Patient Data Generator
// ============================================================
// Deterministic, seeded PRNG-based generator producing session-by-session
// time series with SM-2 adaptive difficulty, trend injection, and
// rolling z-score anomaly detection.
// ============================================================

import type {
  GameCategory,
  GameSession,
  AdaptiveDifficulty,
  AnomalyDataPoint,
  AnomalySeries,
  AnomalyFlag,
  AnomalyType,
  AnomalySeverity,
} from './types';

// ── Seeded PRNG (Mulberry32) ──────────────────────────────────
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Gaussian noise via Box-Muller */
function gaussianNoise(rng: () => number, mean = 0, stdDev = 1): number {
  const u1 = rng();
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2);
  return z * stdDev + mean;
}

// ── SM-2 Spaced Repetition Simulator ─────────────────────────
function initDifficulty(): AdaptiveDifficulty {
  return { level: 1, easeFactor: 2.5, interval: 1, repetitions: 0 };
}

function updateDifficulty(prev: AdaptiveDifficulty, quality: number): AdaptiveDifficulty {
  // quality: 0–5 scale (mapped from accuracy)
  const q = Math.max(0, Math.min(5, Math.round(quality)));
  let { easeFactor, interval, repetitions, level } = prev;

  if (q >= 3) {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.round(interval * easeFactor);

    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

    // Level increases gradually with sustained good performance
    if (repetitions > 4 && level < 5) level = Math.min(5, level + 1);
  } else {
    repetitions = 0;
    interval = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
    if (level > 1) level = Math.max(1, level - 1);
  }

  return {
    level: Math.min(5, Math.max(1, level)),
    easeFactor: Math.round(easeFactor * 100) / 100,
    interval: Math.min(60, Math.max(1, interval)),
    repetitions,
  };
}

// ── Trend Functions ──────────────────────────────────────────

/** Linear drift: adds a slope over session indices */
function linearDrift(sessionIndex: number, totalSessions: number, magnitude: number): number {
  return (sessionIndex / totalSessions) * magnitude;
}

/** Sigmoid inflection: creates an S-curve change point */
function sigmoidInflection(
  sessionIndex: number,
  inflectionPoint: number,
  steepness: number,
  magnitude: number
): number {
  return magnitude / (1 + Math.exp(-steepness * (sessionIndex - inflectionPoint)));
}

// ── Rolling Statistics ───────────────────────────────────────

function rollingMean(values: number[], windowSize: number): number[] {
  return values.map((_, i) => {
    const start = Math.max(0, i - windowSize + 1);
    const window = values.slice(start, i + 1);
    return window.reduce((a, b) => a + b, 0) / window.length;
  });
}

function rollingStd(values: number[], windowSize: number): number[] {
  const means = rollingMean(values, windowSize);
  return values.map((_, i) => {
    const start = Math.max(0, i - windowSize + 1);
    const window = values.slice(start, i + 1);
    const mean = means[i];
    const variance = window.reduce((acc, v) => acc + (v - mean) ** 2, 0) / Math.max(window.length - 1, 1);
    return Math.sqrt(variance);
  });
}

function computeZScores(values: number[], windowSize: number): number[] {
  const means = rollingMean(values, windowSize);
  const stds = rollingStd(values, windowSize);
  return values.map((v, i) => {
    const std = stds[i];
    if (std < 0.001) return 0;
    return (v - means[i]) / std;
  });
}

// ── Date Generator ───────────────────────────────────────────

function generateDates(count: number, startDate: string, rng: () => number): string[] {
  const dates: string[] = [];
  let current = new Date(startDate);
  for (let i = 0; i < count; i++) {
    dates.push(current.toISOString().split('T')[0]);
    // 1–4 day gaps between sessions
    current = new Date(current.getTime() + (1 + Math.floor(rng() * 3)) * 86400000);
  }
  return dates;
}

// ── Session Generator per Category ───────────────────────────

interface CategoryConfig {
  baseResponseTime: number;
  responseTimeStd: number;
  baseAccuracy: number;
  accuracyStd: number;
  baseDwellTime: number;
  dwellTimeStd: number;
  // Trend injection
  responseTimeDrift?: number; // Linear drift magnitude (ms)
  accuracyDrift?: number; // Linear drift on accuracy (%)
  accuracyInflection?: { point: number; steepness: number; magnitude: number };
  responseTimeInflection?: { point: number; steepness: number; magnitude: number };
}

export function generateCategorySessions(
  config: CategoryConfig,
  sessionCount: number,
  dates: string[],
  category: GameCategory,
  seed: number
): GameSession[] {
  const rng = mulberry32(seed);
  let difficulty = initDifficulty();
  const sessions: GameSession[] = [];

  for (let i = 0; i < sessionCount; i++) {
    // Base values with noise
    let responseTime = config.baseResponseTime + gaussianNoise(rng, 0, config.responseTimeStd);
    let accuracy = config.baseAccuracy + gaussianNoise(rng, 0, config.accuracyStd);
    let dwellTime = config.baseDwellTime + gaussianNoise(rng, 0, config.dwellTimeStd);

    // Apply trends
    if (config.responseTimeDrift) {
      responseTime += linearDrift(i, sessionCount, config.responseTimeDrift);
    }
    if (config.accuracyDrift) {
      accuracy += linearDrift(i, sessionCount, config.accuracyDrift);
    }
    if (config.accuracyInflection) {
      accuracy -= sigmoidInflection(
        i,
        config.accuracyInflection.point,
        config.accuracyInflection.steepness,
        config.accuracyInflection.magnitude
      );
    }
    if (config.responseTimeInflection) {
      responseTime += sigmoidInflection(
        i,
        config.responseTimeInflection.point,
        config.responseTimeInflection.steepness,
        config.responseTimeInflection.magnitude
      );
    }

    // Clamp values
    responseTime = Math.max(200, Math.round(responseTime));
    accuracy = Math.max(5, Math.min(100, Math.round(accuracy * 10) / 10));
    dwellTime = Math.max(300, Math.round(dwellTime));

    // Update SM-2 difficulty based on accuracy
    const quality = (accuracy / 100) * 5; // Map 0–100% to 0–5
    difficulty = updateDifficulty(difficulty, quality);

    sessions.push({
      sessionId: `s-${category}-${i + 1}`,
      sessionNumber: i + 1,
      date: dates[i] || dates[dates.length - 1],
      category,
      responseTimeMs: responseTime,
      accuracyPercent: accuracy,
      dwellTimeMs: dwellTime,
      difficulty: { ...difficulty },
    });
  }

  return sessions;
}

// ── Anomaly Series Generator ─────────────────────────────────

const Z_SCORE_THRESHOLD = 1.8;
const ROLLING_WINDOW = 5;

export function generateAnomalySeries(
  type: AnomalyType,
  label: string,
  sessions: GameSession[],
  metric: 'responseTimeMs' | 'accuracyPercent',
  invert: boolean = false // true if lower values are worse (accuracy)
): AnomalySeries {
  const values = sessions.map((s) => s[metric]);
  const dates = sessions.map((s) => s.date);
  const sessionNums = sessions.map((s) => s.sessionNumber);

  // Compute baseline (mean of first ROLLING_WINDOW sessions)
  const baselineValues = values.slice(0, ROLLING_WINDOW);
  const baselineMean = baselineValues.reduce((a, b) => a + b, 0) / baselineValues.length;
  const baselineStd = Math.sqrt(
    baselineValues.reduce((acc, v) => acc + (v - baselineMean) ** 2, 0) / Math.max(baselineValues.length - 1, 1)
  );

  const zScores = computeZScores(values, ROLLING_WINDOW);

  const data: AnomalyDataPoint[] = values.map((v, i) => {
    const zs = zScores[i];
    const isFlagged = invert ? zs < -Z_SCORE_THRESHOLD : zs > Z_SCORE_THRESHOLD;
    return {
      sessionNumber: sessionNums[i],
      date: dates[i],
      value: v,
      baseline: baselineMean,
      upperBound: baselineMean + baselineStd,
      lowerBound: baselineMean - baselineStd,
      zScore: Math.round(zs * 100) / 100,
      isFlagged,
    };
  });

  // Determine if anomaly is active (flagged in the last 5 sessions)
  const recentFlagged = data.slice(-5).filter((d) => d.isFlagged);
  const isActive = recentFlagged.length >= 2;

  let flag: AnomalyFlag | null = null;
  if (isActive) {
    const flaggedIndices = data
      .map((d, i) => (d.isFlagged ? i : -1))
      .filter((i) => i >= 0);
    const maxZ = Math.max(...data.filter((d) => d.isFlagged).map((d) => Math.abs(d.zScore)));
    const severity: AnomalySeverity = maxZ > 3 ? 'high' : maxZ > 2.2 ? 'moderate' : 'low';

    const descriptions: Record<AnomalyType, string> = {
      'face-recognition-delay': 'Face/person recognition delay increasing',
      'place-recognition-confusion': 'Place recognition confusion detected',
      'sequence-recall-degrading': 'Event/sequence recall degrading',
      'attention-pattern-variance': 'Attention pattern variance elevated',
    };

    flag = {
      type,
      severity,
      description: descriptions[type],
      sessionRange: [
        sessionNums[flaggedIndices[0]],
        sessionNums[flaggedIndices[flaggedIndices.length - 1]],
      ],
      zScore: Math.round(maxZ * 100) / 100,
      isActive: true,
    };
  }

  return { type, label, data, flag };
}

// ── Full Patient Data Generation ─────────────────────────────

export interface PersonaConfig {
  id: string;
  name: string;
  age: number;
  avatarColor: string;
  sessionCount: number;
  startDate: string;
  seed: number;
  categories: Record<GameCategory, CategoryConfig>;
  /** Which anomalies to check for this persona */
  anomalyChecks: {
    type: AnomalyType;
    label: string;
    category: GameCategory;
    metric: 'responseTimeMs' | 'accuracyPercent';
    invert: boolean;
  }[];
}

export interface GeneratedPatientData {
  sessions: Record<GameCategory, GameSession[]>;
  anomalies: AnomalySeries[];
}

export function generatePatientData(config: PersonaConfig): GeneratedPatientData {
  const rng = mulberry32(config.seed);
  const dates = generateDates(config.sessionCount, config.startDate, rng);

  const categories: GameCategory[] = ['reminiscence', 'daily-routine', 'attention', 'pattern-recognition'];
  const sessions: Record<GameCategory, GameSession[]> = {} as Record<GameCategory, GameSession[]>;

  for (const cat of categories) {
    sessions[cat] = generateCategorySessions(
      config.categories[cat],
      config.sessionCount,
      dates,
      cat,
      config.seed + cat.charCodeAt(0)
    );
  }

  // Generate anomaly series
  const anomalies: AnomalySeries[] = config.anomalyChecks.map((check) =>
    generateAnomalySeries(check.type, check.label, sessions[check.category], check.metric, check.invert)
  );

  return { sessions, anomalies };
}
