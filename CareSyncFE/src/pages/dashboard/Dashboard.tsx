// src/pages/dashboard/Dashboard.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { medicationApi } from '../../api/medication.api';
import { patientApi } from '../../api/patient.api';
import { activityApi } from '../../api/activity.api';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { cn } from '../../utils/cn';
import type { MedicationSchedule } from '../../types/medication.types';
import type { Patient } from '../../types/patient.types';
import type { Activity } from '../../api/activity.api';

// ─────────────────────────────────────────
// SMALL COMPONENTS
// ─────────────────────────────────────────

// Stat card — top summary numbers
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="card flex items-center gap-4">
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}

// Quick action button
function QuickAction({
  label,
  icon,
  onClick,
  color,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 rounded-xl
                 bg-white dark:bg-gray-800
                 border border-gray-300 dark:border-gray-600
                 hover:border-primary-400 dark:hover:border-primary-500
                 hover:shadow-[0_0_0_1px_theme(colors.primary.500)]
                 transition-all duration-150"
    >
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', color)}>
        {icon}
      </div>
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
        {label}
      </span>
    </button>
  );
}

// Activity icon by type
function ActivityIcon({ type }: { type: Activity['type'] }) {
  const styles: Record<string, string> = {
    medication:  'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400',
    appointment: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
    note:        'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
    alert:       'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    vitals:      'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
  };
  return (
    <div className={cn(
      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
      styles[type] ?? styles.note
    )}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────
// MAIN DASHBOARD PAGE
// ─────────────────────────────────────────
export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading]           = useState(true);
  const [error, setError]                   = useState('');
  const [schedules, setSchedules]           = useState<MedicationSchedule[]>([]);
  const [patients, setPatients]             = useState<Patient[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  // First name for greeting
  const firstName = user?.fullName?.split(' ')[0] ?? 'there';

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Load all data when page opens
  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setError('');
      try {
        // All 3 fetches run at the same time — faster
        const [schedulesData, patientsData, activityData] = await Promise.all([
          medicationApi.getAllSchedules().catch(() => []),
          patientApi.getMyPatients().catch(() => []),
          activityApi.getRecentActivity().catch(() => []),
        ]);
        setSchedules(schedulesData);
        setPatients(patientsData);
        setRecentActivity(activityData);
      } catch {
        setError('Could not load dashboard. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // Simple stats from schedules
  const totalSchedules = schedules.length;
  const activePatients = patients.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── GREETING ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">{getGreeting()}, {firstName} 👋</h1>
          <p className="page-subtitle">
            Here's what's happening with your care coordination today
          </p>
        </div>
        <button
          onClick={() => navigate('/medications/log')}
          className="btn btn-primary self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Log Medication
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900
                        border border-red-200 dark:border-red-800 rounded-xl">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* ── STAT CARDS ── */}
      {/* 1 col mobile → 2 col tablet → 3 col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total medication schedules"
          value={totalSchedules}
          color="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          label="Active patients"
          value={activePatients}
          color="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          label="Recent activities"
          value={recentActivity.length}
          color="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* ── MAIN GRID ── */}
      {/* 1 col mobile → 2 col desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* MEDICATION SCHEDULES */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
              Medication Schedules
            </h3>
            <button
              onClick={() => navigate('/medications')}
              className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline"
            >
              View all
            </button>
          </div>

          {schedules.length === 0 ? (
            <EmptyState
              title="No schedules yet"
              description="Create medication schedules for your patients."
              action={{ label: 'Add schedule', onClick: () => navigate('/medications/create') }}
            />
          ) : (
            <div className="space-y-3">
              {schedules.slice(0, 5).map((schedule) => (
                <div
                  key={schedule.scheduleId}
                  className="flex items-center justify-between gap-3 p-3
                             bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                      Medication #{schedule.medicationId}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {schedule.dosage} · {schedule.frequency}
                      {schedule.timeOfDay ? ` · ${schedule.timeOfDay}` : ''}
                    </p>
                  </div>
                  {/* Status based on dates */}
                  <span className={cn('badge',
                    schedule.endDate && new Date(schedule.endDate) < new Date()
                      ? 'badge-gray'
                      : 'badge-success'
                  )}>
                    {schedule.endDate && new Date(schedule.endDate) < new Date()
                      ? 'Ended'
                      : 'Active'
                    }
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TODAY'S SCHEDULE — time view */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
              Today's Schedule
            </h3>
            <button
              onClick={() => navigate('/schedule')}
              className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline"
            >
              View all
            </button>
          </div>

          {schedules.length === 0 ? (
            <EmptyState
              title="Nothing scheduled"
              description="Add medication schedules to see them here."
            />
          ) : (
            <div className="space-y-3">
              {schedules.slice(0, 5).map((schedule) => (
                <div
                  key={schedule.scheduleId}
                  className="flex items-center gap-3 p-3
                             bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  {/* Time */}
                  <div className="w-16 text-center flex-shrink-0">
                    <p className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                      {schedule.timeOfDay ?? '—'}
                    </p>
                  </div>
                  {/* Vertical line */}
                  <div className="w-px h-8 bg-primary-200 dark:bg-primary-800 flex-shrink-0" />
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                      {schedule.dosage} · {schedule.frequency}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {schedule.instructions ?? 'No instructions'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PATIENTS / FAMILY STATUS */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
              Family Status
            </h3>
            <button
              onClick={() => navigate('/patients')}
              className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline"
            >
              Manage
            </button>
          </div>

          {patients.length === 0 ? (
            <EmptyState
              title="No patients yet"
              description="Add your family members to start coordinating care."
              action={{ label: 'Add patient', onClick: () => navigate('/patients/create') }}
            />
          ) : (
            <div className="space-y-3">
              {patients.slice(0, 4).map((patient) => (
                <div key={patient.patientId} className="flex items-center gap-3">
                  {/* Avatar with initials */}
                  <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/40 rounded-full
                                  flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-primary-700 dark:text-primary-400">
                      {patient.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {/* Name + age */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                      {patient.fullName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {patient.age ? `Age ${patient.age}` : patient.dateOfBirth}
                      {patient.gender ? ` · ${patient.gender}` : ''}
                    </p>
                  </div>
                  {/* Active dot */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECENT ACTIVITY */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
              Recent Activity
            </h3>
            <button
              onClick={() => navigate('/activity')}
              className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline"
            >
              View all
            </button>
          </div>

          {recentActivity.length === 0 ? (
            <EmptyState
              title="No recent activity"
              description="Activity will appear here as you log medications and appointments."
            />
          ) : (
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <ActivityIcon type={item.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">
                      {item.description}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {item.createdAt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className="card">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50 mb-4">
          Quick Actions
        </h3>
        {/* 2 col mobile → 3 col tablet → 5 col desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">

          <QuickAction
            label="Log Medication"
            color="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400"
            onClick={() => navigate('/medications/log')}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            }
          />

          <QuickAction
            label="Add Schedule"
            color="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            onClick={() => navigate('/medications/create')}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />

          <QuickAction
            label="View Reports"
            color="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400"
            onClick={() => navigate('/reports')}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />

          <QuickAction
            label="Invite Caregiver"
            color="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400"
            onClick={() => navigate('/caregivers/invite')}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            }
          />

          <QuickAction
            label="Add Patient"
            color="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
            onClick={() => navigate('/patients/create')}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
        </div>
      </div>
    </div>
  );
}