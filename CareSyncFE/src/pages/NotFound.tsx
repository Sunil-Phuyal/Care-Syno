import { useNavigate } from 'react-router-dom';
import { GlowBlobs } from '../components/ui/GlowBlobs';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="relative isolate overflow-clip min-h-screen flex items-center justify-center bg-gray-50">
      <GlowBlobs />
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <p className="text-2xl font-semibold text-gray-900 mt-4">Page not found</p>
        <p className="text-gray-600 mt-2 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-primary"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}