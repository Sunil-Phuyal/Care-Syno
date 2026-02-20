// src/pages/dashboard/Dashboard.tsx
//
// Sections:
// 1. Greeting header
// 2. Today's Medications
// 3. Today's Schedule
// 4. Family Status
// 5. Quick Actions
// 6. Recent Activity

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { medicationApi } from '../../api/medication.api';
import { patientApi } from '../../api/patient.api';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { cn } from '../../utils/cn';

// ─────────────────────────────────────────
// TYPES — simple shapes for this page only
// ─────────────────────────────────────────
interface Medication {
  id: string;
  name: string;
  dosage: string;
  scheduledTime: string;
  status: 'overdue' | 'due_soon' | 'upcoming' | 'completed';
  patientName: string;
}

interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  duration: string;
  type: 'medication' | 'appointment' | 'checkup';
  status: 'upcoming' | 'completed' | 'overdue';
}

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'away' | 'offline';
  lastActive: string;
}

interface ActivityItem {
  id: string;
  description: string;
  time: string;
  type: 'medication' | 'appointment' | 'note' | 'alert';
}

// ─────────────────────────────────────────
// STAT CARD — top summary cards
// ─────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
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

// ─────────────────────────────────────────
// MEDICATION STATUS BADGE
// ─────────────────────────────────────────
function MedStatusBadge({ status }: { status: Medication['status'] }) {
  const styles = {
    overdue:   'badge badge-error',
    due_soon:  'badge badge-warning',
    upcoming:  'badge badge-gray',
    completed: 'badge badge-success',
  };
  const labels = {
    overdue:   'Overdue',
    due_soon:  'Due soon',
    upcoming:  'Upcoming',
    completed: 'Completed',
  };
  return <span className={styles[status]}>{labels[status]}</span>;
}

// ─────────────────────────────────────────
// QUICK ACTION BUTTON
// ─────────────────────────────────────────
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
                 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                 hover:border-primary-300 dark:hover:border-primary-600
                 hover:shadow-md transition-all duration-150 group"
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

