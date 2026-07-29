import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    // No token found - kick them back to login
    return <Navigate to="/login" />;
  }

  // Token exists - let them see the protected content
  return children;
}

export default ProtectedRoute;