// src/pages/schedule/ScheduleManagement.tsx
// FIX: Calendar now marks real days based on schedule start/end dates
// instead of always marking only today.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicationApi } from '../../api/medication.api';
import { usePatient } from '../../context/PatientContext';
import { useNotification } from '../../context/NotificationContext';
import { PermissionGate } from '../../components/common/PermissionGate';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Spinner } from '../../components/ui/Spinner';
import { cn } from '../../utils/cn';
import type { Medication, MedicationSchedule } from '../../types/medication.types';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FREQUENCY_DEFAULTS: Record<string, string[]> = {
  ONCE_DAILY:        ['08:00'],
  TWICE_DAILY:       ['08:00', '20:00'],
  THREE_TIMES_DAILY: ['08:00', '14:00', '20:00'],
  FOUR_TIMES_DAILY:  ['08:00', '12:00', '16:00', '20:00'],
  AS_NEEDED:         [],
  WEEKLY:            ['08:00'],
  CUSTOM:            ['08:00'],
};

function formatTime(t: any): string {
  if (!t) return '—';
  if (typeof t === 'string') return t.slice(0, 5);
  return String(t);
}

function formatFrequency(f: string) {
  return f.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─────────────────────────────────────────────────────────────
// FIXED Calendar: marks every day that has an active schedule
// Previously always marked only [new Date().getDate()] which
// was hardcoded and meaningless.
// ─────────────────────────────────────────────────────────────
function computeMarkedDays(schedules: MedicationSchedule[], year: number, month: number): Set<number> {
  const marked = new Set<number>();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);

    for (const schedule of schedules) {
      const start = schedule.startDate ? new Date(schedule.startDate) : null;
      const end   = schedule.endDate   ? new Date(schedule.endDate)   : null;

      if (start && date < start) continue;
      if (end   && date > end)   continue;

      if (schedule.frequency === 'WEEKLY' && start) {
        if (date.getDay() !== start.getDay()) continue;
      }

      if (schedule.frequency === 'AS_NEEDED') continue;

      marked.add(day);
      break;
    }
  }

  return marked;
}

function Calendar({
  schedules,
  selectedDay,
  onSelect,
}: {
  schedules: MedicationSchedule[];
  selectedDay: number;
  onSelect: (day: number) => void;
}) {
  const [current, setCurrent] = useState(new Date());
  const today = new Date();
  const year  = current.getFullYear();
  const month = current.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay    = new Date(year, month, 1).getDay();
  const offset      = firstDay === 0 ? 6 : firstDay - 1;
  const isThisMonth = month === today.getMonth() && year === today.getFullYear();

  // Real marked days computed from actual schedules
  const markedDays = computeMarkedDays(schedules, year, month);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-50">
          {current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrent(new Date(year, month - 1, 1))}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrent(new Date(year, month + 1, 1))}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: offset }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const isToday    = isThisMonth && day === today.getDate();
          const isSelected = day === selectedDay && !isToday;
          const hasEvent   = markedDays.has(day);

          return (
            <button
              key={day}
              onClick={() => onSelect(day)}
              className={cn(
                'relative flex flex-col items-center py-1.5 rounded-lg transition-all text-sm',
                isToday    && 'bg-primary-500 text-white',
                isSelected && 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-50',
                !isToday && !isSelected && 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
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

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <span className="w-2 h-2 rounded-full bg-primary-500" />
        <span className="text-xs text-gray-500 dark:text-gray-400">Has medication scheduled</span>
      </div>
    </div>
  );
}

function ScheduleRow({
  schedule,
  medicationName,
  onLog,
  onDelete,
}: {
  schedule: MedicationSchedule;
  medicationName: string;
  onLog: () => void;
  onDelete: () => void;
}) {
  const isActive = !schedule.endDate || new Date(schedule.endDate) >= new Date();
  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="w-16 flex-shrink-0 text-center">
        <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">
          {formatTime(schedule.timeOfDay)}
        </p>
      </div>
      <div className="w-px h-8 bg-gray-200 dark:bg-gray-600 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-50 truncate">{medicationName}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {schedule.dosage} · {formatFrequency(schedule.frequency)}
        </p>
        {(schedule.specialInstructions || schedule.instructions) && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
            {schedule.specialInstructions ?? schedule.instructions}
          </p>
        )}
      </div>
      <span className={cn(
        'text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0',
        isActive
          ? 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
      )}>
        {isActive ? 'Active' : 'Ended'}
      </span>
      <div className="flex gap-1.5 flex-shrink-0">
        <PermissionGate permission="medication.administer">
          <button onClick={onLog} className="px-2.5 py-1 text-xs font-medium rounded-lg bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors">
            Log
          </button>
        </PermissionGate>
        <PermissionGate permission="medication.delete_schedule">
          <button onClick={onDelete} className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800 transition-colors">
            Delete
          </button>
        </PermissionGate>
      </div>
    </div>
  );
}

