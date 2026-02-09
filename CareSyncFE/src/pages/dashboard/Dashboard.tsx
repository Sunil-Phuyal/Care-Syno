import { useAuth } from '../../context/AuthContext';
import { usePatient } from '../../context/PatientContext';
import { usePermissions } from '../../context/PermissionContext';
import { useNavigate } from 'react-router-dom';
import { PermissionGate } from '../../components/common/PermissionGate';
import type { Patient } from '../../types/patient.types';

export function Dashboard() {
  const { user, logout } = useAuth();
  const { selectedPatient, myPatients, selectPatient, isLoading } = usePatient();
  const { currentPatientPermissions } = usePermissions();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold text-primary-600">
                🏥 CareSync
              </h1>
              
              {/* Patient Selector Dropdown */}
              {myPatients.length > 0 && (
                <div>
                  <label className="sr-only">Select Patient</label>
                  <select
                    value={selectedPatient?.patientId || ''}
                    onChange={(e) => {
                      const patient = myPatients.find((p: Patient) => p.patientId === Number(e.target.value));
                      if (patient) selectPatient(patient);
                    }}
                    className="input py-2 text-sm"
                  >
                    {myPatients.map((patient: Patient) => (
                      <option key={patient.patientId} value={patient.patientId}>
                        {patient.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.fullName}
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {myPatients.length === 0 ? (
          // No patients yet
          <div className="card text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to CareSync! 👋
            </h2>
            <p className="text-gray-600 mb-6">
              You don't have any patients yet. Create your first patient to get started.
            </p>
            <button className="btn btn-primary">
              Create Patient
            </button>
          </div>
        ) : (
          // Has patients
          <div className="space-y-6">
            {/* Welcome Card */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.fullName}! 👋
              </h2>
              <p className="text-gray-600">
                Currently viewing: <strong>{selectedPatient?.fullName}</strong>
              </p>
            </div>

            {/* Permission Status Card */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Phase 4: Permission System ✅
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Your permissions for {selectedPatient?.fullName}:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {currentPatientPermissions && Object.entries(currentPatientPermissions).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className={value ? 'text-success-600' : 'text-gray-400'}>
                            {value ? '✅' : '❌'}
                          </span>
                          <span className={value ? 'text-gray-900' : 'text-gray-400'}>
                            {key}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Permission-based Buttons Demo */}
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Permission-based buttons (only visible if you have permission):
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <PermissionGate permission="patient.edit">
                      <button className="btn btn-primary btn-sm">
                        Edit Patient ✅
                      </button>
                    </PermissionGate>

                    <PermissionGate permission="patient.delete">
                      <button className="btn btn-danger btn-sm">
                        Delete Patient ✅
                      </button>
                    </PermissionGate>

                    <PermissionGate permission="medication.create_schedule">
                      <button className="btn btn-primary btn-sm">
                        Create Schedule ✅
                      </button>
                    </PermissionGate>

                    <PermissionGate permission="caregiver.invite">
                      <button className="btn btn-primary btn-sm">
                        Invite Caregiver ✅
                      </button>
                    </PermissionGate>

                    <PermissionGate permission="report.export">
                      <button className="btn btn-primary btn-sm">
                        Export Report ✅
                      </button>
                    </PermissionGate>
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    💡 Tip: If you don't see certain buttons above, it means you don't have those permissions for this patient.
                  </p>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="card bg-success-50 border-success-200">
              <h3 className="font-semibold text-success-900 mb-2">
                ✅ Permission System Working!
              </h3>
              <ul className="text-sm text-success-800 space-y-1">
                <li>✅ Permissions loaded from backend</li>
                <li>✅ UI updates based on permissions</li>
                <li>✅ Buttons show/hide dynamically</li>
                <li>✅ Backend still validates (double security)</li>
                <li>🔜 Next: Patient Management (Phase 5)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}