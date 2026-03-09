// src/hooks/useNotificationScheduler.ts
//
// Loads upcoming medications from the API and schedules
// browser notifications for each one automatically.
// Call this once inside DashboardLayout so it runs app-wide.

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrowserNotifications } from '../utils/browserNotifications';
import { medicationApi } from '../api/medication.api';
import { usePatient } from '../context/PatientContext';

export function useNotificationScheduler() {
  const { selectedPatient }  = usePatient();
  const navigate             = useNavigate();
  const intervalRef          = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Only run if permission is granted and patient is selected
    if (
      !selectedPatient ||
      BrowserNotifications.getPermissionStatus() !== 'granted'
    ) return;

    const scheduleAll = async () => {
      try {
        const upcoming = await medicationApi.getUpcomingMedications(
          selectedPatient.patientId
        );

        // Clear old reminders before rescheduling
        BrowserNotifications.clearAllReminders();

        upcoming.forEach((med: any) => {
          const scheduledTime = new Date(med.scheduledTime);
          BrowserNotifications.scheduleReminder(
            String(med.scheduleId),
            med.medicationName ?? `Medication #${med.medicationId}`,
            med.dosage,
            scheduledTime,
            // Clicking notification navigates to log medication page
            () => navigate(`/medications/log?scheduleId=${med.scheduleId}`)
          );
        });
      } catch {
        // Silently fail — notifications are non-critical
      }
    };

    // Schedule on mount
    scheduleAll();

    // Re-check every 30 minutes to pick up new schedules
    intervalRef.current = setInterval(scheduleAll, 30 * 60 * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      BrowserNotifications.clearAllReminders();
    };
  }, [selectedPatient?.patientId]);
}