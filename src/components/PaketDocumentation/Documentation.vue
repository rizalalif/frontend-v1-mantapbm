<template>
    <Toast />

    <!-- State Loading -->
    <div v-if="isLoading" class="text-center py-16 bg-white rounded-2xl border border-slate-100 my-4 shadow-sm">
        <div class="flex flex-col items-center justify-center space-y-3">
            <div class="w-8 h-8 border-4 border-blue-950 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-slate-500 text-sm font-medium">Memuat data dokumentasi proyek...</p>
        </div>
    </div>

    <!-- State Error -->
    <div v-else-if="isError" class="p-6 bg-red-50 border border-red-200 rounded-2xl text-center my-4">
        <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        </div>
        <h4 class="text-slate-800 font-bold text-base mb-1">Gagal Memuat Dokumentasi</h4>
        <p class="text-sm text-slate-600 mb-4 max-w-md mx-auto">{{ errorMessage }}</p>
        <button @click="fetchDocumentations"
            class="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer">
            Coba Lagi
        </button>
    </div>

    <!-- State Kosong -->
    <div v-else-if="!dokumentasiList || dokumentasiList.length === 0"
        class="text-center py-20 bg-white rounded-2xl border border-slate-100 my-4 shadow-sm">
        <svg class="w-14 h-14 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="text-slate-600 font-bold text-base">Belum Ada Dokumentasi Proyek</p>
        <p class="text-slate-400 text-xs mt-1">Dokumentasi diunggah melalui formulir riwayat Progres Fisik mingguan.</p>
    </div>

    <!-- GALERI GRID SETINGGI SISA LAYAR DENGAN DYNAMIC SCROLL FADE -->
    <div v-else
        class="relative w-full h-[calc(100vh-230px)] min-h-[460px]  rounded-3xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden my-4">

        <!-- FADE OVERLAY ATAS (Aktif jika sudah di-scroll ke bawah) -->
        <div class="pointer-events-none absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-white via-white/80 to-transparent z-10 transition-opacity duration-300"
            :class="canScrollTop ? 'opacity-100' : 'opacity-0'"></div>

        <!-- CONTAINER SCROLLABLE VERTIKAL -->
        <div ref="scrollContainerRef" @scroll="checkScroll"
            class="w-full h-full overflow-y-auto custom-scrollbar-y pr-2 pt-2 pb-14">
            <!-- Grid Foto Responsif Multi-Kolom -->
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                <div v-for="item in dokumentasiList" :key="item?.id || item?.fileName"
                    class="group relative aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer"
                    @click="bukaModal(item)">
                    <!-- Media Gambar -->
                    <img v-if="item?.fileType === 'image' || !item?.fileType" :src="getMediaUrl(item?.fileName)"
                        :alt="item?.fileName || 'Dokumentasi'"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        @error="handleImageError" />

                    <!-- Media Video -->
                    <div v-else-if="item?.fileType === 'video'" class="w-full h-full relative">
                        <video :src="getMediaUrl(item?.fileUrl || item?.fileName)" class="w-full h-full object-cover"
                            preload="metadata"></video>
                        <div class="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div class="bg-white/90 rounded-full p-2.5 shadow-md">
                                <svg class="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                        clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <!-- Overlay Gradient Info Bawah -->
                    <div
                        class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 text-white opacity-90 group-hover:opacity-100 transition-opacity">
                        <p v-if="'monthNumber', 'mingguKe' in item.progressFisik"
                            class="text-[10px] font-bold truncate">
                            {{ `B${item?.progressFisik.monthNumber} / M${item?.progressFisik.mingguKe}` }}
                            <!-- {{ formatTanggal(item?.date || item?.tglPengambilan || item?.createdAt) }} -->
                        </p>
                    </div>

                    <!-- Hover Icon Zoom -->
                    <div
                        class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span class="p-2 bg-white/90 rounded-full shadow-md text-blue-950">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- FADE OVERLAY BAWAH (Aktif jika masih bisa scroll ke bawah) -->
        <div class="pointer-events-none absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent z-10 transition-opacity duration-300"
            :class="canScrollBottom ? 'opacity-100' : 'opacity-0'"></div>
    </div>

    <!-- LIGHTBOX MODAL PREVIEW -->
    <Transition name="fade">
        <div v-if="isModalOpen" class="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 p-4 lg:p-10"
            @click.self="tutupModal">

            <button @click="tutupModal"
                class="absolute top-6 right-6 text-white/80 hover:text-white bg-black/50 p-2.5 rounded-full z-10 transition-colors cursor-pointer">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <div class="relative max-w-5xl w-full max-h-full flex flex-col items-center">
                <img v-if="selectedItem?.fileType === 'image' || !selectedItem?.fileType"
                    :src="getMediaUrl(selectedItem?.fileName)"
                    class="max-w-full max-h-[82vh] object-contain rounded-xl shadow-2xl" @error="handleImageError" />

                <video v-else-if="selectedItem?.fileType === 'video'" :src="getMediaUrl(selectedItem?.fileName)"
                    controls autoplay class="max-w-full max-h-[82vh] rounded-xl shadow-2xl"></video>

                <div class="mt-3 text-white text-center">
                    <p class="text-xs text-slate-300">
                        {{ selectedItem ? `B${selectedItem?.progressFisik["monthNumber"]} /
                        M${selectedItem?.progressFisik["mingguKe"]}`
                            : ''
                        }}
                    </p>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import api, { BASE_URL } from '@/services/api';
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
const toast = useToast();

