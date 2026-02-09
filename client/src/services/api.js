import axios from 'axios';

const api = axios.create({
    baseURL: 'https://scuola-backend.onrender.com/api'
});

// Add a request interceptor to inject the token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Add a response interceptor for global error handling
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            // Optional: window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

