<script setup>
import router from '@/router';
import { computed, onMounted, ref } from 'vue';
import api from '@/services/api';
import { useAuth } from '@/lib/Auth';
import DeleteModal from '../utils/DeleteModal.vue';
import { FileExcel } from '@primeicons/vue';
import * as XLSX from 'xlsx';
import { generateExcel } from '@/lib/Helper.js';
const pakets = ref([]);
const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');
const emit = defineEmits(['refresh']);

const auth = useAuth()

const statusOptions = ref([
    { label: "Semua Status", value: null },
    { label: "Berjalan", value: "berjalan" },
    { label: "Draft", value: "unasigned" },
    { label: "Selesai", value: "selesai" },
    { label: "Tunda", value: "tunda" },
    { label: "Kritis", value: "kritis" },
]);

const selectedStatus = ref(null);
const yearOptions = ref([
    { label: "Semua", value: null },
    { label: "2026", value: 2026 },
    { label: "2025", value: 2025 },
]);
const selectedYear = ref(null);
const searchQuery = ref('');
const showOverlay = ref(false);
const searchContainer = ref(null);

const progressFisik = ref([
    {
        id_paket: "BM-2025-017",
        nama_paket: "Peningkatan Jalan AW Syahranie",
        kategori: "Jalan",
        latitude: -0.470512,
        longitude: 117.140233,
        progres_fisik: 76,
        status: "Berjalan", // Pin warna Biru/Hijau
        nilai_kontrak: "Rp 12,5 Miliar",
        lokasi: "Kec. Samarinda Ulu"
    },
    {
        id_paket: "BM-2025-024",
        nama_paket: "Rehabilitasi Jembatan Sungai Karang Mumus",
        kategori: "Jembatan",
        latitude: -0.493245,
        longitude: 117.152876,
        progres_fisik: 45,
        status: "Terlambat", // Pin warna Merah
        nilai_kontrak: "Rp 8,2 Miliar",
        lokasi: "Kec. Samarinda Kota"
    },
    {
        id_paket: "BM-2025-036",
        nama_paket: "Pembangunan Irigasi Lempake",
        kategori: "Irigasi",
        latitude: -0.428522,
        longitude: 117.172591,
        progres_fisik: 100,
        status: "Selesai", // Pin warna Abu-abu/Hijau Gelap
        nilai_kontrak: "Rp 4,1 Miliar",
        lokasi: "Kec. Samarinda Utara"
    },
    {
        id_paket: "BM-2025-041",
        nama_paket: "Pemeliharaan Rutin Jl. PM Noor",
        kategori: "Jalan",
        latitude: -0.463211,
        longitude: 117.155843,
        progres_fisik: 15,
        status: "Berjalan", // Pin warna Biru/Hijau
        nilai_kontrak: "Rp 2,3 Miliar",
        lokasi: "Kec. Sungai Pinang"
    },
    {
        id_paket: "BM-2025-055",
        nama_paket: "Peningkatan Jalan Cipto Mangunkusumo",
        kategori: "Jalan",
        latitude: -0.525544,
        longitude: 117.123512,
        progres_fisik: 90,
        status: "Berjalan", // Pin warna Biru/Hijau
        nilai_kontrak: "Rp 15,4 Miliar",
        lokasi: "Kec. Loa Janan Ilir"
    }
]);
// Daftar properti/kolom yang bisa dijadikan filter spesifik
const availableProperties = [
    { key: 'name', label: 'Nama Paket' },
    { key: 'noKontrak', label: 'Nomor Kontrak' },
    { key: 'kodeRup', label: 'Kode RUP' },
    { key: 'kodeKegiatan', label: 'Kode Kegiatasn' },

];

