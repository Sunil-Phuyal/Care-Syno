// src/pages/activity/ActivityLog.tsx

import { useState, useEffect } from 'react';
import { activityApi } from '../../api/activity.api';
import type { ActivityDTO } from '../../api/activity.api';
import { usePatient } from '../../context/PatientContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { cn } from '../../utils/cn';

// ─────────────────────────────────────────────────────────────
// Derive a display "type" from backend activityType string
// e.g. "MEDICATION_ADMINISTERED" → "MEDICATION"
// ─────────────────────────────────────────────────────────────
type DisplayType = 'ALL' | 'MEDICATION';

function getDisplayType(activityType: string): Exclude<DisplayType, 'ALL'> {
  if (activityType.startsWith('MEDICATION')) return 'MEDICATION';
  return 'MEDICATION'; // currently backend only returns medication activities
}

// ─────────────────────────────────────────────────────────────
// Color config using system tokens only (no orange, purple, blue
// that aren't in tailwind config)
// ─────────────────────────────────────────────────────────────
const COLOR_CONFIG: Record<ActivityDTO['color'], {
  bar: string;
  badge: string;
  badgeText: string;
}> = {
  success: {
    bar:       'bg-success-500',
    badge:     'bg-success-100 dark:bg-success-900',
    badgeText: 'text-success-700 dark:text-success-300',
  },
  warning: {
    bar:       'bg-warning-500',
    badge:     'bg-warning-100 dark:bg-warning-900',
    badgeText: 'text-warning-700 dark:text-warning-300',
  },
  error: {
    bar:       'bg-error-500',
    badge:     'bg-error-100 dark:bg-error-900',
    badgeText: 'text-error-700 dark:text-error-300',
  },
  info: {
    bar:       'bg-primary-400',
    badge:     'bg-primary-100 dark:bg-primary-900',
    badgeText: 'text-primary-700 dark:text-primary-300',
  },
};

// Friendly label from activityType
// "MEDICATION_ADMINISTERED" → "Administered"
// "MEDICATION_MISSED"       → "Missed"
function getActivityLabel(activityType: string): string {
  const suffix = activityType.split('_').slice(1).join(' ');
  if (!suffix) return activityType;
  return suffix.charAt(0).toUpperCase() + suffix.slice(1).toLowerCase();
}

// Format timestamp for grouping
function getDateLabel(isoString: string): string {
  const date      = new Date(isoString);
  const today     = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString())     return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─────────────────────────────────────────────────────────────
