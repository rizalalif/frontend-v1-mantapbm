// import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import './assets/main.css'
import ToastService from 'primevue/toastservice';

const app = createApp(App)
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
