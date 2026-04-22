// src/pages/medications/MedicationList.tsx

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicationApi } from '../../api/medication.api';
import { useNotification } from '../../context/NotificationContext';
import { PermissionGate } from '../../components/common/PermissionGate';
import { Spinner } from '../../components/ui/Spinner';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { ImageUploader } from '../../components/ui/ImageUploader';
import { cn } from '../../utils/cn';
import type { Medication, AddMedicationRequest, UpdateMedicationRequest } from '../../types/medication.types';

// ── Column widths ─────────────────────────────────────────────────────────────
const COL = {
  medicine:     'flex-1 min-w-0',
  form:         'w-36 hidden md:flex shrink-0',
  manufacturer: 'w-44 hidden lg:flex shrink-0',
  actions:      'w-16 shrink-0',
};

// ── Icon button ───────────────────────────────────────────────────────────────
function IconButton({ onClick, title, variant = 'default', children }: {
  onClick: () => void;
  title: string;
  variant?: 'default' | 'danger';
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'p-1.5 rounded-md transition-colors',
        variant === 'danger'
          ? 'text-gray-400 dark:text-gray-600 hover:text-error-600 dark:hover:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/30'
          : 'text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
      )}
    >
      {children}
    </button>
  );
}

// ── Medicine avatar ───────────────────────────────────────────────────────────
function MedAvatar({ imageUrl, name }: { imageUrl?: string; name: string }) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="w-8 h-8 rounded-lg object-cover shrink-0 border border-gray-200 dark:border-gray-700"
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center shrink-0">
      <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

