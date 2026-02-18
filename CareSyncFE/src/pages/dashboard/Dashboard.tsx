import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge, MedicationStatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Skeleton, SkeletonCard } from '../../components/ui/Skeleton';
import { cn } from '../../utils/cn';

// ─── Types ───────────────────────────────────────────────────────────────────
interface MedicationReminder {
  id: string;
  name: string;
  dosage: string;
  time: string;
  status: 'PENDING' | 'ADMINISTERED' | 'SKIPPED' | 'OVERDUE';
  patientName: string;
}

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'away';
  lastActive: string;
}

interface RecentActivity {
  id: string;
  type: 'medication' | 'appointment' | 'note' | 'alert';
  description: string;
  time: string;
  user: string;
  status?: string;
}

interface QuickStat {
  label: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  icon: React.ReactNode;
  color: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────
const MOCK_REMINDERS: MedicationReminder[] = [
  { id: '1', name: 'Metformin', dosage: '500mg', time: '8:00 AM', status: 'ADMINISTERED', patientName: 'Mary Johnson' },
  { id: '2', name: 'Lisinopril', dosage: '10mg', time: '12:00 PM', status: 'PENDING', patientName: 'Mary Johnson' },
  { id: '3', name: 'Aspirin', dosage: '81mg', time: '2:00 PM', status: 'OVERDUE', patientName: 'Mary Johnson' },
  { id: '4', name: 'Vitamin D', dosage: '1000 IU', time: '6:00 PM', status: 'PENDING', patientName: 'Mary Johnson' },
];

const MOCK_FAMILY: FamilyMember[] = [
  { id: '1', name: 'Sarah Johnson', role: 'Primary Caregiver', status: 'online', lastActive: 'Now' },
  { id: '2', name: 'Mike Johnson', role: 'Son', status: 'away', lastActive: '2h ago' },
  { id: '3', name: 'Dr. Williams', role: 'Physician', status: 'offline', lastActive: 'Yesterday' },
];

const MOCK_ACTIVITY: RecentActivity[] = [
  { id: '1', type: 'medication', description: 'Metformin 500mg administered', time: '8:02 AM', user: 'Sarah J.', status: 'ADMINISTERED' },
  { id: '2', type: 'appointment', description: 'Cardiology checkup scheduled', time: 'Yesterday', user: 'Mike J.' },
  { id: '3', type: 'note', description: 'Blood pressure reading: 120/80', time: 'Yesterday', user: 'Sarah J.' },
  { id: '4', type: 'alert', description: 'Aspirin dose missed', time: '2 days ago', user: 'System' },
];

// ─── Sub-Components ─────────────────────────────────────────────────────────

function StatCard({ label, value, change, positive, icon, color }: QuickStat) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-50 mt-1">{value}</p>
            {change && (
              <p className={cn('text-xs mt-1 font-medium', positive ? 'text-success-600' : 'text-error-500')}>
                {positive ? '↑' : '↓'} {change}
              </p>
            )}
          </div>
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', color)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MedicationRow({ reminder }: { reminder: MedicationReminder }) {
  const statusColors = {
    ADMINISTERED: 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800',
    PENDING: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    OVERDUE: 'bg-error-50 dark:bg-error-900/20 border-error-200 dark:border-error-800',
    SKIPPED: 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700',
  };

  return (
    <div className={cn('flex items-center gap-4 p-3 rounded-lg border', statusColors[reminder.status])}>
      <div className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg',
        reminder.status === 'ADMINISTERED' ? 'bg-success-100 dark:bg-success-900/30' :
        reminder.status === 'OVERDUE' ? 'bg-error-100 dark:bg-error-900/30' :
        'bg-primary-100 dark:bg-primary-900/30'
      )}>
        💊
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 dark:text-gray-50 text-sm">{reminder.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{reminder.dosage} · {reminder.time}</p>
      </div>
      <MedicationStatusBadge status={reminder.status} />
    </div>
  );
}

