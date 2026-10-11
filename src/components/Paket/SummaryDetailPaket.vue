<template>
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-16 bg-white rounded-xl border border-slate-200/60 shadow-sm my-4">
        <div class="flex flex-col items-center justify-center space-y-3">
            <div class="w-10 h-10 border-4 border-blue-950 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-slate-500 text-sm font-medium">Memuat ringkasan detail paket...</p>
        </div>
    </div>

    <!-- Error State -->
    <div v-else-if="isError" class="p-8 bg-red-50 border border-red-200 rounded-xl text-center my-4">
        <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        </div>
        <h4 class="text-slate-800 font-bold text-base mb-1">Gagal Memuat Ringkasan Paket</h4>
        <p class="text-sm text-slate-600 mb-4 max-w-md mx-auto">{{ errorMessage }}</p>
        <button @click="loadDashboardData"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm inline-flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Coba Lagi
        </button>
    </div>

    <!-- State Jika Data Paket Belum Siap -->
    <div v-else-if="!paketId && !paket?.id"
        class="text-center py-16 bg-white rounded-xl border border-slate-200/60 shadow-sm my-4">
        <p class="text-slate-500 text-sm">Menunggu data paket dari parent...</p>
    </div>

    <!-- Content Utama -->
    <div v-else class="min-h-screen p-4 md:p-6 lg:p-8 bg-slate-50/50 font-sans text-slate-800">

        <!-- ========================================== -->
        <!-- HEADER HALAMAN                             -->
        <!-- ========================================== -->
        <div class="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
                <div class="flex items-center gap-2 mb-1">

                    <span class="text-sm!" :class="getStatusBadgeClass(paket?.statusKondisi || 'Status N/A')">{{
                        capitalizeFirstLetter(paket?.statusKondisi || 'Status N/A') }}</span>
                </div>
                <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">Detail Pemantauan Proyek</h1>
                <p class="text-sm text-slate-500 mt-1"></p>
            </div>

        </div>

        <!-- ========================================== -->
        <!-- SECTION 1: DATA TEKNIS & PETA              -->
        <!-- ========================================== -->
        <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">

            <!-- Data Teknis / Info Proyek -->
            <div class="xl:col-span-7 bg-white rounded-xl shadow-sm border border-slate-200/60 p-5">
                <h2 class="text-base font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Informasi Teknis
                    Kegiatan</h2>

                <!-- Grid 2 Kolom untuk list data -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    <div v-for="(val, key) in dataTeknisFormat" :key="key" class="flex flex-col">
                        <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{{ key }}</span>
                        <span class="text-sm text-slate-800 font-medium">{{ val || '-' }}</span>
                    </div>
                </div>
            </div>

            <!-- Peta -->
            <div class="xl:col-span-5 bg-white rounded-xl shadow-sm border border-slate-200/60 p-5 flex flex-col">
                <h2 class="text-base font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Peta</h2>
                <div class="flex-1 bg-slate-200 rounded-lg overflow-hidden relative min-h-[250px]">
                    <div id="map"
                        class="flex-1 rounded border border-gray-200 overflow-hidden relative min-h-[12rem] z-0">
                    </div>
                </div>
            </div>
        </div>

        <!-- ========================================== -->
        <!-- SECTION 2: S-CURVE & SUMMARY PROGRESS     -->
        <!-- ========================================== -->
        <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">
            <!-- Card Kurva Keuangan / S-Curve -->
            <div class="xl:col-span-8 bg-white rounded-xl shadow-sm border border-slate-200/60 p-5">
                <div class="flex items-center gap-3 mb-4">
                    <div class="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                            </path>
                        </svg>
                    </div>
                    <h2 class="text-base font-bold text-slate-800">S - Curve</h2>
                </div>
                <div class="h-[300px]">
                    <canvas id="chartUang" ref="chartUangRef"></canvas>
                </div>
            </div>

            <!-- Stacked Progress Cards (Fisik + Keuangan) -->
            <div class="xl:col-span-4 flex flex-col gap-6">
                <!-- Progres Fisik -->
                <div
                    class="bg-white rounded-xl shadow-sm border border-slate-200/60 p-5 flex-1 flex flex-col justify-between">
                    <h3 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Progress Fisik
                    </h3>

                    <div class="space-y-3">
                        <!-- Rencana -->
                        <div>
                            <div class="flex justify-between text-xs mb-1">
                                <span class="text-slate-500 font-medium">Target Rencana</span>
                                <span class="font-bold text-slate-700">{{ statusProgressFisik.planPercentage }}%</span>
                            </div>
                            <div class="w-full bg-slate-100 rounded-full h-2">
                                <div class="bg-blue-400 h-2 rounded-full"
                                    :style="{ width: (statusProgressFisik.planPercentage || 0) + '%' }">
                                </div>
                            </div>
                        </div>

                        <!-- Aktual -->
                        <div>
                            <div class="flex justify-between text-xs mb-1">
                                <span class="text-slate-500 font-medium">Realisasi Aktual</span>
                                <span class="font-bold text-emerald-600">{{ statusProgressFisik.actualPercentage
                                }}%</span>
                            </div>
                            <div class="w-full bg-slate-100 rounded-full h-2">
                                <div class="h-2 rounded-full transition-all"
                                    :style="{ width: (statusProgressFisik.actualPercentage || 0) + '%' }"
                                    :class="(statusProgressFisik.actualPercentage || 0) >= (statusProgressFisik.planPercentage || 0) ? 'bg-emerald-500' : 'bg-red-500'">
                                </div>
                            </div>
                        </div>

                        <!-- Deviasi Badge -->
                        <div class="pt-2 border-t border-slate-100 flex justify-between items-center">
                            <span class="text-xs font-medium text-slate-500">Deviasi</span>
                            <span
                                class="bg-red-50 text-red-600 font-bold px-3 py-1 rounded-lg text-sm border border-red-100">
                                {{ statusProgressFisik.deviationFisik || 0 }}%
                            </span>
                        </div>
                    </div>
                </div>
                <div
                    class="bg-white rounded-xl shadow-sm border border-slate-200/60 p-5 flex-1 flex flex-col justify-between">
                    <h3 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Progress Keuangan
                    </h3>

                    <div class="space-y-3">
                        <!-- Rencana -->
                        <div>
                            <div class="flex justify-between text-xs mb-1">
                                <span class="text-slate-500 font-medium">Target Rencana</span>
                                <span class="font-bold text-slate-700">{{ statusProgressKeuangan.planPercentage
                                }}%</span>
                            </div>
                            <div class="w-full bg-slate-100 rounded-full h-2">
                                <div class="bg-blue-400 h-2 rounded-full"
                                    :style="{ width: (statusProgressKeuangan.planPercentage || 0) + '%' }">
                                </div>
                            </div>
                        </div>

                        <!-- Aktual -->
                        <div>
                            <div class="flex justify-between text-xs mb-1">
                                <span class="text-slate-500 font-medium">Realisasi Aktual</span>
                                <span class="font-bold text-emerald-600">{{ statusProgressKeuangan.actualPercentage
                                }}%</span>
                            </div>
                            <div class="w-full bg-slate-100 rounded-full h-2">
                                <div class="h-2 rounded-full transition-all"
                                    :style="{ width: (statusProgressKeuangan.actualPercentage || 0) + '%' }"
                                    :class="(statusProgressKeuangan.actualPercentage || 0) >= (statusProgressKeuangan.planPercentage || 0) ? 'bg-emerald-500' : 'bg-red-500'">
                                </div>
                            </div>
                        </div>

                        <!-- Deviasi Badge -->
                        <div class="pt-2 border-t border-slate-100 flex justify-between items-center">
                            <!-- <span class="text-xs font-medium text-slate-500">Deviasi</span>
                            <span
                                class="bg-red-50 text-red-600 font-bold px-3 py-1 rounded-lg text-sm border border-red-100">
                                {{ statusProgressKeuangan.deviationKeuangan || 0 }}%
                            </span> -->
                        </div>
                    </div>
                </div>

                <!-- Progres Keuangan -->
                <!-- <div class="bg-white rounded-xl shadow-sm border border-slate-200/60 p-5 flex-1 flex flex-col justify-between">
                    <h3 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-indigo-500"></span> Prog Keuangan
                    </h3>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                            <p class="text-[11px] text-indigo-600 font-medium mb-1">thd Pagu</p>
                            <p class="text-lg font-black text-indigo-700">
                                {{ statusProgressKeuangan.planPercentage || 0 }}%
                            </p>
                        </div>
                        <div class="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                            <p class="text-[11px] text-indigo-600 font-medium mb-1">thd Kontrak</p>
                            <p class="text-lg font-black text-indigo-700">
                                {{ statusProgressKeuangan.actualPercentage || 0 }}%
                            </p>
                        </div>
                    </div>
                </div> -->
            </div>
        </div>

        <!-- ========================================== -->
        <!-- SECTION 3: PEKERJAAN, DOKUMENTASI, MASALAH -->
        <!-- ========================================== -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">

            <!-- Item Pekerjaan -->
            <div class="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200/60 flex flex-col h-[380px]">
                <div class="p-4 border-b border-slate-100 flex-none bg-slate-50/50 rounded-t-xl">
                    <h2 class="text-sm font-bold text-slate-800">Item Pekerjaan</h2>
                </div>

                <div class="p-4 flex-1 overflow-y-auto custom-scrollbar-y">
                    <div v-if="detailPaket && detailPaket.itemPekerjaan" v-html="detailPaket.itemPekerjaan"
                        class="editor-content text-xs text-slate-700 leading-relaxed"></div>

                    <div v-else class="flex flex-col items-center justify-center h-full text-slate-400">
                        <svg class="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                            </path>
                        </svg>
                        <span class="text-xs italic">Data belum diinput.</span>
                    </div>
                </div>
            </div>

            <!-- Dokumentasi (1 Gambar) -->
            <div class="lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-200/60 flex flex-col h-[380px]">
                <div
                    class="p-4 border-b border-slate-100 flex-none bg-slate-50/50 rounded-t-xl flex justify-between items-center">
                    <h2 class="text-sm font-bold text-slate-800">Dokumentasi</h2>
                </div>
                <div class="p-4 flex-1 overflow-hidden relative">
                    <img v-if="fotoLastProgress.fotoDokumentasi"
                        :src="`${backendUrl}${fotoLastProgress.fotoDokumentasi}`"
                        class="w-full h-full object-cover rounded-lg" />
                    <div v-else class="flex flex-col items-center justify-center h-full text-slate-400">
                        <svg class="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span class="text-xs italic">Tidak ada foto dokumentasi</span>
                    </div>
                </div>
            </div>

            <!-- Permasalahan & Tindak Lanjut -->
            <div class="lg:col-span-5 bg-white rounded-xl shadow-sm border border-slate-200/60 flex flex-col h-[380px]">
                <div class="p-4 border-b border-slate-100 flex-none bg-slate-50/50 rounded-t-xl">
                    <h2 class="text-sm font-bold text-slate-800">Permasalahan dan Tindak Lanjut</h2>
                </div>
                <div class="p-4 flex-1 overflow-y-auto custom-scrollbar-y">
                    <div class="h-full flex flex-col items-center justify-center text-center">
                        <div class="bg-emerald-50 p-4 rounded-full mb-3">
                            <svg class="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <h3 class="text-sm font-bold text-slate-800">Tidak ada kendala kritis</h3>
                        <p class="text-xs text-slate-500 mt-1">Pekerjaan berjalan sesuai dengan rencana teknis.</p>
                    </div>
                </div>
            </div>

        </div>

        <!-- ========================================== -->
        <!-- SECTION 4: GAMBAR RENCANA & STRIP MAP      -->
        <!-- ========================================== -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

            <!-- Gambar Rencana -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200/60 flex flex-col h-[380px]">
                <div class="p-4 border-b border-slate-100 flex-none bg-slate-50/50 rounded-t-xl">
                    <h2 class="text-sm font-bold text-slate-800">Gambar Rencana</h2>
                </div>
                <div class="p-4 flex-1 overflow-hidden relative">
                    <img v-if="fotoLastProgress.fotoTipikal" :src="`${backendUrl}${fotoLastProgress.fotoTipikal}`"
                        class="w-full h-full object-cover rounded-lg" />
                    <div v-else class="flex flex-col items-center justify-center h-full text-slate-400">
                        <svg class="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span class="text-xs italic">Tidak ada gambar rencana</span>
                    </div>
                </div>
            </div>

            <!-- Strip Map -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200/60 flex flex-col h-[380px]">
                <div class="p-4 border-b border-slate-100 flex-none bg-slate-50/50 rounded-t-xl">
                    <h2 class="text-sm font-bold text-slate-800">Strip Map</h2>
                </div>
                <div class="p-4 flex-1 overflow-hidden relative">
                    <img v-if="fotoLastProgress.fotoStreetMap" :src="`${backendUrl}${fotoLastProgress.fotoStreetMap}`"
                        class="w-full h-full object-cover rounded-lg" />
                    <div v-else class="flex flex-col items-center justify-center h-full text-slate-400">
                        <svg class="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span class="text-xs italic">Tidak ada strip map</span>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import api from '@/services/api';
