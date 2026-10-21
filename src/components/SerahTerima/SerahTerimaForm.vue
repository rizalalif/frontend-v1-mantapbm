<template>
    <div class="space-y-6">
        <!-- ============================================================== -->
        <!-- KONDISI 1: JIKA PROGRESS FISIK TERAKHIR BELUM 100%             -->
        <!-- ============================================================== -->
        <div v-if="!isFisik100Percent"
            class="bg-white rounded-[24px] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center text-center">

            <!-- Icon Lock / Peringatan -->
            <div class="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            </div>

            <!-- Pesan Utama -->
            <h3 class="text-xl font-bold text-blue-950 mb-2">Progress Belum 100%</h3>
            <p class="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
                Form Serah Terima Pekerjaan hanya dapat diakses dan diisi apabila akumulasi progres fisik telah mencapai
                100%.
            </p>

            <!-- Card Indikator Akumulasi Progress -->
            <div class="w-full max-w-md bg-slate-50 rounded-2xl p-5 border border-slate-100/80">
                <div class="flex justify-between items-center text-xs font-bold mb-2">
                    <span class="text-slate-500 uppercase tracking-wider">Total Akumulasi Fisik</span>
                    <span class="text-blue-950 text-sm">{{ totalActualPercentage.toFixed(2) }}% / 100%</span>
                </div>
                <!-- Progress Bar -->
                <div class="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div class="h-full bg-orange-500 rounded-full transition-all duration-500"
                        :style="{ width: Math.min(totalActualPercentage, 100) + '%' }">
                    </div>
                </div>
            </div>
        </div>

        <!-- ============================================================== -->
        <!-- KONDISI 2: JIKA AKUMULASI PROGRESS FISIK SUDAH 100%            -->
        <!-- ============================================================== -->
        <div v-else
            class="bg-white rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 max-w-3xl mx-auto">

            <!-- Header Form -->
            <div class="border-b border-slate-100 pb-5 mb-6 flex justify-between items-center">
                <div>
                    <h3 class="font-bold text-lg text-blue-950">Form Serah Terima Pekerjaan</h3>
                    <p class="text-xs text-slate-400 mt-1">
                        Akumulasi progres fisik telah mencapai 100%. Silakan lengkapi data serah terima pekerjaan di
                        bawah ini.
                    </p>
                </div>
                <span class="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full">
                    Fisik 100%
                </span>
            </div>

            <!-- Form Inputs -->
            <form @submit.prevent="handleSubmit" class="space-y-5">
                <!-- 1. Nomor Surat -->
                <div>
                    <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Nomor Surat Serah Terima
                    </label>
                    <input type="text" v-model="form.noStp" required placeholder="Contoh: 005/BAST/BM/2026"
                        class="w-full bg-slate-50 text-sm font-bold text-blue-950 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-400" />
                </div>

                <!-- 2. Tanggal -->
                <div>
                    <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Tanggal Serah Terima
                    </label>
                    <input type="date" v-model="form.tglStp" required
                        class="w-full bg-slate-50 text-sm font-bold text-blue-950 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                </div>

                <!-- Action Button -->
                <div class="flex items-center justify-end pt-4 border-t border-slate-100">
                    <button type="submit" :disabled="isLoading"
                        class="px-8 py-3 rounded-full text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 flex items-center gap-2">
                        <svg v-if="isLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        <span>{{ isLoading ? 'Menyimpan...' : 'Simpan Serah Terima' }}</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import api from '@/services/api';

const props = defineProps({
    paket: {
        type: Object,
        default: () => ({})
    },
    paketId: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['refresh', 'submit-success']);

const isLoading = ref(false);

const form = ref({
    noStp: '',
    tglStp: new Date().toISOString().split('T')[0]
});

// Menghitung persentase aktual dari AKUMULASI (penjumlahan seluruh progres fisik)
const totalActualPercentage = computed(() => {
    const list = props.paket?.progressFisiks || [];
    if (!Array.isArray(list) || list.length === 0) return 0;

    return list.reduce((sum, item) => sum + (Number(item?.actualPercentage) || 0), 0);
});

// Pengecekan apakah total akumulasi sudah mencapai 100%
const isFisik100Percent = computed(() => {
    return totalActualPercentage.value >= 100;
});

// Sinkronisasi data awal jika serah terima sudah pernah disimpan
watch(
    () => props.paket,
    (newPaket) => {
        if (!newPaket) return;
        const stpData = newPaket.serahTerima || newPaket.serahTerimaPekerjaan || {};
        form.value.noStp = stpData.noStp || stpData.noSurat || newPaket.noStp || '';
        if (stpData.tglStp || stpData.tglSerahTerima || newPaket.tglStp) {
            const rawDate = stpData.tglStp || stpData.tglSerahTerima || newPaket.tglStp;
            form.value.tglStp = String(rawDate).split('T')[0];
        }
    },
    { immediate: true, deep: true }
);

// Submit Form Serah Terima
const handleSubmit = async () => {
    try {
        isLoading.value = true;
        const targetId = props.paketId || props.paket?.id;

        const payload = {
            noStp: form.value.noStp,
            tglStp: form.value.tglStp ? new Date(form.value.tglStp).toISOString() : null
        };

        // Kirim request ke endpoint serah terima backend
        await api.put(`/paket/${targetId}/serah-terima`, payload);

        emit('submit-success', 'success', 'Berhasil', 'Data Serah Terima Pekerjaan berhasil disimpan.', 'stp');
        emit('refresh');
    } catch (error) {
        console.error('Gagal menyimpan data serah terima:', error.response?.data || error.message);
        const errMsg = error.response?.data?.message || 'Gagal menyimpan data serah terima.';
        emit('submit-success', 'error', 'Gagal', errMsg, 'stp');
    } finally {
        isLoading.value = false;
    }
};
</script>
