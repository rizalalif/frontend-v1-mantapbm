<script setup>
import { computed, ref, watch } from "vue";
import api from '@/services/api';
import { useAuth } from "@/lib/Auth";
import { getChangedPayload, listOfMonths } from "@/lib/Helper";

const auth = useAuth();

const props = defineProps({
    paketId: String,
    paket: Object,
    nilaiKontrakAktif: [Number, String],
    nilaiPaguAktif: [Number, String]
});

const emit = defineEmits(["saved"]);

const modalVisible = ref(false);
const isLoading = ref(false);
const editingId = ref(null);
const isReadOnly = ref(false);
const archiveGroupName = ref('');
const dateMonth = ref(null);
const activeNilaiKontrakFase = ref(null);
const activeNilaiPagu = ref(null);

const monthName = ref(listOfMonths)
const selectedMonth = ref(null)
const isEditMode = computed(() => !!editingId.value);

const selectedStatus = ref("Sesuai Target");
const statusOptions = ref([
    { label: "Sesuai Target", value: "Sesuai Target" },
    { label: "Terlambat", value: "Terlambat" },
    { label: "Lebih Cepat", value: "Lebih Cepat" },
]);

const originalData = ref({});

const formProgress = ref({
    id: null,
    paketProgressKeuanganId: props.paketId || props.paket?.id || "",
    monthNumber: 1,
    mingguKe: 1,
    monthName: "JANUARI",
    paguPercentage: null,
    actualPercentage: null,
    actualFinance: null,
    deviationFinance: null,
    status: "draft",
    tglLaporan: new Date().toISOString().split('T')[0],
    keterangan: null,
});

// Method untuk membuka modal (bisa untuk Tambah, Edit, atau Detail Arsip)
const openModal = (item = null) => {
    // Tentukan nilai acuan kontrak fase dan pagu
    activeNilaiKontrakFase.value = Number(
        item?.nilaiKontrakAcuan ||
        props.nilaiKontrakAktif ||
        props.paket?.nilaiKontrakAdendum ||
        props.paket?.nilaiKontrak ||
        0
    );

    activeNilaiPagu.value = Number(
        props.nilaiPaguAktif ||
        props.paket?.nilaiPagu ||
        0
    );

    if (item && item.id) {
        editingId.value = item.id;
        isReadOnly.value = Boolean(item._isReadOnly || item.canEdit === false);
        archiveGroupName.value = item._groupName || '';

        const normalizedItem = {
            id: item.id,
            paketProgressKeuanganId: item.paketProgressKeuanganId || props.paketId || props.paket?.id || "",
            monthNumber: item.monthNumber,
            mingguKe: item.mingguKe,
            monthName: item.monthName || item.bulan || "JANUARI",
            paguPercentage: item.paguPercentage !== null && item.paguPercentage !== undefined ? parseFloat(item.paguPercentage) : null,
            actualPercentage: item.actualPercentage !== null && item.actualPercentage !== undefined ? parseFloat(item.actualPercentage) : null,
            actualFinance: item.actualFinance !== null && item.actualFinance !== undefined ? Number(item.actualFinance) : (item.nominalProgress !== null && item.nominalProgress !== undefined ? Number(item.nominalProgress) : null),
            deviationFinance: item.deviationFinance !== null && item.deviationFinance !== undefined ? Number(item.deviationFinance) : null,
            status: item.status,
            tglLaporan: item.tglLaporan ? String(item.tglLaporan).split('T')[0] : new Date().toISOString().split('T')[0],
            keterangan: item.keterangan || null,
        };
        originalData.value = { ...normalizedItem };
        formProgress.value = { ...normalizedItem };
        selectedStatus.value = item.status || "Sesuai Target";
    } else {
        editingId.value = null;
        isReadOnly.value = false;
        archiveGroupName.value = '';

        const defaultData = {
            id: null,
            paketProgressKeuanganId: props.paketId || props.paket?.id || "",
            monthNumber: 1,
            mingguKe: 1,
            monthName: "JANUARI",
            paguPercentage: 0,
            actualPercentage: 0,
            actualFinance: 0,
            deviationFinance: 0,
            status: "Sesuai Target",
            tglLaporan: new Date().toISOString().split('T')[0],
            keterangan: null,
        };
        originalData.value = { ...defaultData };
        formProgress.value = { ...defaultData };
        selectedStatus.value = "Sesuai Target";
    }
    dateMonth.value = null;
    modalVisible.value = true;
};

