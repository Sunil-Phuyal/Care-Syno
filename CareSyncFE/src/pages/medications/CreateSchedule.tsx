// src/pages/medications/CreateSchedule.tsx

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicationApi } from '../../api/medication.api';
import { usePatient } from '../../context/PatientContext';
import { useNotification } from '../../context/NotificationContext';
import { ImageUploader } from '../../components/ui/ImageUploader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { PermissionGate } from '../../components/common/PermissionGate';
import { cn } from '../../utils/cn';
import type { Medication, AddMedicationRequest } from '../../types/medication.types';

// ─── Frequency → default times ────────────────────────────────────────────────
const FREQUENCY_DEFAULTS: Record<string, string[]> = {
  ONCE_DAILY:        ['08:00'],
  TWICE_DAILY:       ['08:00', '20:00'],
  THREE_TIMES_DAILY: ['08:00', '14:00', '20:00'],
  FOUR_TIMES_DAILY:  ['08:00', '12:00', '16:00', '20:00'],
  AS_NEEDED:         [],
  WEEKLY:            ['08:00'],
  CUSTOM:            ['08:00'],
};

// ─── Add Medicine Dialog ───────────────────────────────────────────────────────
function AddMedicineDialog({
  initialName,
  onClose,
  onAdded,
}: {
  initialName: string;
  onClose: () => void;
  onAdded: (med: Medication) => void;
}) {
  const { success, error: showError } = useNotification();
  const [medicationImageUrl, setMedicationImageUrl] = useState<string | null>(null);
  const [form, setForm] = useState<AddMedicationRequest>({
    medicationName:   initialName,
    genericName:      '',
    medicationClass:  '',
    description:      '',
    commonDosages:    '',
    sideEffects:      '',
    contraindications:'',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const med = await medicationApi.addMedication({
        ...form,
        medicationImageUrl: medicationImageUrl ?? undefined,
      });
      success(`${form.medicationName} added successfully!`);
      onAdded(med);
    } catch (err: any) {
      const msg = err.message || 'Failed to add medicine';
      showError(msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh]
                      overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">Add Medicine to System</h2>
          <button onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                       rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <Input name="medicationName" label="Medicine Name *" value={form.medicationName}
            onChange={handleChange} placeholder="e.g. Metformin" required />
          <Input name="genericName" label="Generic Name" value={form.genericName}
            onChange={handleChange} placeholder="e.g. Metformin Hydrochloride" />
          <Input name="medicationClass" label="Medicine Class" value={form.medicationClass}
            onChange={handleChange} placeholder="e.g. Antidiabetic" />
          <Textarea name="description" label="Description" value={form.description}
            onChange={handleChange} rows={2} resize="none"
            placeholder="e.g. Used to control blood sugar levels" />
          <Input name="commonDosages" label="Common Dosages" value={form.commonDosages}
            onChange={handleChange} placeholder="e.g. 500mg, 850mg, 1000mg" />
          <Textarea name="sideEffects" label="Side Effects" value={form.sideEffects}
            onChange={handleChange} rows={2} resize="none"
            placeholder="e.g. Nausea, diarrhea, stomach upset" />
          <Textarea name="contraindications" label="Contraindications" value={form.contraindications}
            onChange={handleChange} rows={2} resize="none"
            placeholder="e.g. Severe kidney disease" />

          <ImageUploader
            folder="medications"
            fileName={`medication_${form.medicationName.replace(/\s+/g, '_')}`}
            label="Medicine Image"
            value={medicationImageUrl}
            onChange={setMedicationImageUrl}
            optional
            hint="Photo of the medicine package or pill."
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>Add Medicine</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Medicine Search ───────────────────────────────────────────────────────────
function MedicineSearch({
  value,
  onChange,
}: {
  value: Medication | null;
  onChange: (med: Medication) => void;
}) {
  const [query, setQuery]           = useState(value?.medicationName ?? '');
  const [results, setResults]       = useState<Medication[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef  = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    setShowDropdown(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 2) { setResults([]); return; }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await medicationApi.searchMedications(q);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleSelect = (med: Medication) => {
    setQuery(med.medicationName);
    setShowDropdown(false);
    onChange(med);
  };

  const handleAdded = (med: Medication) => {
    setShowAddDialog(false);
    handleSelect(med);
  };

  const medName = (med: Medication) => med.medicationName ?? med.name ?? '';

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        Medication <span className="text-red-500">*</span>
      </label>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
          placeholder="Search medicine..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600
                     rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50
                     focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-primary-300 border-t-primary-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Selected medicine chip */}
      {value && (
        <div className="mt-2 flex items-center gap-2 p-2.5 bg-primary-50 dark:bg-primary-900/30
                        border border-primary-200 dark:border-primary-700 rounded-xl">
          <span className="text-lg">💊</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
              {medName(value)}
            </p>
            {value.genericName && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{value.genericName}</p>
            )}
          </div>
          <button type="button" onClick={() => { onChange(null as any); setQuery(''); }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Dropdown */}
      {showDropdown && query.length >= 2 && (
        <div className="absolute top-full mt-1 left-0 right-0 z-10 bg-white dark:bg-gray-800
                        border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg overflow-hidden">
          {results.length > 0 ? (
            <ul className="max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
              {results.map((med) => (
                <li key={med.medicationId}>
                  <button type="button" onClick={() => handleSelect(med)}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left
                               hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <span className="text-lg flex-shrink-0">💊</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                        {medName(med)}
                      </p>
                      {med.genericName && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{med.genericName}</p>
                      )}
                      {med.medicationClass && (
                        <p className="text-xs text-primary-600 dark:text-primary-400">{med.medicationClass}</p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : !isSearching ? (
            <div className="px-4 py-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                No medicines found for "{query}"
              </p>
              <PermissionGate
                permission="medication.create_schedule"
                fallback={
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Ask your primary caregiver to add this medicine.
                  </p>
                }
              >
                <button type="button"
                  onClick={() => { setShowDropdown(false); setShowAddDialog(true); }}
                  className="btn btn-primary btn-sm">
                  + Add "{query}" to system
                </button>
              </PermissionGate>
            </div>
          ) : null}
        </div>
      )}

      {showAddDialog && (
        <AddMedicineDialog
          initialName={query}
          onClose={() => setShowAddDialog(false)}
          onAdded={handleAdded}
        />
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export function CreateSchedule() {
  const navigate = useNavigate();
  const { selectedPatient } = usePatient();
  const { success, error: showError } = useNotification();

  const [selectedMed, setSelectedMed]                     = useState<Medication | null>(null);
  const [prescriptionImageUrl, setPrescriptionImageUrl]   = useState<string | null>(null);
  const [medicationPhotoUrl, setMedicationPhotoUrl]       = useState<string | null>(null);
  const [times, setTimes]                                 = useState<string[]>(['08:00']);
  const [form, setForm] = useState({
    dosage:       '',
    frequency:    'ONCE_DAILY',
    instructions: '',
    startDate:    new Date().toISOString().split('T')[0],
    endDate:      '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'frequency') setTimes(FREQUENCY_DEFAULTS[value] ?? ['08:00']);
  };

  const handleTimeChange = (index: number, value: string) =>
    setTimes((prev) => prev.map((t, i) => (i === index ? value : t)));

  const addTime    = () => setTimes((prev) => [...prev, '12:00']);
  const removeTime = (index: number) => setTimes((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    if (!selectedMed) { setError('Please select a medication.'); return; }
    if (times.length === 0 && form.frequency !== 'AS_NEEDED') {
      setError('Please add at least one time.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await medicationApi.createSchedule({
        patientId:            selectedPatient.patientId,
        medicationId:         selectedMed.medicationId,
        dosage:               form.dosage,
        frequency:            form.frequency,
        times,
        specialInstructions:  form.instructions || undefined,
        startDate:            form.startDate,
        endDate:              form.endDate || undefined,
        prescriptionImageUrl: prescriptionImageUrl ?? undefined,
        medicationPhotoUrl:   medicationPhotoUrl ?? undefined,
      });
      success('Medication schedule created successfully!');
      navigate('/medications');
    } catch (err: any) {
      const msg = err.message || 'Failed to create schedule';
      showError(msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedPatient) {
    return (
      <div className="card text-center py-12">
        <p className="text-4xl mb-3">👤</p>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Please select a patient first.</p>
        <button onClick={() => navigate('/patients')} className="btn btn-primary">Go to Patients</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      <div>
        <button onClick={() => navigate('/medications')}
          className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400
                     hover:text-primary-700 dark:hover:text-primary-300 font-medium mb-3 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Medications
        </button>
        <h1 className="page-title">Create Medication Schedule</h1>
        <p className="page-subtitle">For {selectedPatient.fullName}</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-xl">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Medication search */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">Medication Details</h3>
          <MedicineSearch value={selectedMed} onChange={setSelectedMed} />
          <Input name="dosage" label="Dosage" value={form.dosage} onChange={handleChange}
            placeholder="e.g. 500mg, 1 tablet, 5ml" required />
        </div>

        {/* Schedule */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">Schedule</h3>

          <Select name="frequency" label="Frequency" value={form.frequency} onChange={handleChange} required>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time(s) of Day
              </label>
              <div className="space-y-2">
                {times.map((time, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input type="time" value={time}
                      onChange={(e) => handleTimeChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600
                                 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50
                                 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    {times.length > 1 && (
                      <button type="button" onClick={() => removeTime(index)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addTime}
                className="mt-2 text-sm text-primary-600 dark:text-primary-400 font-medium
                           hover:underline flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add another time
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="startDate" label="Start Date" type="date"
              value={form.startDate} onChange={handleChange} required />
            <Input name="endDate" label="End Date (optional)" type="date"
              value={form.endDate} onChange={handleChange} />
          </div>
        </div>

        {/* Instructions */}
        <div className="card">
          <Textarea name="instructions" label="Instructions (optional)" value={form.instructions}
            onChange={handleChange} rows={3} resize="none"
            placeholder="e.g. Take with food, avoid dairy products..." />
        </div>

        {/* Images */}
        <div className="card space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-1">Prescription Image</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Upload the doctor's prescription for this medication.
            </p>
            <ImageUploader
              folder="prescriptions"
              fileName={`prescription_${selectedPatient.fullName.replace(/\s+/g, '_')}_${selectedMed?.medicationName?.replace(/\s+/g, '_') ?? 'med'}`}
              label="Doctor's Prescription"
              value={prescriptionImageUrl}
              onChange={setPrescriptionImageUrl}
              optional
              hint="Scan or photograph the prescription document."
            />
          </div>
          <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-1">Medication Photo</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Photo of the actual pill or bottle — helps identify it correctly.
            </p>
            <ImageUploader
              folder="medications"
              fileName={`medication_${selectedMed?.medicationName?.replace(/\s+/g, '_') ?? 'med'}_${selectedPatient.fullName.replace(/\s+/g, '_')}`}
              label="Medicine Photo"
              value={medicationPhotoUrl}
              onChange={setMedicationPhotoUrl}
              optional
              hint="Photo of the pill, tablet, or medicine bottle."
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" fullWidth onClick={() => navigate('/medications')}>Cancel</Button>
          <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>Create Schedule</Button>
        </div>
      </form>
    </div>
  );
}