<!-- <template>
    <div
        class="w-full mx-auto border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors flex flex-col items-center justify-center p-8 cursor-pointer h-48">
        <FileUpload ref="fu" name="demo[]" url="/api/upload" :multiple="true" accept="image/*,video/*" :maxFileSize="1000000000"
            mode="advanced" :pt="{
                root: { class: 'bg-transparent!  border-none!' },
                header: { class: 'hidden!' },
                // content: { class: 'bg-transparent! w-full!' }
            }">
            <template #content="{ files, removeFileCallback, messages }">
                <div v-if="messages?.length" class="flex flex-col gap-2">
                    <Message v-for="msg of messages" :key="msg" severity="error">{{ msg }}</Message>
                </div>
                <div v-if="files.length" class="flex flex-col gap-4">
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-muted-color">{{ files.length }} file(s) selected</span>
                        <div class="flex items-center gap-2">
                            <Button variant="text" size="small" @click="onUpload">Upload</Button>
                            <Button variant="text" size="small" severity="danger" @click="onClear">Clear all</Button>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <div v-for="(file, index) of files" :key="file.name + file.size"
                            class="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800">
                            <div class="flex items-center gap-3">
                                <CloudUpload class="text-primary shrink-0" />
                                <div class="flex flex-col">
                                    <span class="text-sm font-medium">{{ file.name }}</span>
                                    <span class="text-xs text-muted-color">{{ formatSize(file.size) }}</span>
                                </div>
                            </div>
                            <Button type="button" iconOnly variant="text" severity="secondary" size="small" rounded
                                @click="removeFileCallback(index)">
                                <Times />
                            </Button>
                        </div>
                    </div>
                </div>
            </template>
            <template #empty>
                <div class="flex flex-col items-center justify-center gap-3 py-8 cursor-pointer" @click="onChoose">
                    <CloudUpload :size="48" class="text-muted-color" />
                    <div class="text-center">
                        <p class="text-lg font-medium mt-0 mb-1">Drop files here</p>
                        <p class="text-sm text-muted-color m-0">or click to browse</p>
                    </div>
                </div>
            </template>
        </FileUpload>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import CloudUpload from '@primeicons/vue/cloud-upload';
import Times from '@primeicons/vue/times';

const fu = ref();

const onChoose = () => {
    fu.value.choose();
};

const onUpload = () => {
    fu.value.upload();
};

const onClear = () => {
    fu.value.clear();
};

const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};
</script> -->

<template>
    <div class="bg-white rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mb-6">
        <h3 class="font-bold text-sm text-blue-950 uppercase tracking-wide mb-6">Upload Dokumentasi Baru
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-6 bg-white rounded-lg shadow-sm border border-slate-100">

                <!-- ZONA DRAG & DROP -->
                <!-- Event .prevent sangat penting agar browser tidak membuka file di tab baru -->
                <div @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false"
                    @drop.prevent="handleDrop" @click="triggerFileInput" :class="[
                        'relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-xl cursor-pointer transition-colors',
                        isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                    ]">
                    <!-- PREVIEW AREA -->
                    <div v-if="selectedFiles.length > 0" class="mt-6">
                        <h3 class="text-sm font-bold text-slate-700 mb-3">File Terpilih ({{ selectedFiles.length }})
                        </h3>

                        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            <div v-for="(fileObj, index) in selectedFiles" :key="index"
                                class="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-square">
                                <!-- Tombol Hapus -->
                                <button @click.stop="removeFile(index)"
                                    class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>

                                <!-- Preview Gambar -->
                                <img v-if="fileObj.type.startsWith('image/')" :src="fileObj.previewUrl"
                                    class="w-full h-full object-cover" />

                                <!-- Preview Video -->
                                <div v-else
                                    class="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white relative">
                                    <svg class="w-8 h-8 mb-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                            clip-rule="evenodd"></path>
                                    </svg>
                                    <span class="text-[10px] truncate w-11/12 text-center">{{ fileObj.file.name
                                    }}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                    <!-- Input file asli (disembunyikan) -->
                    <input type="file" ref="fileInputRef" multiple accept="image/*,video/*" class="hidden"
                        @change="handleFileSelect" />

                    <!-- Icon & Text -->
                    <svg v-show="selectedFiles.length == 0" class="w-12 h-12 text-slate-400 mb-3" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12">
                        </path>
                    </svg>
                    <p v-show="selectedFiles.length == 0" class="text-sm font-medium text-slate-600">
                        Tarik & Lepas foto/video ke sini, atau <span class="text-blue-600">klik untuk mencari
                            file</span>
                    </p>
                    <p class="text-xs text-slate-400 mt-1">Maksimal 10 file sekaligus (Format: JPG, PNG, MP4)</p>
                </div>


            </div>
            <div class="flex flex-col gap-4 justify-between">
                <div>
                    <label
                        class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tanggal</label>
                    <input type="date" v-model="formDataInput.tanggal"
                        class="w-full bg-slate-50 text-sm font-bold text-blue-950 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Keterangan
                        / Lokasi STA</label>
                    <input type="text" v-model="formDataInput.sta" placeholder="Contoh: STA 1+200 Pekerjaan Base A"
                        class="w-full bg-slate-50 text-sm font-semibold text-blue-950 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none">
                </div>
                <div class="mt-6 flex justify-end gap-3">
                    <button @click="selectedFiles = []"
                        class="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Batal</button>
                    <button @click="uploadFiles" :disabled="isUploading"
                        class="bg-blue-950 hover:bg-blue-900 text-white text-sm font-bold py-3 px-8 rounded-xl shadow-lg mt-auto">{{
                            isUploading ? 'Mengunggah...' : 'Upload Dokumentasi' }}</button>

                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import api from '@/services/api';
