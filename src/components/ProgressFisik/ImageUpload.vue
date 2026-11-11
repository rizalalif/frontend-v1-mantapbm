<template>
    <!-- MODE READ-ONLY (ARSIP / DETAIL HANYA BACA) -->
    <div v-if="readonly" class="w-full">
        <div v-if="existingUrl"
            class="group relative border border-slate-200 rounded-xl p-3 bg-slate-50 flex flex-col items-center justify-center overflow-hidden">
            <p class="text-slate-500 text-xs font-semibold mb-2 self-start">{{ label }}</p>
            <div class="relative w-full max-h-48 flex justify-center items-center overflow-hidden rounded-lg bg-white">
                <img class="w-full max-h-48 object-contain rounded transition-transform duration-300 group-hover:scale-102"
                    :src="existingUrl" :alt="label" @error="handleImageError">
                <div @click="isPreviewOpen = true"
                    class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer gap-1.5 text-white text-xs font-semibold">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                    Lihat Ukuran Penuh
                </div>
            </div>
        </div>
        <div v-else
            class="border border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50 flex flex-col items-center justify-center">
            <p class="text-slate-400 text-xs font-semibold m-0">{{ label }}</p>
            <span class="text-[11px] text-slate-400 italic mt-1">Belum ada foto {{ label.toLowerCase() }}</span>
        </div>

        <!-- Lightbox Modal untuk Preview Foto -->
        <div v-if="isPreviewOpen" class="fixed inset-0 z-[250] flex items-center justify-center bg-black/90 p-4"
            @click.self="isPreviewOpen = false">
            <button type="button" @click="isPreviewOpen = false"
                class="absolute top-4 right-4 text-white hover:text-slate-300 p-2 cursor-pointer">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <div class="max-w-4xl max-h-[85vh] flex flex-col items-center">
                <img :src="existingUrl" :alt="label"
                    class="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" />
                <span class="text-white text-xs font-semibold mt-2.5 bg-black/50 px-3 py-1 rounded-full">{{ label }}</span>
            </div>
        </div>
    </div>

    <!-- MODE NORMAL / EDIT (FILE UPLOAD) -->
    <FileUpload v-else ref="fu" name="demo[]" url="/api/upload" accept="image/*" :showUploadButton="false" :fileLimit="1"
        @select="onSelect" @remove="onRemove" @clear="onRemove" :maxFileSize="5242880" mode="advanced"
        invalidFileSizeMessage="Ukuran file maksimal adalah 5MB."
        invalidFileTypeMessage="Hanya diperbolehkan format gambar." :pt="{ root: { class: 'border-0!' } }">
        <template #content="{ files, removeFileCallback }">
            <div v-if="files?.length > 0">
                <div v-for="(file, i) of files" :key="file.name + file.type + file.size"
                    class="group relative rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700 bg-slate-50 flex flex-col items-center justify-center p-2">
                    <img :src="file.objectURL" :alt="file.name" class="w-full max-h-48 object-contain rounded" />
                    <div
                        class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button"
                            class="text-white bg-red-500 rounded-full p-2 hover:bg-red-600 cursor-pointer border-0"
                            @click="removeFileCallback($event, i)">
                            <Times />
                        </button>
                    </div>
                    <div class="p-2 w-full text-center">
                        <div class="text-xs font-medium truncate">{{ file.name }}</div>
                        <div class="text-xs text-muted-color">{{ formatSize(file.size) }}</div>
                    </div>
                </div>
            </div>
        </template>
        <template #empty>
            <div v-if="isEditMode && existingUrl" @click="chooseCallback()"
                class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-xl p-4 text-center cursor-pointer flex flex-col items-center justify-center bg-slate-50">
                <p class="text-muted-color text-xs font-semibold mb-2">{{ label }}</p>
                <img class="w-full max-h-48 object-contain rounded" :src="existingUrl" alt="Preview Gambar" @error="handleImageError">
            </div>
            <div v-else @click="chooseCallback()"
                class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-xl p-12 text-center cursor-pointer">
                <p class="text-muted-color m-0!">{{ label }}</p>
            </div>
        </template>
    </FileUpload>
</template>

<script setup>
import { BASE_URL } from '@/services/api';
import Plus from '@primeicons/vue/plus';
import Times from '@primeicons/vue/times';
import Upload from '@primeicons/vue/upload';
import { ref, watch } from 'vue';

const props = defineProps({
    modelValue: {
        type: File,
        default: null
    },
    label: {
        type: String,
        required: true
    },
    isEditMode: {
        type: Boolean,
        default: false
    },
    existingUrl: {
        type: String,
        default: null
    },
    readonly: {
        type: Boolean,
        default: false
    }
})
const path = ref("");
const isPreviewOpen = ref(false);
const emit = defineEmits(['update:modelValue']);

const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/400x300?text=Gambar+Gagal+Dimuat';
};

// Terpicu ketika user memilih/memasukkan gambar
const onSelect = (event) => {
    // Ambil file pertama dari array (karena kita set fileLimit="1")
    const file = event.files[0];
    if (file) {
        emit('update:modelValue', file);
    }
};

// Terpicu ketika user menghapus gambar dari list preview PrimeVue
const onRemove = () => {
    emit('update:modelValue', null);
};

const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

watch(() => props.existingUrl, (newValue) => {
    if (newValue) {
        path.value = BASE_URL + "/images/progress-fisik/" + props.modelValue;
    } else {
        path.value = "";
    }

}, { immediate: true })
</script>