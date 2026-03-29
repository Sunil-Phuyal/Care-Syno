// src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider }        from './context/ThemeContext';
import { AuthProvider }         from './context/AuthContext';
import { PermissionProvider }   from './context/PermissionContext';
import { PatientProvider }      from './context/PatientContext';
import { NotificationProvider } from './context/NotificationContext';
import { AlertProvider }        from './context/AlertContext';   // ← NEW
import { ProtectedRoute }       from './components/auth/ProtectedRoute';
import { DashboardLayout }      from './components/layout/DashboardLayout';
import { Login }                from './pages/auth/Login';
import { Register }             from './pages/auth/Register';
import { Dashboard }            from './pages/dashboard/Dashboard';
import { ActivityLog }          from './pages/activity/ActivityLog';
import { ScheduleManagement }   from './pages/schedule/ScheduleManagement';
import { Settings }             from './pages/settings/Settings';
import { NotificationSettings } from './pages/notifications/NotificationSettings';
import { PatientList }          from './pages/patients/PatientList';
import { PatientDetail }        from './pages/patients/PatientDetail';
import { CreatePatient }        from './pages/patients/CreatePatient';
import { EditPatient }          from './pages/patients/EditPatient';
import { MedicationList }       from './pages/medications/MedicationList';
import { MedicationSchedules }  from './pages/medications/MedicationSchedules';
import { CreateSchedule }       from './pages/medications/CreateSchedule';
import { LogMedication }        from './pages/medications/LogMedication';
import { MedicationHistory }    from './pages/medications/MedicationHistory';
import { CaregiverList }        from './pages/caregivers/CaregiverList';
import { InviteCaregiver }      from './pages/caregivers/InviteCaregiver';
import { ManagePermissions }    from './pages/caregivers/ManagePermissions';
import { AdherenceReport }      from './pages/reports/AdherenceReport';
import { PatientSummary }       from './pages/reports/PatientSummary';
import { Alerts }               from './pages/alerts/Alerts';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <PermissionProvider>
              <PatientProvider>
                {/*
                  AlertProvider MUST be inside PatientProvider
                  because it calls usePatient() to get selectedPatient.
                  It MUST also wrap DashboardLayout because DashboardLayout
                  calls useAlerts() for the sidebar badge count.
                */}
                <AlertProvider>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/login"    element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected routes */}
                    <Route path="/*" element={
                      <ProtectedRoute>
                        <DashboardLayout>
                          <Routes>
                            <Route path="dashboard"                  element={<Dashboard />} />
                            <Route path="activity-log"               element={<ActivityLog />} />
                            <Route path="schedule"                   element={<ScheduleManagement />} />
                            <Route path="alerts"                     element={<Alerts />} />
                            <Route path="settings"                   element={<Settings />} />
                            <Route path="settings/notifications"     element={<NotificationSettings />} />

                            {/* Patients */}
                            <Route path="patients"                   element={<PatientList />} />
                            <Route path="patients/new"               element={<CreatePatient />} />
                            <Route path="patients/:id"               element={<PatientDetail />} />
                            <Route path="patients/:id/edit"          element={<EditPatient />} />

                            {/* Medications — catalog */}
                            <Route path="medications"                element={<MedicationList />} />

                            {/* Medications — schedules */}
                            <Route path="medications/schedules"      element={<MedicationSchedules />} />
                            <Route path="medications/new"            element={<CreateSchedule />} />
                            <Route path="medications/log"            element={<LogMedication />} />
                            <Route path="medications/history"        element={<MedicationHistory />} />

                            {/* Caregivers */}
                            <Route path="caregivers"                 element={<CaregiverList />} />
                            <Route path="caregivers/invite"          element={<InviteCaregiver />} />
                            <Route path="caregivers/:id/permissions" element={<ManagePermissions />} />

                            {/* Reports */}
                            <Route path="reports/adherence"          element={<AdherenceReport />} />
                            <Route path="reports/summary"            element={<PatientSummary />} />

                            <Route path="/"  element={<Navigate to="/dashboard" replace />} />
                            <Route path="*"  element={<Navigate to="/dashboard" replace />} />
                          </Routes>
                        </DashboardLayout>
                      </ProtectedRoute>
                    } />
                  </Routes>
                </AlertProvider>
              </PatientProvider>
            </PermissionProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;