import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api'
});

// THIẾT LẬP INTERCEPTOR (Trạm kiểm soát tự động)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        // Tự động thêm Bearer token vào mọi request
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;