import { usePatientContext } from '../context/PatientContext';

export function usePatientData() {
  return usePatientContext();
}
