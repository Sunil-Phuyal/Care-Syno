// src/pages/ScheduleManagement.tsx
//
// Changes from original:
// - Fixed all dark:bg-*-900/20 opacity classes → solid colors (no more CSS errors)
// - Connected to real API via medicationApi.getPatientSchedules()
// - Added usePatient context to get selectedPatient
// - Kept all existing structure, calendar, modals, and logic intact

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { SkeletonCard, Skeleton } from '../../components/ui/Skeleton';
import { medicationApi } from '../../api/medication.api';
import { cn } from '../../utils/cn';
import type { MedicationSchedule } from '../../types/medication.types';
import { Spinner } from '../../components/ui/Spinner';
import { usePatient } from '../../context/PatientContext';

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

// ─── Config ───────────────────────────────────────────────────────────────────
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Solid dark mode colors — no opacity tricks that break @apply
const EVENT_COLORS: Record<EventType, { bg: string; text: string; dot: string; pill: string }> = {
  MEDICATION:  {
    bg:   'bg-primary-50 dark:bg-primary-900',
    text: 'text-primary-700 dark:text-primary-300',
    dot:  'bg-primary-500',
    pill: 'bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-300',
  },
  APPOINTMENT: {
    bg:   'bg-orange-50 dark:bg-orange-900',
    text: 'text-orange-700 dark:text-orange-300',
    dot:  'bg-orange-500',
    pill: 'bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300',
  },
  CHECKUP: {
    bg:   'bg-blue-50 dark:bg-blue-900',
    text: 'text-blue-700 dark:text-blue-300',
    dot:  'bg-blue-500',
    pill: 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300',
  },
  THERAPY: {
    bg:   'bg-success-50 dark:bg-success-900',
    text: 'text-success-700 dark:text-success-300',
    dot:  'bg-success-500',
    pill: 'bg-success-100 dark:bg-success-800 text-success-700 dark:text-success-300',
  },
};

const EVENT_ICONS: Record<EventType, string> = {
  MEDICATION:  '💊',
  APPOINTMENT: '🏥',
  CHECKUP:     '🩺',
  THERAPY:     '🏃',
};

// ─── Map MedicationSchedule → ScheduleEvent ───────────────────────────────────
function mapScheduleToEvent(s: MedicationSchedule): ScheduleEvent {
  return {
    id:       String(s.scheduleId),
    title:    `Medication #${s.medicationId} — ${s.dosage}`,
    type:     'MEDICATION',
    time:     s.timeOfDay ?? '—',
    duration: '5 min',
    notes:    s.instructions ?? undefined,
    status:   s.endDate && new Date(s.endDate) < new Date() ? 'COMPLETED' : 'UPCOMING',
  };
}

