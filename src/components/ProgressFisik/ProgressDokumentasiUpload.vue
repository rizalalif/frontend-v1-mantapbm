<template>
    <div class="col-span-1 md:col-span-3 flex flex-col gap-2.5 mt-2 pt-4 border-t border-slate-100">
        <!-- Header & Counter -->
        <div class="flex items-center justify-between">
            <div>
                <label class="block text-xs font-bold text-blue-950 uppercase tracking-wider">
                    Foto Dokumentasi Lapangan
                </label>
                <p class="text-[11px] text-slate-400">
                    {{ readonly ? 'Klik ikon kaca pembesar pada foto untuk melihat ukuran penuh.' : 'Tarik & lepas foto langsung ke kotak bergaris, atau klik untuk memilih file.' }}
                </p>
            </div>

            <!-- Badge Status Foto -->
            <div class="flex items-center gap-2">
                <span v-if="existingPhotos && existingPhotos.length > 0"
                    class="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-[11px] font-bold">
                    {{ existingPhotos.length }} Tersimpan
                </span>
                <span v-if="stagedFiles.length > 0"
                    class="px-2.5 py-1 bg-orange-50 text-orange-600 rounded-full text-[11px] font-bold animate-pulse">
                    +{{ stagedFiles.length }} Foto Baru
                </span>
            </div>
        </div>

        <!-- CONTAINER DERETAN FOTO + KOTAK BERGARIS (1 BARIS HORIZONTAL SCROLL) -->
        <div
            class="flex flex-nowrap overflow-x-auto gap-3 py-2 px-2 custom-scrollbar-x bg-slate-50/70 p-3 rounded-2xl border border-slate-100 items-center min-h-[148px]">

            <!-- 1. FOTO YANG SUDAH TERSIMPAN (EXISTING) -->
            <div v-for="(doc, idx) in existingPhotos" :key="doc?.id || idx"
                class="relative flex-none w-32 h-32 rounded-xl overflow-hidden border border-slate-200 bg-white group shadow-xs hover:shadow-md transition-all">

                <!-- Media Gambar -->
                <img v-if="doc?.fileType === 'image' || !doc?.fileType" :src="getMediaUrl(doc?.fileName)"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    @error="handleImageError" />

                <!-- Media Video -->
                <div v-else class="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white p-1">
                    <svg class="w-6 h-6 mb-1 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                            clip-rule="evenodd" />
                    </svg>
                    <span class="text-[9px] truncate w-full text-center">Video</span>
                </div>

                <!-- Overlay Action: Preview & Hapus -->
                <div
                    class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button type="button" @click.stop="openLightbox(doc)" title="Lihat Foto"
                        class="p-1.5 bg-white/90 hover:bg-white text-blue-950 rounded-full shadow-sm transition-all hover:scale-110 cursor-pointer">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                    </button>
                    <button v-if="!readonly" type="button" @click.stop="handleRemoveExisting(doc?.id)" title="Hapus Foto"
                        class="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-sm transition-all hover:scale-110 cursor-pointer">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- 2. FOTO BARU YANG SEDANG DI-DROP / DIPILIH (STAGED) -->
            <template v-if="!readonly">
                <div v-for="(fileObj, index) in stagedFiles" :key="'staged-' + index"
                    class="relative flex-none w-32 h-32 rounded-xl overflow-hidden border-2 border-orange-400 bg-white group shadow-xs">

                    <!-- Badge Penanda 'Baru' -->
                    <span
                        class="absolute top-1.5 left-1.5 bg-orange-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-xs z-10 uppercase tracking-wider">
                        Baru
                    </span>

                    <!-- Tombol Hapus File Staged -->
                    <button type="button" @click.stop="removeStagedFile(index)" title="Batalkan foto ini"
                        class="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-90 hover:opacity-100 z-10 cursor-pointer transition-transform hover:scale-110 shadow-sm">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <!-- Preview Gambar -->
                    <img v-if="fileObj.type.startsWith('image/')" :src="fileObj.previewUrl"
                        class="w-full h-full object-cover" />

                    <!-- Preview Video -->
                    <div v-else class="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white p-1">
                        <svg class="w-6 h-6 mb-1 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                clip-rule="evenodd" />
                        </svg>
                        <span class="text-[9px] truncate w-full text-center">{{ fileObj.file.name }}</span>
                    </div>
                </div>

                <!-- 3. KOTAK BERGARIS (INLINE DASHED DROPZONE) -->
                <div @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false"
                    @drop.prevent="handleDrop" @click="triggerFileInput" :class="[
                        'relative flex-none w-32 h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all p-2 text-center group select-none',
                        isDragging
                            ? 'border-orange-500 bg-orange-100/60 scale-102 shadow-md'
                            : 'border-slate-300 hover:border-orange-500 bg-white hover:bg-orange-50/40 shadow-xs'
                    ]">

                    <!-- Input file disembunyikan -->
                    <input type="file" ref="fileInputRef" multiple accept="image/*,video/*" class="hidden"
                        @change="handleFileSelect" />

                    <div
                        class="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-orange-100 text-slate-400 group-hover:text-orange-500 flex items-center justify-center mb-1.5 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                    </div>

                    <span class="text-[11px] font-bold text-slate-600 group-hover:text-orange-600 leading-tight">
                        Tarik & Lepas
                    </span>
                    <span class="text-[9px] text-slate-400 group-hover:text-orange-400 mt-0.5">
                        atau klik cari
                    </span>
                </div>
            </template>

            <!-- 4. EMPTY STATE KHUSUS MODE READ-ONLY (JIKA TIDAK ADA FOTO) -->
            <div v-if="readonly && (!existingPhotos || existingPhotos.length === 0)"
                class="w-full text-center py-6 text-xs text-slate-400 italic">
                Tidak ada foto dokumentasi lapangan pada laporan ini.
            </div>

        </div>

        <!-- LIGHTBOX PREVIEW MODAL -->
        <div v-if="previewDoc" class="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4"
            @click.self="previewDoc = null">
            <button type="button" @click="previewDoc = null"
                class="absolute top-4 right-4 text-white hover:text-slate-300 p-2 cursor-pointer">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <div class="max-w-4xl max-h-[80vh] flex flex-col items-center">
                <img v-if="previewDoc?.fileType === 'image' || !previewDoc?.fileType"
                    :src="getMediaUrl(previewDoc?.fileName)"
                    class="max-w-full max-h-[75vh] object-contain rounded-lg shadow-xl" />
                <video v-else :src="getMediaUrl(previewDoc?.fileName)" controls autoplay
                    class="max-w-full max-h-[75vh] rounded-lg shadow-xl"></video>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { BASE_URL } from '@/services/api';