function CreateScheduleForm({
  medications, patientId, onCreated, onCancel,
}: {
  medications: Medication[];
  patientId: number;
  onCreated: () => void;
  onCancel: () => void;
}) {
  const { success, error: showError } = useNotification();
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    medicationId: '', dosage: '', frequency: 'ONCE_DAILY',
    instructions: '', startDate: new Date().toISOString().split('T')[0], endDate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'frequency') setTimes(FREQUENCY_DEFAULTS[value] ?? ['08:00']);
  };

  const handleSubmit = async () => {
    if (!form.medicationId) { setError('Please select a medication.'); return; }
    if (times.length === 0 && form.frequency !== 'AS_NEEDED') { setError('Please add at least one time.'); return; }
    setError(''); setIsLoading(true);
    try {
      await medicationApi.createSchedule({
        patientId, medicationId: Number(form.medicationId),
        dosage: form.dosage, frequency: form.frequency, times,
        specialInstructions: form.instructions || undefined,
        startDate: form.startDate, endDate: form.endDate || undefined,
      });
      success('Schedule created successfully!');
      onCreated();
    } catch (err: any) {
      const msg = err.message || 'Failed to create schedule';
      showError(msg); setError(msg);
    } finally { setIsLoading(false); }
  };

  return (
    <div className="card border-2 border-primary-200 dark:border-primary-700 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-gray-50">New Schedule</h3>
        <button onClick={onCancel} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {medications.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 py-2">No medicines available. Add medicines from the Medications page first.</p>
      ) : (
        <>
          <Select name="medicationId" label="Medication" value={form.medicationId} onChange={handleChange}>
            <option value="">Select medication...</option>
            {medications.map((med) => (
              <option key={med.medicationId} value={med.medicationId}>
                {med.medicationName}{med.genericName ? ` — ${med.genericName}` : ''}
              </option>
            ))}
          </Select>
          <Input name="dosage" label="Dosage" value={form.dosage} onChange={handleChange} placeholder="e.g. 500mg, 1 tablet" />
          <Select name="frequency" label="Frequency" value={form.frequency} onChange={handleChange}>
            <option value="ONCE_DAILY">Once daily</option>
            <option value="TWICE_DAILY">Twice daily</option>
            <option value="THREE_TIMES_DAILY">Three times daily</option>
            <option value="FOUR_TIMES_DAILY">Four times daily</option>
            <option value="AS_NEEDED">As needed</option>
            <option value="WEEKLY">Weekly</option>
            <option value="CUSTOM">Custom</option>
          </Select>
          {form.frequency !== 'AS_NEEDED' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time(s)</label>
              <div className="space-y-2">
                {times.map((time, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="time" value={time} onChange={(e) => setTimes((prev) => prev.map((t, idx) => idx === i ? e.target.value : t))}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    {times.length > 1 && (
                      <button type="button" onClick={() => setTimes((prev) => prev.filter((_, idx) => idx !== i))}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setTimes((prev) => [...prev, '12:00'])}
                className="mt-1.5 text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline">
                + Add time
              </button>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Input name="startDate" label="Start Date" type="date" value={form.startDate} onChange={handleChange} />
            <Input name="endDate"   label="End Date"   type="date" value={form.endDate}   onChange={handleChange} />
          </div>
          <Textarea name="instructions" label="Instructions (optional)" value={form.instructions} onChange={handleChange} rows={2} resize="none" placeholder="e.g. Take after meals" />
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" fullWidth onClick={onCancel}>Cancel</Button>
            <Button type="button" variant="primary"   fullWidth isLoading={isLoading} onClick={handleSubmit}>Create</Button>
          </div>
        </>
      )}
    </div>
  );
}

export function ScheduleManagement() {
  const navigate = useNavigate();
  const { selectedPatient } = usePatient();
  const [schedules, setSchedules]     = useState<MedicationSchedule[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [showForm, setShowForm]       = useState(false);

  useEffect(() => {
    if (!selectedPatient) { setIsLoading(false); return; }
    const load = async () => {
      setIsLoading(true);
      try {
        const [schedulesData, medsData] = await Promise.all([
          medicationApi.getPatientSchedules(selectedPatient.patientId),
          medicationApi.getAllMedications(),
        ]);
        setSchedules(schedulesData);
        setMedications(medsData);
      } finally { setIsLoading(false); }
    };
    load();
  }, [selectedPatient]);

  const reload = async () => {
    if (!selectedPatient) return;
    const data = await medicationApi.getPatientSchedules(selectedPatient.patientId);
    setSchedules(data);
    setShowForm(false);
  };

  const handleDelete = async (scheduleId: number) => {
    if (!confirm('Delete this schedule?')) return;
    try {
      await medicationApi.deleteSchedule(scheduleId);
      setSchedules((prev) => prev.filter((s) => s.scheduleId !== scheduleId));
    } catch (err: any) { alert(err.message || 'Failed to delete.'); }
  };

  const getMedName = (medicationId: number) =>
    medications.find((m) => m.medicationId === medicationId)?.medicationName ?? `Medication #${medicationId}`;

  const activeCount   = schedules.filter((s) => !s.endDate || new Date(s.endDate) >= new Date()).length;
  const inactiveCount = schedules.length - activeCount;

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

  if (!selectedPatient) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 mb-4">Please select a patient to view their schedule.</p>
        <button onClick={() => navigate('/patients')} className="btn btn-primary">Go to Patients</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="page-title">Schedule</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            {' · '}
            <span className="font-semibold text-primary-600 dark:text-primary-400">
              {selectedPatient.fullName}
            </span>
          </p>
        </div>
        <PermissionGate permission="medication.create_schedule">
          <button onClick={() => setShowForm((v) => !v)} className="btn btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Schedule
          </button>
        </PermissionGate>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-4 py-2 bg-success-50 dark:bg-success-900 rounded-full">
          <span className="w-2 h-2 rounded-full bg-success-500" />
          <span className="text-sm font-medium text-success-700 dark:text-success-300">{activeCount} active</span>
        </div>
        {inactiveCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{inactiveCount} ended</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          {/* FIXED: pass schedules so calendar can compute real marked days */}
          <Calendar schedules={schedules} selectedDay={selectedDay} onSelect={setSelectedDay} />
          <div className="card space-y-2">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Quick Actions</p>
            <button onClick={() => navigate('/medications/log')} className="w-full text-left text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 py-1.5 transition-colors">Log medication administration</button>
            <button onClick={() => navigate('/medications/history')} className="w-full text-left text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 py-1.5 transition-colors">View administration history</button>
            <button onClick={() => navigate('/medications')} className="w-full text-left text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 py-1.5 transition-colors">Manage medicine catalog</button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {showForm && (
            <CreateScheduleForm
              medications={medications}
              patientId={selectedPatient.patientId}
              onCreated={reload}
              onCancel={() => setShowForm(false)}
            />
          )}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-50">Medication Schedules</h3>
              <span className="text-sm text-gray-400 dark:text-gray-500">{schedules.length} total</span>
            </div>
            {schedules.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">No schedules yet for {selectedPatient.fullName}.</p>
                <PermissionGate permission="medication.create_schedule">
                  <button onClick={() => setShowForm(true)} className="mt-2 text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline">
                    Create the first schedule
                  </button>
                </PermissionGate>
              </div>
            ) : (
              <div>
                {schedules.map((schedule) => (
                  <ScheduleRow
                    key={schedule.scheduleId}
                    schedule={schedule}
                    medicationName={getMedName(schedule.medicationId)}
                    onLog={() => navigate('/medications/log', { state: { scheduleId: schedule.scheduleId } })}
                    onDelete={() => handleDelete(schedule.scheduleId)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}