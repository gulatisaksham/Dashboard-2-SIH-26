import React from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, CalendarClock, Focus, Puzzle, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { GameSession, GameCategory } from '../../data/types';
import { CATEGORY_META } from '../../data/types';
import { calculateDelta } from '../../utils/deltaCalculations';
import { EmptyState } from '../ui/EmptyState';

interface CognitivePanelProps {
  sessions: GameSession[];
  category: GameCategory;
}

const ICON_MAP: Record<GameCategory, React.ElementType> = {
  'reminiscence': Camera,
  'daily-routine': CalendarClock,
  'attention': Focus,
  'pattern-recognition': Puzzle,
};

const DeltaIndicator: React.FC<{
  currentWindow: number[];
  previousWindow: number[];
  metric: 'accuracy' | 'responseTime';
}> = ({ currentWindow, previousWindow, metric }) => {
  if (currentWindow.length === 0 || previousWindow.length === 0) return null;
  const delta = calculateDelta(currentWindow, previousWindow);

  let color = 'var(--color-text-muted)';
  let Icon = Minus;

  if (delta.direction === 'up') {
    Icon = ArrowUp;
    color = metric === 'accuracy' ? 'var(--color-alert-green)' : 'var(--color-alert-red)';
  } else if (delta.direction === 'down') {
    Icon = ArrowDown;
    color = metric === 'accuracy' ? 'var(--color-alert-red)' : 'var(--color-alert-green)';
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', fontSize: '12px', fontWeight: 500, color, marginLeft: '6px' }}>
      <Icon size={12} style={{ marginRight: '2px' }} />
      {Math.round(delta.percent)}%
    </div>
  );
};

export const CognitivePanel: React.FC<CognitivePanelProps> = ({ sessions, category }) => {
  const { t } = useTranslation();
  const meta = CATEGORY_META[category];
  const Icon = ICON_MAP[category] || Puzzle;
  const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;

  const WINDOW_SIZE = 5;
  const hasEnoughHistory = sessions.length >= WINDOW_SIZE * 2;
  const currentAccuracyWindow = hasEnoughHistory ? sessions.slice(-WINDOW_SIZE).map(s => s.accuracyPercent) : [];
  const previousAccuracyWindow = hasEnoughHistory ? sessions.slice(-WINDOW_SIZE * 2, -WINDOW_SIZE).map(s => s.accuracyPercent) : [];
  const currentResponseWindow = hasEnoughHistory ? sessions.slice(-WINDOW_SIZE).map(s => s.responseTimeMs) : [];
  const previousResponseWindow = hasEnoughHistory ? sessions.slice(-WINDOW_SIZE * 2, -WINDOW_SIZE).map(s => s.responseTimeMs) : [];

  if (sessions.length === 0) {
    return (
      <div className="card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <Icon size={18} style={{ marginRight: '8px', color: '#1A6B5A' }} />
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>
            {t(meta.i18nKey)}
          </h3>
        </div>
        <EmptyState
          icon={<Icon size={32} color="#8A8A8A" />}
          message={`No session data yet.`}
          style={{ height: '140px', minHeight: 'auto', backgroundColor: '#F3F1EE', border: '1px dashed #E2E0DC' }}
        />
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
        <Icon size={18} style={{ marginRight: '8px', color: '#1A6B5A' }} />
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>
          {t(meta.i18nKey)}
        </h3>
      </div>

      {/* Dual charts */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ fontSize: '10px', color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
              {t('dashboard.responseTime')}
            </div>
            {hasEnoughHistory && (
              <DeltaIndicator 
                currentWindow={currentResponseWindow}
                previousWindow={previousResponseWindow}
                metric="responseTime"
              />
            )}
          </div>
          <div style={{ height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sessions}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E0DC" />
                <XAxis dataKey="sessionNumber" tick={{ fontSize: 9, fill: '#8A8A8A' }} interval="preserveStartEnd" axisLine={false} tickLine={false} />
                <YAxis tick={false} axisLine={{ stroke: '#E2E0DC' }} width={20} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '4px' }} />
                <Line type="monotone" dataKey="responseTimeMs" stroke="#1A6B5A" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ fontSize: '10px', color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
              {t('dashboard.accuracy')}
            </div>
            {hasEnoughHistory && (
              <DeltaIndicator 
                currentWindow={currentAccuracyWindow}
                previousWindow={previousAccuracyWindow}
                metric="accuracy"
              />
            )}
          </div>
          <div style={{ height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sessions}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E0DC" />
                <XAxis dataKey="sessionNumber" tick={{ fontSize: 9, fill: '#8A8A8A' }} interval="preserveStartEnd" axisLine={false} tickLine={false} />
                <YAxis tick={false} axisLine={{ stroke: '#E2E0DC' }} width={20} domain={[0, 100]} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '4px' }} />
                <Line type="monotone" dataKey="accuracyPercent" stroke="#4A7FB5" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Adaptive Difficulty */}
      {lastSession && (
        <div style={{ display: 'flex', gap: '16px', paddingTop: '12px', borderTop: '1px solid #E2E0DC' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{t('dashboard.level')}</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A1A' }}>{lastSession.difficulty.level}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{t('dashboard.easeFactor')}</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A1A' }}>{lastSession.difficulty.easeFactor.toFixed(2)}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{t('dashboard.interval')}</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A1A' }}>{lastSession.difficulty.interval}d</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{t('dashboard.repetitions')}</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A1A' }}>{lastSession.difficulty.repetitions}</div>
          </div>
        </div>
      )}
    </div>
  );
};
