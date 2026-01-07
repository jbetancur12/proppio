import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// Auto-inject token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 402 Payment Required (Subscription Suspended)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 402) {
            // Redirect to subscription suspended page
            window.location.href = '/subscription-suspended';
        }
        return Promise.reject(error);
    }
);