// Expose openModal agar bisa dipanggil oleh komponen parent
defineExpose({
    openModal
});

watch(
    () => formProgress.value.actualFinance,
    (newActual, oldActual) => {
        if (!modalVisible.value || isReadOnly.value) return;

        const payload = getChangedPayload(originalData.value, formProgress.value);
        if (Object.hasOwn(payload, 'actualFinance')) {
            const nilaiKontrak = activeNilaiKontrakFase.value || parseFloat(props.paket?.nilaiKontrakAdendum || props.paket?.nilaiKontrak || 0);
            const nilaiPagu = activeNilaiPagu.value || parseFloat(props.paket?.nilaiPagu || 0);
            const actual = parseFloat(payload.actualFinance);

            if (nilaiKontrak && !isNaN(actual)) {
                const actualPercentage = (actual / nilaiKontrak) * 100;
                formProgress.value.actualPercentage = parseFloat(actualPercentage.toFixed(2));
            }
            if (nilaiPagu && !isNaN(actual)) {
                const paguPercentage = (actual / nilaiPagu) * 100;
                formProgress.value.paguPercentage = parseFloat(paguPercentage.toFixed(2));
            }
        }
    }
);

const submitForm = async () => {
    if (isReadOnly.value) return;

    try {
        isLoading.value = true;
        const targetId = props.paketId || props.paket?.id || formProgress.value.paketProgressKeuanganId;
        if (!targetId && !editingId.value) {
            alert("Paket ID tidak ditemukan! Harap pilih paket terlebih dahulu.");
            return;
        }

        let monthStr = formProgress.value.strMonth;
        if (dateMonth.value instanceof Date) {
            const monthNames = ["JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI", "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"];
            monthStr = monthNames[dateMonth.value.getMonth()];
        }

        const fullPayload = {
            paketProgressKeuanganId: targetId,
            monthNumber: Number(formProgress.value.monthNumber) || 1,
            mingguKe: Number(formProgress.value.mingguKe) || 1,
            monthName: String(monthStr || formProgress.value.monthName || "JANUARI"),
            actualFinance: Number(formProgress.value.actualFinance) || 0,
            actualPercentage: Number(formProgress.value.actualPercentage) || 0,
            paguPercentage: Number(formProgress.value.paguPercentage) || 0,
            status: selectedStatus.value || formProgress.value.status || "Sesuai Target",
            tglLaporan: formProgress.value.tglLaporan ? new Date(formProgress.value.tglLaporan).toISOString() : null,
            keterangan: formProgress.value.keterangan || null
        };

        const isUpdate = !!editingId.value;
        const payloadToSend = isUpdate ? getChangedPayload(originalData.value, fullPayload) : fullPayload;

        if (isUpdate && Object.keys(payloadToSend).length === 0) {
            modalVisible.value = false;
            return;
        }

        const url = isUpdate
            ? `/progress-keuangan/${editingId.value}`
            : `/progress-keuangan`;


        const response = isUpdate
            ? await api.put(url, payloadToSend)
            : await api.post(url, payloadToSend);

        modalVisible.value = false;
        emit("saved", response?.data?.data || response?.data || null);
    } catch (error) {
        console.error("Error submitting progress keuangan:", error.response?.data || error.message);
        // alert(`${error.response?.data?.message}: ` || "Gagal menyimpan progress keuangan");
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div>
        <Dialog v-model:visible="modalVisible" pt:root:class="border-0! bg-transparent! max-w-[70%]!"
            pt:mask:class="backdrop-blur-xs">
            <template #container="{ closeCallback }">
                <!-- Form Input Progres Keuangan -->
                <form @submit.prevent="submitForm">
                    <div
                        class="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-y-auto max-h-[90vh]">

                        <!-- Sticky Header -->
                        <div class="sticky top-0 z-20 bg-white px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                            <div class="flex items-center gap-2.5 flex-wrap">
                                <h3 class="font-bold text-sm text-blue-950 uppercase tracking-wide">
                                    {{ isReadOnly ? 'Detail Laporan Progres Keuangan' : (isEditMode ? 'Edit Laporan Progres Keuangan' : 'Tambah Laporan Progres Keuangan') }}
                                </h3>
                                <span v-if="isReadOnly"
                                    class="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                                    Arsip • Hanya Baca
                                </span>
                            </div>
                            <button type="button" @click="closeCallback"
                                class="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50 cursor-pointer">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                        <div class="p-8 pt-6">
                            <!-- Banner Informasi Mode Arsip -->
                            <div v-if="isReadOnly"
                                class="mb-5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-600">
                                <svg class="w-4 h-4 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <div>
                                    <span class="font-bold text-slate-700">Mode Detail (Arsip Kontrak Sebelumnya):</span>
                                    Menampilkan data asli laporan saat diinput (hanya baca) pada grup
                                    <span class="font-semibold text-blue-950">{{ archiveGroupName || 'ini' }}</span>.
                                    Untuk mengubah atau menghapus laporan ini, buka melalui baris pada grup fase kontrak asalnya.
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                            <div class="grid grid-cols-2 gap-3">
                                <div class="col-span-1">
                                    <label
                                        class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Bulan
                                        Ke-</label>
                                    <input type="number" min="1" max="12" v-model="formProgress.monthNumber" :disabled="isReadOnly"
                                        class="w-full bg-slate-50 text-sm text-center font-bold text-blue-950 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none disabled:bg-slate-100/80 disabled:text-slate-600 disabled:cursor-not-allowed">
                                </div>
                                <div class="col-span-1">
                                    <label
                                        class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Minggu
                                        Ke-</label>
                                    <input type="number" min="1" max="12" v-model="formProgress.mingguKe" :disabled="isReadOnly"
                                        class="w-full bg-slate-50 text-sm text-center font-bold text-blue-950 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none disabled:bg-slate-100/80 disabled:text-slate-600 disabled:cursor-not-allowed">
                                </div>

                            </div>
                            <div>
                                <label
                                    class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nama
                                    Bulan</label>
                                <Select v-model="formProgress.monthName" :options="monthName" optionLabel="label" :disabled="isReadOnly"
                                    optionValue="value" placeholder="Pilih Bulan"
                                    :pt="{ root: 'w-full! bg-slate-50! text-sm! font-bold! text-blue-950! rounded-xl! px-2! py-[3px]! border-none! shadow-none! focus:ring-2! focus:ring-orange-500! focus:outline-none! cursor-pointer disabled:bg-slate-100/80! disabled:cursor-not-allowed!' }" />
                            </div>
                            <div>
                                <label
                                    class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                                <Select v-model="selectedStatus" :options="statusOptions" optionLabel="label" :disabled="isReadOnly"
                                    optionValue="value" placeholder="Pilih status"
                                    :pt="{ root: 'w-full! bg-slate-50! text-sm! font-bold! text-blue-950! rounded-xl! px-2! py-[3px]! border-none! shadow-none! focus:ring-2! focus:ring-orange-500! focus:outline-none! cursor-pointer disabled:bg-slate-100/80! disabled:cursor-not-allowed!' }" />
                            </div>

                            <div>
                                <label
                                    class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Aktual
                                    Keuangan</label>
                                <InputNumber placeholder="Masukkan Nominal" name="actualNominal" :disabled="isReadOnly"
                                    v-model="formProgress.actualFinance" :minFractionDigits="2" :maxFractionDigits="2"
                                    mode="currency" currency="IDR" locale="id-ID" class="w-full"
                                    input-class="w-full! bg-slate-50! text-sm! font-bold! text-blue-950! rounded-xl! px-4! py-3! border-none! focus:ring-2! focus:ring-orange-500! focus:outline-none! disabled:bg-slate-100/80! disabled:text-slate-600! disabled:cursor-not-allowed!" />
                            </div>

                            <div>
                                <label
                                    class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Progress
                                    Kontrak</label>
                                <InputNumber placeholder="Masukkan Persentase" name="actualPercentage" :disabled="isReadOnly"
                                    v-model="formProgress.actualPercentage" :minFractionDigits="2"
                                    :maxFractionDigits="2" mode="decimal" suffix=" %" locale="id-ID" class="w-full"
                                    input-class="w-full! bg-slate-50! text-sm! font-bold! text-blue-950! rounded-xl! px-4! py-3! border-none! focus:ring-2! focus:ring-orange-500! focus:outline-none! disabled:bg-slate-100/80! disabled:text-slate-600! disabled:cursor-not-allowed!" />
                            </div>
                            <div>
                                <label
                                    class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Progress
                                    Pagu</label>
                                <InputNumber placeholder="Masukkan Persentase" name="actualPercentage" :disabled="isReadOnly"
                                    v-model="formProgress.paguPercentage" :minFractionDigits="2" :maxFractionDigits="2"
                                    mode="decimal" suffix=" %" locale="id-ID" class="w-full"
                                    input-class="w-full! bg-slate-50! text-sm! font-bold! text-blue-950! rounded-xl! px-4! py-3! border-none! focus:ring-2! focus:ring-orange-500! focus:outline-none! disabled:bg-slate-100/80! disabled:text-slate-600! disabled:cursor-not-allowed!" />
                            </div>

                            <!-- FIELD TANGGAL LAPORAN (COLSPAN 2) -->
                            <div class="col-span-1 md:col-span-2">
                                <label
                                    class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tanggal
                                    Laporan</label>
                                <input type="date" v-model="formProgress.tglLaporan" :disabled="isReadOnly"
                                    class="w-full bg-slate-50 text-sm font-semibold text-blue-950 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none disabled:bg-slate-100/80 disabled:text-slate-600 disabled:cursor-not-allowed">
                            </div>

                            <!-- FIELD KETERANGAN (COLSPAN 2) -->
                            <div class="col-span-1 md:col-span-2">
                                <label
                                    class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Keterangan
                                    </label>
                                <textarea rows="3" v-model="formProgress.keterangan" :disabled="isReadOnly"
                                    class="w-full bg-slate-50 text-sm font-medium text-blue-950 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none placeholder-slate-300 disabled:bg-slate-100/80 disabled:text-slate-600 disabled:cursor-not-allowed"
                                    placeholder="Tuliskan keterangan laporan progres keuangan..."></textarea>
                            </div>
                        </div>

                        <!-- ACTION BUTTONS -->
                        <div class="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                            <button type="button" @click="closeCallback"
                                class="px-8 py-3.5 rounded-full text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors cursor-pointer">
                                {{ isReadOnly ? 'Tutup' : 'Batal' }}
                            </button>
                            <button v-if="!isReadOnly" type="submit" :disabled="isLoading"
                                class="px-8 py-3.5 rounded-full text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2 hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                        d="M5 13l4 4L19 7">
                                    </path>
                                </svg>
                                {{ isLoading ? 'Menyimpan...' : (isEditMode ? 'Update Laporan' : 'Simpan') }}
                            </button>
                        </div>
                        </div>
                    </div>
                </form>
            </template>
        </Dialog>
    </div>
</template>
