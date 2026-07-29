import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const GOOGLE_CLIENT_ID = '509503053419-da3m2663pldhpck665j2pusrkkvhks0d.apps.googleusercontent.com';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        { email, password },
        { withCredentials: true }
      );

      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      setMessage('Login successful! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 1000);

    } catch (error) {
      setMessage(error.response?.data?.message || 'Something went wrong');
    }
  }

  async function handleGoogleResponse(response) {
    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/google',
        { credential: response.credential },
        { withCredentials: true }
      );

      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      setMessage('Google login successful! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 1000);

    } catch (error) {
      setMessage(error.response?.data?.message || 'Google login failed');
    }
  }

  useEffect(() => {
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });

      google.accounts.id.renderButton(
        document.getElementById('googleSignInDiv'),
        { theme: 'outline', size: 'large', width: 320 }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Welcome back</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-sm text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        <div id="googleSignInDiv" className="flex justify-center"></div>

        {message && (
          <p className="mt-4 text-sm text-center text-gray-700">{message}</p>
        )}

        <p className="mt-6 text-sm text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-medium hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;