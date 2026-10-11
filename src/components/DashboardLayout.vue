<script setup>
import { ref } from 'vue';
import { RouterView, useRoute } from 'vue-router';
const route = useRoute();

const pageList = ref([
    { id: 1, name: 'Dashboard', route: 'dashboard' },
    { id: 2, name: 'Paket Pekerjaan', route: 'paket' },
    { id: 3, name: 'Progress Fisik', route: 'progress-fisik' },
    { id: 4, name: 'Progress Keuangan', route: 'progress-keuangan' },
    { id: 5, name: 'Peta Proyek', route: 'peta-proyek' },
    { id: 6, name: 'Kendala', route: 'kendala' },
    { id: 7, name: 'Dokumentasi', route: 'dokumentasi' }
])
</script>

<template>
    <div class="flex h-screen overflow-hidden">
        <!-- Sidebar -->
        <aside class="w-64 bg-primary text-gray-300 flex flex-col shadow-xl z-20">
            <div class="p-4 flex items-center gap-3 border-b border-gray-700">
                <div class="w-8 h-8 bg-white rounded flex items-center justify-center text-primary font-bold">
                    <i class="fa-solid fa-bridge"></i>
                </div>
                <div>
                    <h1 class="font-bold text-white leading-tight">MANTAP BM</h1>
                    <p class="text-[10px]">Monitoring Bina Marga</p>
                </div>
            </div>

            <nav class="flex-1 overflow-y-auto py-4">
                <ul class="space-y-1 px-2">
                    <!-- <li>
                        <a href="#" :class="{ 'bg-accent': $route.name === 'dashboard' }"
                            class="flex items-center gap-3 px-3 py-2 hover:bg-secondary font-semibold rounded-md">
                            <i class="fa-solid fa-border-all w-5"></i> Beranda
                        </a>
                    </li> -->
                    <li v-for="page in pageList" :key="page.id">
                        <RouterLink :to="`/${page.route}`"
                            :class="route.name === page.route ? 'bg-accent text-primary' : 'hover:bg-secondary hover:text-white'"
                            class="flex items-center gap-3 px-3 py-2  rounded-md transition">
                            <i class="fa-solid fa-box-open w-5"></i> {{ page.name }}
                        </RouterLink>
                    </li>

                </ul>

                <div class="mt-8 px-4">
                    <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Filter</h3>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-[11px] mb-1">Tahun Anggaran</label>
                            <select class="w-full bg-secondary border border-gray-600 rounded p-1.5 text-xs text-white">
                                <option>2025</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-[11px] mb-1">Sumber Dana</label>
                            <select class="w-full bg-secondary border border-gray-600 rounded p-1.5 text-xs text-white">
                                <option>Semua</option>
                            </select>
                        </div>
                        <button
                            class="w-full mt-2 border border-accent text-accent hover:bg-accent hover:text-primary transition py-1.5 rounded text-xs font-semibold">
                            Terapkan Filter
                        </button>
                    </div>
                </div>
            </nav>
        </aside>
        <!-- Main Content -->
        <div class="flex-1 flex flex-col h-screen overflow-hidden">
            <!-- Header / Navbar -->
            <header class="bg-primary text-white p-4 flex justify-between items-center shadow z-10">
                <div>
                    <h2 class="font-bold text-lg leading-none">DASHBOARD MONITORING PROYEK BINA MARGA</h2>
                    <p class="text-gray-400 text-xs mt-1">PROVINSI KALIMANTAN TIMUR</p>
                </div>
                <div class="flex items-center gap-4">
                    <div
                        class="bg-secondary px-3 py-1.5 rounded border border-gray-600 text-xs flex items-center gap-2">
                        <span>Periode Data: 31 Mei 2025</span>
                        <i class="fa-solid fa-chevron-down text-[10px]"></i>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                            <i class="fa-solid fa-user"></i>
                        </div>
                        <div class="text-xs">
                            <p class="font-bold">Admin BM</p>
                            <p class="text-gray-400">Dinas PUPR & PERA Kaltim</p>
                        </div>
                    </div>
                </div>
            </header>
            <main class="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#d9d9d5]">
                <RouterView />
            </main>
        </div>
    </div>

</template>

<style scoped></style>