import { useState, useMemo } from 'react';
import { getAllPatientData, getDefaultPatientId } from '../data/personas';

export function usePatientData() {
  const allData = useMemo(() => getAllPatientData(), []);
  const [currentPatientId, setCurrentPatientId] = useState(getDefaultPatientId());
  const currentData = useMemo(() => allData.find(d => d.patient.id === currentPatientId) || allData[0], [allData, currentPatientId]);
  return {
    allPatients: allData.map(d => d.patient),
    currentData,
    currentPatientId,
    setCurrentPatientId,
  };
}