const isLoading = ref(false);
const isError = ref(false);
const errorMessage = ref('');
const dokumentasiList = ref([]);

// State Scroll & Dynamic Fade
const scrollContainerRef = ref(null);
const canScrollTop = ref(false);
const canScrollBottom = ref(false);

// State Modal Lightbox
const isModalOpen = ref(false);
const selectedItem = ref(null);
const backendUrl = ref(`${BASE_URL}/images/`);

// Cek posisi scroll untuk menentukan aktivasi fade atas dan bawah
const checkScroll = () => {
    const el = scrollContainerRef.value;
    if (!el) {
        canScrollTop.value = false;
        canScrollBottom.value = false;
        return;
    }
    const { scrollTop, scrollHeight, clientHeight } = el;

    // Jika konten tidak melebihi tinggi container, kedua fade tidak aktif
    if (scrollHeight <= clientHeight) {
        canScrollTop.value = false;
        canScrollBottom.value = false;
        return;
    }

    // Toleransi 5px untuk presisi browser
    canScrollTop.value = scrollTop > 5;
    canScrollBottom.value = scrollTop + clientHeight < scrollHeight - 5;
};

const getMediaUrl = (fileName) => {
    if (!fileName) return '';
    if (fileName.startsWith('http://') || fileName.startsWith('https://')) return fileName;
    return `${backendUrl.value}${fileName}`;
};

const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/400x400?text=Foto+Gagal+Dimuat';
};

const formatTanggal = (tanggal) => {
    if (!tanggal) return '-';
    try {
        const d = new Date(tanggal);
        if (isNaN(d.getTime())) return '-';
        return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
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
        const response = await api.get(`/documentation/${props.paketId}`);

        if (response.data && Array.isArray(response.data.data)) {
            dokumentasiList.value = response.data.data;
        } else if (Array.isArray(response.data)) {
            dokumentasiList.value = response.data;
        } else {
            dokumentasiList.value = [];
        }

        // Hitung ulang status scroll setelah DOM ter-render
        await nextTick();
        checkScroll();
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
    window.addEventListener('resize', checkScroll);
});

onUnmounted(() => {
    window.removeEventListener('resize', checkScroll);
});

defineExpose({
    fetchDocumentations
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Custom Scrollbar Vertikal */
.custom-scrollbar-y::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar-y::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar-y::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 9999px;
}

.custom-scrollbar-y::-webkit-scrollbar-thumb:hover {
    background-color: #94a3b8;
}
</style>
