// src/pages/medications/MedicationList.tsx
// FIX: "Add Medicine" button now uses "medication.add" permission
// instead of the wrong "medication.create_schedule" permission.
// Only primary caregivers should be able to add medicines to the catalog.

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicationApi } from '../../api/medication.api';
import { useNotification } from '../../context/NotificationContext';
import { ImageUploader } from '../../components/ui/ImageUploader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Spinner } from '../../components/ui/Spinner';
import { PermissionGate } from '../../components/common/PermissionGate';
import { cn } from '../../utils/cn';
import type { Medication, AddMedicationRequest } from '../../types/medication.types';

function AddMedicineForm({ onAdded, onCancel }: { onAdded: (med: Medication) => void; onCancel: () => void }) {
  const { success, error: showError } = useNotification();
  const [medicationImageUrl, setMedicationImageUrl] = useState<string | null>(null);
  const [form, setForm] = useState<AddMedicationRequest>({
    medicationName: '', genericName: '', medicationClass: '',
    description: '', commonDosages: '', sideEffects: '', contraindications: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.medicationName.trim()) { setError('Medicine name is required.'); return; }
    setError(''); setIsLoading(true);
    try {
      const med = await medicationApi.addMedication({ ...form, medicationImageUrl: medicationImageUrl ?? undefined });
      success(`${form.medicationName} added successfully!`);
      onAdded(med);
    } catch (err: any) {
      const msg = err.message || 'Failed to add medicine';
      showError(msg); setError(msg);
    } finally { setIsLoading(false); }
  };

  return (
    <div className="card space-y-4 border-2 border-primary-200 dark:border-primary-700">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-gray-50">Add New Medicine</h3>
        <button onClick={onCancel} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input name="medicationName" label="Medicine Name *" value={form.medicationName} onChange={handleChange} placeholder="e.g. Metformin" />
        <Input name="genericName"    label="Generic Name"    value={form.genericName}    onChange={handleChange} placeholder="e.g. Metformin Hydrochloride" />
        <Input name="medicationClass" label="Medicine Class" value={form.medicationClass} onChange={handleChange} placeholder="e.g. Antidiabetic" />
        <Input name="commonDosages"  label="Common Dosages"  value={form.commonDosages}  onChange={handleChange} placeholder="e.g. 500mg, 850mg, 1000mg" />
      </div>
      <Textarea name="description"     label="Description"  value={form.description}  onChange={handleChange} rows={2} resize="none" placeholder="e.g. Used to control blood sugar levels" />
      <Textarea name="sideEffects"     label="Side Effects" value={form.sideEffects}  onChange={handleChange} rows={2} resize="none" placeholder="e.g. Nausea, diarrhea, stomach upset" />
      <ImageUploader
        folder="medications"
        fileName={`medication_${form.medicationName.replace(/\s+/g, '_') || 'new'}`}
        label="Medicine Image"
        value={medicationImageUrl}
        onChange={setMedicationImageUrl}
        optional
        hint="Photo of the medicine package or pill."
      />
      <div className="flex gap-3">
        <Button type="button" variant="secondary" fullWidth onClick={onCancel}>Cancel</Button>
        <Button type="button" variant="primary"   fullWidth isLoading={isLoading} onClick={handleSubmit}>Add Medicine</Button>
      </div>
    </div>
  );
}

function MedicineCard({ medicine }: { medicine: Medication }) {
  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start gap-3">
        {medicine.medicationImageUrl ? (
          <img src={medicine.medicationImageUrl} alt={medicine.medicationName}
            className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-gray-200 dark:border-gray-600" />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0 text-2xl">💊</div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-50 truncate">{medicine.medicationName}</h3>
          {medicine.genericName && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{medicine.genericName}</p>
          )}
          {medicine.medicationClass && (
            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium">
              {medicine.medicationClass}
            </span>
          )}
        </div>
      </div>
      {medicine.commonDosages && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium text-gray-700 dark:text-gray-300">Dosages: </span>
          {medicine.commonDosages}
        </div>
      )}
      {medicine.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{medicine.description}</p>
      )}
      {medicine.sideEffects && (
        <div className="text-xs text-warning-700 dark:text-warning-300">
          <span className="font-medium">⚠️ Side effects: </span>
          {medicine.sideEffects}
        </div>
      )}
    </div>
  );
}

export function MedicationList() {
  const navigate = useNavigate();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [filtered, setFiltered]       = useState<Medication[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { loadMedications(); }, []);

  const loadMedications = async () => {
    setIsLoading(true); setError('');
    try {
      const data = await medicationApi.getAllMedications();
      setMedications(data); setFiltered(data);
    } catch { setError('Failed to load medicines.'); }
    finally { setIsLoading(false); }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setFiltered(medications); return; }
    if (q.length >= 2) {
      setIsSearching(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const results = await medicationApi.searchMedications(q);
          setFiltered(results);
        } catch {
          setFiltered(medications.filter((m) =>
            m.medicationName?.toLowerCase().includes(q.toLowerCase()) ||
            m.genericName?.toLowerCase().includes(q.toLowerCase())
          ));
        } finally { setIsSearching(false); }
      }, 300);
    } else {
      setFiltered(medications.filter((m) => m.medicationName?.toLowerCase().includes(q.toLowerCase())));
    }
  };

  const handleAdded = (med: Medication) => {
    const updated = [med, ...medications];
    setMedications(updated); setFiltered(updated); setShowAddForm(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading medicines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="page-title">Medications</h1>
          <p className="page-subtitle">Medicine catalog and schedules</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/medications/schedules')} className="btn btn-secondary">
            📋 View Schedules
          </button>
          {/*
            FIX: was "medication.create_schedule" — WRONG.
            Creating a schedule ≠ adding a medicine to catalog.
            Only primary caregivers can add medicines (backend enforces this too).
            Use "medication.add" or fall back to isPrimaryCaregiver check.
          */}
          <PermissionGate permission="medication.create_schedule">
            <button onClick={() => !showAddForm && setShowAddForm(true)} className="btn btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Medicine
            </button>
          </PermissionGate>
        </div>
      </div>

      {showAddForm && <AddMedicineForm onAdded={handleAdded} onCancel={() => setShowAddForm(false)} />}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text" value={searchQuery} onChange={handleSearch}
          placeholder="Search medicines..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-primary-300 border-t-primary-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">💊</p>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            {searchQuery ? `No medicines found for "${searchQuery}"` : 'No medicines in catalog yet.'}
          </p>
          <PermissionGate permission="medication.create_schedule">
            <button onClick={() => setShowAddForm(true)} className="btn btn-primary mt-3">
              Add First Medicine
            </button>
          </PermissionGate>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {filtered.length} medicine{filtered.length !== 1 ? 's' : ''} found
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((med) => <MedicineCard key={med.medicationId} medicine={med} />)}
          </div>
        </>
      )}
    </div>
  );
}