import { computed, ref, watch, nextTick, onMounted } from 'vue';
import Chart from 'chart.js/auto';
import { useAuth } from '@/lib/Auth';
import { useRoute } from 'vue-router';
import ChartDataLabels from 'chartjs-plugin-datalabels';

const props = defineProps({
    paketId: {
        type: [String, Number],
        required: false,
        default: null
    },
    paket: {
        type: Object,
        required: false,
        default: () => ({})
    }
});

const backendUrl = ref('http://100.114.142.21:3002/images/progress-fisik/');
let mapInstance = null;
const emit = defineEmits(['refresh']);
const auth = useAuth();
const isLoading = ref(false);
const isError = ref(false);
const errorMessage = ref('');

let chartKeuanganInstance = null;
let chartFisikInstance = null;
const chartUangRef = ref(null);
const chartFisikRef = ref(null);

const dataProgres = ref({ dataFisik: [], dataUang: [] });
const statusProgressKeuangan = ref({
    actualPercentage: 0,
    planPercentage: 0,
    deviationFinance: null,
    status: ''
});
const statusProgressFisik = ref({
    actualPercentage: 0,
    planPercentage: 0,
    deviationFisik: null,

    status: ''
});
const formattedDataTeknis = ref({

});

const loadMap = async () => {
    if (!detailPaket.value) {
        return
    }

    let statusColor = '';
    if (detailPaket.value.statusKondisi == 'aman') {
        statusColor = '#28A745'
    } else if (detailPaket.value.statusKondisi == 'perhatian') {
        statusColor = '#FFA500'
    } else if (detailPaket.value.statusKondisi == 'kritis') {
        statusColor = '#FF0000'
    }
    console.log('onlocation', detailPaket.value);

    const location = [{
        latitude: detailPaket.value.latitude,
        longitude: detailPaket.value.longitude,
        statusKondisi: detailPaket.value.statusKondisi,
        namaPaket: detailPaket.value.name,
        city: detailPaket.value.city
    }]
    try {
        const mapElement = document.getElementById('map');
        if (mapElement) {
            if (mapElement._leaflet_id) {
                mapElement._leaflet_id = null;
            }
            mapInstance = L.map(mapElement).setView([0.5387, 116.4194], 6);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 18
            }).addTo(mapInstance);



            location.forEach(proyek => {
                L.circleMarker([proyek.latitude, proyek.longitude], {
                    radius: 7,
                    fillColor: statusColor,
                    color: "#ffffff",
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.9
                }).addTo(mapInstance)
                    .bindPopup(`
            <div class="font-sans">
                <span class="text-[10px] font-bold text-gray-400">${proyek.namaPaket}</span>
                <h4 class="text-xs font-bold text-gray-800 mb-1 leading-tight">${proyek.city}</h4>
                <span class="text-[10px] px-2 py-0.5 rounded text-white" style="background-color: ${statusColor};">
                    ${proyek.statusKondisi}
                </span>
            </div>
        `);
            });
        }

    } catch (error) {
        console.error("Gagal memuat data peta", error);
    }
}