// ==========================================
// LOGIKA SARAN PENCARIAN DINAMIS (BARU)
// ==========================================
const dynamicSuggestions = computed(() => {
    const query = searchQuery.value.trim();

    // 1. Jika user sudah mengetik titik dua ':', sembunyikan overlay
    // karena diasumsikan user sudah memilih mode pencarian spesifik
    if (query.includes(':')) {
        return [];
    }

    // 2. Jika input masih kosong, tampilkan default properties saja
    if (!query) {
        return availableProperties.map(prop => ({
            ...prop,
            searchValue: '', // Belum ada yang diketik
            fullText: `${prop.key}: `
        }));
    }

    // 3. Jika user mengetik kata kunci (misal: "Jaladara")
    // Generate dinamis: "nama: Jaladara", "penyedia: Jaladara", dst.
    return availableProperties.map(prop => ({
        ...prop,
        searchValue: query, // Kata kunci yang sedang diketik
        fullText: `${prop.key}: ${query}` // Hasil gabungan yang akan diset ke input saat di-klik
    }));
});

// Fungsi saat opsi di klik
const applySuggestion = (fullText) => {
    searchQuery.value = fullText;
    showOverlay.value = false; // Tutup overlay setelah memilih

    // ✅ LANGKAH BARU: Segera trigger pencarian
    // Ini akan langsung memfilter daftar paket berdasarkan kata kunci yang dipilih
};

// Fungsi untuk memasukkan format "property: " saat user mengklik overlay
const selectPropertyFilter = (propertyKey) => {
    searchQuery.value = `${propertyKey}: `;
    showOverlay.value = false;
    // Opsional: Fokuskan kembali ke input box (bisa gunakan template ref pada input jika mau)
};

const clearSearch = () => {
    searchQuery.value = '';
    showOverlay.value = false;
};

// ==========================================
// LOGIKA FILTERING DATA
// ==========================================
const filteredPaket = computed(() => {
    let query = searchQuery.value.trim().toLowerCase();
    if (!query) return pakets.value; // Jika kosong, tampilkan semua

    // Cek apakah user menggunakan pencarian spesifik (mengandung tanda titik dua ":")
    // Contoh input: "penyedia: JALADARA"
    const colonIndex = query.indexOf(':');

    if (colonIndex !== -1 && colonIndex < query.length - 1) {
        // Mode Pencarian Spesifik
        const filterKey = query.substring(0, colonIndex).trim(); // Hasil: "penyedia"
        const filterValue = query.substring(colonIndex + 1).trim(); // Hasil: "jaladara"

        // Jika kata kunci kosong (misal baru ngetik "penyedia: "), kembalikan semua data
        if (!filterValue) return pakets.value;

        return pakets.value.filter(paket => {

            // Mapping filterKey ke atribut asli objek dari database
            switch (filterKey) {
                case 'name':
                    return paket.name?.toLowerCase().includes(filterValue);
                case 'kodeRup':
                    return paket.kodeRup?.toLowerCase().includes(filterValue);
                case 'noKontrak':
                    return paket.noKontrak?.toLowerCase().includes(filterValue);
                case 'kodeKegiatan':
                    return paket.kodeKegiatan?.toLowerCase().includes(filterValue);
                default:
                    // Jika key tidak dikenali, abaikan filter spesifik dan lakukan pencarian global
                    return searchGlobal(paket, filterValue);
            }
        });
    } else {
        // Mode Pencarian Global (User ngetik teks biasa tanpa ":")
        return pakets.value.filter(paket => searchGlobal(paket, query));
    }
});

// Fungsi pembantu untuk mencari ke SELURUH kolom (Pencarian Global)
const searchGlobal = (paket, text) => {
    return (
        paket.name?.toLowerCase().includes(text) ||
        paket.noKontrak?.toLowerCase().includes(text) ||
        paket.kodeKegiatan?.toLowerCase().includes(text) ||
        paket.kodeRup?.toLowerCase().includes(text) ||
        String(paket.tahun).includes(text)
    );
};

