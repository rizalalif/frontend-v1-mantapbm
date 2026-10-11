<template>
    <div class="bg-white rounded-[24px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col">
        <div class="p-6 border-b border-slate-50 flex justify-between items-center">
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

        <div class="overflow-x-auto p-2 ">
            <table class="w-full text-left border-collapse ">
                <thead>
                    <tr class="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th class="px-4 py-4 text-center rounded-tl-xl w-40">Periode</th>
                        <th class="px-4 py-4 text-center rounded-tl-xl w-40">Bulan</th>
                        <th class="px-4 py-4 text-center">Nominal Progress</th>
                        <th class="px-4 py-4 text-center">Terhadap Pagu</th>
                        <th class="px-4 py-4 text-center">Terhadap Kontrak</th>
                        <!-- <th class="px-4 py-4">Status</th> -->
                        <th class="px-4 py-4 rounded-tr-xl text-center"></th>
                    </tr>
                </thead>
                <tbody class="text-sm">
                    <tr v-if="!filteredProgressList || filteredProgressList.length === 0">
                        <td colspan="6" class="text-center py-8 text-slate-400 text-sm font-medium">
                            Belum ada riwayat laporan progres keuangan untuk paket ini.
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
                        <td class="px-4 py-4 text-center font-semibold text-blue-950">
                            <div class="flex justify-between">
                                <span>
                                    Rp.
                                </span>
                                <span>

                                    {{ formatRupiah(progress.actualFinance) }}
                                </span>
                            </div>
                        </td>
                        <td class="px-4 py-4 text-center font-bold text-blue-950">
                            {{ progress.paguPercentage }}%
                        </td>
                        <td class="px-4 py-4 text-center font-bold text-blue-950">
                            {{ progress.actualPercentage }}%
                        </td>
                        <!-- <td class="px-4 py-4 font-bold"
                            :class="Number(progress.deviationFinance) < 0 ? 'text-red-500' : 'text-emerald-500'">
                            {{ Number(progress.deviationFinance) > 0 ? '+' : '' }}{{
                                formatRupiah(progress.deviationFinance) }}
                        </td> -->
                        <!-- <td class="px-4 py-4">
                            <span :class="getStatusBadgeClass(progress.status)">
                                {{ progress.status || 'Sesuai Target' }}
                            </span>
                        </td> -->
                        <td class="px-4 py-4 text-center" @click.stop>
                            <DeleteModal title="Hapus Progress Keuangan"
                                deskripsi="Apakah Anda yakin ingin menghapus laporan progres keuangan periode ini?"
                                :action-hapus="() => deleteProgress(progress.id)" />
                        </td>
                    </tr>
                    <tr class="border-t-2 border-slate-100">
                        <td colspan="2" class="px-4 py-4 text-center font-extrabold text-lg text-blue-950">
                            Total
                        </td>
                        <!-- <td class="px-4 py-4 text-right font-bold text-blue-950">
                        </td> -->
                        <td class="px-4 py-4 text-center font-extrabold text-lg text-blue-950">
                            <div class="flex justify-between">
                                <span>
                                    Rp.
                                </span>
                                <span>

                                    {{ formatRupiah(progressListTable.totalActualFinance) }}
                                </span>
                            </div>
                        </td>
                        <td class="px-4 py-4 text-center font-extrabold text-lg text-blue-950">
                            {{ progressListTable.totalPaguPercentage.toFixed(2) }}%
                        </td>
                        <td class="px-4 py-4 text-center font-extrabold text-lg text-blue-950">
                            {{ progressListTable.totalActualPercentage.toFixed(2) }}%
                        </td>
                    </tr>
                </tbody>
            </table>

        </div>

        <!-- Modal reusable untuk Tambah & Edit -->
        <ProgressKeuanganModal ref="modalRef" :paket-id="paket?.id" :paket="paket" @saved="getProgress" />
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import axios from 'axios';
import { useAuth } from '@/lib/Auth';
import ProgressKeuanganModal from './ProgressKeuanganModal.vue';
import DeleteModal from '@/components/utils/DeleteModal.vue';
import { FileExcel } from '@primeicons/vue';
import { generateExcel } from '@/lib/Helper.js';

const auth = useAuth();

const emit = defineEmits(['refresh', 'submit-success']);

const props = defineProps({
    progressList: {
        type: Object,
        default: () => []
    },
    paket: Object,
    paketId: String,
    isVisibleHeader: Boolean
});

const filteredProgressList = computed(() => {

    if (!props.progressList || !Array.isArray(props.progressList)) return [];

    return props.progressList.filter(progress => {
        if (!progress) return false;


        let matchMonth = true;
        if (selectedMonth.value && selectedMonth.value !== 'all') {
            matchMonth = progress.monthName.toLowerCase() === selectedMonth.value.toLowerCase();
        }

        return matchMonth;
    });
});

