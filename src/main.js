// import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import './assets/main.css'
import axios from 'axios';
import ToastService from 'primevue/toastservice';

// axios.interceptors.request.use((config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
// });

// axios.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response && error.response.status === 401) {
//             localStorage.removeItem('token');
//             router.push('/login');
//         }
//         return Promise.reject(error);
//     }
// );
const app = createApp(App)
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';
if (window.screen.width < 768) {
    var meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=1280';
    document.getElementsByTagName('head')[0].appendChild(meta);
}

app.use(router)
app.use(ToastService);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.p-dark' // Opsional jika ingin fitur dark mode
        }
    },


});

app.mount('#app')
