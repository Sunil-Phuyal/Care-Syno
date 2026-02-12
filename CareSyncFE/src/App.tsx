import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PermissionProvider } from './context/PermissionContext';
import { PatientProvider } from './context/PatientContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Dashboard
import { Dashboard } from './pages/dashboard/Dashboard';

// Patient Pages
import { PatientList } from './pages/patients/PatientList';
import { PatientDetail } from './pages/patients/PatientDetail';
import { CreatePatient } from './pages/patients/CreatePatient';
import { EditPatient } from './pages/patients/EditPatient';

// Medication Pages
import { MedicationList } from './pages/medications/MedicationList';
import { CreateSchedule } from './pages/medications/CreateSchedule';
import { LogMedication } from './pages/medications/LogMedication';
import { MedicationHistory } from './pages/medications/MedicationHistory';

// Caregiver Pages
import { CaregiverList } from './pages/caregivers/CaregiverList';
import { InviteCaregiver } from './pages/caregivers/InviteCaregiver';
import { ManagePermissions } from './pages/caregivers/ManagePermissions';

// Report Pages
import { AdherenceReport } from './pages/reports/AdherenceReport';
import { PatientSummary } from './pages/reports/PatientSummary';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <PermissionProvider>
            <PatientProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes with Layout */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Routes>
                          <Route path="/dashboard" element={<Dashboard />} />
                          
                          {/* Patient Routes */}
                          <Route path="/patients" element={<PatientList />} />
                          <Route path="/patients/new" element={<CreatePatient />} />
                          <Route path="/patients/:id" element={<PatientDetail />} />
                          <Route path="/patients/:id/edit" element={<EditPatient />} />

                          {/* Medication Routes */}
                          <Route path="/medications" element={<MedicationList />} />
                          <Route path="/medications/new" element={<CreateSchedule />} />
                          <Route path="/medications/log" element={<LogMedication />} />
                          <Route path="/medications/history" element={<MedicationHistory />} />

                          {/* Caregiver Routes */}
                          <Route path="/caregivers" element={<CaregiverList />} />
                          <Route path="/caregivers/invite" element={<InviteCaregiver />} />
                          <Route path="/caregivers/:id/permissions" element={<ManagePermissions />} />

                          {/* Report Routes */}
                          <Route path="/reports/adherence" element={<AdherenceReport />} />
                          <Route path="/reports/summary" element={<PatientSummary />} />

                          {/* Default Route */}
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                          <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
  );
}

export default App;