import { useAuth } from '../../context/AuthContext';
import { usePatient } from '../../context/PatientContext';
import { usePermissions } from '../../context/PermissionContext';
import { useNavigate } from 'react-router-dom';
import { PermissionGate } from '../../components/common/PermissionGate';

export function Dashboard() {
  const { user } = useAuth();
  const { selectedPatient, myPatients } = usePatient();
  const { currentPatientPermissions } = usePermissions();
  const navigate = useNavigate();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.fullName}! 👋
        </h1>
        {selectedPatient && (
          <p className="text-gray-600 mt-2">
            Currently managing care for <strong>{selectedPatient.fullName}</strong>
          </p>
        )}
      </div>

      {/* Quick Stats */}
      {selectedPatient && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
                👴
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Patient</p>
                <p className="text-xl font-bold text-gray-900">{selectedPatient.fullName}</p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-success-50 to-green-50 border-success-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center text-2xl">
                💊
              </div>
              <div>
                <p className="text-sm text-gray-600">Quick Action</p>
                <PermissionGate permission="medication.administer">
                  <button
                    onClick={() => navigate('/medications/log')}
                    className="text-success-700 font-medium hover:underline"
                  >
                    Log Medication →
                  </button>
                </PermissionGate>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-warning-50 to-yellow-50 border-warning-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center text-2xl">
                📊
              </div>
              <div>
                <p className="text-sm text-gray-600">Quick Report</p>
                <PermissionGate permission="report.view">
                  <button
                    onClick={() => navigate('/reports/adherence')}
                    className="text-warning-700 font-medium hover:underline"
                  >
                    View Adherence →
                  </button>
                </PermissionGate>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => navigate('/patients')}
          className="card hover:shadow-md transition-shadow text-left"
        >
          <div className="text-3xl mb-2">👥</div>
          <h3 className="font-semibold text-gray-900">My Patients</h3>
          <p className="text-sm text-gray-600">Manage {myPatients.length} patient{myPatients.length !== 1 ? 's' : ''}</p>
        </button>

        {selectedPatient && (
          <>
            <button
              onClick={() => navigate('/medications')}
              className="card hover:shadow-md transition-shadow text-left"
            >
              <div className="text-3xl mb-2">💊</div>
              <h3 className="font-semibold text-gray-900">Medications</h3>
              <p className="text-sm text-gray-600">View schedules</p>
            </button>

            <button
              onClick={() => navigate('/caregivers')}
              className="card hover:shadow-md transition-shadow text-left"
            >
              <div className="text-3xl mb-2">🤝</div>
              <h3 className="font-semibold text-gray-900">Care Team</h3>
              <p className="text-sm text-gray-600">Manage caregivers</p>
            </button>

            <PermissionGate permission="report.view">
              <button
                onClick={() => navigate('/reports/summary')}
                className="card hover:shadow-md transition-shadow text-left"
              >
                <div className="text-3xl mb-2">📋</div>
                <h3 className="font-semibold text-gray-900">Reports</h3>
                <p className="text-sm text-gray-600">View insights</p>
              </button>
            </PermissionGate>
          </>
        )}
      </div>

      {/* Getting Started (if no patients) */}
      {myPatients.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🏥</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to CareSync!
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Get started by creating your first patient profile. You can then set up medication schedules,
            invite family members to help, and track medication adherence.
          </p>
          <button
            onClick={() => navigate('/patients/new')}
            className="btn btn-primary btn-lg"
          >
            Create Your First Patient
          </button>
        </div>
      )}

      {/* System Status */}
      <div className="card bg-success-50 border-success-200 mt-8">
        <div className="flex items-start gap-3">
          <div className="text-2xl">✅</div>
          <div className="flex-1">
            <h3 className="font-semibold text-success-900 mb-1">
              System Ready!
            </h3>
            <p className="text-sm text-success-800">
              All features are operational. You have access to {Object.values(currentPatientPermissions || {}).filter(Boolean).length} permissions
              for the current patient.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}