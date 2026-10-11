<template>
    <FileUpload ref="fu" name="demo[]" url="/api/upload" accept="image/*" :showUploadButton="false" :fileLimit="1"
        @select="onSelect" @remove="onRemove" @clear="onRemove" :maxFileSize="1000000" mode="advanced"
        invalidFileSizeMessage="Ukuran file maksimal adalah 5MB."
        invalidFileTypeMessage="Hanya diperbolehkan format gambar." :pt="{ root: { class: 'border-0!' } }">
        <!-- <template #header="{ files, chooseCallback, uploadCallback }">
            <div class="flex items-center gap-2">
                <Button type="button" severity="secondary" variant="outlined" @click="chooseCallback()">
                    <Plus />
                    Add Images
                </Button>
                <Button v-if="files?.length > 0" type="button" @click="uploadCallback()">
                    <Upload />
                    Upload All
                </Button>
            </div>
        </template> -->
        <template #content="{ files, removeFileCallback }">
            <div v-if="files?.length > 0">
                <div v-for="(file, i) of files" :key="file.name + file.type + file.size"
                    class="group relative rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700">
                    <img :src="file.objectURL" :alt="file.name" class="w-full h-32 object-cover" />
                    <div
                        class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button"
                            class="text-white bg-red-500 rounded-full p-2 hover:bg-red-600 cursor-pointer border-0"
                            @click="removeFileCallback($event, i)">
                            <Times />
                        </button>
                    </div>
                    <div class="p-2">
                        <div class="text-xs font-medium truncate">{{ file.name }}</div>
                        <div class="text-xs text-muted-color">{{ formatSize(file.size) }}</div>
                    </div>
                </div>
            </div>
        </template>
        <template #empty>
            <div v-if="isEditMode" @click="chooseCallback()"
                class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-xl p-12 text-center cursor-pointer">
                <p class="text-muted-color m-0!">{{ label }}</p>
                <img class="w-full h-32 object-cover" :src="existingUrl" alt="">
            </div>
            <div v-else @click="chooseCallback()"
                class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-xl p-12 text-center cursor-pointer">
                <p class="text-muted-color m-0!">{{ label }}</p>
            </div>
        </template>
    </FileUpload>
</template>

<script setup>
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
    }
})
const path = ref("");
const emit = defineEmits(['update:modelValue']);
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
    console.log("newValue", props.existingUrl);
    if (newValue) {
        path.value = "http://100.114.142.21:3002/images/progress-fisik/" + props.modelValue;
    } else {
        path.value = "";
    }

}, { immediate: true })
</script>