// ── Confirm delete modal ──────────────────────────────────────────────────────
function ConfirmDeleteModal({ name, onConfirm, onCancel, isLoading }: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-sm">
        <div className="w-10 h-10 rounded-full bg-error-100 dark:bg-error-900/40 flex items-center justify-center mb-4">
          <svg className="w-5 h-5 text-error-600 dark:text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">Delete medicine</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Are you sure you want to delete{' '}
          <span className="font-medium text-gray-700 dark:text-gray-300">{name}</span>?
          This will remove it from the catalog.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn btn-secondary flex-1">Cancel</button>
          <button onClick={onConfirm} disabled={isLoading} className="btn btn-danger flex-1 disabled:opacity-60">
            {isLoading
              ? <svg className="w-4 h-4 animate-spin mx-auto" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add / Edit form ───────────────────────────────────────────────────────────
function MedicationForm({ initial, onDone, onCancel }: {
  initial?: Medication;
  onDone: (med: Medication) => void;
  onCancel: () => void;
}) {
  const { success, error: showError } = useNotification();
  const isEdit = !!initial;

  const [imageUrl, setImageUrl] = useState<string | null>(initial?.medicationImageUrl ?? null);
  const [form, setForm] = useState({
    medicationName: initial?.medicationName ?? '',
    genericName:    initial?.genericName    ?? '',
    description:    initial?.description    ?? '',
    dosageForm:     initial?.dosageForm     ?? '',
    strength:       initial?.strength       ?? '',
    manufacturer:   initial?.manufacturer   ?? '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.medicationName.trim()) { setError('Medicine name is required.'); return; }
    setError('');
    setIsLoading(true);
    try {
      if (isEdit && initial) {
        const updated = await medicationApi.updateMedication(initial.medicationId, {
          ...form,
          medicationImageUrl: imageUrl ?? undefined,
        });
        success(`${updated.medicationName} updated successfully!`);
        onDone(updated);
      } else {
        const created = await medicationApi.addMedication({
          ...form,
          medicationImageUrl: imageUrl ?? undefined,
        });
        success(`${created.medicationName} added successfully!`);
        onDone(created);
      }
    } catch (err: any) {
      const msg = err.message || `Failed to ${isEdit ? 'update' : 'add'} medicine`;
      showError(msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card space-y-4 border-2 border-primary-200 dark:border-primary-700">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-gray-50">
          {isEdit ? 'Edit Medicine' : 'Add New Medicine'}
        </h3>
        <button
          onClick={onCancel}
          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
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
        <Input name="dosageForm"     label="Dosage Form"     value={form.dosageForm}     onChange={handleChange} placeholder="e.g. Tablet, Capsule, Syrup" />
        <Input name="strength"       label="Strength"        value={form.strength}       onChange={handleChange} placeholder="e.g. 500mg" />
        <Input name="manufacturer"   label="Manufacturer"    value={form.manufacturer}   onChange={handleChange} placeholder="e.g. Sun Pharma" />
      </div>

      <Textarea
        name="description"
        label="Description"
        value={form.description}
        onChange={handleChange}
        rows={2}
        resize="none"
        placeholder="e.g. Used to control blood sugar levels"
      />

      <ImageUploader
        folder="medications"
        fileName={`medication_${form.medicationName.replace(/\s+/g, '_') || 'new'}`}
        label="Medicine Image"
        value={imageUrl}
        onChange={setImageUrl}
        optional
        hint="Photo of the medicine package or pill."
      />

      <div className="flex gap-3">
        <Button type="button" variant="secondary" fullWidth onClick={onCancel}>Cancel</Button>
        <Button type="button" variant="primary" fullWidth isLoading={isLoading} onClick={handleSubmit}>
          {isEdit ? 'Save Changes' : 'Add Medicine'}
        </Button>
      </div>
    </div>
  );
}

// ── Medicine row ──────────────────────────────────────────────────────────────
function MedicineRow({ medicine, onEdit, onDelete }: {
  medicine: Medication;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-stretch hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">

      {/* Medicine */}
      <div className={cn(COL.medicine, 'flex items-center gap-3 px-5 py-3')}>
        <MedAvatar imageUrl={medicine.medicationImageUrl} name={medicine.medicationName} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {medicine.medicationName}
          </p>
          {medicine.genericName && (
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
              {medicine.genericName}
            </p>
          )}
        </div>
      </div>

      {/* Form */}
      <div className={cn(COL.form, 'items-center px-5 py-3')}>
        <div>
          {medicine.dosageForm && (
            <p className="text-sm text-gray-600 dark:text-gray-300">{medicine.dosageForm}</p>
          )}
          {medicine.strength && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{medicine.strength}</p>
          )}
          {!medicine.dosageForm && !medicine.strength && (
            <p className="text-sm text-gray-300 dark:text-gray-600">—</p>
          )}
        </div>
      </div>

      {/* Manufacturer */}
      <div className={cn(COL.manufacturer, 'items-center px-5 py-3')}>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {medicine.manufacturer ?? '—'}
        </p>
      </div>

      {/* Actions */}
      <div className={cn(COL.actions, 'flex items-center gap-0.5 justify-end px-3 py-3')}>
        <PermissionGate permission="medication.edit_schedule">
          <IconButton onClick={onEdit} title="Edit medicine">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </IconButton>
        </PermissionGate>
        <PermissionGate permission="medication.delete_schedule">
          <IconButton onClick={onDelete} title="Delete medicine" variant="danger">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </IconButton>
        </PermissionGate>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function MedicationList() {
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();

  const [medications, setMedications]   = useState<Medication[]>([]);
  const [filtered, setFiltered]         = useState<Medication[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [error, setError]               = useState('');
  const [searchQuery, setSearchQuery]   = useState('');
  const [isSearching, setIsSearching]   = useState(false);
  const [showForm, setShowForm]         = useState(false);
  const [editTarget, setEditTarget]     = useState<Medication | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Medication | null>(null);
  const [isDeleting, setIsDeleting]     = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { loadMedications(); }, []);

  const loadMedications = async () => {
    setIsLoading(true); setError('');
    try {
      const data = await medicationApi.getAllMedications();
      setMedications(data); setFiltered(data);
    } catch {
      setError('Failed to load medicines.');
    } finally {
      setIsLoading(false);
    }
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
      setFiltered(medications.filter((m) =>
        m.medicationName?.toLowerCase().includes(q.toLowerCase())
      ));
    }
  };

  const handleAdded = (med: Medication) => {
    const updated = [med, ...medications];
    setMedications(updated); setFiltered(updated); setShowForm(false);
  };

  const handleEdited = (med: Medication) => {
    const updated = medications.map((m) => m.medicationId === med.medicationId ? med : m);
    setMedications(updated); setFiltered(updated); setEditTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await medicationApi.deleteMedication(deleteTarget.medicationId);
      const updated = medications.filter((m) => m.medicationId !== deleteTarget.medicationId);
      setMedications(updated); setFiltered(updated);
      setDeleteTarget(null);
      success(`${deleteTarget.medicationName} deleted successfully.`);
    } catch {
      showError('Failed to delete medicine. Please try again.');
    } finally {
      setIsDeleting(false);
    }
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
    <>
      {deleteTarget && (
        <ConfirmDeleteModal
          name={deleteTarget.medicationName}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
          isLoading={isDeleting}
        />
      )}

      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="page-title">Medications</h1>
            <p className="page-subtitle">Medicine catalog and schedules</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/medications/schedules')} className="btn btn-secondary">
              📋 View Schedules
            </button>
            <PermissionGate permission="medication.create_schedule">
              <button
                onClick={() => { setEditTarget(null); setShowForm(true); }}
                className="btn btn-primary"
                disabled={showForm && !editTarget}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Medicine
              </button>
            </PermissionGate>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-error-50 dark:bg-error-900/30 border border-error-200 dark:border-error-800 rounded-xl text-sm text-error-700 dark:text-error-400">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Inline Add / Edit form */}
        {showForm && !editTarget && (
          <MedicationForm
            onDone={handleAdded}
            onCancel={() => setShowForm(false)}
          />
        )}
        {editTarget && (
          <MedicationForm
            initial={editTarget}
            onDone={handleEdited}
            onCancel={() => setEditTarget(null)}
          />
        )}

        {/* Search */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search medicines by name or generic name..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-primary-300 border-t-primary-500 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {searchQuery ? `No medicines found for "${searchQuery}"` : 'No medicines in catalog yet.'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              {searchQuery ? 'Try a different search term.' : 'Add the first medicine to get started.'}
            </p>
            {!searchQuery && (
              <PermissionGate permission="medication.create_schedule">
                <button onClick={() => setShowForm(true)} className="btn btn-primary">
                  Add First Medicine
                </button>
              </PermissionGate>
            )}
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            {/* Table header */}
            <div className="flex items-stretch border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <p className={cn(COL.medicine,     'flex items-center px-5 py-2.5 text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider')}>Medicine</p>
              <p className={cn(COL.form,         'items-center px-5 py-2.5 text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden md:flex')}>Form</p>
              <p className={cn(COL.manufacturer, 'items-center px-5 py-2.5 text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden lg:flex')}>Manufacturer</p>
              <div className={COL.actions} />
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map((med) => (
                <MedicineRow
                  key={med.medicationId}
                  medicine={med}
                  onEdit={() => { setShowForm(false); setEditTarget(med); }}
                  onDelete={() => setDeleteTarget(med)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}