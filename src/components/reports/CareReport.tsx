import React from 'react';
import type { PatientData } from '../../data/types';
import { CATEGORY_META, ANOMALY_META } from '../../data/types';

interface CareReportProps {
  patientData: PatientData;
  localAlerts?: any[];
}

export function CareReport({ patientData, localAlerts = [] }: CareReportProps) {
  const { patient, sessions, anomalies, alerts } = patientData;
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  // Calculate "days active this month" (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const allSessions = Object.values(sessions).flat();
  const activeDays = new Set(
    allSessions
      .filter(s => new Date(s.date) >= thirtyDaysAgo)
      .map(s => s.date.split('T')[0])
  ).size;

  // Active flags
  const activeFlags = anomalies.filter(a => a.flag?.isActive);

  // Extract notes from localAlerts
  const caregiverNotes = localAlerts.filter(a => a.textKey === 'customNote' || a.author === 'You');

  // Calculate trends per category (last 30 days averages)
  const categoryTrends = Object.keys(CATEGORY_META).map(catKey => {
    const catSessions = sessions[catKey as keyof typeof sessions] || [];
    const recent = catSessions.filter(s => new Date(s.date) >= thirtyDaysAgo);
    
    if (recent.length === 0) {
      return { category: CATEGORY_META[catKey as keyof typeof CATEGORY_META].label, acc: '-', rt: '-' };
    }

    const avgAcc = Math.round(recent.reduce((sum, s) => sum + s.accuracyPercent, 0) / recent.length);
    const avgRt = Math.round(recent.reduce((sum, s) => sum + s.responseTimeMs, 0) / recent.length);
    
    return {
      category: CATEGORY_META[catKey as keyof typeof CATEGORY_META].label,
      acc: `${avgAcc}%`,
      rt: `${(avgRt / 1000).toFixed(1)}s`
    };
  });

  return (
    <div className="bg-white text-black p-8 max-w-[21cm] mx-auto" style={{ fontFamily: '"Inter", sans-serif', fontSize: '12pt' }}>
      {/* Header */}
      <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: '"Fraunces", serif' }}>MemoryLane — Care Report</h1>
          <p className="text-gray-600">Generated: {today} • Period: Last 30 Days</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-xl">{patient.name}</p>
          <p>Age {patient.age}</p>
        </div>
      </div>

      {/* Patient Snapshot */}
      <div className="mb-8">
        <h2 className="text-xl font-bold border-b border-gray-300 mb-3 pb-1" style={{ fontFamily: '"Fraunces", serif' }}>Patient Snapshot</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 border border-gray-300 rounded">
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Risk Tier</p>
            <p className="font-bold text-lg capitalize">{patient.riskTier.replace('-', ' ')}</p>
          </div>
          <div className="p-3 border border-gray-300 rounded">
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Last Session</p>
            <p className="font-bold text-lg">{patient.daysSinceLastSession === 0 ? 'Today' : `${patient.daysSinceLastSession} days ago`}</p>
          </div>
          <div className="p-3 border border-gray-300 rounded">
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Active Days (Month)</p>
            <p className="font-bold text-lg">{activeDays} days</p>
          </div>
        </div>
      </div>

      {/* This Month's Trends */}
      <div className="mb-8" style={{ breakInside: 'avoid' }}>
        <h2 className="text-xl font-bold border-b border-gray-300 mb-3 pb-1" style={{ fontFamily: '"Fraunces", serif' }}>This Month's Trends</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left">Category</th>
              <th className="border border-gray-300 p-2 text-center">Avg. Accuracy</th>
              <th className="border border-gray-300 p-2 text-center">Avg. Response Time</th>
            </tr>
          </thead>
          <tbody>
            {categoryTrends.map((t, idx) => (
              <tr key={idx}>
                <td className="border border-gray-300 p-2 font-medium">{t.category}</td>
                <td className="border border-gray-300 p-2 text-center">{t.acc}</td>
                <td className="border border-gray-300 p-2 text-center">{t.rt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Active Engagement Flags */}
      <div className="mb-8" style={{ breakInside: 'avoid' }}>
        <h2 className="text-xl font-bold border-b border-gray-300 mb-3 pb-1 flex items-center gap-2" style={{ fontFamily: '"Fraunces", serif' }}>
          Active Engagement Flags
        </h2>
        {activeFlags.length === 0 ? (
          <p className="text-gray-600 italic">No active anomaly flags detected during this period.</p>
        ) : (
          <ul className="list-disc pl-5 space-y-2">
            {activeFlags.map((a, idx) => (
              <li key={idx} className="mb-2">
                <span className="font-bold">{ANOMALY_META[a.type]?.label || a.type}:</span> {a.flag?.description}
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-gray-500 mt-2 italic">
          Disclaimer: These are behavioral engagement patterns, not a clinical diagnosis.
        </p>
      </div>

      {/* Current Alerts & Reminders */}
      <div className="mb-8" style={{ breakInside: 'avoid' }}>
        <h2 className="text-xl font-bold border-b border-gray-300 mb-3 pb-1" style={{ fontFamily: '"Fraunces", serif' }}>Recent System Alerts</h2>
        {alerts.length === 0 ? (
          <p className="text-gray-600 italic">No recent system alerts.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left w-1/4">Date</th>
                <th className="border border-gray-300 p-2 text-left w-1/2">Message</th>
                <th className="border border-gray-300 p-2 text-left w-1/4">Status</th>
              </tr>
            </thead>
            <tbody>
              {alerts.slice(0, 5).map((alert, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-300 p-2">
                    {new Date(alert.scheduledAt).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 p-2">{alert.message}</td>
                  <td className="border border-gray-300 p-2 capitalize">{alert.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Caregiver Notes */}
      {caregiverNotes.length > 0 && (
        <div className="mb-8" style={{ breakInside: 'avoid' }}>
          <h2 className="text-xl font-bold border-b border-gray-300 mb-3 pb-1" style={{ fontFamily: '"Fraunces", serif' }}>Caregiver Notes</h2>
          <div className="space-y-3">
            {caregiverNotes.map((note, idx) => (
              <div key={idx} className="border border-gray-300 p-3 rounded bg-gray-50">
                <p className="text-sm text-gray-500 mb-1">{note.time}</p>
                <p>{note.customText || note.textKey}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-4 border-t border-gray-300 text-center text-sm text-gray-500">
        <p>Generated by MemoryLane — for care coordination purposes, not a diagnostic document.</p>
        <p>Timestamp: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}
