<template>
    <Toast />
    <DropzoneDokumentasi :paketId="paketId" @refresh="fetchDocumentations" @submit="showAlert" />

    <!-- State Loading -->
    <div v-if="isLoading" class="text-center py-12 bg-slate-50 rounded-lg border border-slate-200 my-4">
        <div class="flex flex-col items-center justify-center space-y-3">
            <div class="w-8 h-8 border-4 border-blue-950 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-slate-500 text-sm font-medium">Memuat data dokumentasi...</p>
        </div>
    </div>

    <!-- State Error -->
    <div v-else-if="isError" class="p-6 bg-red-50 border border-red-200 rounded-xl text-center my-4">
        <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        </div>
        <h4 class="text-slate-800 font-bold text-base mb-1">Gagal Memuat Dokumentasi</h4>
        <p class="text-sm text-slate-600 mb-4 max-w-md mx-auto">{{ errorMessage }}</p>
        <button @click="fetchDocumentations"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm inline-flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Coba Lagi
        </button>
    </div>

    <!-- State Jika paketId Belum Ada / Null -->
    <div v-else-if="!paketId" class="text-center py-12 bg-slate-50 rounded-lg border border-slate-200 my-4">
        <p class="text-slate-500 text-sm">Menunggu data paket dari parent...</p>
    </div>

    <!-- State Kosong -->
    <div v-else-if="dokumentasiList.length === 0"
        class="text-center py-12 bg-slate-50 rounded-lg border border-slate-200 my-4">
        <svg class="w-12 h-12 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="text-slate-500 text-sm">Belum ada dokumentasi untuk paket ini.</p>
    </div>

    <!-- Carousel Scrollable Horizontal -->
    <div v-else class="flex flex-nowrap overflow-x-auto gap-4 pb-6 snap-x snap-mandatory custom-scrollbar-x my-4">

        <div v-for="item in dokumentasiList" :key="item?.id || item?.fileName"
            class="flex-none w-64 md:w-72 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group snap-center"
            @click="bukaModal(item)">
            <!-- Area Media -->
            <div class="h-40 bg-slate-100 relative overflow-hidden">

                <!-- Jika Gambar -->
                <img v-if="item?.fileType === 'image'" :src="getMediaUrl(item?.fileName)"
                    :alt="item?.fileName || 'Dokumentasi'"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    @error="handleImageError" />

                <!-- Jika Video -->
                <div v-else-if="item?.fileType === 'video'" class="w-full h-full relative">
                    <video :src="getMediaUrl(item?.fileUrl || item?.fileName)" class="w-full h-full object-cover"
                        preload="metadata"></video>
                    <div class="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div class="bg-white/90 rounded-full p-3 shadow-lg">
                            <svg class="w-8 h-8 text-blue-600 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                    clip-rule="evenodd"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Fallback jika fileType tidak diketahui -->
                <div v-else class="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                    <span class="text-xs">Media tidak didukung</span>
                </div>

            </div>

            <!-- Footer Info -->
            <div class="p-3">
                <p class="text-xs font-bold text-slate-800 truncate mb-1">{{ item?.keterangan || item?.location ||
                    'Tanpa STA' }}</p>
                <p class="text-[11px] text-slate-500">{{ formatTanggal(item?.date || item?.createdAt) }}</p>
            </div>
        </div>

        <!-- Lightbox Modal -->
        <Transition name="fade">
            <div v-if="isModalOpen"
                class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 lg:p-10"
                @click.self="tutupModal">

                <!-- Tombol Tutup Silang di Kanan Atas -->
                <button @click="tutupModal"
                    class="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 p-2 rounded-full z-10">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12">
                        </path>
                    </svg>
                </button>

                <!-- Container Media Modal -->
                <div class="relative max-w-5xl w-full max-h-full flex flex-col items-center">

                    <img v-if="selectedItem?.fileType === 'image'" :src="getMediaUrl(selectedItem?.fileName)"
                        class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                        @error="handleImageError" />

                    <video v-else-if="selectedItem?.fileType === 'video'" :src="getMediaUrl(selectedItem?.fileName)"
                        controls autoplay class="max-w-full max-h-[85vh] rounded-lg shadow-2xl"></video>

                    <!-- Teks Keterangan di Bawah Modal -->
                    <div class="mt-4 text-white text-center">
                        <h3 class="text-lg font-bold">{{ selectedItem?.location || selectedItem?.keterangan ||
                            'Lokasi_tidak_diketahui' }}</h3>
                        <p class="text-sm text-slate-300">{{ selectedItem ? formatTanggal(selectedItem.date ||
                            selectedItem.createdAt) : '' }}</p>
                    </div>

                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import DropzoneDokumentasi from './DropzoneDokumentasi.vue';