const props = defineProps({
    existingPhotos: {
        type: Array,
        default: () => []
    },
    readonly: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:files', 'remove-photo']);

const isDragging = ref(false);
const fileInputRef = ref(null);
const stagedFiles = ref([]);
const previewDoc = ref(null);

const BASE_IMAGE_URL = `${BASE_URL}/images/`;

const triggerFileInput = () => {
    fileInputRef.value.click();
};

const handleDrop = (event) => {
    isDragging.value = false;
    const files = event.dataTransfer.files;
    processFiles(files);
};

const handleFileSelect = (event) => {
    processFiles(event.target.files);
    event.target.value = '';
};

const processFiles = (files) => {
    const MAX_SIZE = 10 * 1024 * 1024;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
            alert(`File "${file.name}" tidak didukung. Harap upload gambar atau video.`);
            continue;
        }
        if (file.size > MAX_SIZE) {
            alert(`Ukuran file "${file.name}" melebihi batas 10 MB.`);
            continue;
        }

        stagedFiles.value.push({
            file,
            type: file.type,
            previewUrl: URL.createObjectURL(file)
        });
    }
    emit('update:files', stagedFiles.value.map(f => f.file));
};

const removeStagedFile = (index) => {
    const removed = stagedFiles.value.splice(index, 1)[0];
    if (removed?.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
    }
    emit('update:files', stagedFiles.value.map(f => f.file));
};

const clearStagedFiles = () => {
    stagedFiles.value.forEach(f => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    stagedFiles.value = [];
    emit('update:files', []);
};

const handleRemoveExisting = (id) => {
    if (!id) return;
    emit('remove-photo', id);
};

const openLightbox = (doc) => {
    previewDoc.value = doc;
};

const getMediaUrl = (fileName) => {
    if (!fileName) return '';
    if (fileName.startsWith('http://') || fileName.startsWith('https://')) return fileName;
    return `${BASE_IMAGE_URL}${fileName}`;
};

const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/300x300?text=Foto+Tidak+Tersedia';
};

defineExpose({
    clearStagedFiles
});
</script>

<style scoped>
.custom-scrollbar-x::-webkit-scrollbar {
    height: 6px;
}

.custom-scrollbar-x::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar-x::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 9999px;
}

.custom-scrollbar-x::-webkit-scrollbar-thumb:hover {
    background-color: #94a3b8;
}
</style>
