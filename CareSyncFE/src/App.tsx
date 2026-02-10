import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PermissionProvider } from './context/PermissionContext';
import { PatientProvider } from './context/PatientContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Dashboard } from './pages/dashboard/Dashboard';
import { PatientList } from './pages/patients/PatientList';
import { PatientDetail } from './pages/patients/PatientDetail';
import { CreatePatient } from './pages/patients/CreatePatient';
import { EditPatient } from './pages/patients/EditPatient';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PermissionProvider>
          <PatientProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/patients"
                element={
                  <ProtectedRoute>
                    <PatientList />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/patients/new"
                element={
                  <ProtectedRoute>
                    <CreatePatient />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/patients/:id"
                element={
                  <ProtectedRoute>
                    <PatientDetail />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/patients/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditPatient />
                  </ProtectedRoute>
                }
              />

              {/* Default Route */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* 404 Route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </PatientProvider>
        </PermissionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;