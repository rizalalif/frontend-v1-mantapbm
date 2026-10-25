<template>
    <div class="bg-white rounded-[24px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col">
        <!-- TOP CONTROLS (Pencarian & Tombol Tambah) -->
        <div class="p-6 border-b border-slate-50 flex justify-between items-center">
            <div class="flex items-center gap-3 flex-wrap">
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                    <input type="text" v-model="searchQuery"
                        class="bg-slate-50 text-sm font-medium text-blue-950 rounded-full pl-10 pr-4 py-2.5 w-64 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-400"
                        placeholder="Cari nomor adendum...">
                </div>
            </div>

            <div class="flex items-center gap-3">
                <button @click="openAddModal"
                    class="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-2.5 px-6 rounded-full flex items-center gap-2 transition-colors shadow-md shadow-orange-500/20">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path>
                    </svg>
                    Tambah Adendum
                </button>
            </div>
        </div>

        <!-- TABEL DATA ADENDUM -->
        <div class="overflow-x-auto p-2">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th class="px-4 py-4 text-center w-16 rounded-tl-xl">No</th>
                        <th class="px-4 py-4 text-left">Nomor Adendum</th>
                        <th class="px-4 py-4 text-center">Tanggal Adendum</th>
                        <th class="px-4 py-4 text-right">Nilai Adendum</th>
                        <th class="px-4 py-4 text-center rounded-tr-xl w-24">Aksi</th>
                    </tr>
                </thead>
                <tbody class="text-sm">
                    <!-- Empty State -->
                    <tr v-if="!filteredAdendumList || filteredAdendumList.length === 0">
                        <td colspan="5" class="text-center py-8 text-slate-400 text-sm font-medium">
                            Belum ada riwayat data adendum untuk paket ini.
                        </td>
                    </tr>

                    <!-- Data Rows (Klik Baris untuk Edit) -->
                    <tr v-for="(item, index) in filteredAdendumList" :key="item.id || index"
                        @click="openEditModal(item)"
                        class="hover:bg-slate-50 transition-colors border-b border-slate-50/70 cursor-pointer">
                        <td class="px-4 py-4 text-center font-bold text-slate-400">
                            {{ index + 1 }}
                        </td>
                        <td class="px-4 py-4 text-left font-bold text-blue-950">
                            {{ item.noAdendum || '-' }}
                        </td>
                        <td class="px-4 py-4 text-center font-semibold text-slate-600">
                            {{ formatDate(item.tglAdendum) }}
                        </td>
                        <td class="px-4 py-4 text-right font-bold text-blue-950">
                            {{ formatRupiah(item.nilaiAdendum) }}
                        </td>
                        <!-- Kolom Aksi Hapus (Gunakan @click.stop agar tidak trigger modal edit) -->
                        <td class="px-4 py-4 text-center" @click.stop>
                            <DeleteModal title="Hapus Adendum"
                                deskripsi="Apakah Anda yakin ingin menghapus data adendum ini? Data yang dihapus tidak dapat dikembalikan."
                                :action-hapus="() => deleteAdendum(item.id)" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal Tambah & Edit Adendum -->
        <AdendumModal ref="modalRef" :paket-id="paketId" :paket="paket" @saved="onAdendumSaved" />
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import api from '@/services/api';
import DeleteModal from '@/components/utils/DeleteModal.vue';
import AdendumModal from './AdendumModal.vue';
import { formatRupiah } from '@/lib/Helper.js';

const emit = defineEmits(['refresh', 'submit-success']);

const props = defineProps({
    adendumList: {
        type: Array,
        default: () => []
    },
    paket: {
        type: Object,
        default: () => ({})
    },
    paketId: {
        type: String,
        default: ''
    }
});

const searchQuery = ref('');
const modalRef = ref(null);

// Filter data berdasarkan noAdendum
const filteredAdendumList = computed(() => {

    if (!props.adendumList || !Array.isArray(props.adendumList)) return [];

    return props.adendumList.filter(item => {
        if (!item) return false;
        if (!searchQuery.value) return true;
        const noAdendum = String(item.noAdendum || '').toLowerCase();
        return noAdendum.includes(searchQuery.value.toLowerCase());
    });
});

// Buka Modal Tambah
const openAddModal = () => {
    if (modalRef.value) {
        modalRef.value.openModal(null);
    }
};

// Buka Modal Edit
const openEditModal = (item) => {
    if (modalRef.value) {
        modalRef.value.openModal(item);
    }
};

// Callback setelah simpan data dari Modal
const onAdendumSaved = (res) => {
    emit('submit-success', 'success', 'Berhasil', 'Data adendum berhasil disimpan.', 'adendum');
    emit('refresh');
};

// Hapus Data Adendum
const deleteAdendum = async (id) => {
    try {
        await api.delete(`/adendum/${id}`);
        emit('submit-success', 'success', 'Berhasil', 'Data adendum berhasil dihapus.', 'adendum');
        emit('refresh');
    } catch (error) {
        console.error('Error saat menghapus data adendum:', error.response?.data || error.message);
        alert(error.response?.data?.message || 'Gagal menghapus data adendum');
    }
};

// Helper Format Tanggal ke DD MMMM YYYY
const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        return d.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    } catch {
        return dateString;
    }
};
</script>