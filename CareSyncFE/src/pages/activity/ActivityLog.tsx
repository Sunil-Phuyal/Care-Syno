// src/pages/ActivityLog.tsx

import { useState, useEffect } from 'react';
import { activityApi } from '../../api/activity.api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { cn } from '../../utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────
type ActivityType = 'ALL' | 'MEDICATION' | 'APPOINTMENT' | 'NOTE' | 'ALERT' | 'CAREGIVER';
type ActivityStatus = 'ADMINISTERED' | 'SKIPPED' | 'OVERDUE' | 'PENDING' | 'COMPLETED' | 'INFO';

interface Activity {
  id: string;
  type: Exclude<ActivityType, 'ALL'>;
  title: string;
  description: string;
  status: ActivityStatus;
  user: string;
  timestamp: string;
  date: string;
  patient: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const TYPE_FILTERS: { label: string; value: ActivityType }[] = [
  { label: 'All Activity',  value: 'ALL' },
  { label: 'Medications',   value: 'MEDICATION' },
  { label: 'Appointments',  value: 'APPOINTMENT' },
  { label: 'Notes',         value: 'NOTE' },
  { label: 'Alerts',        value: 'ALERT' },
  { label: 'Caregiver',     value: 'CAREGIVER' },
];

const TYPE_ICONS: Record<Exclude<ActivityType, 'ALL'>, string> = {
  MEDICATION:  '💊',
  APPOINTMENT: '📅',
  NOTE:        '📝',
  ALERT:       '⚠️',
  CAREGIVER:   '👥',
};

// Solid colors — no opacity tricks that break in @apply
const TYPE_COLORS: Record<Exclude<ActivityType, 'ALL'>, string> = {
  MEDICATION:  'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300',
  APPOINTMENT: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
  NOTE:        'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
  ALERT:       'bg-error-100 dark:bg-error-900 text-error-700 dark:text-error-300',
  CAREGIVER:   'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
};

const STATUS_BADGE: Record<ActivityStatus, { label: string; className: string }> = {
  ADMINISTERED: { label: 'Administered', className: 'bg-success-100 text-success-700 dark:bg-success-800 dark:text-success-100' },
  SKIPPED:      { label: 'Skipped',      className: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
  OVERDUE:      { label: 'Overdue',      className: 'bg-error-100 text-error-700 dark:bg-error-800 dark:text-error-100' },
  PENDING:      { label: 'Pending',      className: 'bg-warning-100 text-warning-700 dark:bg-warning-800 dark:text-warning-100' },
  COMPLETED:    { label: 'Completed',    className: 'bg-success-100 text-success-700 dark:bg-success-800 dark:text-success-100' },
  INFO:         { label: 'Info',         className: 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100' },
};

// ─── Map API response to our Activity shape ───────────────────────────────────
// Your backend returns activity.type as lowercase — we uppercase it to match our types
function mapApiActivity(item: any): Activity {
  const typeMap: Record<string, Exclude<ActivityType, 'ALL'>> = {
    medication:  'MEDICATION',
    appointment: 'APPOINTMENT',
    note:        'NOTE',
    alert:       'ALERT',
    vitals:      'NOTE',       // vitals shows as note
  };

  const statusMap: Record<string, ActivityStatus> = {
    completed:  'COMPLETED',
    pending:    'PENDING',
    missed:     'OVERDUE',
    ADMINISTERED: 'ADMINISTERED',
    SKIPPED:    'SKIPPED',
    OVERDUE:    'OVERDUE',
    PENDING:    'PENDING',
    COMPLETED:  'COMPLETED',
    INFO:       'INFO',
  };

  // Format date for grouping
  const createdAt = new Date(item.createdAt);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  let dateLabel = 'Earlier';
  if (createdAt.toDateString() === today.toDateString()) {
    dateLabel = 'Today';
  } else if (createdAt.toDateString() === yesterday.toDateString()) {
    dateLabel = 'Yesterday';
  } else {
    dateLabel = createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return {
    id:          String(item.id),
    type:        typeMap[item.type?.toLowerCase()] ?? 'NOTE',
    title:       item.description ?? 'Activity',
    description: item.description ?? '',
    status:      statusMap[item.status] ?? 'INFO',
    user:        item.performedBy ?? 'System',
    timestamp:   createdAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    date:        dateLabel,
    patient:     item.patientName ?? '',
  };
}

// ─── Activity Row ─────────────────────────────────────────────────────────────
function ActivityRow({ activity }: { activity: Activity }) {
  const badge = STATUS_BADGE[activity.status];

  return (
    <div className="flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30
                    rounded-xl transition-colors">
      {/* Type icon */}
      <div className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0',
        TYPE_COLORS[activity.type]
      )}>
        {TYPE_ICONS[activity.type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              {activity.title}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {activity.description}
            </p>
          </div>
          {/* Status badge */}
          <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0', badge.className)}>
            {badge.label}
          </span>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-2">
          <Avatar fallback={activity.user} size="xs" />
          <span className="text-xs text-gray-500 dark:text-gray-400">{activity.user}</span>
          <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{activity.timestamp}</span>
          {activity.patient && (
            <>
              <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{activity.patient}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Date Group ───────────────────────────────────────────────────────────────
function DateGroup({ date, activities }: { date: string; activities: Activity[] }) {
  return (
    <div>
      {/* Sticky date label */}
      <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 py-2 px-1 z-10">
        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {date}
        </span>
      </div>
      <Card className="divide-y divide-gray-100 dark:divide-gray-700/50 p-0 overflow-hidden">
        {activities.map((a) => (
          <ActivityRow key={a.id} activity={a} />
        ))}
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function ActivityLog() {
  const [activities, setActivities]   = useState<Activity[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [typeFilter, setTypeFilter]   = useState<ActivityType>('ALL');
  const [dateFilter, setDateFilter]   = useState('all');

  // Load from API
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await activityApi.getActivity();
        setActivities(data.map(mapApiActivity));
      } catch {
        setError('Could not load activity log. Please refresh.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Filter activities
  const filtered = activities.filter((a) => {
    const matchesType   = typeFilter === 'ALL' || a.type === typeFilter;
    const matchesSearch = !search
      || a.title.toLowerCase().includes(search.toLowerCase())
      || a.description.toLowerCase().includes(search.toLowerCase());
    const matchesDate = dateFilter === 'all'
      || a.date.toLowerCase().includes(dateFilter.toLowerCase());
    return matchesType && matchesSearch && matchesDate;
  });

  // Group by date
  const grouped = filtered.reduce<Record<string, Activity[]>>((acc, a) => {
    if (!acc[a.date]) acc[a.date] = [];
    acc[a.date].push(a);
    return acc;
  }, {});

  const dateOrder = ['Today', 'Yesterday'];
  const sortedDates = Object.keys(grouped).sort((a, b) => {
    const ai = dateOrder.indexOf(a);
    const bi = dateOrder.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return 0;
  });

  // Export to CSV — simple version
  const handleExport = () => {
    const rows = [
      ['Date', 'Time', 'Type', 'Title', 'Description', 'Status', 'User', 'Patient'],
      ...filtered.map((a) => [a.date, a.timestamp, a.type, a.title, a.description, a.status, a.user, a.patient]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = 'activity-log.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading activity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Activity Log</h1>
          <p className="page-subtitle">Complete history of all care activities</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </Button>
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

      {/* Search + Date filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search activities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          className="sm:w-64"
        />
        <Select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="sm:w-40"
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
        </Select>
      </div>

      {/* Type filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setTypeFilter(f.value)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              typeFilter === f.value
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
            )}
          >
            {f.label}
            {f.value !== 'ALL' && (
              <span className="ml-1.5 text-xs opacity-70">
                {activities.filter((a) => a.type === f.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Result count */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing{' '}
        <span className="font-semibold text-gray-900 dark:text-gray-50">{filtered.length}</span>
        {' '}activities
      </p>

      {/* Activity list grouped by date */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          title="No activities found"
          description="Try adjusting your filters to find what you're looking for."
          action={{
            label: 'Clear filters',
            onClick: () => { setSearch(''); setTypeFilter('ALL'); setDateFilter('all'); },
          }}
        />
      ) : (
        <div className="space-y-4">
          {sortedDates.map((date) => (
            <DateGroup key={date} date={date} activities={grouped[date]} />
          ))}
        </div>
      )}
    </div>
  );
}