import { useAuth } from '@/lib/Auth';


const auth = useAuth()
// Props jika Anda memasukkan ini di halaman Detail Paket
const props = defineProps(['paketId']);
const emit = defineEmits(['refresh', 'submit']);

// State untuk input teks tambahan
const formDataInput = reactive({
    tanggal: new Date().toISOString().split('T')[0], // Default hari ini (YYYY-MM-DD)
    sta: ''
});
// State
const isDragging = ref(false);
const selectedFiles = ref([]);
const fileInputRef = ref(null);
const isUploading = ref(false);

// Trigger klik pada div untuk membuka jendela pemilihan file browser
const triggerFileInput = () => {
    fileInputRef.value.click();
};

// Menangani event Drop file dari desktop
const handleDrop = (event) => {
    isDragging.value = false;
    const files = event.dataTransfer.files;
    processFiles(files);
};

// Menangani pemilihan file lewat klik
const handleFileSelect = (event) => {
    const files = event.target.files;
    processFiles(files);
    // Reset input agar bisa memilih file yang sama lagi jika sempat dihapus
    event.target.value = '';
};

// Proses file (buat objek URL untuk preview thumbnail)
const processFiles = (files) => {
    const MAX_FILE_SIZE = 90 * 1024 * 1024;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validasi hanya gambar & video
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
            selectedFiles.value.push({
                file: file,
                type: file.type,
                // Buat temporary URL untuk menampilkan preview gambar
                previewUrl: URL.createObjectURL(file)
            });
            continue
        } else if (file.size > MAX_FILE_SIZE) {
            emit('submit', 'error', 'Gagal', `File "${file.name}" terlalu besar! (Maksimal 10 MB)`);
            continue;
        } else {
            emit('submit', 'error', 'Gagal', `File ${file.name} tidak didukung. Harap upload gambar atau video.`);
        }
    }
};

const removeFile = (index) => {
    // Hapus dari array
    const fileObj = selectedFiles.value.splice(index, 1)[0];
    // Bebaskan memori browser dari URL temporary
    URL.revokeObjectURL(fileObj.previewUrl);
};

// // Fungsi Upload ke Express API
// const uploadFiles = async () => {
//     if (selectedFiles.value.length === 0) return;

//     isUploading.value = true;

//     // WAJIB: Gunakan FormData untuk mengirim file
//     const formData = new FormData();

//     selectedFiles.value.forEach((item) => {
//         formData.append('files', item.file); // 'files' harus sama dengan nama di multer upload.array('files')
//     });

//     try {
//         await axios.post(`/api/paket/${props.paketId}/dokumentasi`, formData, {
//             headers: {
//                 'Content-Type': 'multipart/form-data'
//             }
//         });

//         alert('Dokumentasi berhasil diunggah!');
//         selectedFiles.value = []; // Reset setelah sukses
//         emit('refresh'); // Beri tahu komponen induk untuk merefresh tab Dokumentasi

//     } catch (error) {
//         console.error("Gagal mengunggah dokumentasi:", error);
//         alert('Terjadi kesalahan saat mengunggah.');
//     } finally {
//         isUploading.value = false;
//     }
// };
const batalUpload = () => {
    selectedFiles.value = [];
    formDataInput.sta = ''; // Reset STA jika dibatalkan
};
const uploadFiles = async () => {
    // 1. Validasi Input
    console.log('formDataInput', formDataInput);

    if (!formDataInput.tanggal) {
        emit('submit', 'error', 'Mohon isi Tanggal Pengambilan terlebih dahulu!');
        return;
    }
    if (!formDataInput.sta) {
        emit('submit', 'error', 'Mohon isi Lokasi / STA terlebih dahulu!');
        return;
    }
    if (selectedFiles.value.length === 0) return;

    isUploading.value = true;

    // 2. Siapkan FormData (Gabungan Teks & File)
    const formData = new FormData();

    // Masukkan teks ke FormData
    formData.append('tglPengambilan', formDataInput.tanggal);
    formData.append('lokasiSta', formDataInput.sta);
    formData.append('paketDocumentationId', props.paketId);

    // Masukkan file ke FormData
    selectedFiles.value.forEach((item) => {
        formData.append('files', item.file);
    });

    for (let [key, value] of formData.entries()) {
        console.log(key, ':', value);
    }


    try {
        await api.post('/documentation', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        // alert('Dokumentasi berhasil diunggah!');
        batalUpload(); // Reset semua field setelah sukses
        emit('refresh');
        emit('submit', 'success', 'Sukses', 'Dokumentasi berhasil diunggah!');
    } catch (error) {
        console.error(error);
        emit('submit', 'error', 'Error', 'Terjadi kesalahan saat mengunggah!');

    } finally {
        isUploading.value = false;
    }
};
</script>