// src/context/AlertContext.tsx
// Provides real-time alert count to the sidebar badge.
// Fetches from the same APIs as Alerts.tsx and refreshes every 2 minutes.

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { medicationApi } from '../api/medication.api';
import { usePatient } from './PatientContext';
import type { TodayScheduleDTO, UpcomingMedicationDTO } from '../types/medication.types';

interface AlertContextType {
  urgentCount: number;
  totalCount: number;
  refresh: () => void;
}

const AlertContext = createContext<AlertContextType>({
  urgentCount: 0,
  totalCount: 0,
  refresh: () => {},
});

export function AlertProvider({ children }: { children: ReactNode }) {
  const { selectedPatient } = usePatient();
  const [urgentCount, setUrgentCount] = useState(0);
  const [totalCount,  setTotalCount]  = useState(0);

  const fetchCounts = useCallback(async () => {
    if (!selectedPatient) {
      setUrgentCount(0);
      setTotalCount(0);
      return;
    }

    try {
      const [todayData, upcomingData]: [TodayScheduleDTO[], UpcomingMedicationDTO[]] =
        await Promise.all([
          medicationApi.getTodaysSchedule(selectedPatient.patientId),
          medicationApi.getUpcomingMedications(selectedPatient.patientId),
        ]);

      // Critical: missed (past + not administered)
      const missed  = todayData.filter((s) => s.isPast && !s.isAdministered).length;
      // Critical: overdue
      const overdue = upcomingData.filter((m) => m.isOverdue).length;
      // Warning: upcoming within 30 min
      const upcoming = upcomingData.filter((m) => !m.isOverdue && m.minutesUntilDue <= 30).length;

      setUrgentCount(missed + overdue);
      setTotalCount(missed + overdue + upcoming);
    } catch {
      // Silently fail — don't break the layout over a badge count
    }
  }, [selectedPatient]);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  // Refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(fetchCounts, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchCounts]);

  return (
    <AlertContext.Provider value={{ urgentCount, totalCount, refresh: fetchCounts }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  return useContext(AlertContext);
}