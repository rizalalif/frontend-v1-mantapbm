<script setup>
import { computed, ref, watch } from "vue";
import axios from "axios";
import { useAuth } from "@/lib/Auth";
import { getChangedPayload, listOfMonths } from "@/lib/Helper";

const auth = useAuth();

const props = defineProps({
    paketId: String,
    paket: Object
});

const emit = defineEmits(["saved"]);

const modalVisible = ref(false);
const isLoading = ref(false);
const editingId = ref(null);
const dateMonth = ref(null);

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
    keterangan: null,
});

// Method untuk membuka modal (bisa untuk Tambah atau Edit)
const openModal = (item = null) => {
    if (item && item.id) {
        editingId.value = item.id;
        const normalizedItem = {
            id: item.id,
            paketProgressKeuanganId: item.paketProgressKeuanganId || props.paketId || props.paket?.id || "",
            monthNumber: item.monthNumber,
            mingguKe: item.mingguKe,
            monthName: item.monthName,
            paguPercentage: item.paguPercentage !== null && item.paguPercentage !== undefined ? parseFloat(item.paguPercentage) : null,
            actualPercentage: item.actualPercentage !== null && item.actualPercentage !== undefined ? parseFloat(item.actualPercentage) : null,
            actualFinance: item.actualFinance !== null && item.actualFinance !== undefined ? Number(item.actualFinance) : null,
            deviationFinance: item.deviationFinance !== null && item.deviationFinance !== undefined ? Number(item.deviationFinance) : null,
            status: item.status,
            keterangan: item.keterangan,
        };
        originalData.value = { ...normalizedItem };
        formProgress.value = { ...normalizedItem };
        selectedStatus.value = item.status || "Sesuai Target";
    } else {
        editingId.value = null;
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
        if (!modalVisible.value) return;

        const payload = getChangedPayload(originalData.value, formProgress.value);
        if (Object.hasOwn(payload, 'actualFinance')) {
            const nilaiKontrak = parseFloat(props.paket?.nilaiKontrak);
            const nilaiPagu = parseFloat(props.paket?.nilaiPagu);
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
    try {
        isLoading.value = true;
        const targetId = props.paketId || props.paket?.id || formProgress.value.paketProgressKeuanganId;
        console.log(targetId, "targetId");
        console.log(editingId.value, "editingId");
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
            keterangan: formProgress.value.keterangan
        };

        const isUpdate = !!editingId.value;
        const payloadToSend = isUpdate ? getChangedPayload(originalData.value, fullPayload) : fullPayload;

        if (isUpdate && Object.keys(payloadToSend).length === 0) {
            console.log("Tidak ada perubahan data.");
            modalVisible.value = false;
            return;
        }

        const url = isUpdate
            ? `http://100.114.142.21:3002/api/v1/progress-keuangan/${editingId.value}`
            : `http://100.114.142.21:3002/api/v1/progress-keuangan`;

        console.log(`Submitting progress keuangan (${isUpdate ? 'PUT' : 'POST'}) 🚀:`, payloadToSend);

        const response = isUpdate
            ? await axios.put(url, payloadToSend, { headers: { Authorization: `Bearer ${auth.state.token || localStorage.getItem("token")}` } })
            : await axios.post(url, payloadToSend, { headers: { Authorization: `Bearer ${auth.state.token || localStorage.getItem("token")}` } });

        console.log("Progress Keuangan berhasil disimpan 🚀:", response.data);
        modalVisible.value = false;
        emit("saved", response.data);
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
                        class="bg-white rounded-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">

                        <h3 class="font-bold text-sm text-blue-950 uppercase tracking-wide mb-6">
                            {{ isEditMode ? 'Edit Laporan Progres Keuangan' : 'Tambah Laporan Progres Keuangan' }}
                        </h3>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                            <div class="grid grid-cols-2 gap-3">
                                <div class="col-span-1">
                                    <label
                                        class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Bulan
                                        Ke-</label>
                                    <input type="number" min="1" max="12" v-model="formProgress.monthNumber"
                                        class="w-full bg-slate-50 text-sm text-center font-bold text-blue-950 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none">
                                </div>
                                <div class="col-span-1">
                                    <label
                                        class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Minggu
                                        Ke-</label>
                                    <input type="number" min="1" max="12" v-model="formProgress.mingguKe"
                                        class="w-full bg-slate-50 text-sm text-center font-bold text-blue-950 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none">
                                </div>

                            </div>
                            <div>
                                <label
                                    class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nama
                                    Bulan</label>
                                <Select v-model="formProgress.monthName" :options="monthName" optionLabel="label"
                                    optionValue="value" placeholder="Pilih Bulan"
                                    :pt="{ root: 'w-full! bg-slate-50! text-sm! font-bold! text-blue-950! rounded-xl! px-2! py-[3px]! border-none! shadow-none! focus:ring-2! focus:ring-orange-500! focus:outline-none! cursor-pointer' }" />
                            </div>
                            <!-- <div>
                                <label
                                    class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Rencana
                                    Fisik (%)</label>
                                <input type="number" step="0.01" v-model="formProgress.rencanaFisik"
                                    class="w-full bg-slate-50 text-sm font-bold text-blue-950 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none">
                            </div> -->
                            <div>
                                <label
                                    class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                                <Select v-model="selectedStatus" :options="statusOptions" optionLabel="label"
                                    optionValue="value" placeholder="Pilih status"
                                    :pt="{ root: 'w-full! bg-slate-50! text-sm! font-bold! text-blue-950! rounded-xl! px-2! py-[3px]! border-none! shadow-none! focus:ring-2! focus:ring-orange-500! focus:outline-none! cursor-pointer' }" />
                            </div>

                            <!-- <div>
                                <label
                                    class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nilai
                                    Kontrak (Rp)</label>
                                <input type="number" v-model="formProgress.nilaiKontrak"
                                    class="w-full bg-slate-50 text-sm font-bold text-blue-950 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none">
                            </div> -->
                            <div>
                                <label
                                    class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Aktual
                                    Keuangan</label>
                                <InputNumber placeholder="Masukkan Nominal" name="actualNominal"
                                    v-model="formProgress.actualFinance" :minFractionDigits="2" :maxFractionDigits="2"
                                    mode="currency" currency="IDR" locale="id-ID" class="w-full"
                                    input-class="w-full! bg-slate-50! text-sm! font-bold! text-blue-950! rounded-xl! px-4! py-3! border-none! focus:ring-2! focus:ring-orange-500! focus:outline-none!" />
                            </div>
                            <!-- <div>
                                <label
                                    class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nilai
                                    Adendum (Rp)</label>
                                <input type="number" v-model="formProgress.nilaiAdendum"
                                    class="w-full bg-slate-50 text-sm font-bold text-blue-950 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none">
                            </div>
                            -->


                            <div>
                                <label
                                    class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Progress
                                    Kontrak</label>
                                <InputNumber placeholder="Masukkan Persentase" name="actualPercentage"
                                    v-model="formProgress.actualPercentage" :minFractionDigits="2"
                                    :maxFractionDigits="2" mode="decimal" suffix=" %" locale="id-ID" class="w-full"
                                    input-class="w-full! bg-slate-50! text-sm! font-bold! text-blue-950! rounded-xl! px-4! py-3! border-none! focus:ring-2! focus:ring-orange-500! focus:outline-none!" />
                            </div>
                            <div>
                                <label
                                    class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Progress
                                    Pagu</label>
                                <InputNumber placeholder="Masukkan Persentase" name="actualPercentage"
                                    v-model="formProgress.paguPercentage" :minFractionDigits="2" :maxFractionDigits="2"
                                    mode="decimal" suffix=" %" locale="id-ID" class="w-full"
                                    input-class="w-full! bg-slate-50! text-sm! font-bold! text-blue-950! rounded-xl! px-4! py-3! border-none! focus:ring-2! focus:ring-orange-500! focus:outline-none!" />
                            </div>
                            <!-- <div>
                                <label
                                    class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Deviasi
                                    Keuangan</label>
                                <input type="text" readonly v-model="formProgress.deviationFinance"
                                    class="w-full bg-red-50 text-sm font-bold text-red-600 rounded-xl px-4 py-3 border-none focus:outline-none">
                            </div> -->

                            <!-- <div class="md:col-span-3">
                                <label
                                    class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Keterangan
                                    / Kendala</label>
                                <textarea rows="2" v-model="formProgress.keterangan"
                                    class="w-full bg-slate-50 text-sm font-medium text-blue-950 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
                                    placeholder="Tuliskan keterangan laporan..."></textarea>
                            </div> -->
                        </div>

                        <!-- ACTION BUTTONS -->
                        <div class="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                            <button type="button" @click="closeCallback"
                                class="px-8 py-3.5 rounded-full text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors">
                                Batal
                            </button>
                            <button type="submit" :disabled="isLoading"
                                class="px-8 py-3.5 rounded-full text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2 hover:-translate-y-0.5 disabled:opacity-50">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                        d="M5 13l4 4L19 7">
                                    </path>
                                </svg>
                                {{ isLoading ? 'Menyimpan...' : (isEditMode ? 'Update Laporan' : 'Simpan') }}
                            </button>
                        </div>
                    </div>
                </form>
            </template>
        </Dialog>
    </div>
</template>
