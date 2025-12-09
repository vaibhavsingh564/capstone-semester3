import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE || 'http://localhost:5001',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Clear local storage and redirect to login if token is invalid/expired
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Optional: Redirect to login page
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