const progressListTable = ref({
    data: [],
    totalActualFinance: 0,
    totalDeviationFinance: 0,
    totalPaguPercentage: 0,
    totalActualPercentage: 0,
});

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
    const dataList = filteredProgressList.value;
    if (!dataList || dataList.length === 0) {
        emit('submit-success', 'warn', 'Info', 'Tidak ada data untuk diexport.', 'keuangan')
        return;
    }
    // 1. Siapkan datanya (Tambahkan nomor urut atau pastikan tipe data angka)
    const dataToExport = dataList.map((progress, index) => ({
        no: index + 1,
        actualFinance: progress?.actualFinance || '-',
        actualPercentage: progress?.actualPercentage || '-',
        createdAt: progress?.createdAt || '-',
        deviationFinance: progress?.deviationFinance || '-',
        id: progress?.id || '-',
        keterangan: progress?.keterangan || '-',
        mingguKe: progress?.mingguKe || '-',
        monthName: progress?.monthName || '-',
        monthNumber: progress?.monthNumber || '-',
        paguPercentage: progress?.paguPercentage || '-',
        paketProgressKeuanganId: progress?.paketProgressKeuanganId || '-',
        status: progress?.status || '-',
        tglLaporan: progress?.tglLaporan || '-'
    }));

    // 2. Definisikan struktur kolom (Header Excel, Key di objek dataToExport, dan Lebar Excel)
    const columnsConfig = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Actual Nominal', key: 'actualFinance', width: 50 },
        { header: 'Actual Persentase', key: 'actualPercentage', width: 25 },
        { header: 'Created At', key: 'createdAt', width: 35 },
        { header: 'Deviation', key: 'deviationFinance', width: 20 },
        { header: 'ID', key: 'id', width: 20 },
        { header: 'Keterangan', key: 'keterangan', width: 15 },
        { header: 'Minggu Ke', key: 'mingguKe', width: 20 },
        { header: 'Nama Bulan', key: 'monthName', width: 20 },
        { header: 'Nomor Bulan', key: 'monthNumber', width: 20 },
        { header: 'Plan Persentase', key: 'paguPercentage', width: 20 },
        { header: 'Status', key: 'status', width: 20 },
        { header: 'Tanggal Laporan', key: 'tglLaporan', width: 20 },
        { header: 'ID Paket Progress Fisik', key: 'paketProgressFisikId', width: 20 },


    ];

    // 3. Panggil fungsi Helper
    try {
        generateExcel(
            dataToExport,          // Data mentah yang sudah dirapikan
            columnsConfig,         // Konfigurasi Header & Lebar Kolom
            'Rekap_Daftar_Progress_Keuangan',  // Nama File
            'Data Progress Keuangan'           // Nama Sheet
        );
    } catch (error) {
        alert('Terjadi kesalahan saat mengunduh Excel.', error);
    }
};

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
        const response = await axios.delete(`http://100.114.142.21:3002/api/v1/progress-keuangan/${id}`, {
            headers: {
                Authorization: `Bearer ${auth.state.token || localStorage.getItem('token')}`
            }
        });
        console.log("Delete progress success 🚀:", response.data);
        emit('refresh');
    } catch (error) {
        console.error("Error deleting progress:", error.response?.data || error.message);
        alert(error.response?.data?.message || "Gagal menghapus data progress keuangan");
    }
};

// watch(() => props.progressList, () => {
//     console.log('progressList di Table:', props.progressList);
//     // progressListTable.value = props.progressList;
//     let totalActualFinance = 0;
//     let totalDeviationFinance = 0;
//     let totalPaguPercentage = 0;
//     let totalActualPercentage = 0;

//     props.progressList.forEach(progress => {
//         totalActualFinance += Number(progress?.actualFinance);
//         totalDeviationFinance += Number(progress?.deviationFinance);
//         totalPaguPercentage += Number(progress?.paguPercentage);
//         totalActualPercentage += Number(progress?.actualPercentage);
//     });
//     progressListTable.value = { data: props.progressList, totalActualFinance, totalDeviationFinance, totalPaguPercentage, totalActualPercentage };

//     console.log("progressListTable", progressListTable.value);

// }, { immediate: true });

watch(() => filteredProgressList.value, (newList) => {
    let totalActualFinance = 0;
    let totalDeviationFinance = 0;
    let totalPaguPercentage = 0;
    let totalActualPercentage = 0;

    if (newList && Array.isArray(newList)) {
        newList.forEach(progress => {
            if (progress) {
                totalActualFinance += Number(progress?.actualFinance) || 0;
                totalDeviationFinance += Number(progress?.deviationFinance) || 0;
                totalPaguPercentage += Number(progress?.paguPercentage) || 0;
                totalActualPercentage += Number(progress?.actualPercentage) || 0;
            }
        });
    }

    progressListTable.value = {
        data: newList || [],
        totalActualFinance,
        totalDeviationFinance,
        totalPaguPercentage,
        totalActualPercentage
    };
}, { immediate: true, deep: true });

// Format Angka ke Rupiah
const formatRupiah = (val) => {
    if (val === null || val === undefined || isNaN(val)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        currency: 'IDR',
        maximumFractionDigits: 0
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