import axios from 'axios';
import { useAuth } from '@/lib/Auth.js';
import { Toast, useToast } from 'primevue';

const props = defineProps({
    paketId: {
        type: [String, Number],
        required: false,
        default: null
    }
});

const auth = useAuth();
const toast = useToast()
// State Handling
const isLoading = ref(false);
const isError = ref(false);
const errorMessage = ref('');
const dokumentasiList = ref([]);

// State Modal Lightbox
const isModalOpen = ref(false);
const selectedItem = ref(null);
const backendUrl = ref('http://100.114.142.21:3002/images/');

const showAlert = (severity, status, message) => {

    toast.add({
        severity: severity,
        summary: status,
        detail: message,
        group: 'top-center',
        life: 2000
    });

};

const getMediaUrl = (fileName) => {
    if (!fileName) return '';
    if (fileName.startsWith('http://') || fileName.startsWith('https://')) {
        return fileName;
    }
    return `${backendUrl.value}${fileName}`;
};

const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/400x300?text=Gambar+Gagal+Dimuat';
};

const formatTanggal = (tanggal) => {
    if (!tanggal) return '-';
    try {
        const d = new Date(tanggal);
        if (isNaN(d.getTime())) return '-';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return d.toLocaleDateString('id-ID', options);
    } catch {
        return '-';
    }
};

const fetchDocumentations = async () => {
    if (!props.paketId) {
        dokumentasiList.value = [];
        return;
    }

    isLoading.value = true;
    isError.value = false;
    errorMessage.value = '';

    try {
        const token = auth.state?.token || localStorage.getItem('token');
        const response = await axios.get(`http://100.114.142.21:3002/api/v1/documentation/${props.paketId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.data && Array.isArray(response.data.data)) {
            dokumentasiList.value = response.data.data;
        } else if (Array.isArray(response.data)) {
            dokumentasiList.value = response.data;
        } else {
            dokumentasiList.value = [];
        }
    } catch (err) {
        console.error("Error fetching documentation:", err);
        isError.value = true;
        errorMessage.value = err.response?.data?.message || err.message || 'Terjadi kesalahan saat memuat data dokumentasi.';
    } finally {
        isLoading.value = false;
    }
};

const bukaModal = (item) => {
    if (!item) return;
    selectedItem.value = item;
    isModalOpen.value = true;
    document.body.style.overflow = 'hidden';
};

const tutupModal = () => {
    isModalOpen.value = false;
    selectedItem.value = null;
    document.body.style.overflow = 'auto';
};

watch(() => props.paketId, (newVal) => {
    if (newVal) {
        fetchDocumentations();
    } else {
        dokumentasiList.value = [];
    }
}, { immediate: true });

onMounted(() => {
    if (props.paketId) {
        fetchDocumentations();
    }
});
</script>

<style scoped>
/* Transisi untuk Modal Lightbox */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Kustomisasi Scrollbar Horizontal */
.custom-scrollbar-x::-webkit-scrollbar {
    height: 8px;
}

.custom-scrollbar-x::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar-x::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 10px;
}

.custom-scrollbar-x::-webkit-scrollbar-thumb:hover {
    background-color: #94a3b8;
}
</style>