import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Patient } from '../../data/types';
import { Badge } from '../ui/Badge';
import { InitialsAvatar } from '../ui/InitialsAvatar';

interface TopBarProps {
  patient: Patient;
  allPatients: Patient[];
  onPatientChange: (id: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ patient, allPatients, onPatientChange }) => {
  const { t, i18n } = useTranslation();

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'hi', label: 'HI' },
    { code: 'as', label: 'AS' },
    { code: 'bn', label: 'BN' },
    { code: 'mn', label: 'MN' },
  ];

  return (
    <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E0DC' }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Left: patient info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <InitialsAvatar initials={patient.initials} color={patient.avatarColor} size={44} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: '20px', color: '#1A1A1A', fontWeight: 600 }}>
                {patient.name}
              </span>
              <span style={{ color: '#5C5C5C', fontSize: '14px' }}>
                {patient.age} {t('patient.years')}
              </span>
              <Badge variant={patient.riskTier} label={t(`riskTiers.${patient.riskTier}`)} />
            </div>
            <span style={{ color: '#8A8A8A', fontSize: '12px' }}>
              {t('patient.daysSinceSession')}: {patient.daysSinceLastSession} · {t('patient.totalSessions')}: {patient.totalSessions}
            </span>
          </div>
        </div>

        {/* Right: profile switcher + language */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <select
            value={patient.id}
            onChange={(e) => onPatientChange(e.target.value)}
            style={{
              border: '1px solid #E2E0DC',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '13px',
              color: '#1A1A1A',
              backgroundColor: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            {allPatients.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {languages.map(({ code, label }) => {
              const isActive = i18n.language === code || i18n.language?.startsWith(code);
              return (
                <button
                  key={code}
                  onClick={() => i18n.changeLanguage(code)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    border: `1px solid ${isActive ? '#1A6B5A' : '#E2E0DC'}`,
                    borderRadius: '4px',
                    backgroundColor: isActive ? '#1A6B5A' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#5C5C5C',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
