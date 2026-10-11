<script setup>
import { useAuth } from '@/lib/Auth';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const router = useRouter()
const isLoading = ref(false);
const auth = useAuth()
const user = reactive({
    email: '',
    password: ''
})

async function login() {
    isLoading.value = true;
    try {

        await new Promise((resolve) => setTimeout(resolve, 1000))


        await auth.login(user);

        router.push('/dashboard');
    } catch (error) {
        console.log(error);
        toast.add({ severity: 'error', summary: 'Login Gagal', detail: error.response.data.message, life: 3000 });
    } finally {
        isLoading.value = false;
    }
}
</script>
<template>
    <Toast position="top-center" />

    <!-- BAGIAN KANAN: Form Registrasi -->
    <div class="bg-white w-full max-w-md rounded-2xl border border-slate-50 shadow-xl p-8">

        <!-- Header Form -->
        <!-- <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-slate-900">Sign In</h1>
            <p class="text-slate-500 mt-1">Sistem Monitoring MANTAP BM</p>
        </div> -->
        <div class="sm:mx-auto sm:w-full sm:max-w-md p-10">
            <img class="mx-auto h-10 w-auto" src="https://www.svgrepo.com/show/301692/login.svg" alt="Workflow">
            <h2 class="mt-6 text-center text-3xl leading-9 font-extrabold text-gray-900">
                MANTAP BM
            </h2>
        </div>
        <!-- Form Input -->
        <form @submit.prevent="login">

            <!-- Email -->
            <div class="mb-4">
                <label class="block text-slate-700 font-medium mb-1.5">Email</label>
                <input type="email" required v-model="user.email"
                    class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-colors"
                    placeholder="user@gmail.com">
            </div>

            <!-- Password -->
            <div class="mb-6">
                <label class="block text-slate-700 font-medium mb-1.5">Password</label>
                <input type="password" required v-model="user.password"
                    class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-colors"
                    placeholder="••••••••">
            </div>

            <!-- Tombol Submit -->
            <button type="submit"
                class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                <div class="flex justify-center">
                    <div v-if="isLoading">
                        <ProgressSpinner :strokeWidth="8" animationDuration=".5s" style="width: 20px; height: 20px" :pt="{
                            circleTrack: { style: { stroke: 'transparent' } }
                        }" />
                    </div>
                    <div v-else>
                        Login
                    </div>
                </div>
            </button>

        </form>


    </div>

</template>
<style sc></style>