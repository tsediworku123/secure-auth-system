import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { Link } from 'react-router-dom';

function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      const accessToken = localStorage.getItem('accessToken');

      try {
        const response = await api.get('/sessions');
        setSessions(response.data.sessions);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load sessions');
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <Link to="/dashboard" className="text-sm text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-6">Your Login Sessions</h1>

        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="border border-gray-200 rounded-lg p-4 flex items-start justify-between gap-4"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(session.created_at).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">IP: {session.ip_address}</p>
                  <p className="text-xs text-gray-400 mt-1 break-all">
                    {session.user_agent}
                  </p>
                </div>

                {session.is_suspicious ? (
                  <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full whitespace-nowrap">
                    ⚠ Suspicious
                  </span>
                ) : (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full whitespace-nowrap">
                    ✓ Normal
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Sessions;