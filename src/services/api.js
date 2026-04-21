import axios from 'axios';

const api = axios.create({
  // PASTIKAN HTTPS DAN TIDAK ADA TANDA / DI AKHIR API
  baseURL: 'https://bkadarsip-backend-production.up.railway.app/api',
  timeout: 120000,   
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest' // Bantu Laravel deteksi request AJAX
  },
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Memaksa agar semua request menggunakan HTTPS secara internal
    if (config.url.startsWith('http://')) {
        config.url = config.url.replace('http://', 'https://');
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