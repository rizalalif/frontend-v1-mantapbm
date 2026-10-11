import axios from 'axios';
import router from '@/router';

// 1. Ambil Base URL dari environment variable Vite
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api/v1';
export const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3002';
export const IMAGE_BASE_URL = `${BASE_URL}/images`;

// 2. Buat instance Axios terpusat
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// 3. Request Interceptor: Otomatis sisipkan Bearer Token jika user sudah login
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Pastikan token bersih jika tersimpan dalam bentuk string JSON ("...")
      const cleanToken = token.startsWith('"') && token.endsWith('"')
        ? JSON.parse(token)
        : token;
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 4. Response Interceptor: Tangani error global seperti sesi kadaluarsa (401)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Sesi telah berakhir atau tidak sah. Mengalihkan ke login...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Cegah looping jika error 401 terjadi di halaman login itu sendiri
      if (router.currentRoute.value.name !== 'login') {
        router.push({ name: 'login' });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
