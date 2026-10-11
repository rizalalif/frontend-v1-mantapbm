<template>
    <div class="bg-white rounded-[24px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col">
        <div class="p-6 border-b border-slate-50 flex justify-between items-center">
            <!-- <h3 class="font-bold text-sm text-blue-950 uppercase tracking-wide">Riwayat Laporan Fisik</h3> -->
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
                    placeholder="Pilih status"
                    :pt="{ root: { class: 'bg-slate-50! text-sm! font-semibold! text-slate-600! rounded-full! px-2! border-none! focus:ring-2! focus:ring-orange-500! focus:outline-none! cursor-pointer! appearance-none! relative!' } }" />
                <Select v-model="selectedMonth" :options="monthNames" optionLabel="label" optionValue="value"
                    placeholder="Pilih bulan"
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
                    Export
                </button>


                <button @click="openAddModal"
                    class="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-2.5 px-6 rounded-full flex items-center gap-2 transition-colors shadow-md shadow-orange-500/20">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4">
                        </path>
                    </svg>
                    Tambah
                </button>
            </div>
        </div>

        <div class="overflow-x-auto p-2">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th class="text-center px-4 py-4 rounded-tl-xl w-40">Periode</th>
                        <th class="text-center px-4 py-4">Bulan</th>
                        <th class="text-center px-4 py-4">Nominal Progress</th>
                        <th class="text-center px-4 py-4">Progress Rencana</th>
                        <th class="text-center px-4 py-4">Progress Aktual</th>
                        <th class="text-center px-4 py-4">Deviasi</th>
                        <th class="text-center px-4 py-4">Status</th>
                        <th class="px-4 py-4 rounded-tr-xl text-center"></th>
                    </tr>
                </thead>
                <tbody class="text-sm">
                    <tr v-if="!filteredProgressList || filteredProgressList.length === 0">
                        <td colspan="6" class="text-center py-8 text-slate-400 text-sm font-medium">
                            Belum ada riwayat laporan progres fisik untuk paket ini.
                        </td>
                    </tr>
                    <tr v-for="progress in filteredProgressList" :key="progress.id" @click="openEditModal(progress)"
                        class="hover:bg-slate-50 transition-colors border-b border-slate-50/70 cursor-pointer">
                        <td class="px-4 py-4 text-center font-bold text-blue-950">
                            B-{{ progress.monthNumber || '-' }} / M-{{ progress.mingguKe || '-' }}
                        </td>
                        <td class="px-4 py-4 text-center font-semibold text-blue-950">
                            {{ progress.monthName }}
                        </td>
                        <td class="px-4 py-4 text-right font-semibold text-blue-950">
                            <div class="flex justify-between">
                                <span class="text-left">Rp</span>
                                <span>{{ formatRupiah(progress.actualNominal) }}</span>
                            </div>
                        </td>
                        <td class="px-4 py-4 text-center font-bold text-blue-950">
                            {{ progress.planPercentage }}%
                        </td>
                        <td class="px-4 py-4 text-center font-bold text-blue-950">
                            {{ progress.actualPercentage }}%
                        </td>
                        <td class="px-4 py-4 text-center font-bold"
                            :class="Number(progress.deviationFisik) < 0 ? 'text-red-500' : 'text-emerald-500'">
                            {{ Number(progress.deviationFisik) > 0 ? '+' : '' }}{{
                                progress.deviationFisik }}%
                        </td>
                        <td class="px-4 py-4 text-center font-bold">
                            <div class="px-0! text-center" :class="getStatusBadgeClass(progress.status)">
                                {{ progress.status || 'Sesuai Target' }}

                            </div>
                        </td>
                        <td class="px-4 py-4 text-center" @click.stop>
                            <DeleteModal title="Hapus Progress fisik"
                                deskripsi="Apakah Anda yakin ingin menghapus laporan progres fisik periode ini?"
                                :action-hapus="() => deleteProgress(progress.id)" />
                        </td>
                    </tr>
                    <tr class="border-t-2 border-slate-100">
                        <td colspan="2" class="px-4 py-4 text-center font-extrabold text-lg text-blue-950">
                            Total
                        </td>
                        <!-- <td class="px-4 py-4 text-right text-right font-bold text-blue-950">
                        </td> -->
                        <td class="px-4 py-4 font-extrabold text-lg text-blue-950">
                            <div class="flex justify-between">
                                <span>
                                    Rp.
                                </span>
                                <span>
                                    {{ formatRupiah(progressListTable.totalActualNominal) }}
                                </span>
                            </div>

                        </td>
                        <td class="px-4 py-4 text-center font-extrabold text-lg text-blue-950">
                            {{ progressListTable.totalPlanPercentage.toFixed(2) }}%
                        </td>
                        <td class="px-4 py-4 text-center font-extrabold text-lg text-blue-950">

                            {{ progressListTable.totalActualPercentage.toFixed(2) }}%
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal reusable untuk Tambah & Edit -->
        <ProgressFisikModal ref="modalRef" :paket-id="paket?.id" :paket="paket" @saved="getProgress" />
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import api from '@/services/api';
import { useAuth } from '@/lib/Auth';
import DeleteModal from '@/components/utils/DeleteModal.vue';
import ProgressFisikModal from './ProgressFisikModal.vue';
import { FileExcel } from '@primeicons/vue';
import { generateExcel } from '@/lib/Helper.js';
import { useToast } from 'primevue';

