<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useAuth } from '@/lib/Auth.js';
import api from '@/services/api';
import ProgressFisikTable from '../ProgressFisik/ProgressFisikTable.vue';
import { generateExcel } from '@/lib/Helper.js';
import { useToast } from 'primevue';
const auth = useAuth()
const isLoading = ref(false)
const toast = useToast()
const error = ref(false)
const errorMessage = ref('')
const progressFisik = ref([]);
const props = defineProps({
    paket: {
        type: Object,
        required: false
    },
    paketId: {
        type: String,
        required: false
    },
    progressList: {
        type: Array,
        default: () => []
    },
    isVisibleHeader: {
        type: Boolean,
        default: true
    }
});

const showAlert = (severity, status, message) => {
    toast.add({
        severity: severity,
        summary: status,
        detail: message,
        life: 3000
    })
}

const statusOptions = ref([
    { label: "Semua Status", value: "all" },
    { label: "Sesuai Target", value: "Sesuai Target" },
    { label: "Terlambat", value: "Terlambat" },
    { label: "Lebih Cepat", value: "Lebih Cepat" },
]);

const selectedStatus = ref(null);

const monthNames = ref([
    { label: "Semua Bulan", value: "all" },
    { label: "Januari", value: "Januari" },
    { label: "Februari", value: "Februari" },
    { label: "Maret", value: "Maret" },
    { label: "April", value: "April" },
    { label: "Mei", value: "Mei" },
    { label: "Juni", value: "Juni" },
    { label: "Juli", value: "Juli" },
    { label: "Agustus", value: "Agustus" },
    { label: "September", value: "September" },
    { label: "Oktober", value: "Oktober" },
    { label: "November", value: "November" },
    { label: "Desember", value: "Desember" },
]);

const selectedMonth = ref(null);



async function getDetailProgressFisik() {

    try {
        isLoading.value = true;
        error.value = false;
        if (auth.isLoggedIn) {
            const response = await api.get('/progress-fisik', {
                params: {
                    status: selectedStatus.value,
                    month: selectedMonth.value,
                }
            });

            progressFisik.value = response.data.data;
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        error.value = true;
        errorMessage.value = error.message || "Gagal memuat data paket";
    } finally {
        isLoading.value = false;
    }
}

const handleExportExcel = () => {
    // 1. Siapkan datanya (Tambahkan nomor urut atau pastikan tipe data angka)
    const dataToExport = progressFisik.value.map((progress, index) => ({
        no: index + 1,
        actualNominal: progress?.actualNominal || '-',
        actualPercentage: progress?.actualPercentage || '-',
        createdAt: progress?.createdAt || '-',
        deviationFisik: progress?.deviationFisik || '-',
        id: progress?.id,
        keterangan: progress?.keterangan || '-',
        mingguKe: progress?.mingguKe || '-',
        monthName: progress?.monthName || '-',
        monthNumber: progress?.monthNumber || '-',
        paketProgressFisikId: progress?.paketProgressFisikId || '-',
        planPercentage: progress?.planPercentage || '-',
        status: progress?.status || '-',
        tglLaporan: progress?.tglLaporan || '-'

    }));

    // 2. Definisikan struktur kolom (Header Excel, Key di objek dataToExport, dan Lebar Excel)
    const columnsConfig = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Actual Nominal', key: 'actualNominal', width: 50 },
        { header: 'Actual Persentase', key: 'actualPercentage', width: 25 },
        { header: 'Created At', key: 'createdAt', width: 35 },
        { header: 'Deviation Fisik', key: 'deviationFisik', width: 20 },
        { header: 'ID', key: 'id', width: 20 },
        { header: 'Keterangan', key: 'keterangan', width: 15 },
        { header: 'Minggu Ke', key: 'mingguKe', width: 20 },
        { header: 'Nama Bulan', key: 'monthName', width: 20 },
        { header: 'Nomor Bulan', key: 'monthNumber', width: 20 },
        { header: 'Plan Persentase', key: 'planPercentage', width: 20 },
        { header: 'Status', key: 'status', width: 20 },
        { header: 'Tanggal Laporan', key: 'tglLaporan', width: 20 },
        { header: 'ID Paket Progress Fisik', key: 'paketProgressFisikId', width: 20 },


    ];

    // 3. Panggil fungsi Helper
    try {
        generateExcel(
            dataToExport,          // Data mentah yang sudah dirapikan
            columnsConfig,         // Konfigurasi Header & Lebar Kolom
            'Rekap_Daftar_Progress_Fisik',  // Nama File
            'Data Progress Fisik'           // Nama Sheet
        );
    } catch (error) {
        alert('Terjadi kesalahan saat mengunduh Excel.', error);
    }
};


onMounted(async () => {
    await getDetailProgressFisik();
});
</script>

<template>
    <Toast />
    <div class="flex flex-col gap-3">
        <div class="bg-white rounded-[24px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)]  flex flex-col">
            <div class="p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                <!-- Search & Filters -->
                <div class="flex items-center gap-3 flex-wrap">
                    <!-- <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                        <input type="text"
                            class="bg-slate-50 text-sm font-medium text-blue-950 rounded-full pl-10 pr-4 py-2.5 w-64 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-400"
                            placeholder="Cari nama paket atau no kontrak...">
                    </div> -->

                    <Select v-model="selectedStatus" :options="statusOptions" optionLabel="label" optionValue="value"
                        placeholder="Pilih status" @change="getDetailProgressFisik()"
                        :pt="{ root: { class: 'bg-slate-50! text-sm! font-semibold! text-slate-600! rounded-full! px-2! border-none! focus:ring-2! focus:ring-orange-500! focus:outline-none! cursor-pointer! appearance-none! relative!' } }" />
                    <Select v-model="selectedMonth" :options="monthNames" optionLabel="label" optionValue="value"
                        placeholder="Pilih bulan" @change="getDetailProgressFisik()"
                        :pt="{ root: { class: 'bg-slate-50! text-sm! font-semibold! text-slate-600! rounded-full! px-2! border-none! focus:ring-2! focus:ring-orange-500! focus:outline-none! cursor-pointer! appearance-none! relative!' } }" />
                </div>
                <div class="flex items-center gap-3 flex-wrap">
                    <button @click="handleExportExcel"
                        class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full shadow-sm text-sm font-semibold flex items-center gap-2 transition-all">
                        <!-- <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                            </path>
                        </svg> -->
                        <FileExcel :size="40" />
                        Export Excel
                    </button>


                </div>

            </div>
        </div>
        <ProgressFisikTable :isVisibleHeader="false" :progress-list="progressFisik" @submit="showAlert" />
    </div>
</template>
<style scoped></style>