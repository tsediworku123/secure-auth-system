import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/auth',
  withCredentials: true, // always send cookies (needed for the refresh token)
});

// This runs automatically BEFORE every request
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// This runs automatically AFTER every response
api.interceptors.response.use(
  (response) => response, // if it worked fine, just pass it through
  async (error) => {
    const originalRequest = error.config;

    // Only try to refresh if we got a 401, AND we haven't already retried this exact request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // mark it, so we don't loop forever if refresh also fails

      try {
        const refreshResponse = await axios.post(
          'http://localhost:5000/api/auth/refresh',
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);

        // Update the header and retry the original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh failed too - the user needs to log in again for real
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;