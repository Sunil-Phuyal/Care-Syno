// src/pages/alerts/Alerts.tsx

import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';

const alerts = [
  { id: 1, type: 'MISSED',   title: 'Missed Medication',    message: 'Metformin 500mg was not administered at 8:00 AM.',   time: '2 hours ago', urgent: true  },
  { id: 2, type: 'OVERDUE',  title: 'Overdue Medication',   message: 'Blood pressure medication is 1 hour overdue.',       time: '1 hour ago',  urgent: true  },
  { id: 3, type: 'REMINDER', title: 'Upcoming Appointment', message: 'Dr. Smith appointment tomorrow at 10:00 AM.',        time: '3 hours ago', urgent: false },
  { id: 4, type: 'INFO',     title: 'Caregiver Joined',     message: 'Sita Sharma has accepted the care team invitation.', time: 'Yesterday',   urgent: false },
];

const TYPE_STYLES: Record<string, { bg: string; icon: string; badge: string }> = {
  MISSED:   { bg: 'bg-error-50 dark:bg-error-900 border-error-200 dark:border-error-800',         icon: '❌', badge: 'bg-error-100 dark:bg-error-800 text-error-700 dark:text-error-200' },
  OVERDUE:  { bg: 'bg-warning-50 dark:bg-warning-900 border-warning-200 dark:border-warning-800', icon: '⏰', badge: 'bg-warning-100 dark:bg-warning-800 text-warning-700 dark:text-warning-200' },
  REMINDER: { bg: 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800',             icon: '📅', badge: 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200' },
  INFO:     { bg: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',             icon: 'ℹ️', badge: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' },
};

export function Alerts() {
  const navigate  = useNavigate();
  const urgent    = alerts.filter((a) => a.urgent);
  const normal    = alerts.filter((a) => !a.urgent);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="page-title">Alerts</h1>
          <p className="page-subtitle">
            {urgent.length > 0
              ? `${urgent.length} urgent alert${urgent.length > 1 ? 's' : ''} need your attention`
              : 'All caught up — no urgent alerts'}
          </p>
        </div>
        {alerts.length > 0 && (
          <button className="btn btn-secondary text-sm">Mark all as read</button>
        )}
      </div>

      {/* Urgent */}
      {urgent.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-error-600 dark:text-error-400 uppercase tracking-wider">
            🚨 Urgent
          </p>
          {urgent.map((alert) => {
            const style = TYPE_STYLES[alert.type];
            return (
              <div key={alert.id} className={cn('flex items-start gap-4 p-4 rounded-xl border', style.bg)}>
                <span className="text-2xl flex-shrink-0">{style.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-50">{alert.title}</h3>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', style.badge)}>
                      {alert.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{alert.message}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{alert.time}</p>
                </div>
                <button className="btn btn-secondary btn-sm flex-shrink-0">Dismiss</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Normal */}
      {normal.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Other Alerts
          </p>
          <div className="card divide-y divide-gray-100 dark:divide-gray-700">
            {normal.map((alert) => {
              const style = TYPE_STYLES[alert.type];
              return (
                <div key={alert.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                  <span className="text-xl flex-shrink-0 mt-0.5">{style.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{alert.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{alert.message}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{alert.time}</p>
                  </div>
                  <button className="btn btn-ghost btn-sm flex-shrink-0 text-gray-400">✕</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {alerts.length === 0 && (
        <div className="card text-center py-16">
          <p className="text-5xl mb-4">🎉</p>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">All caught up!</h3>
          <p className="text-gray-500 dark:text-gray-400">No alerts at the moment.</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary mt-6">
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}