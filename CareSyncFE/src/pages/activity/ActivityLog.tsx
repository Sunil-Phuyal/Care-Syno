import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { cn } from '../../utils/cn';

// ─── Types ───────────────────────────────────────────────────────────────────
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

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_ACTIVITIES: Activity[] = [
  { id: '1',  type: 'MEDICATION',   title: 'Metformin 500mg',          description: 'Morning dose administered on schedule',        status: 'ADMINISTERED', user: 'Sarah J.',  timestamp: '8:02 AM',  date: 'Today',     patient: 'Mary Johnson' },
  { id: '2',  type: 'APPOINTMENT',  title: 'Cardiology Checkup',        description: 'Scheduled for tomorrow at 10:00 AM',          status: 'PENDING',      user: 'Mike J.',   timestamp: '7:45 AM',  date: 'Today',     patient: 'Mary Johnson' },
  { id: '3',  type: 'MEDICATION',   title: 'Aspirin 81mg',              description: 'Afternoon dose was not administered',         status: 'OVERDUE',      user: 'System',    timestamp: '2:01 PM',  date: 'Today',     patient: 'Mary Johnson' },
  { id: '4',  type: 'NOTE',         title: 'Blood Pressure Reading',    description: 'BP: 120/80 mmHg - within normal range',       status: 'INFO',         user: 'Sarah J.',  timestamp: '9:15 AM',  date: 'Today',     patient: 'Mary Johnson' },
  { id: '5',  type: 'MEDICATION',   title: 'Lisinopril 10mg',           description: 'Noon dose administered successfully',         status: 'ADMINISTERED', user: 'Sarah J.',  timestamp: '12:05 PM', date: 'Yesterday', patient: 'Mary Johnson' },
  { id: '6',  type: 'ALERT',        title: 'Medication Missed Alert',   description: 'Vitamin D 1000IU evening dose missed',        status: 'SKIPPED',      user: 'System',    timestamp: '6:30 PM',  date: 'Yesterday', patient: 'Mary Johnson' },
  { id: '7',  type: 'CAREGIVER',    title: 'Caregiver Check-in',        description: 'Mike Johnson checked in remotely',            status: 'INFO',         user: 'Mike J.',   timestamp: '3:00 PM',  date: 'Yesterday', patient: 'Mary Johnson' },
  { id: '8',  type: 'MEDICATION',   title: 'Metformin 500mg',           description: 'Morning dose administered',                   status: 'ADMINISTERED', user: 'Sarah J.',  timestamp: '8:05 AM',  date: 'Yesterday', patient: 'Mary Johnson' },
  { id: '9',  type: 'APPOINTMENT',  title: 'GP Annual Review',          description: 'Completed - all vitals normal',               status: 'COMPLETED',    user: 'Dr. Smith', timestamp: '11:00 AM', date: '2 days ago', patient: 'Mary Johnson' },
  { id: '10', type: 'NOTE',         title: 'Side Effects Note',         description: 'Patient reported mild dizziness after Lisinopril', status: 'INFO',    user: 'Sarah J.',  timestamp: '2:30 PM',  date: '2 days ago', patient: 'Mary Johnson' },
];

// ─── Config ───────────────────────────────────────────────────────────────────
const TYPE_FILTERS: { label: string; value: ActivityType }[] = [
  { label: 'All Activity', value: 'ALL' },
  { label: 'Medications', value: 'MEDICATION' },
  { label: 'Appointments', value: 'APPOINTMENT' },
  { label: 'Notes', value: 'NOTE' },
  { label: 'Alerts', value: 'ALERT' },
  { label: 'Caregiver', value: 'CAREGIVER' },
];

const TYPE_ICONS: Record<Exclude<ActivityType, 'ALL'>, string> = {
  MEDICATION:  '💊',
  APPOINTMENT: '📅',
  NOTE:        '📝',
  ALERT:       '⚠️',
  CAREGIVER:   '👥',
};