function ActivityItem({ activity }: { activity: RecentActivity }) {
  const icons = {
    medication: '💊',
    appointment: '📅',
    note: '📝',
    alert: '⚠️',
  };

  const colors = {
    medication: 'bg-primary-100 dark:bg-primary-900/30',
    appointment: 'bg-orange-100 dark:bg-orange-900/30',
    note: 'bg-blue-100 dark:bg-blue-900/30',
    alert: 'bg-error-100 dark:bg-error-900/30',
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className={cn('w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-base', colors[activity.type])}>
        {icons[activity.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-snug">{activity.description}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{activity.user} · {activity.time}</p>
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [adherenceRate] = useState(78);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const administered = MOCK_REMINDERS.filter(r => r.status === 'ADMINISTERED').length;
  const total = MOCK_REMINDERS.length;

  const stats: QuickStat[] = [
    {
      label: "Today's Medications",
      value: `${administered}/${total}`,
      change: `${Math.round((administered / total) * 100)}% complete`,
      positive: true,
      color: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
    },
    {
      label: 'Adherence Rate',
      value: `${adherenceRate}%`,
      change: '5% vs last week',
      positive: true,
      color: 'bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    },
    {
      label: 'Upcoming Appointments',
      value: 2,
      change: 'Next: Tomorrow 10am',
      positive: true,
      color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    },
    {
      label: 'Active Alerts',
      value: 1,
      change: '1 overdue dose',
      positive: false,
      color: 'bg-error-100 dark:bg-error-900/30 text-error-600 dark:text-error-400',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton height="2rem" width="40%" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            Good morning, {user?.fullName?.split(' ')[0] || 'Caregiver'} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/activity')}>
            View Activity
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/medications/log')}>
            + Log Medication
          </Button>
        </div>
      </div>

      {/* Overdue Alert Banner */}
      <div className="flex items-center gap-3 p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl">
        <div className="w-10 h-10 bg-error-100 dark:bg-error-900/30 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-error-600 dark:text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-error-800 dark:text-error-300">Overdue Medication</p>
          <p className="text-sm text-error-600 dark:text-error-400">Aspirin 81mg was due at 2:00 PM. Please administer or mark as skipped.</p>
        </div>
        <Button variant="danger" size="sm" onClick={() => navigate('/medications')}>
          Review
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Medication Reminders */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Today's Medications</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/medications')}>
                View all →
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 pb-4">
              {MOCK_REMINDERS.map(reminder => (
                <MedicationRow key={reminder.id} reminder={reminder} />
              ))}
            </CardContent>
          </Card>

          {/* Adherence Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Adherence</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Overall this week
                </p>
                <span className="text-2xl font-bold text-success-600 dark:text-success-400">
                  {adherenceRate}%
                </span>
              </div>
              <ProgressBar value={adherenceRate} size="lg" variant="success" />
              <div className="grid grid-cols-7 gap-1 mt-4">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                  <div key={i} className="text-center">
                    <div className={cn(
                      'w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-medium mb-1',
                      i < 4 ? 'bg-success-500 text-white' :
                      i === 4 ? 'bg-warning-400 text-white' :
                      'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    )}>
                      {i < 4 ? '✓' : i === 4 ? '~' : day}
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4">

          {/* Family Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Family Status</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/caregivers')}>
                Manage →
              </Button>
            </CardHeader>
            <CardContent className="pb-4 space-y-3">
              {MOCK_FAMILY.map(member => (
                <div key={member.id} className="flex items-center gap-3">
                  <Avatar
                    fallback={member.name}
                    size="sm"
                    status={member.status}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                      {member.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{member.role}</p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {member.lastActive}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Log Medication', icon: '💊', path: '/medications/log', color: 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' },
                  { label: 'Add Appointment', icon: '📅', path: '/schedule', color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' },
                  { label: 'View Reports', icon: '📊', path: '/reports', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' },
                  { label: 'Add Note', icon: '📝', path: '/activity', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' },
                ].map(action => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-3 rounded-xl text-center',
                      'border border-transparent hover:border-gray-200 dark:hover:border-gray-600',
                      'transition-all hover:shadow-sm',
                      action.color
                    )}
                  >
                    <span className="text-2xl">{action.icon}</span>
                    <span className="text-xs font-medium leading-tight">{action.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/activity')}>
                View all →
              </Button>
            </CardHeader>
            <CardContent className="pb-2">
              {MOCK_ACTIVITY.map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}