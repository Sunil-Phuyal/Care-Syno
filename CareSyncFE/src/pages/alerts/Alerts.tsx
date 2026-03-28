// src/pages/alerts/Alerts.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicationApi } from '../../api/medication.api';
import { usePatient } from '../../context/PatientContext';
import { Spinner } from '../../components/ui/Spinner';
import { cn } from '../../utils/cn';
import type { TodayScheduleDTO, UpcomingMedicationDTO } from '../../types/medication.types';

// ─────────────────────────────────────────────────────────────
// Alert shape built from real API data
// ─────────────────────────────────────────────────────────────
type AlertSeverity = 'critical' | 'warning' | 'info';

interface Alert {
  id: string;
  severity: AlertSeverity;
  category: 'MISSED' | 'OVERDUE' | 'UPCOMING' | 'INFO';
  title: string;
  description: string;
  time: string;
  scheduleId?: number;
  patientName?: string;
}

// ─────────────────────────────────────────────────────────────
// Build alerts from API responses
// ─────────────────────────────────────────────────────────────
function buildAlerts(
  todaySchedules: TodayScheduleDTO[],
  upcomingMedications: UpcomingMedicationDTO[],
  patientName: string
): Alert[] {
  const alerts: Alert[] = [];

  // MISSED — past time, not administered
  todaySchedules
    .filter((s) => s.isPast && !s.isAdministered)
    .forEach((s) => {
      const scheduledTime = s.scheduledTime
        ? new Date(s.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';
      alerts.push({
        id: `missed-${s.scheduleId}`,
        severity: 'critical',
        category: 'MISSED',
        title: 'Missed Medication',
        description: `${s.medicationName} ${s.dosage} was not administered${scheduledTime ? ` at ${scheduledTime}` : ''}.`,
        time: scheduledTime ? `Scheduled at ${scheduledTime}` : 'Earlier today',
        scheduleId: s.scheduleId,
        patientName,
      });
    });

  // OVERDUE — upcoming but minutesUntilDue is negative
  upcomingMedications
    .filter((m) => m.isOverdue)
    .forEach((m) => {
      const minsLate = Math.abs(m.minutesUntilDue);
      alerts.push({
        id: `overdue-${m.scheduleId}`,
        severity: 'critical',
        category: 'OVERDUE',
        title: 'Overdue Medication',
        description: `${m.medicationName} ${m.dosage} is ${minsLate} minute${minsLate !== 1 ? 's' : ''} overdue.`,
        time: `${minsLate} min overdue`,
        scheduleId: m.scheduleId,
        patientName,
      });
    });

  // UPCOMING — due within 30 minutes, not overdue
  upcomingMedications
    .filter((m) => !m.isOverdue && m.minutesUntilDue <= 30)
    .forEach((m) => {
      const scheduledTime = m.scheduledTime
        ? new Date(m.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';
      alerts.push({
        id: `upcoming-${m.scheduleId}`,
        severity: 'warning',
        category: 'UPCOMING',
        title: 'Upcoming Medication',
        description: `${m.medicationName} ${m.dosage} is due in ${m.minutesUntilDue} minute${m.minutesUntilDue !== 1 ? 's' : ''}.`,
        time: scheduledTime ? `Due at ${scheduledTime}` : `In ${m.minutesUntilDue} min`,
        scheduleId: m.scheduleId,
        patientName,
      });
    });

  return alerts;
}

// ─────────────────────────────────────────────────────────────
// Severity config — text only, no emoji, consistent with system
// ─────────────────────────────────────────────────────────────
const SEVERITY_CONFIG: Record<AlertSeverity, {
  bar: string;
  badge: string;
  badgeText: string;
  rowBg: string;
  label: string;
}> = {
  critical: {
    bar:       'bg-error-500',
    badge:     'bg-error-100 dark:bg-error-900',
    badgeText: 'text-error-700 dark:text-error-300',
    rowBg:     'bg-error-50 dark:bg-error-900 border-error-100 dark:border-error-800',
    label:     'Critical',
  },
  warning: {
    bar:       'bg-warning-500',
    badge:     'bg-warning-100 dark:bg-warning-900',
    badgeText: 'text-warning-700 dark:text-warning-300',
    rowBg:     'bg-warning-50 dark:bg-warning-900 border-warning-100 dark:border-warning-800',
    label:     'Warning',
  },
  info: {
    bar:       'bg-primary-400',
    badge:     'bg-primary-100 dark:bg-primary-900',
    badgeText: 'text-primary-700 dark:text-primary-300',
    rowBg:     'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700',
    label:     'Info',
  },
};

const CATEGORY_LABEL: Record<string, string> = {
  MISSED:   'Missed',
  OVERDUE:  'Overdue',
  UPCOMING: 'Upcoming',
  INFO:     'Info',
};

// ─────────────────────────────────────────────────────────────
// Single alert row
// ─────────────────────────────────────────────────────────────
function AlertRow({
  alert,
  onDismiss,
  onAction,
}: {
  alert: Alert;
  onDismiss: (id: string) => void;
  onAction: (scheduleId: number) => void;
}) {
  const cfg = SEVERITY_CONFIG[alert.severity];

  return (
    <div className={cn(
      'relative flex items-start gap-4 p-4 rounded-xl border overflow-hidden',
      cfg.rowBg
    )}>
      {/* Left severity bar */}
      <div className={cn('absolute left-0 top-0 bottom-0 w-1 rounded-l-xl', cfg.bar)} />

      {/* Content */}
      <div className="flex-1 min-w-0 pl-2">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-md', cfg.badge, cfg.badgeText)}>
            {CATEGORY_LABEL[alert.category]}
          </span>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
            {alert.title}
          </h3>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          {alert.description}
        </p>

        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {alert.patientName && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Patient: <span className="font-medium text-gray-600 dark:text-gray-300">{alert.patientName}</span>
            </span>
          )}
          <span className="text-xs text-gray-400 dark:text-gray-500">{alert.time}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* OVERDUE only → still actionable, give it now */}
        {alert.category === 'OVERDUE' && alert.scheduleId && (
          <button
            onClick={() => onAction(alert.scheduleId!)}
            className="btn btn-primary btn-sm"
          >
            Log Now
          </button>
        )}
        {/* MISSED → no log button, just dismiss and acknowledge */}
        <button
          onClick={() => onDismiss(alert.id)}
          className="btn btn-ghost btn-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Summary stats bar at the top
// ─────────────────────────────────────────────────────────────
function AlertSummary({ alerts }: { alerts: Alert[] }) {
  const critical = alerts.filter((a) => a.severity === 'critical').length;
  const warnings = alerts.filter((a) => a.severity === 'warning').length;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="card py-4 text-center">
        <p className={cn(
          'text-2xl font-bold',
          critical > 0 ? 'text-error-600 dark:text-error-400' : 'text-gray-300 dark:text-gray-600'
        )}>
          {critical}
        </p>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">Critical</p>
      </div>
      <div className="card py-4 text-center">
        <p className={cn(
          'text-2xl font-bold',
          warnings > 0 ? 'text-warning-600 dark:text-warning-400' : 'text-gray-300 dark:text-gray-600'
        )}>
          {warnings}
        </p>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">Warnings</p>
      </div>
      <div className="card py-4 text-center">
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{alerts.length}</p>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">Total</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Filter tab bar
// ─────────────────────────────────────────────────────────────
type FilterType = 'ALL' | 'MISSED' | 'OVERDUE' | 'UPCOMING';

function FilterTabs({
  active,
  counts,
  onChange,
}: {
  active: FilterType;
  counts: Record<FilterType, number>;
  onChange: (f: FilterType) => void;
}) {
  const tabs: { key: FilterType; label: string }[] = [
    { key: 'ALL',      label: 'All' },
    { key: 'MISSED',   label: 'Missed' },
    { key: 'OVERDUE',  label: 'Overdue' },
    { key: 'UPCOMING', label: 'Upcoming' },
  ];

  return (
    <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
            active === tab.key
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          )}
        >
          {tab.label}
          {counts[tab.key] > 0 && (
            <span className={cn(
              'ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-semibold',
              active === tab.key
                ? tab.key === 'MISSED' || tab.key === 'OVERDUE'
                  ? 'bg-error-100 dark:bg-error-900 text-error-600 dark:text-error-400'
                  : 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
            )}>
              {counts[tab.key]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────
export function Alerts() {
  const navigate = useNavigate();
  const { selectedPatient, myPatients } = usePatient();

  const [alerts, setAlerts]           = useState<Alert[]>([]);
  const [dismissed, setDismissed]     = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState('');
  const [filter, setFilter]           = useState<FilterType>('ALL');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const loadAlerts = useCallback(async () => {
    if (!selectedPatient) { setIsLoading(false); return; }

    setIsLoading(true);
    setError('');

    try {
      const [todayData, upcomingData] = await Promise.all([
        medicationApi.getTodaysSchedule(selectedPatient.patientId),
        medicationApi.getUpcomingMedications(selectedPatient.patientId),
      ]);

      const built = buildAlerts(todayData, upcomingData, selectedPatient.fullName);
      setAlerts(built);
      setLastRefreshed(new Date());
    } catch {
      setError('Failed to load alerts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedPatient]);

  useEffect(() => { loadAlerts(); }, [loadAlerts]);

  // Auto-refresh every 2 minutes so alerts stay current
  useEffect(() => {
    const interval = setInterval(loadAlerts, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadAlerts]);

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set([...prev, id]));
  };

  const handleDismissAll = () => {
    setDismissed(new Set(alerts.map((a) => a.id)));
  };

  const handleAction = (scheduleId: number) => {
    navigate('/medications/log', { state: { scheduleId } });
  };

  // Visible alerts = not dismissed
  const visible = alerts.filter((a) => !dismissed.has(a.id));

  // Filtered by tab
  const filtered = filter === 'ALL'
    ? visible
    : visible.filter((a) => a.category === filter);

  // Counts per tab
  const counts: Record<FilterType, number> = {
    ALL:      visible.length,
    MISSED:   visible.filter((a) => a.category === 'MISSED').length,
    OVERDUE:  visible.filter((a) => a.category === 'OVERDUE').length,
    UPCOMING: visible.filter((a) => a.category === 'UPCOMING').length,
  };

  // Split by severity for display
  const criticalAlerts = filtered.filter((a) => a.severity === 'critical');
  const warningAlerts  = filtered.filter((a) => a.severity === 'warning');

  if (!selectedPatient) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Please select a patient to view alerts.
        </p>
        <button onClick={() => navigate('/patients')} className="btn btn-primary">
          Go to Patients
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="page-title">Alerts</h1>
          <p className="page-subtitle">
            {isLoading
              ? 'Loading alerts...'
              : visible.length > 0
                ? `${visible.filter((a) => a.severity === 'critical').length > 0
                    ? `${visible.filter((a) => a.severity === 'critical').length} critical alert${visible.filter((a) => a.severity === 'critical').length !== 1 ? 's' : ''} require attention`
                    : 'No critical alerts'}`
                : 'All caught up — no active alerts'
            }
            {' · '}
            <span className="text-primary-600 dark:text-primary-400 font-medium">
              {selectedPatient.fullName}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Last refreshed time */}
          <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
            Updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>

          <button
            onClick={loadAlerts}
            disabled={isLoading}
            className="btn btn-secondary btn-sm"
          >
            Refresh
          </button>

          {visible.length > 0 && (
            <button
              onClick={handleDismissAll}
              className="btn btn-ghost btn-sm text-gray-500"
            >
              Dismiss all
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between gap-3 p-4 bg-error-50 dark:bg-error-900 border border-error-200 dark:border-error-800 rounded-xl">
          <p className="text-sm text-error-700 dark:text-error-300">{error}</p>
          <button onClick={loadAlerts} className="btn btn-secondary btn-sm">Retry</button>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Checking medications...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          {alerts.length > 0 && <AlertSummary alerts={visible} />}

          {/* Filter tabs — only show if there are alerts */}
          {visible.length > 0 && (
            <FilterTabs active={filter} counts={counts} onChange={setFilter} />
          )}

          {/* Alert list */}
          {filtered.length === 0 && !isLoading ? (
            <div className="card text-center py-16">
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                {filter === 'ALL' ? 'All caught up' : `No ${filter.toLowerCase()} alerts`}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {filter === 'ALL'
                  ? `No active alerts for ${selectedPatient.fullName} right now.`
                  : `There are no ${filter.toLowerCase()} alerts at this time.`}
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => navigate('/medications/schedules')} className="btn btn-secondary">
                  View Schedules
                </button>
                <button onClick={() => navigate('/medications/log')} className="btn btn-primary">
                  Log Medication
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">

              {/* Critical section */}
              {criticalAlerts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-error-200 dark:bg-error-800" />
                    <p className="text-xs font-bold text-error-600 dark:text-error-400 uppercase tracking-widest">
                      Requires Action
                    </p>
                    <div className="h-px flex-1 bg-error-200 dark:bg-error-800" />
                  </div>
                  <div className="space-y-2">
                    {criticalAlerts.map((alert) => (
                      <AlertRow
                        key={alert.id}
                        alert={alert}
                        onDismiss={handleDismiss}
                        onAction={handleAction}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Warning section */}
              {warningAlerts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      Upcoming
                    </p>
                    <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <div className="space-y-2">
                    {warningAlerts.map((alert) => (
                      <AlertRow
                        key={alert.id}
                        alert={alert}
                        onDismiss={handleDismiss}
                        onAction={handleAction}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick navigation footer */}
          {visible.length > 0 && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => navigate('/medications/schedules')}
                className="btn btn-ghost text-sm text-gray-500 dark:text-gray-400"
              >
                View all schedules
              </button>
              <button
                onClick={() => navigate('/medications/history')}
                className="btn btn-ghost text-sm text-gray-500 dark:text-gray-400"
              >
                Administration history
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}