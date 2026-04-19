import axios from 'axios';

const api = axios.create({
  baseURL: 'https://bkadarsip-backend-production.up.railway.app/api',
  timeout: 120000,   
  headers: {
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => Promise.reject(error));

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
        localStorage.clear();
        // window.location.href = '/login'; // Opsional: paksa logout jika token hangus
    }
    return Promise.reject(error);
  }
);

export default api;