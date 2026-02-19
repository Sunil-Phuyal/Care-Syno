import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Switch } from '../../components/ui/Switch';
import { Textarea } from '../../components/ui/Textarea';
import { Avatar } from '../../components/ui/Avatar';
import { AlertDialog } from '../../components/ui/AlertDialog';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────
type SettingsTab = 'profile' | 'notifications' | 'security';

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',
    relationship: 'Primary Caregiver',
    address: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: '',
    bloodType: '',
    allergies: '',
    medicalNotes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsSaving(false);
    setSaved(true);
  };

  return (
    <div className="space-y-6">

      {/* Avatar Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar fallback={form.fullName || 'U'} size="2xl" variant="rounded" />
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-700 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">{form.fullName || 'Your Name'}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{form.relationship}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{form.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input name="fullName"     label="Full Name"        value={form.fullName}     onChange={handleChange} required />
          <Input name="email"        label="Email Address"    value={form.email}        onChange={handleChange} type="email" required />
          <Input name="phone"        label="Phone Number"     value={form.phone}        onChange={handleChange} type="tel" placeholder="+1 (555) 000-0000" />
          <Input name="dateOfBirth"  label="Date of Birth"    value={form.dateOfBirth}  onChange={handleChange} type="date" />
          <Select name="relationship" label="Role / Relationship" value={form.relationship} onChange={handleChange}>
            <option>Primary Caregiver</option>
            <option>Family Member</option>
            <option>Professional Caregiver</option>
            <option>Healthcare Provider</option>
          </Select>
          <div className="sm:col-span-2">
            <Textarea name="address" label="Address" value={form.address} onChange={handleChange} placeholder="Street, City, State, ZIP" rows={2} resize="none" />
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Contact</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input name="emergencyName"     label="Contact Name"   value={form.emergencyName}     onChange={handleChange} placeholder="Full name" />
          <Input name="emergencyPhone"    label="Contact Phone"  value={form.emergencyPhone}    onChange={handleChange} type="tel" placeholder="+1 (555) 000-0000" />
          <Select name="emergencyRelation" label="Relationship"  value={form.emergencyRelation} onChange={handleChange}>
            <option value="">Select relationship...</option>
            <option>Spouse</option>
            <option>Parent</option>
            <option>Sibling</option>
            <option>Child</option>
            <option>Friend</option>
            <option>Doctor</option>
          </Select>
        </CardContent>
      </Card>

      {/* Medical Info */}
      <Card>
        <CardHeader>
          <CardTitle>Medical Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select name="bloodType" label="Blood Type" value={form.bloodType} onChange={handleChange}>
            <option value="">Select blood type...</option>
            {['A+','A−','B+','B−','AB+','AB−','O+','O−'].map(t => <option key={t}>{t}</option>)}
          </Select>
          <div className="sm:col-span-2">
            <Textarea name="allergies" label="Allergies" value={form.allergies} onChange={handleChange} placeholder="List known allergies, or 'None'" rows={2} resize="none" />
          </div>
          <div className="sm:col-span-2">
            <Textarea name="medicalNotes" label="Medical Notes" value={form.medicalNotes} onChange={handleChange} placeholder="Additional medical information, conditions, notes..." rows={3} resize="none" />
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end gap-3">
        <Button variant="secondary">Discard Changes</Button>
        <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
          Save Changes
        </Button>
      </div>

      <AlertDialog open={saved} onClose={() => setSaved(false)} title="Profile Updated" description="Your profile has been saved successfully." variant="success" />
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────
function NotificationsTab() {
  const [settings, setSettings] = useState({
    emailMedication:   true,
    emailAppointment:  true,
    emailAlert:        true,
    pushMedication:    true,
    pushAppointment:   false,
    pushAlert:         true,
    smsAlert:          true,
    smsMedication:     false,
    reminderMinutes:   '30',
    dailySummary:      true,
    weeklyReport:      true,
  });

  const toggle = (key: keyof typeof settings) =>
    setSettings(s => ({ ...s, [key]: !s[key] }));

  const SwitchRow = ({ label, desc, k }: { label: string; desc: string; k: keyof typeof settings }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
      </div>
      <Switch checked={settings[k] as boolean} onChange={() => toggle(k)} size="md" />
    </div>
  );

  return (
    <div className="space-y-6">

      <Card>
        <CardHeader><CardTitle>Email Notifications</CardTitle></CardHeader>
        <CardContent className="p-6 pt-0">
          <SwitchRow k="emailMedication"  label="Medication Reminders"    desc="Email when a medication is due or missed" />
          <SwitchRow k="emailAppointment" label="Appointment Reminders"   desc="Email reminder before scheduled appointments" />
          <SwitchRow k="emailAlert"       label="Critical Alerts"         desc="Immediate email for overdue medications" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Push Notifications</CardTitle></CardHeader>
        <CardContent className="p-6 pt-0">
          <SwitchRow k="pushMedication"   label="Medication Reminders"    desc="Push notification when medication is due" />
          <SwitchRow k="pushAppointment"  label="Appointment Reminders"   desc="Push notification before appointments" />
          <SwitchRow k="pushAlert"        label="Critical Alerts"         desc="Instant push for urgent care events" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>SMS Notifications</CardTitle></CardHeader>
        <CardContent className="p-6 pt-0">
          <SwitchRow k="smsAlert"        label="Critical Alerts"         desc="SMS for overdue medications and emergencies" />
          <SwitchRow k="smsMedication"   label="Medication Reminders"    desc="SMS reminders for scheduled medications" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Reminder Settings</CardTitle></CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
          <Select
            label="Advance Reminder Time"
            value={settings.reminderMinutes}
            onChange={e => setSettings(s => ({ ...s, reminderMinutes: e.target.value }))}
          >
            <option value="15">15 minutes before</option>
            <option value="30">30 minutes before</option>
            <option value="60">1 hour before</option>
            <option value="120">2 hours before</option>
          </Select>
          <SwitchRow k="dailySummary"  label="Daily Summary Email"   desc="Receive a daily care summary each evening" />
          <SwitchRow k="weeklyReport"  label="Weekly Report Email"   desc="Weekly adherence and activity report" />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="primary">Save Notification Settings</Button>
      </div>
    </div>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────
function SecurityTab() {
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [twoFactor, setTwoFactor]   = useState(false);
  const [isSaving, setIsSaving]     = useState(false);
  const [saved, setSaved]           = useState(false);
  const [pwError, setPwError]       = useState('');

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setPwError('');
  };

  const handleSavePassword = async () => {
    if (passwords.newPass !== passwords.confirm) { setPwError('Passwords do not match'); return; }
    if (passwords.newPass.length < 6) { setPwError('Password must be at least 6 characters'); return; }
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsSaving(false);
    setSaved(true);
    setPasswords({ current: '', newPass: '', confirm: '' });
  };

  const SwitchRow = ({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: () => void }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
      </div>
      <Switch checked={checked} onChange={onChange} size="md" />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Change Password */}
      <Card>
        <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
          <Input
            name="current"
            label="Current Password"
            type="password"
            placeholder="Enter current password"
            value={passwords.current}
            onChange={handlePasswordChange}
          />
          <Input
            name="newPass"
            label="New Password"
            type="password"
            placeholder="Enter new password"
            value={passwords.newPass}
            onChange={handlePasswordChange}
            helperText="Minimum 6 characters"
          />
          <Input
            name="confirm"
            label="Confirm New Password"
            type="password"
            placeholder="Confirm new password"
            value={passwords.confirm}
            onChange={handlePasswordChange}
            error={pwError}
          />
          <div className="flex justify-end">
            <Button variant="primary" onClick={handleSavePassword} isLoading={isSaving}>
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2FA & Security */}
      <Card>
        <CardHeader><CardTitle>Security Preferences</CardTitle></CardHeader>
        <CardContent className="p-6 pt-0">
          <SwitchRow
            label="Two-Factor Authentication"
            desc="Add extra security by requiring a code when signing in"
            checked={twoFactor}
            onChange={() => setTwoFactor(v => !v)}
          />
          <SwitchRow
            label="Login Notifications"
            desc="Email me when a new device logs into my account"
            checked={true}
            onChange={() => {}}
          />
          <SwitchRow
            label="Session Timeout"
            desc="Automatically log out after 30 minutes of inactivity"
            checked={true}
            onChange={() => {}}
          />
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Sessions</CardTitle>
          <Button variant="danger" size="sm">Log Out All</Button>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-3">
          {[
            { device: 'Chrome on Windows', location: 'New York, NY', time: 'Active now', current: true },
            { device: 'Safari on iPhone',  location: 'New York, NY', time: '2 hours ago', current: false },
          ].map((session, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{session.device}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{session.location} · {session.time}</p>
                </div>
              </div>
              {session.current
                ? <span className="text-xs text-success-600 dark:text-success-400 font-semibold bg-success-50 dark:bg-success-900/20 px-2 py-1 rounded-full">This device</span>
                : <Button variant="ghost" size="sm">Revoke</Button>
              }
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-error-200 dark:border-error-800">
        <CardHeader>
          <CardTitle className="text-error-600 dark:text-error-400">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-50">Delete Account</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Permanently delete your account and all data. This cannot be undone.</p>
            </div>
            <Button variant="danger" size="sm">Delete Account</Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={saved} onClose={() => setSaved(false)} title="Password Updated" description="Your password has been changed successfully." variant="success" />
    </div>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────
export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const tabs: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    },
    {
      key: 'notifications',
      label: 'Notifications',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    },
    {
      key: 'security',
      label: 'Security',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your account preferences and security</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.key
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'profile'       && <ProfileTab />}
      {activeTab === 'notifications' && <NotificationsTab />}
      {activeTab === 'security'      && <SecurityTab />}
    </div>
  );
}