// ─────────────────────────────────────────
// ACTIVITY ICON by type
// ─────────────────────────────────────────
function ActivityIcon({ type }: { type: ActivityItem['type'] }) {
  const styles = {
    medication:  'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
    appointment: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    note:        'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
    alert:       'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  };
  const icons = {
    medication: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    appointment: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    note: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    alert: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };
  return (
    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', styles[type])}>
      {icons[type]}
    </div>
  );
}

// ─────────────────────────────────────────
// FAMILY STATUS DOT
// ─────────────────────────────────────────
function StatusDot({ status }: { status: FamilyMember['status'] }) {
  const colors = {
    active:  'bg-green-500',
    away:    'bg-yellow-400',
    offline: 'bg-gray-300 dark:bg-gray-600',
  };
  return (
    <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', colors[status])} />
  );
}

// ─────────────────────────────────────────
// MAIN DASHBOARD PAGE
// ─────────────────────────────────────────
export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Loading + data state
  const [isLoading, setIsLoading]       = useState(true);
  const [medications, setMedications]   = useState<Medication[]>([]);
  const [schedule, setSchedule]         = useState<ScheduleItem[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [error, setError]               = useState('');

  // Get first name for greeting
  const firstName = user?.fullName?.split(' ')[0] ?? 'there';

  // Current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Load all dashboard data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Fetch medications and patients in parallel for speed
        const [medsResponse, patientsResponse] = await Promise.all([
          medicationApi.getAllMedications().catch(() => ({ data: [] })),
          patientApi.getMyPatients().catch(() => ({ data: [] })),
        ]);

        // Map medications to our simple shape
        const meds = (medsResponse?.data ?? []).map((m: any) => ({
          id: m.id,
          name: m.medicationName ?? m.name,
          dosage: m.dosage,
          scheduledTime: m.scheduledTime ?? m.time,
          status: m.status ?? 'upcoming',
          patientName: m.patientName ?? m.patient?.fullName ?? 'Patient',
        }));
        setMedications(meds);

        // Build schedule from medications + any appointments
        const scheduleItems = meds.slice(0, 5).map((m: Medication) => ({
          id: m.id,
          title: `${m.name} — ${m.patientName}`,
          time: m.scheduledTime,
          duration: '5 min',
          type: 'medication' as const,
          status: m.status === 'completed' ? 'completed' as const
                : m.status === 'overdue'   ? 'overdue' as const
                : 'upcoming' as const,
        }));
        setSchedule(scheduleItems);

        // Family members from patients list
        const family = (patientsResponse?.data ?? []).slice(0, 4).map((p: any) => ({
          id: p.id,
          name: p.fullName ?? p.name,
          role: p.relationship ?? 'Family Member',
          status: 'active' as const,
          lastActive: 'Just now',
        }));
        setFamilyMembers(family);

        // Recent activity from meds (last 5)
        const activity = meds.slice(0, 5).map((m: Medication) => ({
          id: m.id,
          description: `${m.name} scheduled for ${m.patientName}`,
          time: m.scheduledTime,
          type: 'medication' as const,
        }));
        setRecentActivity(activity);

      } catch (err) {
        setError('Failed to load dashboard data. Please refresh.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Stats derived from data
  const totalMeds    = medications.length;
  const overdueMeds  = medications.filter((m) => m.status === 'overdue').length;
  const completedMeds = medications.filter((m) => m.status === 'completed').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── GREETING HEADER ── */}
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
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20
                        border border-red-200 dark:border-red-800 rounded-xl">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total medications today"
          value={totalMeds}
          color="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          label="Overdue medications"
          value={overdueMeds}
          color="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Completed today"
          value={completedMeds}
          color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      {/* Mobile: 1 column, Desktop: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* TODAY'S MEDICATIONS */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
              Today's Medications
            </h3>
            <button
              onClick={() => navigate('/medications')}
              className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline"
            >
              View all
            </button>
          </div>

          {medications.length === 0 ? (
            <EmptyState
              title="No medications today"
              description="All medications have been logged or none are scheduled."
              action={{ label: 'Add medication', onClick: () => navigate('/medications/create') }}
            />
          ) : (
            <div className="space-y-3">
              {medications.slice(0, 5).map((med) => (
                <div key={med.id}
                  className="flex items-center justify-between gap-3 p-3
                             bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                      {med.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {med.dosage} · {med.patientName} · {med.scheduledTime}
                    </p>
                  </div>
                  <MedStatusBadge status={med.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TODAY'S SCHEDULE */}
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

          {schedule.length === 0 ? (
            <EmptyState
              title="No schedule for today"
              description="Nothing scheduled yet. Add appointments or medication times."
            />
          ) : (
            <div className="space-y-3">
              {schedule.map((item) => (
                <div key={item.id}
                  className="flex items-center gap-3 p-3
                             bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  {/* Time block */}
                  <div className="w-12 text-center flex-shrink-0">
                    <p className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                      {item.time}
                    </p>
                  </div>
                  {/* Vertical line */}
                  <div className="w-px h-8 bg-primary-200 dark:bg-primary-800 flex-shrink-0" />
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.duration}
                    </p>
                  </div>
                  {/* Status dot */}
                  <div className={cn('w-2 h-2 rounded-full flex-shrink-0',
                    item.status === 'completed' ? 'bg-green-500'
                    : item.status === 'overdue' ? 'bg-red-500'
                    : 'bg-yellow-400'
                  )} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FAMILY STATUS */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
              Family Status
            </h3>
            <button
              onClick={() => navigate('/caregivers')}
              className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline"
            >
              Manage
            </button>
          </div>

          {familyMembers.length === 0 ? (
            <EmptyState
              title="No family members yet"
              description="Invite family caregivers to coordinate care together."
              action={{ label: 'Invite family', onClick: () => navigate('/caregivers/invite') }}
            />
          ) : (
            <div className="space-y-3">
              {familyMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/40 rounded-full
                                  flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-primary-700 dark:text-primary-400">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {/* Name + role */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                      {member.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{member.role}</p>
                  </div>
                  {/* Status */}
                  <div className="flex items-center gap-1.5">
                    <StatusDot status={member.status} />
                    <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                      {member.lastActive}
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
              description="Activity will show here as you log medications and appointments."
            />
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <ActivityIcon type={item.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">
                      {item.description}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {item.time}
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <QuickAction
            label="Log Medication"
            color="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
            onClick={() => navigate('/medications/log')}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            }
          />
          <QuickAction
            label="Schedule Appointment"
            color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
            onClick={() => navigate('/schedule')}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <QuickAction
            label="View Reports"
            color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
            onClick={() => navigate('/reports')}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          <QuickAction
            label="Invite Family"
            color="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
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
            color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
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