// ==========================================
// EVENT LISTENER: Menutup Overlay jika klik di luar
// ==========================================
const handleClickOutside = (event) => {
    if (searchContainer.value && !searchContainer.value.contains(event.target)) {
        showOverlay.value = false;
    }
};
const handleExportExcel = () => {
    // 1. Siapkan datanya (Tambahkan nomor urut atau pastikan tipe data angka)
    const dataToExport = filteredPaket.value.map((paket, index) => ({
        no: index + 1,
        name: paket.name || '-',
        noKontrak: paket.noKontrak || '-',
        penyediaJasa: paket.namaPenyediaJasa || '-',
        nilaiPagu: Number(paket.nilaiPagu) || 0,
        nilaiKontrak: Number(paket.nilaiKontrak) || 0,
        tahun: paket.tahun || '2026',
        kodeRup: paket.kodeRup || '-',
        kodeKegiatan: paket.kodeKegiatan || '-',
        statusPaket: paket.statusPaket || '-',
        statusKondisi: paket.statusKondisi || '-',
        longitude: paket.longitude || '-',
        latitude: paket.latitude || '-',
        tahun: paket.tahun,
    }));

    // 2. Definisikan struktur kolom (Header Excel, Key di objek dataToExport, dan Lebar Excel)
    const columnsConfig = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Nama Paket Pekerjaan', key: 'name', width: 50 },
        { header: 'Nomor Kontrak', key: 'noKontrak', width: 25 },
        { header: 'Penyedia Jasa', key: 'penyediaJasa', width: 35 },
        { header: 'Nilai Pagu (Rp)', key: 'nilaiPagu', width: 20 },
        { header: 'Nilai Kontrak (Rp)', key: 'nilaiKontrak', width: 20 },
        { header: 'Tahun Anggaran', key: 'tahun', width: 15 },
        { header: 'Kode RUP', key: 'kodeRup', width: 20 },
        { header: 'Kode Kegiatan', key: 'kodeKegiatan', width: 20 },
        { header: 'Status Paket', key: 'statusPaket', width: 20 },
        { header: 'Status Kondisi', key: 'statusKondisi', width: 20 },
        { header: 'Longitude', key: 'longitude', width: 20 },
        { header: 'Latitude', key: 'latitude', width: 20 },
        { header: 'Tahun', key: 'tahun', width: 20 },


    ];

    // 3. Panggil fungsi Helper
    try {
        generateExcel(
            dataToExport,          // Data mentah yang sudah dirapikan
            columnsConfig,         // Konfigurasi Header & Lebar Kolom
            'Rekap_Daftar_Paket',  // Nama File
            'Data Paket'           // Nama Sheet
        );
    } catch (error) {
        alert('Terjadi kesalahan saat mengunduh Excel.', error);
    }
};

