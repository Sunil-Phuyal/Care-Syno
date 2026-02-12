import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePatient } from '../../context/PatientContext';
import { usePermission } from '../../hooks/usePermission';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { selectedPatient, myPatients, selectPatient } = usePatient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠', show: true },
    { path: '/patients', label: 'Patients', icon: '👥', show: true },
    { path: '/medications', label: 'Medications', icon: '💊', show: !!selectedPatient },
    { path: '/caregivers', label: 'Care Team', icon: '🤝', show: !!selectedPatient },
    { path: '/reports/adherence', label: 'Reports', icon: '📊', show: !!selectedPatient },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Logo + Mobile Menu */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
                <span className="text-2xl">🏥</span>
                <span className="text-xl font-bold text-primary-600 hidden sm:inline">
                  CareSync
                </span>
              </button>
            </div>

            {/* Center: Patient Selector (Desktop) */}
            {myPatients.length > 0 && (
              <div className="hidden md:block flex-1 max-w-xs mx-4">
                <select
                  value={selectedPatient?.patientId || ''}
                  onChange={(e) => {
                    const patient = myPatients.find(p => p.patientId === Number(e.target.value));
                    if (patient) selectPatient(patient);
                  }}
                  className="input w-full text-sm"
                >
                  {myPatients.map((patient) => (
                    <option key={patient.patientId} value={patient.patientId}>
                      {patient.fullName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Right: User Menu */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
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

      {/* Sidebar */}
      <aside className={`
        fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-20
        transform transition-transform duration-200 ease-in-out
        lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <nav className="p-4 space-y-2">
          {navItems.filter(item => item.show).map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setIsSidebarOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive(item.path)
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Patient Selector (Mobile) */}
        {myPatients.length > 0 && (
          <div className="p-4 border-t border-gray-200 lg:hidden">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Selected Patient
            </label>
            <select
              value={selectedPatient?.patientId || ''}
              onChange={(e) => {
                const patient = myPatients.find(p => p.patientId === Number(e.target.value));
                if (patient) selectPatient(patient);
              }}
              className="input w-full text-sm"
            >
              {myPatients.map((patient) => (
                <option key={patient.patientId} value={patient.patientId}>
                  {patient.fullName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Version Info */}
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <p className="text-xs text-gray-500">CareSync v1.0.0</p>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}