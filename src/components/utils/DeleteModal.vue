<script setup>
import { ref } from 'vue';

const props = defineProps({
    title: {
        type: String,
        default: 'Konfirmasi Hapus'
    },
    deskripsi: {
        type: String,
        default: 'Apakah Anda yakin ingin menghapus data ini? Data yang dihapus tidak dapat dikembalikan.'
    },
    actionHapus: {
        type: Function,
        default: null
    },
    buttonText: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['confirm']);

const visible = ref(false);
const isLoading = ref(false);

const openModal = (e) => {
    if (e && e.stopPropagation) {
        e.stopPropagation();
    }
    visible.value = true;
};

const handleConfirm = async () => {
    try {
        isLoading.value = true;
        if (props.actionHapus && typeof props.actionHapus === 'function') {
            await props.actionHapus();
        }
        emit('confirm');
        visible.value = false;
    } catch (error) {
        console.error('Error executing actionHapus:', error);
    } finally {
        isLoading.value = false;
    }
};

defineExpose({ openModal, visible });
</script>

<template>
    <div class="inline-block" @click.stop>
        <!-- Tombol Trigger (Default: Trash Icon / Text) -->
        <slot name="trigger" :open="openModal">
            <button v-if="buttonText" type="button" @click.stop="openModal"
                class="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-2">
                <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {{ buttonText }}
            </button>
            <button v-else type="button" @click.stop="openModal"
                class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center justify-center"
                title="Hapus">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </slot>

        <!-- Dialog Konfirmasi Hapus -->
        <Dialog v-model:visible="visible" modal :closable="false"
            pt:root:class="border-0! bg-white! rounded-2xl! shadow-xl! max-w-md! w-full!"
            pt:mask:class="backdrop-blur-xs">
            <template #header>
                <div class="flex items-center gap-3">
                    <!-- <div class="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-lg font-bold">
                        ⚠️
                    </div> -->
                    <div>
                        <h3 class="text-base font-bold text-slate-900">{{ title }}</h3>
                    </div>
                </div>
            </template>

            <div class="py-2">
                <p class="text-sm font-medium text-slate-600 leading-relaxed">
                    {{ deskripsi }}
                </p>

                <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                    <button type="button" @click="visible = false" :disabled="isLoading"
                        class="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors">
                        Batal
                    </button>
                    <button type="button" @click="handleConfirm" :disabled="isLoading"
                        class="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md shadow-red-600/20 flex items-center gap-2 disabled:opacity-50">
                        {{ isLoading ? 'Menghapus...' : 'Hapus' }}
                    </button>
                </div>
            </div>
        </Dialog>
    </div>
</template>