const auth = useAuth();

const emit = defineEmits(['refresh', 'submit-success']);
const toast = useToast()
const props = defineProps({
    progressList: {
        type: Array,
        default: () => []
    },
    isVisibleHeader: Boolean,
    paket: Object,
    paketId: String
});

const filteredProgressList = computed(() => {
    if (!props.progressList || !Array.isArray(props.progressList)) return [];

    return props.progressList.filter(progress => {
        if (!progress) return false;

        let matchStatus = true;
        if (selectedStatus.value && selectedStatus.value !== 'all') {
            matchStatus = progress.status === selectedStatus.value;
        }

        let matchMonth = true;
        if (selectedMonth.value && selectedMonth.value !== 'all') {
            matchMonth = progress.monthName.toLowerCase() === selectedMonth.value.toLowerCase();
        }

        return matchStatus && matchMonth;
    });
});

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
const handleExportExcel = () => {
    try {
        const dataList = filteredProgressList.value;
        if (!dataList || dataList.length === 0) {
            emit('submit-success', 'warn', 'Info', 'Tidak ada data untuk diexport.', 'fisik')
            // toast.add({ severity: 'error', summary: 'Error', detail: 'Validasi Error', life: 3000 });
            return;
        }

        // 1. Siapkan datanya (Tambahkan nomor urut atau pastikan tipe data angka)
        const dataToExport = dataList.map((progress, index) => ({
            no: index + 1,
            actualNominal: progress?.actualNominal ?? '-',
            actualPercentage: progress?.actualPercentage ?? '-',
            createdAt: progress?.createdAt ?? '-',
            deviationFisik: progress?.deviationFisik ?? '-',
            id: progress?.id,
            keterangan: progress?.keterangan || '-',
            mingguKe: progress?.mingguKe ?? '-',
            monthName: progress?.monthName || '-',
            monthNumber: progress?.monthNumber ?? '-',
            paketProgressFisikId: progress?.paketProgressFisikId ?? '-',
            planPercentage: progress?.planPercentage ?? '-',
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
        generateExcel(
            dataToExport,          // Data mentah yang sudah dirapikan
            columnsConfig,         // Konfigurasi Header & Lebar Kolom
            'Rekap_Daftar_Progress_Fisik',  // Nama File
            'Data Progress Fisik'           // Nama Sheet
        );
    } catch (error) {
        console.error('Export Error:', error);
        emit('submit-success', 'error', 'Validasi Error', 'Terjadi Kesalahan saat mengunduh excel.', 'fisik')

    }
};

const progressListTable = ref({
    data: [],
    totalActualNominal: 0,
    totalPlanPercentage: 0,
    totalActualPercentage: 0,
});

const modalRef = ref(null);

const openAddModal = () => {
    if (modalRef.value) {
        modalRef.value.openModal(null);
    }
};

const openEditModal = (progress) => {

    if (modalRef.value) {
        modalRef.value.openModal(progress);
    }
};

const getProgress = (data) => {
    // console.log('progress data', data);
    props.progressList.push(data)
    emit('refresh');
};

const deleteProgress = async (id) => {
    try {
        const response = await api.delete(`/progress-fisik/${id}`);
        console.log("Delete progress success 🚀:", response.data);
        emit('refresh');
    } catch (error) {
        console.error("Error deleting progress:", error.response?.data || error.message);
        alert(error.response?.data?.message || "Gagal menghapus data progress fisik");
    }
};

watch(() => filteredProgressList.value, (newList) => {
    let totalActualNominal = 0;
    let totalPlanPercentage = 0;
    let totalActualPercentage = 0;

    if (newList && Array.isArray(newList)) {
        newList.forEach(progress => {
            if (progress) {
                totalActualNominal += Number(progress.actualNominal) || 0;
                totalPlanPercentage += Number(progress.planPercentage) || 0;
                totalActualPercentage += Number(progress.actualPercentage) || 0;
            }
        });
    }

    progressListTable.value = {
        data: newList || [],
        totalActualNominal,
        totalPlanPercentage,
        totalActualPercentage
    };
}, { immediate: true, deep: true });

// Format Angka ke Rupiah
const formatRupiah = (val) => {
    if (val === null || val === undefined || isNaN(val)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        currency: 'IDR',
        maximumFractionDigits: 2
    }).format(val);
};

// Helper badge class status sesuai dengan tabel HTML sebelumnya
const getStatusBadgeClass = (status) => {
    if (!status) return 'px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold';
    const s = String(status).toLowerCase();
    if (s.includes('terlambat') || s.includes('rendah') || s.includes('minus')) {
        return 'px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-[10px] font-bold';
    }
    if (s.includes('cepat') || s.includes('tinggi') || s.includes('surplus')) {
        return 'px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold';
    }
    return 'px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold';
};
</script>