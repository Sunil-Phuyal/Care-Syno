import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { PermissionProvider } from './context/PermissionContext';
import { PatientProvider } from './context/PatientContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Dashboard } from './pages/dashboard/Dashboard';
import { ActivityLog } from './pages/activity/ActivityLog';
import { ScheduleManagement } from './pages/schedule/ScheduleManagement';
import { Settings } from './pages/settings/Settings';
import { PatientList } from './pages/patients/PatientList';
import { PatientDetail } from './pages/patients/PatientDetail';
import { CreatePatient } from './pages/patients/CreatePatient';
import { EditPatient } from './pages/patients/EditPatient';
import { MedicationList } from './pages/medications/MedicationList';
import { CreateSchedule } from './pages/medications/CreateSchedule';
import { LogMedication } from './pages/medications/LogMedication';
import { MedicationHistory } from './pages/medications/MedicationHistory';
import { CaregiverList } from './pages/caregivers/CaregiverList';
import { InviteCaregiver } from './pages/caregivers/InviteCaregiver';
import { ManagePermissions } from './pages/caregivers/ManagePermissions';
import { AdherenceReport } from './pages/reports/AdherenceReport';
import { PatientSummary } from './pages/reports/PatientSummary';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <PermissionProvider>
              <PatientProvider>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login"    element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected routes — all wrapped in DashboardLayout */}
                  <Route
                    path="/*"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout>
                          <Routes>
                            {/* Dashboard */}
                            <Route path="dashboard"                  element={<Dashboard />} />

                            {/* Activity & Schedule */}
                            <Route path="activity-log"               element={<ActivityLog />} />
                            <Route path="schedule"                   element={<ScheduleManagement />} />

                            {/* Alerts — placeholder until alerts page is built */}
                            <Route path="alerts"                     element={<Dashboard />} />

                            {/* Settings */}
                            <Route path="settings"                   element={<Settings />} />

                            {/* Patients */}
                            <Route path="patients"                   element={<PatientList />} />
                            <Route path="patients/new"               element={<CreatePatient />} />
                            <Route path="patients/:id"               element={<PatientDetail />} />
                            <Route path="patients/:id/edit"          element={<EditPatient />} />

                            {/* Medications */}
                            <Route path="medications"                element={<MedicationList />} />
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

                            {/* Default redirect */}
                            <Route path="/"  element={<Navigate to="/dashboard" replace />} />
                            <Route path="*"  element={<Navigate to="/dashboard" replace />} />
                          </Routes>
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </PatientProvider>
            </PermissionProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;