const loadKurvaUang = async () => {
    console.log("paket id", props.paket?.id);

    try {
        const response = await api.get(`/dashboard-paket/${props.paket?.id}/data-kurva`);

        if (chartKeuanganInstance) {
            chartKeuanganInstance.destroy();
            chartKeuanganInstance = null;
        }

        const { labels, aktualFisik, aktualKeuangan } = response.data?.data || {};
        Chart.register(ChartDataLabels)
        chartKeuanganInstance = new Chart(chartUangRef.value, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Fisik (%)',
                        data: aktualFisik,
                        borderColor: '#22c55e',
                        backgroundColor: '#22c55e',
                        tension: 0.4,
                        borderWidth: 2
                    },
                    {
                        label: 'Keuangan (%)',
                        data: aktualKeuangan,
                        borderColor: '#f97316',
                        backgroundColor: '#f97316',
                        tension: 0.4,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { grid: { display: false } },
                    y: { ticks: { display: false }, border: { display: false }, grid: { display: false }, beginAtZero: true, max: 100 }
                },
                plugins: {
                    datalabels: {
                        display: true,              // Tampilkan label
                        align: 'top',               // Posisikan tulisan di atas titik
                        anchor: 'end',              // Tumpuan ada di ujung titik
                        offset: 6,                  // Jarak tulisan dari titik (px)
                        color: '#0f172a',           // Warna tulisan (slate-900)
                        font: {
                            weight: 'bold',           // Huruf tebal
                            size: 11
                        },
                        // 4. Format angka agar lebih rapi (misal ditambah lambang %)
                        formatter: (value, context) => {
                            const lastValueIndex = aktualKeuangan.filter(val => val !== null && val !== undefined).length

                            // Jika datanya null, undefined, atau 0, jangan tampilkan apa-apa
                            if (value === null || value === undefined || value === 0) {
                                return '';
                            }
                            if (context.dataIndex !== lastValueIndex - 1) {
                                console.log('last');
                                console.log(context.dataIndex);
                                console.log(lastValueIndex);

                                return '';
                            }
                            return value + '%';
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error("Gagal memuat kurva uang:", error);
    }
};

// const loadKurvaFisik = async () => {
//     console.log(detailPaket.value);

//     try {
//         const token = auth.state?.token || localStorage.getItem("token");
//         const response = await axios.get(`http://100.114.142.21:3002/api/v1/dashboard-paket/kurva-fisik/${props.paket?.id}`, {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//             }
//         });

//         if (chartFisikInstance) {
//             chartFisikInstance.destroy();
//             chartFisikInstance = null;
//         }

//         const { labels = [], aktual = [] } = response.data?.data || {};
//         chartFisikInstance = new Chart(chartFisikRef.value, {
//             type: 'line',
//             data: {
//                 labels: labels,
//                 datasets: [
//                     {
//                         label: 'Realisasi (%)',
//                         data: aktual,
//                         borderColor: '#3b82f6',
//                         backgroundColor: '#3b82f6',
//                         tension: 0.6,
//                         borderWidth: 2
//                     }
//                 ]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 scales: {
//                     x: { grid: { display: false } },
//                     y: { ticks: { display: false }, border: { display: false }, grid: { display: false }, beginAtZero: true, max: 100 }
//                 }
//             }
//         });

//     } catch (error) {
//         console.error("Gagal memuat kurva fisik:", error);
//     }
// };



const route = useRoute();
const paketId = ref(route.params.kodePaket); // Asumsi route Anda /paket/:id
const fotoLastProgress = ref({
    fotoTipikal: '',
    fotoStreetMap: '',
    fotoDokumentasi: '',
})
// State Penampung Data Utama
const detailPaket = ref(null);

// Fungsi memanggil API
const fetchDetailPaket = async () => {
    try {
        const response = await api.get(`/paket/kode/${paketId.value}`);
        detailPaket.value = response.data.data;

        console.log("response.data", response.data.data);

    } catch (error) {
        console.error("Gagal mengambil detail paket:", error);
    } finally {
        isLoading.value = false;
    }
};

const setDataPaket = () => {
    if (!detailPaket.value) return;

    // Handle physical progress data
    const progressFisikData = detailPaket.value.progressFisiks || detailPaket.value.progressFisik || [];
    if (progressFisikData.length > 0) {
        const lastStatus = progressFisikData[0];
        statusProgressFisik.value.actualPercentage = lastStatus.actualPercentage || 0;
        statusProgressFisik.value.planPercentage = lastStatus.planPercentage || 0;
        statusProgressFisik.value.deviationFisik = lastStatus.deviationFisik || 0;
        fotoLastProgress.value.fotoTipikal = lastStatus.fotoTipikal || '';
        fotoLastProgress.value.fotoStreetMap = lastStatus.fotoStreetMap || '';
        fotoLastProgress.value.fotoDokumentasi = lastStatus.fotoDokumentasi || '';

        console.log('progreee fisik data');
        console.log(lastStatus);



    } else {
        statusProgressFisik.value.actualPercentage = 0;
        statusProgressFisik.value.planPercentage = 0;
        statusProgressFisik.value.deviationFisik = 0;
        fotoLastProgress.value.fotoTipikal = '';
        fotoLastProgress.value.fotoStreetMap = '';
        fotoLastProgress.value.fotoDokumentasi = '';
    }

    // Handle financial progress data
    const progressKeuanganData = detailPaket.value.progressKeuangans || detailPaket.value.progressKeuangan || [];
    if (progressKeuanganData.length > 0) {
        const lastStatus = progressKeuanganData[0];
        statusProgressKeuangan.value.actualPercentage = lastStatus.actualPercentage || 0;
        statusProgressKeuangan.value.planPercentage = lastStatus.paguPercentage || lastStatus.planPercentage || 0;
        statusProgressKeuangan.value.deviationFinance = lastStatus.deviationFinance || 0;
    } else {
        statusProgressKeuangan.value.actualPercentage = 0;
        statusProgressKeuangan.value.planPercentage = 0;
        statusProgressKeuangan.value.deviationFinance = 0;
    }
}
const documentationFoto = computed(() => {
    if (!detailPaket.value || !detailPaket.value.documentations || detailPaket.value.documentations.length === 0) return [];

    // Ambil data array ke-[0] (karena take: 1 mengembalikan array berisi 1 objek)
    const dataTerakhir = detailPaket.value.documentations[0];
    if (!dataTerakhir || !dataTerakhir.fileName) return [];

    return dataTerakhir;
});


watch(() => detailPaket.value, () => {
    if (detailPaket.value) {
        setDataPaket();
        // loadKurvaFisik();
        loadKurvaUang();
        loadMap()
    }
}, { immediate: true })

onMounted(async () => {
    await fetchDetailPaket();
    // setDataPaket();
    // loadKurvaFisik();
    // loadKurvaUang();
})
// ==========================================
// COMPUTED PROPERTIES UNTUK MENGOLAH UI
// ==========================================

// 1. Format Rupiah
const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka || 0);
};

// 2. Olah Data Teknis untuk Looping di Tabel Info
const dataTeknisFormat = computed(() => {
    if (!detailPaket.value) return {};
    return {
        'Nilai Pagu': formatRupiah(detailPaket.value.nilaiPagu),
        'Nilai Kontrak': formatRupiah(detailPaket.value.nilaiKontrak),
        'Nomor Kontrak': detailPaket.value.noKontrak || '-',
        'PPKom': detailPaket.value.ppkom || '-',
        'Penyedia Jasa': detailPaket.value.penyediaJasa || '-',
        'Konsultan': detailPaket.value.konsultanSupervisi || '-',
        'Lokasi': detailPaket.value.city || detailPaket.value.lokasi || '-',
        'Ruas Lokasi': detailPaket.value.ruasLokasi || '-',
        'Kecamatan': detailPaket.value.kecamatan || '-',
        'Kelurahan': detailPaket.value.kelurahan || '-',
        'Sumber Dana': detailPaket.value.sumberDana || '-',
        'Tahun': detailPaket.value.tahun || '-',
    };
});

// 3. Olah Angka Progress Fisik Terakhir
const progresFisikTerakhir = computed(() => {
    if (!detailPaket.value) return 0;

    const progressFisikData = detailPaket.value.progressFisiks || detailPaket.value.progressFisik || [];
    if (progressFisikData.length === 0) return 0;

    const dataTerakhir = progressFisikData[0];
    if (!dataTerakhir || !dataTerakhir.nominalAktual || !detailPaket.value.nilaiKontrak) return 0;

    const persen = (Number(dataTerakhir.nominalAktual) / Number(detailPaket.value.nilaiKontrak)) * 100;
    return parseFloat(persen.toFixed(2));
});

// 4. Olah Angka Progress Keuangan Terakhir
const progresKeuanganTerakhir = computed(() => {
    if (!detailPaket.value) return { nominal: 0, persenPagu: 0, persenKontrak: 0 };

    const progressKeuanganData = detailPaket.value.progressKeuangans || detailPaket.value.progressKeuangan || [];
    if (progressKeuanganData.length === 0) return { nominal: 0, persenPagu: 0, persenKontrak: 0 };

    const dataTerakhir = progressKeuanganData[0];
    if (!dataTerakhir || !dataTerakhir.nominalAktual) return { nominal: 0, persenPagu: 0, persenKontrak: 0 };

    const nominalAktual = Number(dataTerakhir.nominalAktual);
    const nilaiPagu = Number(detailPaket.value.nilaiPagu);
    const nilaiKontrak = Number(detailPaket.value.nilaiKontrak);

    return {
        nominal: nominalAktual,
        persenPagu: nilaiPagu > 0 ? parseFloat(((nominalAktual / nilaiPagu) * 100).toFixed(2)) : 0,
        persenKontrak: nilaiKontrak > 0 ? parseFloat(((nominalAktual / nilaiKontrak) * 100).toFixed(2)) : 0
    };
});

const getStatusBadgeClass = (status) => {
    if (!status) return 'px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold';
    const s = String(status).toLowerCase();
    if (s.includes('kritis')) {
        return 'px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-[10px] font-bold';
    }
    if (s.includes('aman')) {
        return 'px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold';
    }
    if (s.includes('perhatian')) {
        return 'px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-md text-[10px] font-bold';
    }
    return 'px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold';
};

function capitalizeFirstLetter(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}


</script>

<style scoped>
/* Scrollbar Kustom (yang sudah ada sebelumnya) */
.custom-scrollbar-y::-webkit-scrollbar {
    width: 5px;
}

.custom-scrollbar-y::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar-y::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 20px;
}

