import axios from 'axios';

// Create a custom instance of Axios for all API calls
const apiClient = axios.create({
  // Use a relative path, assuming your Vite proxy or server serves the frontend
  baseURL: '/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR: Attaches the token to every outgoing request
apiClient.interceptors.request.use(
  (config) => {
    // 1. Retrieve the token from LocalStorage
    const token = localStorage.getItem('ecommerce_token'); 

    // 2. If the token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 3. Return the modified configuration
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

export default apiClient;