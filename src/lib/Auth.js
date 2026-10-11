// src/store/auth.js
import { reactive, computed } from 'vue';
import axios from 'axios';

// Helper untuk membaca localStorage dengan aman
const getStorageItem = (key) => {
    const item = localStorage.getItem(key);
    if (!item || item === 'undefined' || item === 'null') return null;
    try {
        return JSON.parse(item);
    } catch {
        return item;
    }
};

// 1. Buat state yang reaktif
const state = reactive({
    user: getStorageItem('user'),
    token: getStorageItem('token'),
});

// 2. Buat aksi (functions) dan getters untuk memanipulasi state
export const useAuth = () => {

    // Getters
    const isLoggedIn = computed(() => !!state.token);
    const userRole = computed(() => state.user?.role || 'user');

    // Actions
    const login = async (kredensial) => {
        const response = await axios.post('http://100.114.142.21:3002/api/v1/users/login', kredensial);
        console.log("Response login:", response.data);

        const resBody = response.data;
        const resData = resBody.data || resBody;

        // Ekstraksi token & user dari response backend
        const token = resBody.token || resData.token || (typeof resData === 'string' ? resData : null);
        const user = resBody.user || resData.user || (typeof resData === 'object' && resData !== null && !resData.token ? resData : null) || (resBody.data?.email || resBody.data?.id ? resBody.data : null);

        state.token = token;
        state.user = user;

        if (state.token) {
            localStorage.setItem('token', typeof state.token === 'string' ? state.token : JSON.stringify(state.token));
        } else {
            localStorage.removeItem('token');
        }

        if (state.user) {
            localStorage.setItem('user', JSON.stringify(state.user));
        } else {
            localStorage.removeItem('user');
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    };

    const logout = () => {
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
    };

    // Ekspos yang diperlukan saja
    return {
        state,
        isLoggedIn,
        userRole,
        login,
        logout
    };
};

const getStatusBadgeClass = (status) => {
    if (!status) return 'px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold';
    const s = String(status).toLowerCase();
    if (s.includes('terlambat') || s.includes('rendah') || s.includes('minus')) {
        return 'px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-[10px] font-bold';
    }
    if (s.includes('perhatian') || s.includes('tinggi') || s.includes('surplus')) {
        return 'px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold';
    }
    return 'px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold';
};