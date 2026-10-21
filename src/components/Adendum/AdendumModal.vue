<script setup>
import { computed, ref } from 'vue';
import api from '@/services/api';
import InputNumber from 'primevue/inputnumber';

const props = defineProps({
    paketId: {
        type: String,
        default: ''
    },
    paket: {
        type: Object,
        default: () => ({})
    }
});

const emit = defineEmits(['saved']);

const modalVisible = ref(false);
const isLoading = ref(false);
const editingId = ref(null);
const isEditMode = computed(() => !!editingId.value);

const formAdendum = ref({
    paketAdendumId: '',
    noAdendum: '',
    tglAdendum: new Date().toISOString().split('T')[0],
    nilaiAdendum: null
});

// Method membuka modal (Bisa dipanggil dari luar / Parent via template ref)
const openModal = (item = null) => {
    const defaultPaketId = props.paketId || props.paket?.id || '';

    if (item && item.id) {
        editingId.value = item.id;
        formAdendum.value = {
            paketAdendumId: item.paketAdendumId || defaultPaketId,
            noAdendum: item.noAdendum || '',
            tglAdendum: item.tglAdendum ? item.tglAdendum.split('T')[0] : '',
            nilaiAdendum: item.nilaiAdendum !== null && item.nilaiAdendum !== undefined ? Number(item.nilaiAdendum) : null
        };
    } else {
        editingId.value = null;
        formAdendum.value = {
            paketAdendumId: defaultPaketId,
            noAdendum: '',
            tglAdendum: new Date().toISOString().split('T')[0],
            nilaiAdendum: null
        };
    }
    modalVisible.value = true;
};

// Expose openModal agar bisa diakses oleh ref pada AdendumTable.vue
defineExpose({
    openModal
});

// Submit Form (POST untuk Tambah, PUT untuk Edit)
const submitForm = async () => {
    try {
        isLoading.value = true;
        const targetPaketId = props.paketId || props.paket?.id || formAdendum.value.paketAdendumId;

        const payload = {
            paketAdendumId: targetPaketId,
            noAdendum: formAdendum.value.noAdendum,
            tglAdendum: formAdendum.value.tglAdendum,
            nilaiAdendum: Number(formAdendum.value.nilaiAdendum) || 0
        };

        let response;
        if (isEditMode.value) {
            response = await api.put(`/adendum/${editingId.value}`, payload);
        } else {
            response = await api.post('/adendum', payload);
        }

        modalVisible.value = false;
        emit('saved', response.data);
    } catch (error) {
        console.error('Gagal menyimpan data adendum:', error.response?.data || error.message);
        // alert(error.response?.data?.message || 'Gagal menyimpan data adendum.');
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <Dialog v-model:visible="modalVisible" pt:root:class="border-0! bg-transparent! max-w-[550px]! w-full!"
        pt:mask:class="backdrop-blur-xs">
        <template #container="{ closeCallback }">
            <form @submit.prevent="submitForm">
                <div class="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
                    <!-- Modal Header -->
                    <h3 class="font-bold text-base text-blue-950 uppercase tracking-wide mb-6">
                        {{ isEditMode ? 'Edit Data Adendum' : 'Tambah Data Adendum' }}
                    </h3>

                    <div class="flex flex-col gap-4 mb-6">
                        <!-- 1. Nomor Adendum (noAdendum) -->
                        <div>
                            <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Nomor Adendum
                            </label>
                            <input type="text" v-model="formAdendum.noAdendum" required
                                placeholder="Contoh: 001/ADD/BM/2026"
                                class="w-full bg-slate-50 text-sm font-bold text-blue-950 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-400" />
                        </div>

                        <!-- 2. Tanggal Adendum (tglAdendum) -->
                        <div>
                            <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Tanggal Adendum
                            </label>
                            <input type="date" v-model="formAdendum.tglAdendum" required
                                class="w-full bg-slate-50 text-sm font-bold text-blue-950 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                        </div>

                        <!-- 3. Nilai Adendum (nilaiAdendum) -->
                        <div>
                            <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Nilai Adendum (Rp)
                            </label>
                            <InputNumber v-model="formAdendum.nilaiAdendum" mode="currency" currency="IDR" locale="id-ID"
                                :minFractionDigits="0" placeholder="Rp 0" required class="w-full"
                                input-class="w-full! bg-slate-50! text-sm! font-bold! text-blue-950! rounded-xl! px-4! py-3! border-none! focus:ring-2! focus:ring-orange-500! focus:outline-none!" />
                        </div>
                    </div>

                    <!-- Modal Actions -->
                    <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" @click="modalVisible = false" :disabled="isLoading"
                            class="px-6 py-2.5 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors">
                            Batal
                        </button>
                        <button type="submit" :disabled="isLoading"
                            class="px-8 py-2.5 rounded-full text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-50">
                            {{ isLoading ? 'Menyimpan...' : (isEditMode ? 'Simpan Perubahan' : 'Tambah Adendum') }}
                        </button>
                    </div>
                </div>
            </form>
        </template>
    </Dialog>
</template>
