import { useState } from 'react';
import { authApi } from './api';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const testAPI = async () => {
    setIsLoading(true);
    setMessage('Testing API connection...');
    
    try {
      // This will fail (no credentials), but we can see if API is reachable
      await authApi.login({ email: 'test@test.com', password: 'test' });
    } catch (error: any) {
      // Expected to fail, but we can see the error
      if (error.errorCode) {
        setMessage(`✅ API Connected! Error: ${error.message}`);
      } else {
        setMessage(`❌ API Error: ${error}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="card max-w-md w-full">
        <h1 className="text-3xl font-bold text-primary-600 mb-4">
          🏥 CareSync
        </h1>
        
        <div className="space-y-4">
          <div>
            <p className="text-gray-600 mb-4">
              Phase 2: API Layer Complete! ✅
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✅ Axios configured with interceptors</li>
              <li>✅ JWT token auto-attached</li>
              <li>✅ Auth API ready</li>
              <li>✅ Permission API ready</li>
              <li>✅ Patient API ready</li>
              <li>✅ Medication API ready</li>
              <li>✅ Caregiver API ready</li>
              <li>✅ Report API ready</li>
              <li>🔜 Next: Authentication Context (Phase 3)</li>
            </ul>
          </div>

          {message && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              {message}
            </div>
          )}

          <button 
            onClick={testAPI}
            disabled={isLoading}
            className="btn btn-primary w-full"
          >
            {isLoading ? 'Testing...' : 'Test API Connection 🚀'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
