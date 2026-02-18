import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { cn } from '../../utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────
type EventType = 'MEDICATION' | 'APPOINTMENT' | 'CHECKUP' | 'THERAPY';

interface ScheduleEvent {
  id: string;
  title: string;
  type: EventType;
  time: string;
  duration: string;
  location?: string;
  provider?: string;
  notes?: string;
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TODAY_INDEX = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

const THIS_MONTH_EVENTS: Record<number, EventType[]> = {
  3:  ['MEDICATION'],
  7:  ['APPOINTMENT'],
  10: ['MEDICATION', 'CHECKUP'],
  14: ['APPOINTMENT'],
  17: ['THERAPY'],
  21: ['MEDICATION'],
  24: ['APPOINTMENT', 'CHECKUP'],
  28: ['THERAPY'],
};

const TODAY_SCHEDULE: ScheduleEvent[] = [
  { id: '1', title: 'Metformin 500mg',    type: 'MEDICATION',   time: '8:00 AM',  duration: '5 min',   status: 'COMPLETED',  notes: 'Take with breakfast' },
  { id: '2', title: 'Morning Walk',       type: 'THERAPY',      time: '9:00 AM',  duration: '30 min',  status: 'COMPLETED' },
  { id: '3', title: 'Lisinopril 10mg',    type: 'MEDICATION',   time: '12:00 PM', duration: '5 min',   status: 'UPCOMING',   notes: 'Take with water' },
  { id: '4', title: 'Cardiology Checkup', type: 'APPOINTMENT',  time: '2:30 PM',  duration: '60 min',  status: 'UPCOMING',   location: 'City Medical Center', provider: 'Dr. Sarah Williams' },
  { id: '5', title: 'Aspirin 81mg',       type: 'MEDICATION',   time: '6:00 PM',  duration: '5 min',   status: 'UPCOMING' },
  { id: '6', title: 'Evening Walk',       type: 'THERAPY',      time: '6:30 PM',  duration: '20 min',  status: 'UPCOMING' },
];

// ─── Config ───────────────────────────────────────────────────────────────────
const EVENT_COLORS: Record<EventType, { bg: string; text: string; dot: string; pill: string }> = {
  MEDICATION:  { bg: 'bg-primary-50 dark:bg-primary-900/20',  text: 'text-primary-700 dark:text-primary-300',  dot: 'bg-primary-500',  pill: 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400' },
  APPOINTMENT: { bg: 'bg-orange-50 dark:bg-orange-900/20',    text: 'text-orange-700 dark:text-orange-300',    dot: 'bg-orange-500',   pill: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400' },
  CHECKUP:     { bg: 'bg-blue-50 dark:bg-blue-900/20',        text: 'text-blue-700 dark:text-blue-300',        dot: 'bg-blue-500',     pill: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400' },
  THERAPY:     { bg: 'bg-success-50 dark:bg-success-900/20',  text: 'text-success-700 dark:text-success-300',  dot: 'bg-success-500',  pill: 'bg-success-100 dark:bg-success-900/40 text-success-700 dark:text-success-400' },
};

const EVENT_ICONS: Record<EventType, string> = {
  MEDICATION:  '💊',
  APPOINTMENT: '🏥',
  CHECKUP:     '🩺',
  THERAPY:     '🏃',
};

// ─── Calendar Grid ────────────────────────────────────────────────────────────
function CalendarGrid() {
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </CardTitle>
        <div className="flex gap-1">
          <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-bold text-gray-400 dark:text-gray-500 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-0.5">
          {/* Empty offset cells */}
          {Array.from({ length: offset }).map((_, i) => <div key={`e-${i}`} />)}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const isToday    = day === now.getDate();
            const isSelected = day === selectedDay;
            const events     = THIS_MONTH_EVENTS[day];

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  'relative flex flex-col items-center py-1.5 rounded-lg transition-all text-sm',
                  isSelected && !isToday && 'bg-gray-100 dark:bg-gray-700',
                  isToday    && 'bg-primary-600 text-white',
                  !isToday   && 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                <span className="font-medium">{day}</span>
                {events && (
                  <div className="flex gap-0.5 mt-0.5">
                    {events.slice(0, 3).map((type, i) => (
                      <span
                        key={i}
                        className={cn('w-1.5 h-1.5 rounded-full', isToday ? 'bg-white/80' : EVENT_COLORS[type].dot)}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          {(Object.keys(EVENT_COLORS) as EventType[]).map(type => (
            <div key={type} className="flex items-center gap-1.5">
              <span className={cn('w-2 h-2 rounded-full', EVENT_COLORS[type].dot)} />
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{type.toLowerCase()}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Event Card ───────────────────────────────────────────────────────────────
function EventCard({ event, onEdit }: { event: ScheduleEvent; onEdit: (e: ScheduleEvent) => void }) {
  const colors = EVENT_COLORS[event.type];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-xl border transition-all hover:shadow-sm cursor-pointer',
        event.status === 'COMPLETED'
          ? 'border-gray-200 dark:border-gray-700 opacity-60'
          : `border-gray-200 dark:border-gray-700 ${colors.bg}`,
      )}
      onClick={() => onEdit(event)}
    >
      {/* Time */}
      <div className="text-center w-14 flex-shrink-0">
        <p className="text-xs font-bold text-gray-900 dark:text-gray-50">{event.time}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{event.duration}</p>
      </div>

      {/* Divider */}
      <div className={cn('w-0.5 self-stretch rounded-full flex-shrink-0', colors.dot)} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-base">{EVENT_ICONS[event.type]}</span>
          <p className={cn('text-sm font-semibold', event.status === 'COMPLETED' ? 'line-through text-gray-500 dark:text-gray-500' : 'text-gray-900 dark:text-gray-50')}>
            {event.title}
          </p>
        </div>
        {event.provider  && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">👤 {event.provider}</p>}
        {event.location  && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">📍 {event.location}</p>}
        {event.notes     && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 italic">{event.notes}</p>}
      </div>

      {/* Status */}
      <span className={cn(
        'text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0',
        event.status === 'COMPLETED'  && 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400',
        event.status === 'UPCOMING'   && colors.pill,
        event.status === 'CANCELLED'  && 'bg-gray-100 dark:bg-gray-800 text-gray-500'
      )}>
        {event.status === 'COMPLETED' ? '✓ Done' : event.status === 'UPCOMING' ? 'Upcoming' : 'Cancelled'}
      </span>
    </div>
  );
}

// ─── Add Event Modal ──────────────────────────────────────────────────────────
function AddEventModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ title: '', type: 'MEDICATION', date: '', time: '', duration: '', location: '', provider: '', notes: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <Modal open={open} onClose={onClose} size="md">
      <ModalHeader>
        <ModalTitle>Add Schedule Event</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <Input name="title"    label="Event Title"    value={form.title}    onChange={handleChange} placeholder="e.g. Metformin 500mg" required />
          <Select name="type"    label="Event Type"     value={form.type}     onChange={handleChange}>
            <option value="MEDICATION">💊 Medication</option>
            <option value="APPOINTMENT">🏥 Appointment</option>
            <option value="CHECKUP">🩺 Checkup</option>
            <option value="THERAPY">🏃 Therapy / Exercise</option>
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input name="date"     label="Date"     value={form.date}     onChange={handleChange} type="date" required />
            <Input name="time"     label="Time"     value={form.time}     onChange={handleChange} type="time" required />
          </div>
          <Input name="duration"   label="Duration (e.g. 30 min)" value={form.duration}   onChange={handleChange} placeholder="30 min" />
          <Input name="location"   label="Location (optional)"    value={form.location}   onChange={handleChange} placeholder="e.g. City Medical Center" />
          <Input name="provider"   label="Provider (optional)"    value={form.provider}   onChange={handleChange} placeholder="e.g. Dr. Smith" />
          <Textarea name="notes"   label="Notes (optional)"       value={form.notes}      onChange={handleChange} rows={2} resize="none" placeholder="Any additional notes..." />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary"   onClick={onClose}>Add Event</Button>
      </ModalFooter>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function ScheduleManagement() {
  const [showAddEvent,     setShowAddEvent]     = useState(false);
  const [selectedEvent,    setSelectedEvent]    = useState<ScheduleEvent | null>(null);

  const completed = TODAY_SCHEDULE.filter(e => e.status === 'COMPLETED').length;
  const upcoming  = TODAY_SCHEDULE.filter(e => e.status === 'UPCOMING').length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Schedule</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowAddEvent(true)}
          leftIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
        >
          Add Event
        </Button>
      </div>

      {/* Summary Chips */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-4 py-2 bg-success-50 dark:bg-success-900/20 rounded-full">
          <span className="w-2 h-2 rounded-full bg-success-500" />
          <span className="text-sm font-medium text-success-700 dark:text-success-400">{completed} completed</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-full">
          <span className="w-2 h-2 rounded-full bg-primary-500" />
          <span className="text-sm font-medium text-primary-700 dark:text-primary-400">{upcoming} upcoming</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Calendar */}
        <div>
          <CalendarGrid />
        </div>

        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Today's Schedule</CardTitle>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {TODAY_SCHEDULE.length} events
              </span>
            </CardHeader>
            <CardContent className="pb-4 space-y-2">
              {TODAY_SCHEDULE.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEdit={setSelectedEvent}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Event Modal */}
      <AddEventModal open={showAddEvent} onClose={() => setShowAddEvent(false)} />

      {/* Event Detail Modal */}
      {selectedEvent && (
        <Modal open={!!selectedEvent} onClose={() => setSelectedEvent(null)} size="sm">
          <ModalHeader>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{EVENT_ICONS[selectedEvent.type]}</span>
              <ModalTitle>{selectedEvent.title}</ModalTitle>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-gray-600 dark:text-gray-300">{selectedEvent.time} · {selectedEvent.duration}</span>
              </div>
              {selectedEvent.location && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="text-gray-600 dark:text-gray-300">{selectedEvent.location}</span>
                </div>
              )}
              {selectedEvent.provider && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <span className="text-gray-600 dark:text-gray-300">{selectedEvent.provider}</span>
                </div>
              )}
              {selectedEvent.notes && (
                <p className="text-gray-500 dark:text-gray-400 italic">{selectedEvent.notes}</p>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setSelectedEvent(null)}>Close</Button>
            <Button variant="primary">Edit Event</Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}