// Single activity row
// ─────────────────────────────────────────────────────────────
function ActivityRow({ item }: { item: ActivityDTO }) {
  const cfg   = COLOR_CONFIG[item.color] ?? COLOR_CONFIG.info;
  const label = getActivityLabel(item.activityType);
  const time  = new Date(item.timestamp).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="relative flex items-start gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-xl transition-colors overflow-hidden">
      {/* Left color bar */}
      <div className={cn('absolute left-0 top-2 bottom-2 w-0.5 rounded-full', cfg.bar)} />

      {/* Content */}
      <div className="flex-1 min-w-0 pl-3">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-md', cfg.badge, cfg.badgeText)}>
            {label}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">{time}</span>
        </div>

        <p className="text-sm text-gray-700 dark:text-gray-200 leading-snug">
          {item.description}
        </p>

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            by <span className="font-medium text-gray-700 dark:text-gray-300">{item.performedByName}</span>
          </span>
          {item.patientName && (
            <>
              <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
              <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                {item.patientName}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Date group
// ─────────────────────────────────────────────────────────────
function DateGroup({ date, items }: { date: string; items: ActivityDTO[] }) {
  return (
    <div>
      <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 py-2 px-1 z-10">
        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {date}
        </span>
      </div>
      <div className="card divide-y divide-gray-100 dark:divide-gray-700/50 p-2">
        {items.map((item) => (
          <ActivityRow key={item.activityId} item={item} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────
export function ActivityLog() {
  const { selectedPatient } = usePatient();

  const [activities, setActivities] = useState<ActivityDTO[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [colorFilter, setColorFilter] = useState<'ALL' | ActivityDTO['color']>('ALL');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        let data: ActivityDTO[];

        if (selectedPatient) {
          // Specific patient — use patientActivity endpoint
          data = await activityApi.getPatientActivity(selectedPatient.patientId, 50);
        } else {
          // No patient selected — load recent across all patients
          data = await activityApi.getRecentActivity(20);
        }

        setActivities(data);
      } catch {
        setError('Could not load activity log. Please refresh.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [selectedPatient]);

  // ── Filtering ──
  const filtered = activities.filter((a) => {
    const matchesSearch = !search
      || a.description.toLowerCase().includes(search.toLowerCase())
      || a.performedByName.toLowerCase().includes(search.toLowerCase())
      || a.patientName?.toLowerCase().includes(search.toLowerCase());

    const matchesColor = colorFilter === 'ALL' || a.color === colorFilter;

    const dateLabel = getDateLabel(a.timestamp).toLowerCase();
    const matchesDate = dateFilter === 'all'
      || (dateFilter === 'today'     && dateLabel === 'today')
      || (dateFilter === 'yesterday' && dateLabel === 'yesterday');

    return matchesSearch && matchesColor && matchesDate;
  });

  // ── Group by date ──
  const grouped = filtered.reduce<Record<string, ActivityDTO[]>>((acc, a) => {
    const label = getDateLabel(a.timestamp);
    if (!acc[label]) acc[label] = [];
    acc[label].push(a);
    return acc;
  }, {});

  const dateOrder   = ['Today', 'Yesterday'];
  const sortedDates = Object.keys(grouped).sort((a, b) => {
    const ai = dateOrder.indexOf(a);
    const bi = dateOrder.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return 0;
  });

  // ── CSV export ──
  const handleExport = () => {
    const rows = [
      ['Date', 'Time', 'Type', 'Description', 'Performed By', 'Patient'],
      ...filtered.map((a) => [
        getDateLabel(a.timestamp),
        new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        a.activityType,
        a.description,
        a.performedByName,
        a.patientName,
      ]),
    ];
    const csv  = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'activity-log.csv'; link.click();
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
          <p className="page-subtitle">
            {selectedPatient
              ? <>Care history for <span className="font-semibold text-primary-600 dark:text-primary-400">{selectedPatient.fullName}</span></>
              : 'Recent activity across all patients'
            }
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleExport}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between gap-3 p-4 bg-error-50 dark:bg-error-900 border border-error-200 dark:border-error-800 rounded-xl">
          <p className="text-sm text-error-700 dark:text-error-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-secondary btn-sm"
          >
            Refresh
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search by description, caregiver, or patient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:flex-1"
        />
        <Select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="sm:w-36"
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
        </Select>
        <Select
          value={colorFilter}
          onChange={(e) => setColorFilter(e.target.value as any)}
          className="sm:w-40"
        >
          <option value="ALL">All Status</option>
          <option value="success">Administered</option>
          <option value="warning">Skipped</option>
          <option value="error">Missed / Refused</option>
          <option value="info">Other</option>
        </Select>
      </div>

      {/* Result count + clear */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing{' '}
          <span className="font-semibold text-gray-900 dark:text-gray-50">{filtered.length}</span>
          {' '}of{' '}
          <span className="font-semibold text-gray-900 dark:text-gray-50">{activities.length}</span>
          {' '}activities
        </p>
        {(search || dateFilter !== 'all' || colorFilter !== 'ALL') && (
          <button
            onClick={() => { setSearch(''); setDateFilter('all'); setColorFilter('ALL'); }}
            className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Activity list */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No activities found"
          description="Try adjusting your filters to find what you are looking for."
          action={{
            label: 'Clear filters',
            onClick: () => { setSearch(''); setDateFilter('all'); setColorFilter('ALL'); },
          }}
        />
      ) : (
        <div className="space-y-4">
          {sortedDates.map((date) => (
            <DateGroup key={date} date={date} items={grouped[date]} />
          ))}
        </div>
      )}
    </div>
  );
}