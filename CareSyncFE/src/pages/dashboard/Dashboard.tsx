import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary-600">
                🏥 CareSync
              </h1>
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
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome back, {user?.fullName}! 👋
          </h2>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Phase 3: Authentication Complete! ✅
            </p>

            <ul className="space-y-2 text-sm text-gray-700">
              <li>✅ You are logged in</li>
              <li>✅ JWT token stored in localStorage</li>
              <li>✅ Protected route working</li>
              <li>✅ Can logout</li>
              <li>🔜 Next: Permission System (Phase 4)</li>
            </ul>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Your Info:</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>User ID:</strong> {user?.userId}</p>
                <p><strong>Roles:</strong> {user?.roles.join(', ')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}