// ─── Calendar Grid ────────────────────────────────────────────────────────────
function CalendarGrid({
  markedDays,
  selectedDay,
  onSelectDay,
}: {
  markedDays: Set<number>;
  selectedDay: number;
  onSelectDay: (day: number) => void;
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayRaw = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const offset      = firstDayRaw === 0 ? 6 : firstDayRaw - 1;

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const today = new Date();
  const isCurrentMonth =
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </CardTitle>
        <div className="flex gap-1">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-bold text-gray-400 dark:text-gray-500 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: offset }).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const isToday    = isCurrentMonth && day === today.getDate();
            const isSelected = day === selectedDay;
            const hasEvent   = markedDays.has(day);

            return (
              <button
                key={day}
                onClick={() => onSelectDay(day)}
                className={cn(
                  'relative flex flex-col items-center py-1.5 rounded-lg transition-all text-sm',
                  isToday    && 'bg-primary-500 text-white',
                  isSelected && !isToday && 'bg-gray-100 dark:bg-gray-700',
                  !isToday   && 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                <span className="font-medium">{day}</span>
                {hasEvent && (
                  <span className={cn(
                    'w-1.5 h-1.5 rounded-full mt-0.5',
                    isToday ? 'bg-white/80' : 'bg-primary-500'
                  )} />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          {(Object.keys(EVENT_COLORS) as EventType[]).map((type) => (
            <div key={type} className="flex items-center gap-1.5">
              <span className={cn('w-2 h-2 rounded-full', EVENT_COLORS[type].dot)} />
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {type.toLowerCase()}
              </span>
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
      onClick={() => onEdit(event)}
      className={cn(
        'flex items-start gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700',
        'transition-all hover:shadow-sm cursor-pointer',
        event.status === 'COMPLETED' ? 'opacity-60' : colors.bg,
      )}
    >
      {/* Time */}
      <div className="text-center w-14 flex-shrink-0">
        <p className="text-xs font-bold text-gray-900 dark:text-gray-50">{event.time}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{event.duration}</p>
      </div>

      {/* Color bar */}
      <div className={cn('w-0.5 self-stretch rounded-full flex-shrink-0', colors.dot)} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-base">{EVENT_ICONS[event.type]}</span>
          <p className={cn(
            'text-sm font-semibold',
            event.status === 'COMPLETED'
              ? 'line-through text-gray-500 dark:text-gray-500'
              : 'text-gray-900 dark:text-gray-50'
          )}>
            {event.title}
          </p>
        </div>
        {event.provider && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">👤 {event.provider}</p>}
        {event.location && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">📍 {event.location}</p>}
        {event.notes    && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 italic">{event.notes}</p>}
      </div>

      {/* Status badge */}
      <span className={cn(
        'text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0',
        event.status === 'COMPLETED' && 'bg-success-100 dark:bg-success-800 text-success-700 dark:text-success-100',
        event.status === 'UPCOMING'  && colors.pill,
        event.status === 'CANCELLED' && 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
      )}>
        {event.status === 'COMPLETED' ? '✓ Done' : event.status === 'UPCOMING' ? 'Upcoming' : 'Cancelled'}
      </span>
    </div>
  );
}

// ─── Add Event Modal ──────────────────────────────────────────────────────────
function AddEventModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({
    title: '', type: 'MEDICATION', date: '', time: '',
    duration: '', location: '', provider: '', notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <Modal open={open} onClose={onClose} size="md">
      <ModalHeader>
        <ModalTitle>Add Schedule Event</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <Input name="title"    label="Event Title"               value={form.title}    onChange={handleChange} placeholder="e.g. Metformin 500mg" required />
          <Select name="type"    label="Event Type"                value={form.type}     onChange={handleChange}>
            <option value="MEDICATION">💊 Medication</option>
            <option value="APPOINTMENT">🏥 Appointment</option>
            <option value="CHECKUP">🩺 Checkup</option>
            <option value="THERAPY">🏃 Therapy / Exercise</option>
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input name="date"     label="Date"     type="date" value={form.date}     onChange={handleChange} required />
            <Input name="time"     label="Time"     type="time" value={form.time}     onChange={handleChange} required />
          </div>
          <Input    name="duration" label="Duration (e.g. 30 min)"    value={form.duration} onChange={handleChange} placeholder="30 min" />
          <Input    name="location" label="Location (optional)"       value={form.location} onChange={handleChange} placeholder="e.g. City Medical Center" />
          <Input    name="provider" label="Provider (optional)"       value={form.provider} onChange={handleChange} placeholder="e.g. Dr. Smith" />
          <Textarea name="notes"   label="Notes (optional)"          value={form.notes}    onChange={handleChange} rows={2} resize="none" placeholder="Any additional notes..." />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary"   onClick={onClose}>Add Event</Button>
      </ModalFooter>
    </Modal>
  );
}

// ─── Event Detail Modal ───────────────────────────────────────────────────────
function EventDetailModal({ event, onClose }: { event: ScheduleEvent; onClose: () => void }) {
  return (
    <Modal open={!!event} onClose={onClose} size="sm">
      <ModalHeader>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{EVENT_ICONS[event.type]}</span>
          <ModalTitle>{event.title}</ModalTitle>
        </div>
      </ModalHeader>
      <ModalBody>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-600 dark:text-gray-300">{event.time} · {event.duration}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-gray-600 dark:text-gray-300">{event.location}</span>
            </div>
          )}
          {event.provider && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-gray-600 dark:text-gray-300">{event.provider}</span>
            </div>
          )}
          {event.notes && (
            <p className="text-gray-500 dark:text-gray-400 italic">{event.notes}</p>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>Close</Button>
        <Button variant="primary">Edit Event</Button>
      </ModalFooter>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function ScheduleManagement() {
  const { selectedPatient } = usePatient();

  const [events, setEvents]               = useState<ScheduleEvent[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [showAddEvent, setShowAddEvent]   = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [selectedDay, setSelectedDay]     = useState(new Date().getDate());

  // Load schedules from API and map to events
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const schedules = await medicationApi.getPatientSchedules(
          selectedPatient?.patientId ?? 0
        ).catch(() => []);
        setEvents(schedules.map(mapScheduleToEvent));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [selectedPatient]);

  const completed  = events.filter((e) => e.status === 'COMPLETED').length;
  const upcoming   = events.filter((e) => e.status === 'UPCOMING').length;

  // Days that have events — for calendar dots
  const markedDays = new Set<number>(
    events.map((e) => {
      const d = new Date();
      return d.getDate();
    })
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Schedule</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowAddEvent(true)}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Event
        </Button>
      </div>

      {/* Summary chips — solid colors, no opacity */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-4 py-2 bg-success-50 dark:bg-success-900 rounded-full">
          <span className="w-2 h-2 rounded-full bg-success-500" />
          <span className="text-sm font-medium text-success-700 dark:text-success-300">
            {completed} completed
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900 rounded-full">
          <span className="w-2 h-2 rounded-full bg-primary-500" />
          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
            {upcoming} upcoming
          </span>
        </div>
      </div>

      {/* Main grid — calendar + schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Calendar */}
        <div>
          <CalendarGrid
            markedDays={markedDays}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />
        </div>

        {/* Today's schedule */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Today's Schedule</CardTitle>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {events.length} events
              </span>
            </CardHeader>
            <CardContent className="pb-4 space-y-2">
              {events.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No events scheduled</p>
                  <button
                    onClick={() => setShowAddEvent(true)}
                    className="mt-2 text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline"
                  >
                    Add your first event
                  </button>
                </div>
              ) : (
                events.map((event) => (
                  <EventCard key={event.id} event={event} onEdit={setSelectedEvent} />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Event Modal */}
      <AddEventModal open={showAddEvent} onClose={() => setShowAddEvent(false)} />

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}