async function getPaket() {
    try {
        loading.value = true;
        error.value = false;

        if (auth.isLoggedIn) {
            const response = await api.get('/paket', {
                params: {
                    statusPaket: selectedStatus.value,
                    tahun: selectedYear.value,
                    // paketUserId: auth.userRole.value === 'user' ? auth.state.user.id : null
                }
            });

            pakets.value = response.data.data;
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        error.value = true;
        errorMessage.value = error.message || "Gagal memuat data paket";
    } finally {
        loading.value = false;
    }
}

const toDetail = (paketId) => {
    router.push({ name: 'paket-detail', params: { kodePaket: paketId } })

}

const formatRupiah = (val) => {
    if (val === null || val === undefined || isNaN(val)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(val);
};

const deletePaket = async (id) => {
    try {
        const response = await api.delete(`/paket/${id}`);
        await getPaket();
        // emit('refresh');
    } catch (error) {
        console.error("Error deleting progress:", error.response?.data || error.message);
        alert(error.response?.data?.message || "Gagal menghapus data progress fisik");
    }
};

const expandedRowGroups = ref([])
// Fungsi menghitung Total Pagu per Grup
const hitungTotalPaguGrup = (namaGrup) => {
    return filteredPaket.value
        .filter(p => p.jenisPekerjaan === namaGrup)
        .reduce((sum, p) => sum + (Number(p.nilaiPagu) || 0), 0);
};

// Fungsi menghitung Total Kontrak per Grup
const hitungTotalKontrakGrup = (namaGrup) => {
    return filteredPaket.value
        .filter(p => p.jenisPekerjaan === namaGrup)
        .reduce((sum, p) => sum + (Number(p.nilaiKontrak) || 0), 0);
}

onMounted(() => {

    getPaket();
});


</script>

<template>
    <div class="flex flex-col gap-3">
        <!-- Header -->
        <div class="bg-white rounded-[24px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)]  flex flex-col">
            <div class="p-3 flex flex-col lg:flex-row lg:items-center justify-between">

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
                    </div>
                     -->
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                        <input type="text" v-model="searchQuery" @focus="showOverlay = true"
                            @keydown.esc="showOverlay = false"
                            placeholder="Cari paket... (Gunakan format: 'properti: kata_kunci' untuk filter spesifik)"
                            class="bg-slate-50 text-sm font-medium text-blue-950 rounded-full pl-10 pr-4 py-2.5 w-64 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-400">
                        <!-- Tombol Clear (X) -->
                        <button v-if="searchQuery" @click="clearSearch"
                            class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                        <div v-if="showOverlay && dynamicSuggestions.length > 0"
                            class="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                            <div
                                class="px-3 py-2 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Saran Filter Pencarian
                            </div>
                            <ul class="max-h-60 overflow-y-auto">
                                <li v-for="suggestion in dynamicSuggestions" :key="suggestion.key"
                                    @click="applySuggestion(suggestion.fullText)"
                                    class="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2 group transition-colors">
                                    <span
                                        class="bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-800 text-xs font-mono px-2 py-0.5 rounded border border-slate-200 group-hover:border-blue-300 transition-colors">
                                        {{ suggestion.label }}:
                                    </span>

                                    <!-- Teks yang diketik user muncul di sini -->
                                    <span v-if="suggestion.searchValue" class="text-sm font-bold text-slate-800">
                                        {{ suggestion.searchValue }}
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <Select v-model="selectedStatus" :options="statusOptions" optionLabel="label" optionValue="value"
                        placeholder="Pilih status" @change="getPaket()"
                        :pt="{ root: { class: 'bg-slate-50! text-sm! font-semibold! text-slate-600! rounded-full! px-2! border-none! focus:ring-2! focus:ring-orange-500! focus:outline-none! cursor-pointer! appearance-none! relative!' } }" />
                    <Select v-model="selectedYear" :options="yearOptions" optionLabel="label" optionValue="value"
                        placeholder="Pilih tahun" @change="getPaket()"
                        :pt="{ root: { class: 'bg-slate-50! text-sm! font-semibold! text-slate-600! rounded-full! px-2! border-none! focus:ring-2! focus:ring-orange-500! focus:outline-none! cursor-pointer! appearance-none! relative!' } }" />

                </div>

                <!-- Add Button -->
                <div class="flex justify-center gap-3">
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
                    <button @click="router.push('/paket/add')"
                        class="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-2.5 px-6 rounded-full flex items-center gap-2 transition-colors shadow-md shadow-orange-500/20">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4">
                            </path>
                        </svg>
                        Tambah Paket
                    </button>
                </div>
            </div>
        </div>
        <!-- end header -->

        <!-- Data Table -->
        <div
            class="bg-white rounded-[24px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col min-h-full">

            <!-- TOP CONTROLS (Search, Filter, Add Button) -->


            <!-- TABLE DATA -->
            <div class="overflow-x-auto p-2">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr
                            class="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                            <th class="px-4 py-4 rounded-tl-xl">No Kontrak / Nama Paket</th>
                            <th class="px-4 py-4">Penyedia Jasa</th>
                            <th class="px-4 py-4 text-right">Nilai Kontrak</th>
                            <th class="px-4 py-4 text-right">Tahun</th>
                            <!-- <th class="px-4 py-4 w-40">Progres Fisik</th>
                        <th class="px-4 py-4 w-40">Progres Keuangan</th> -->
                            <th class="px-4 py-4">Status</th>
                            <th class="px-4 py-4">Kondisi</th>
                            <th class="px-4 py-4"></th>
                            <!-- <th class="px-4 py-4 text-center rounded-tr-xl">Aksi</th> -->
                        </tr>
                    </thead>
                    <tbody class="text-sm">

                        <!-- ROW 1 -->
                        <tr @click="toDetail(paket.kodePaket)" v-for="paket in filteredPaket" :key="paket.id"
                            class="hover:bg-slate-50/50 transition-colors border-b border-slate-50/70 group">
                            <!-- <RouterLink :to="'/paket/detail'"> -->
                            <td class="px-4 py-5">
                                <p class="text-[10px] font-bold text-slate-400 mb-0.5">{{ paket.noKontrak }}</p>
                                <p class="font-bold text-blue-950">{{ paket.name }}</p>
                            </td>
                            <td class="px-4 py-5 font-semibold text-slate-600">{{ paket.penyediaJasa }}</td>
                            <td class="px-4 py-5 font-bold text-blue-950 text-right text-nowrap">{{
                                formatRupiah(paket.nilaiKontrak) }}
                            </td>
                            <td class="px-4 py-5 font-bold text-blue-950 text-right text-nowrap">{{
                                paket.tahun }}</td>

                            <td class="px-4 py-5">
                                <span
                                    class="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold tracking-wide">{{
                                        paket.statusPaket }}</span>
                            </td>
                            <td class="px-4 py-5">
                                <span
                                    class="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold tracking-wide">{{
                                        paket.statusKondisi }}</span>
                            </td>
                            <td class="px-4 py-5">
                                <DeleteModal title="Hapus Paket"
                                    deskripsi="Apakah Anda yakin ingin menghapus Paket ini?"
                                    :action-hapus="() => deletePaket(paket.id)" />
                            </td>

                            <!-- </RouterLink to="/paket/detail"> -->
                        </tr>




                    </tbody>
                </table>
            </div>

            <!-- PAGINATION (Bottom) -->
            <!-- <div class="p-5 border-t border-slate-50 flex items-center justify-between mt-auto">
                <p class="text-xs font-semibold text-slate-400">Menampilkan 1 hingga 4 dari 45 Paket</p>
                <div class="flex items-center gap-1">
                    <button
                        class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-400 transition-colors"><svg
                            class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7">
                            </path>
                        </svg></button>
                    <button
                        class="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500 text-white font-bold text-sm shadow-md shadow-orange-500/20">1</button>
                    <button
                        class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-600 font-bold text-sm transition-colors">2</button>
                    <button
                        class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-600 font-bold text-sm transition-colors">3</button>
                    <button
                        class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-400 transition-colors"><svg
                            class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7">
                            </path>
                        </svg></button>
                </div>
            </div> -->

        </div>
        <!-- Data Table -->

    </div>
    <div class="flex flex-col gap-3">
        <!-- Header -->
        <div class="bg-white rounded-[24px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)]  flex flex-col">
            <div class="p-3 flex flex-col lg:flex-row lg:items-center justify-between">

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
                    </div>
                     -->
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                        <input type="text" v-model="searchQuery" @focus="showOverlay = true"
                            @keydown.esc="showOverlay = false"
                            placeholder="Cari paket... (Gunakan format: 'properti: kata_kunci' untuk filter spesifik)"
                            class="bg-slate-50 text-sm font-medium text-blue-950 rounded-full pl-10 pr-4 py-2.5 w-64 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-400">
                        <!-- Tombol Clear (X) -->
                        <button v-if="searchQuery" @click="clearSearch"
                            class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                        <div v-if="showOverlay && dynamicSuggestions.length > 0"
                            class="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                            <div
                                class="px-3 py-2 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Saran Filter Pencarian
                            </div>
                            <ul class="max-h-60 overflow-y-auto">
                                <li v-for="suggestion in dynamicSuggestions" :key="suggestion.key"
                                    @click="applySuggestion(suggestion.fullText)"
                                    class="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2 group transition-colors">
                                    <span
                                        class="bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-800 text-xs font-mono px-2 py-0.5 rounded border border-slate-200 group-hover:border-blue-300 transition-colors">
                                        {{ suggestion.label }}:
                                    </span>

                                    <!-- Teks yang diketik user muncul di sini -->
                                    <span v-if="suggestion.searchValue" class="text-sm font-bold text-slate-800">
                                        {{ suggestion.searchValue }}
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <Select v-model="selectedStatus" :options="statusOptions" optionLabel="label" optionValue="value"
                        placeholder="Pilih status" @change="getPaket()"
                        :pt="{ root: { class: 'bg-slate-50! text-sm! font-semibold! text-slate-600! rounded-full! px-2! border-none! focus:ring-2! focus:ring-orange-500! focus:outline-none! cursor-pointer! appearance-none! relative!' } }" />
                    <Select v-model="selectedYear" :options="yearOptions" optionLabel="label" optionValue="value"
                        placeholder="Pilih tahun" @change="getPaket()"
                        :pt="{ root: { class: 'bg-slate-50! text-sm! font-semibold! text-slate-600! rounded-full! px-2! border-none! focus:ring-2! focus:ring-orange-500! focus:outline-none! cursor-pointer! appearance-none! relative!' } }" />

                </div>

                <!-- Add Button -->
                <div class="flex justify-center gap-3">
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
                    <button @click="router.push('/paket/add')"
                        class="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-2.5 px-6 rounded-full flex items-center gap-2 transition-colors shadow-md shadow-orange-500/20">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4">
                            </path>
                        </svg>
                        Tambah Paket
                    </button>
                </div>
            </div>
        </div>
        <!-- end header -->
        <div
            class="bg-white  rounded-[24px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col min-h-full">

            <!-- Data Table -->
            <DataTable :value="filteredPaket" rowGroupMode="subheader" groupRowsBy="jenisPekerjaan" sortMode="single"
                sortField="jenisPekerjaan" :sortOrder="1" expandableRowGroups
                v-model:expandedRowGroups="expandedRowGroups" :pt="{
                    /* WAJIB: Tambahkan 'table-fixed' agar lebar persentase tidak bergeser */
                    table: { class: 'min-w-full text-sm text-left text-slate-600 border-collapse table-fixed' },
                    thead: { class: 'text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200' },
                    tbody: { class: 'divide-y divide-slate-100' },
                    rowGroupHeaderCell: { colspan: 6 },
                    // rowGroupHeader: { class: 'cursor-pointer hover:bg-blue-100/50 transition-colors' },

                    // /* WAJIB: !p-0 agar grid kita bisa menempel dari ujung ke ujung */
                    // rowGroupHeaderCell: { class: '!p-0 !bg-blue-50/70 border-b border-blue-200' },
                    rowGroupToggler: { class: 'inline-flex! items-center justify-start! mr-3 text-blue-600 hover:text-blue-800' },
                    // rowGroupTogglerIcon: { class: 'w-4 h-4' }
                }">

                <!-- KOLOM NAMA PAKET -->
                <Column field="name" header="Nama Paket " style="width: 12%;" :pt="{
                    columnHeaderContent: { class: 'p-0!' },
                    columnTitle: { class: 'text-xs! text-slate-400 font-bold! px-4 py-4 uppercase! tracking-wider! rounded-tl-xl py-3! px-4!' }
                }">
                    <template #body="slotProps">
                        <div class=" py-3 px-6 font-bold text-blue-950">
                            {{ slotProps.data.name }}
                        </div>
                    </template>
                </Column>

                <!-- KOLOM NILAI KONTRAK -->
                <Column field="nilaiPagu" header="Nilai Pagu" style="width: 10%;" :pt="{
                    columnTitle: { class: 'text-xs! text-slate-400 font-bold! px-4 py-4 uppercase! tracking-wider! rounded-tl-xl py-3! px-4!' }
                }">
                    <template #body="slotProps">
                        <div class="px-4 py-5 font-bold text-blue-950  text-sm!">
                            {{ formatRupiah(slotProps.data.nilaiPagu) }}
                        </div>
                    </template>
                </Column>
                <!-- KOLOM NILAI KONTRAK -->
                <Column field="nilaiKontrak" header="Nilai Kontrak" style="width: 10%;" :pt="{
                    columnTitle: { class: 'text-xs! text-slate-400 font-bold! px-4 py-4 uppercase! tracking-wider! rounded-tl-xl py-3! px-4!' }
                }">
                    <template #body="slotProps">
                        <div class="px-4 py-5 font-bold text-blue-950  text-sm!">
                            {{ formatRupiah(slotProps.data.nilaiKontrak) }}
                        </div>
                    </template>
                </Column>
                <!-- KOLOM NILAI KONTRAK -->
                <Column field="progress" header="Progres Fisik" style="width: 10%;" :pt="{
                    columnTitle: { class: 'text-xs! text-slate-400 font-bold! px-4 py-4 uppercase! tracking-wider! rounded-tl-xl py-3! px-4!' }
                }">
                    <template #body="slotProps">
                        <div class="px-4 py-5 font-bold text-blue-950  text-sm!">
                            <!-- {{ formatRupiah(slotProps.data.progress) }} -->
                        </div>
                    </template>
                </Column>

                <!-- KOLOM NILAI KONTRAK -->
                <Column field="progress" header="Progress Keuangan" style="width: 10%;" :pt="{
                    columnTitle: { class: 'text-xs! text-slate-400 font-bold! px-4 py-4 uppercase! tracking-wider! rounded-tl-xl py-3! px-4!' }
                }">
                    <template #body="slotProps">
                        <div class="px-4 py-5 font-bold text-blue-950  text-sm!">
                            {{ formatRupiah(slotProps.data.status) }}
                        </div>
                    </template>
                </Column>
                <Column field="statusKondisi" header="Status Kondisi" style="width: 10%;" :pt="{
                    columnTitle: { class: 'text-xs! text-slate-400 font-bold! px-4 py-4 uppercase! tracking-wider! rounded-tl-xl py-3! px-4!' }
                }">
                    <template #body="slotProps">
                        <div class="px-4 py-5 font-bold text-blue-950  text-sm!">
                            <span
                                class="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold tracking-wide">{{
                                    slotProps.data.statusPaket }}</span>
                        </div>
                    </template>
                </Column>

                <!-- CUSTOM HEADER GRUP (Baris Expandable) -->
                <!-- Ini adalah baris "jenisPekerjaan" yang bisa di-klik untuk buka/tutup -->
                <template #groupheader="slotProps">
                    <div class="inline-flex items-center justify-between align-middle w-[calc(100%-2.5rem)] ">

                        <!-- Kolom 1 (Sejajar Nama Paket) - Lebar: 40% -->
                        <div style="width: 12%" class="inline-flex items-center py-3">
                            <span class="font-bold text-blue-950 text-sm uppercase tracking-wide">
                                {{ slotProps.data.jenisPekerjaan }}
                            </span>
                            <span
                                class="bg-blue-100 text-blue-700 text-[10px] py-0.5 px-2 rounded-full font-bold border border-blue-200 ml-3">
                                {{filteredPaket.filter(p => p.jenisPekerjaan ===
                                    slotProps.data.jenisPekerjaan).length}}
                            </span>
                        </div>

                        <!-- BAGIAN KANAN: Total Pagu & Kontrak -->
                        <template v-if="!expandedRowGroups.includes(slotProps.data.jenisPekerjaan)">

                            <!-- Kolom 2 (Sejajar Pagu) - Lebar: 15% -->
                            <div style="width: 10%;" class="py-3 px-4 font-bold text-slate-800">
                                {{ formatRupiah(hitungTotalPaguGrup(slotProps.data.jenisPekerjaan)) }}
                            </div>

                            <!-- Kolom 3 (Sejajar Kontrak) - Lebar: 15% -->
                            <div style="width: 10%;" class="py-3 px-4 font-bold text-slate-800">
                                {{ formatRupiah(hitungTotalKontrakGrup(slotProps.data.jenisPekerjaan)) }}
                            </div>

                            <!-- Kolom 4 (Sejajar Fisik) - Lebar: 15% -->
                            <div style="width: 10%;" class="py-3 px-4 font-bold text-emerald-700 text-center">
                                <!-- {{ hitungAkumulasiFisik(slotProps.data.subProgramKegiatan) }}% --> 100%
                            </div>

                            <!-- Kolom 5 (Sejajar Keuangan) - Lebar: 15% -->
                            <div style="width: 10%;" class="py-3 px-4 font-bold text-indigo-700 text-center">
                                <!-- Buat hitungAkumulasiKeuangan() seperti Rata Fisik --> 100
                                <!-- {{ hitungAkumulasiKeuangan(...) }}% -->
                            </div>
                            <!-- Kolom 5 (Sejajar Keuangan) - Lebar: 15% -->
                            <div style="width: 10%;" class="py-3 px-4 font-bold text-indigo-700 text-center">
                                <!-- Buat hitungAkumulasiKeuangan() seperti Rata Fisik -->
                                <!-- {{ hitungAkumulasiKeuangan(...) }}% -->
                            </div>

                        </template>

                    </div>
                </template>

            </DataTable>
            <!-- Data Table -->

        </div>
    </div>

</template>
<style scoped></style>