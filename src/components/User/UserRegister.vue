<script setup>
import { useAuth } from '@/lib/Auth';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';


const router = useRouter()
const auth = useAuth()
const user = reactive({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
})
// const selectedLanguage = ref(null);
const languages = ref([
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'viewer' },
]);
async function login() {
    try {

        await auth.login(user);

        router.push('/dashboard');
    } catch (error) {
        console.log(error);
    }
}

async function register(params) {
    try {

        const payload = {
            fullName: `${user.firstName} ${user.lastName}`,
            email: user.email,
            password: user.password,
            confirmPassword: user.confirmPassword,
            role: user.role
        }

        const response = await axios.post("http://100.114.142.21:3002/api/v1/users/register", payload);
        console.log("responsed ata 🚀🚀🚀🚀", response.data);

    } catch (error) {
        console.error(error);
    }
}
</script>
<template>

    <div
        class="max-w-5xl mx-auto bg-white rounded-[32px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">

        <!-- BAGIAN KANAN: Form Registrasi -->

        <!-- Header Form -->
        <!-- <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-slate-900">Sign In</h1>
            <p class="text-slate-500 mt-1">Sistem Monitoring MANTAP BM</p>
        </div> -->
        <!-- Form Input -->
        <form @submit.prevent="register">
            <div class="grid grid-cols-1 gap-3">
                <!-- Full width column -->
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nama
                        Depan<span class="text-red-500">*</span></label>
                    <input type="text" placeholder="Masukkan nama depan" v-model="user.firstName"
                        class="w-full bg-slate-50 text-sm font-bold text-blue-950 rounded-xl px-4 py-3.5 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-300">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nama
                        Belakang
                        <span class="text-red-500">*</span></label>
                    <input type="text" placeholder="Masukkan nama belakang" v-model="user.lastName"
                        class="w-full bg-slate-50 text-sm font-bold text-blue-950 rounded-xl px-4 py-3.5 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-300">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email<span
                            class="text-red-500">*</span></label>
                    <input type="text" placeholder="Masukkan email" v-model="user.email"
                        class="w-full bg-slate-50 text-sm font-bold text-blue-950 rounded-xl px-4 py-3.5 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-300">
                </div>
                <div>
                    <label
                        class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Password<span
                            class="text-red-500">*</span></label>
                    <input type="password" placeholder="Masukkan password" v-model="user.password"
                        class="w-full bg-slate-50 text-sm font-bold text-blue-950 rounded-xl px-4 py-3.5 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-300">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Konfirmasi
                        Password<span class="text-red-500">*</span></label>
                    <input type="password" placeholder="Masukkan password" v-model="user.confirmPassword"
                        class="w-full bg-slate-50 text-sm font-bold text-blue-950 rounded-xl px-4 py-3.5 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-300">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Role<span
                            class="text-red-500">*</span></label>
                    <Select v-model="user.role" :options="languages" optionLabel="label" optionValue="value"
                        placeholder="Pilih Role" class="w-full md:w-56" :pt="{
                            root: {
                                'option': 'text-xs!',
                                'class': 'w-full! px-2! py-1.5! bg-slate-50! font-bold! text-blue-950! rounded-xl! border-none! focus:ring-2! focus:ring-orange-500! focus:outline-none! placeholder-slate-300!'
                            }
                        }" />
                    <!-- <input type="text" placeholder="Masukkan Kode RUP..." v-model="user.role"
                    class="w-full bg-slate-50 text-sm font-bold text-blue-950 rounded-xl px-4 py-3.5 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-300"> -->
                </div>
            </div>
            <div class="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                <button type="button"
                    class="px-8 py-3.5 rounded-full text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors">
                    Batal
                </button>
                <button type="submit"
                    class="px-10 py-3.5 rounded-full text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2 hover:-translate-y-0.5">
                    Daftar
                </button>
            </div>

        </form>

    </div>


</template>
<style sc></style>