const TYPE_COLORS: Record<Exclude<ActivityType, 'ALL'>, string> = {
  MEDICATION:  'bg-primary-100 dark:bg-primary-900/30',
  APPOINTMENT: 'bg-orange-100 dark:bg-orange-900/30',
  NOTE:        'bg-blue-100 dark:bg-blue-900/30',
  ALERT:       'bg-error-100 dark:bg-error-900/30',
  CAREGIVER:   'bg-purple-100 dark:bg-purple-900/30',
};

const STATUS_BADGE: Record<ActivityStatus, { label: string; className: string }> = {
  ADMINISTERED: { label: 'Administered', className: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400' },
  SKIPPED:      { label: 'Skipped',      className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  OVERDUE:      { label: 'Overdue',      className: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400' },
  PENDING:      { label: 'Pending',      className: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400' },
  COMPLETED:    { label: 'Completed',    className: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400' },
  INFO:         { label: 'Info',         className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
};

// ─── Activity Row ─────────────────────────────────────────────────────────────
function ActivityRow({ activity }: { activity: Activity }) {
  const badge = STATUS_BADGE[activity.status];

  return (
    <div className="flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors group">
      {/* Icon */}
      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0', TYPE_COLORS[activity.type])}>
        {TYPE_ICONS[activity.type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-50 text-sm">{activity.title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{activity.description}</p>
          </div>
          <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0', badge.className)}>
            {badge.label}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <Avatar fallback={activity.user} size="xs" />
          <span className="text-xs text-gray-500 dark:text-gray-400">{activity.user}</span>
          <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{activity.timestamp}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Date Group ───────────────────────────────────────────────────────────────
function DateGroup({ date, activities }: { date: string; activities: Activity[] }) {
  return (
    <div>
      <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 py-2 px-1 z-10">
        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {date}
        </span>
      </div>
      <Card className="divide-y divide-gray-100 dark:divide-gray-700/50">
        {activities.map(a => (
          <ActivityRow key={a.id} activity={a} />
        ))}
      </Card>
    </div>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function ActivityLog() {
  const [search, setSearch]           = useState('');
  const [typeFilter, setTypeFilter]   = useState<ActivityType>('ALL');
  const [dateFilter, setDateFilter]   = useState('all');

  // Filter
  const filtered = MOCK_ACTIVITIES.filter(a => {
    const matchesType   = typeFilter === 'ALL' || a.type === typeFilter;
    const matchesSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase());
    const matchesDate   = dateFilter === 'all' || a.date.toLowerCase().includes(dateFilter);
    return matchesType && matchesSearch && matchesDate;
  });

  // Group by date
  const grouped = filtered.reduce<Record<string, Activity[]>>((acc, a) => {
    if (!acc[a.date]) acc[a.date] = [];
    acc[a.date].push(a);
    return acc;
  }, {});

  const dateOrder = ['Today', 'Yesterday', '2 days ago'];
  const sortedDates = Object.keys(grouped).sort((a, b) => dateOrder.indexOf(a) - dateOrder.indexOf(b));

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Activity Log</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Complete history of care activities for Mary Johnson
          </p>
        </div>
        <Button variant="outline" size="sm">
          Export CSV
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search activities..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          className="sm:w-64"
        />
        <Select
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="sm:w-40"
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="2 days">2 Days Ago</option>
        </Select>
      </div>

      {/* Type Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {TYPE_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setTypeFilter(f.value)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              typeFilter === f.value
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
            )}
          >
            {f.label}
            {f.value !== 'ALL' && (
              <span className="ml-1.5 text-xs opacity-70">
                {MOCK_ACTIVITIES.filter(a => a.type === f.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing <span className="font-semibold text-gray-900 dark:text-gray-50">{filtered.length}</span> activities
      </p>

      {/* Activity List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          title="No activities found"
          description="Try adjusting your filters to find what you're looking for."
          action={{ label: 'Clear filters', onClick: () => { setSearch(''); setTypeFilter('ALL'); setDateFilter('all'); } }}
        />
      ) : (
        <div className="space-y-4">
          {sortedDates.map(date => (
            <DateGroup key={date} date={date} activities={grouped[date]} />
          ))}
        </div>
      )}
    </div>
  );
}