.custom-scrollbar-y::-webkit-scrollbar-thumb:hover {
    background-color: #94a3b8;
}

/* ==================================================== */
/* STYLING UNTUK KONTEN DARI HTML EDITOR (Tingkat Lanjut) */
/* ==================================================== */
.editor-content :deep(ul) {
    list-style-type: disc;
    /* Munculkan kembali titik bullet */
    padding-left: 1.5rem;
    margin-bottom: 1rem;
}

.editor-content :deep(ol) {
    list-style-type: decimal;
    /* Munculkan kembali angka 1, 2, 3 */
    padding-left: 1.5rem;
    margin-bottom: 1rem;
}

.editor-content :deep(li) {
    margin-bottom: 0.5rem;
}

.editor-content :deep(p) {
    margin-bottom: 0.75rem;
}

.editor-content :deep(strong),
.editor-content :deep(b) {
    font-weight: 700;
    /* Munculkan kembali efek tebal */
    color: #1e293b;
    /* slate-800 */
}

.editor-content :deep(em),
.editor-content :deep(i) {
    font-style: italic;
}

.editor-content :deep(a) {
    color: #2563eb;
    /* blue-600 */
    text-decoration: underline;
}

.editor-content :deep(h1),
.editor-content :deep(h2),
.editor-content :deep(h3) {
    font-weight: 700;
    color: #0f172a;
    /* slate-900 */
    margin-top: 1rem;
    margin-bottom: 0.5rem;
}
</style>