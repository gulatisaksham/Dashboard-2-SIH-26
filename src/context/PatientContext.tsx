import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { getAllPatientData, getDefaultPatientId } from '../data/personas';
import type { PatientData, AlertStatus } from '../data/types';

interface PatientContextValue {
  allPatients: PatientData[];
  currentData: PatientData;
  currentPatientId: string;
  isLoading: boolean;
  switchPatient: (id: string) => void;
  updateAlertStatus: (alertId: string, newStatus: AlertStatus) => void;
}

const PatientContext = createContext<PatientContextValue | null>(null);

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allData, setAllData] = useState(() => getAllPatientData());
  const [currentPatientId, setCurrentPatientId] = useState(getDefaultPatientId());
  const [isLoading, setIsLoading] = useState(false);
  
  const [currentData, setCurrentData] = useState<PatientData>(() =>
    allData.find(d => d.patient.id === getDefaultPatientId())!
  );

  const switchPatient = useCallback((id: string) => {
    if (id === currentPatientId) return;
    setIsLoading(true);
    setCurrentPatientId(id);
    setTimeout(() => {
      setAllData(currentAllData => {
        const found = currentAllData.find(d => d.patient.id === id);
        if (found) setCurrentData(found);
        return currentAllData;
      });
      setIsLoading(false);
    }, 400);
  }, [currentPatientId]);

  const updateAlertStatus = useCallback((alertId: string, newStatus: AlertStatus) => {
    setAllData(prev => prev.map(pd => {
      if (pd.patient.id === currentPatientId) {
        return {
          ...pd,
          alerts: pd.alerts.map(a => a.id === alertId ? { ...a, status: newStatus } : a)
        };
      }
      return pd;
    }));
    
    setCurrentData(prev => ({
      ...prev,
      alerts: prev.alerts.map(a => a.id === alertId ? { ...a, status: newStatus } : a)
    }));
  }, [currentPatientId]);

  return (
    <PatientContext.Provider value={{ allPatients: allData, currentData, currentPatientId, isLoading, switchPatient, updateAlertStatus }}>
      {children}
    </PatientContext.Provider>
  );
};

export function usePatientContext(): PatientContextValue {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error('usePatientContext must be used within PatientProvider');
  return ctx;
}
