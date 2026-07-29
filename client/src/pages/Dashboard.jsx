import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosInstance';

function Dashboard() {
  const navigate = useNavigate();

  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  async function handleLogout() {
    const accessToken = localStorage.getItem('accessToken');

    try {
      await api.post('/logout-all');
    } catch (error) {
      console.error('Logout request failed:', error);
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        {user ? (
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">{user.email}</p>
                <p className="text-xs text-gray-500">
                  Signed in via {user.auth_provider || 'email/password'}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
              Account created: {new Date(user.created_at).toLocaleDateString()}
            </div>

            <Link
              to="/sessions"
              className="block text-sm text-blue-600 font-medium hover:underline"
            >
              View my login sessions →
            </Link>
          </div>
        ) : (
          <p className="text-gray-500 mb-6">No user info found.</p>
        )}

        <button
          onClick={handleLogout}
          className="w-full bg-red-50 text-red-600 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;