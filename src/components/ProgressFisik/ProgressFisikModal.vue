<script setup>
import { computed, ref, watch } from "vue";
import api, { API_BASE_URL, BASE_URL } from '@/services/api';
import { useAuth } from "@/lib/Auth";
import { getChangedPayload, listOfMonths } from "@/lib/Helper";
import ImageUpload from "./ImageUpload.vue";

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
const isVisibleSubmitUpdate = computed(() => {


    if (!isEditMode.value) return false
    const payload = getChangedPayload(originalData.value, formProgress.value);
    console.log('Payload Perubahan:', payload);

    // Cek apakah ada perubahan sama sekali
    if (Object.keys(payload).length === 0) {
        console.log("payload kosong");
        return false
    }
    return true
});
// State untuk menyimpan URL gambar dari database
const existingFotos = ref({
    fotoTipikal: null,
    fotoStreetMap: null,
    fotoDokumentasi: null
});
const BASE_IMAGE_URL = `${BASE_URL}/images/progress-fisik/`;
const monthName = ref(listOfMonths);
const isEditMode = computed(() => !!editingId.value);
const lastProgressId = computed(() => props.paket.progressFisiks.length > 0 ? props.paket.progressFisiks[props.paket.progressFisiks.length - 1].id : null);
const selectedStatus = ref(null);
const statusOptions = ref([
    { label: "Sesuai Target", value: "Sesuai Target" },
    { label: "Terlambat", value: "Terlambat" },
    { label: "Lebih Cepat", value: "Lebih Cepat" },
]);

const originalData = ref({});

const formProgress = ref({
    id: null,
    paketProgressFisikId: props.paketId || props.paket?.id || "",
    monthNumber: 1,
    monthName: "JANUARI",
    mingguKe: 1,
    actualNominal: 0,
    tglLaporan: "2026-08-25T00:00:00.000Z",
    planPercentage: 0,
    actualPercentage: 0,
    deviationFisik: 0,
    status: null,
    keterangan: null,
    tindakLanjut:null,
    fotoTipikal: null,
    fotoStreetMap: null,
    fotoDokumentasi: null,
});

// Method untuk membuka modal (bisa untuk Tambah atau Edit)
const openModal = (item = null) => {
    console.log("item", item);
    console.log("lasProgress");
    console.log(lastProgressId.value);

    if (item && item.id) {
        editingId.value = item.id;
        const normalizedItem = {
            id: item.id,
            paketProgressFisikId: item.paketProgressFisikId || item.paketProgressKeuanganId || props.paketId || props.paket?.id || "",
            monthNumber: Number(item.monthNumber) || 1,
            mingguKe: Number(item.mingguKe) || 1,
            monthName: item.monthName,
            planPercentage: item.planPercentage !== null && item.planPercentage !== undefined ? parseFloat(item.planPercentage) : null,
            actualPercentage: item.actualPercentage !== null && item.actualPercentage !== undefined ? parseFloat(item.actualPercentage) : null,
            actualNominal: item.actualNominal !== null && item.actualNominal !== undefined ? Number(item.actualNominal) : null,
            deviationFisik: item.deviationFisik !== null && item.deviationFisik !== undefined ? Number(item.deviationFisik) : null,
            status: item.status,
            keterangan: item.keterangan,
            tindakLanjut: item.tindakLanjut,
            tglLaporan: item.tglLaporan,
            fotoTipikal: item.fotoTipikal,
            fotoStreetMap: item.fotoStreetMap,
            fotoDokumentasi: item.fotoDokumentasi,
        };

        existingFotos.value = {
            fotoTipikal: item.fotoTipikal ? BASE_IMAGE_URL + item.fotoTipikal : null,
            fotoStreetMap: item.fotoStreetMap ? BASE_IMAGE_URL + item.fotoStreetMap : null,
            fotoDokumentasi: item.fotoDokumentasi ? BASE_IMAGE_URL + item.fotoDokumentasi : null,
        };

        console.log("existingFoto");
        console.log(existingFotos.value);

        originalData.value = { ...normalizedItem };
        formProgress.value = { ...normalizedItem };

        console.log("originalData");
        console.log(originalData.value);
        // selectedStatus.value = item.status || "Sesuai Target";
    } else {
        editingId.value = null;
        const defaultData = {
            id: null,
            paketProgressFisikId: props.paketId || props.paket?.id || "",
            monthNumber: 1,
            mingguKe: 1,
            monthName: "JANUARI",
            planPercentage: 0,
            actualPercentage: 0,
            actualNominal: 0,
            deviationFisik: 0,
            status: "Sesuai Target",
            keterangan: null,
            tindakLanjut:null,
            tglLaporan: "2026-08-25T00:00:00.000Z",
            fotoTipikal: null,
            fotoStreetMap: null,
            fotoDokumentasi: null,
        };
        originalData.value = { ...defaultData };
        formProgress.value = { ...defaultData };
        // selectedStatus.value = "Sesuai Target";
    }
    dateMonth.value = null;
    modalVisible.value = true;
};

// Expose openModal agar bisa dipanggil oleh komponen parent
defineExpose({
    openModal
});

watch(
    () => formProgress.value.actualNominal,
    (newActual) => {
        if (!modalVisible.value) return;

        const payload = getChangedPayload(originalData.value, formProgress.value);
        if (Object.hasOwn(payload, 'actualNominal')) {
            let nilaiKontrak = parseFloat(props.paket?.nilaiKontrak) || 0;
            const actual = parseFloat(payload.actualNominal) || 0;
            console.log("newActual", actual);

            if (props.paket?.nilaiKontrakAdendum !== null && props.paket?.nilaiKontrakAdendum !== undefined) {
                nilaiKontrak = parseFloat(props.paket?.nilaiKontrakAdendum) || 0;
            }

            if (nilaiKontrak && nilaiKontrak > 0) {


                const actualPercentage = (actual / nilaiKontrak) * 100;
                formProgress.value.actualPercentage = parseFloat(actualPercentage.toFixed(2));
                console.log("formPercentage", formProgress.value.actualPercentage);
            }
        }
    }
);


// Watcher untuk menghitung deviasi fisik otomatis: Deviasi = Progress Aktual (%) - Progress Rencana (%)
watch(
    () => [formProgress.value.actualPercentage, formProgress.value.planPercentage],
    ([actual, plan]) => {
        if (!modalVisible.value) return;

        const payload = getChangedPayload(originalData.value, formProgress.value);
        if (Object.hasOwn(payload, 'actualPercentage') || Object.hasOwn(payload, 'planPercentage')) {
            const actualVal = parseFloat(actual) || 0;
            const planVal = parseFloat(plan) || 0;
            const dev = actualVal - planVal;
            formProgress.value.deviationFisik = parseFloat(dev.toFixed(2));

            if (dev < 0) {
                selectedStatus.value = "Terlambat";
                formProgress.value.status = "Terlambat";
            } else if (dev > 0) {
                selectedStatus.value = "Lebih Cepat";
                formProgress.value.status = "Lebih Cepat";
            } else {
                selectedStatus.value = "Sesuai Target";
                formProgress.value.status = "Sesuai Target";
            }
        }
        console.log("formProgress.value.status", formProgress.value.status);

    }, { immediate: true }
);

const submitForm = async () => {
    console.log("lastPorgress", lastProgressId.value);
    try {
        isLoading.value = true;
        const targetId = props.paketId || props.paket?.id || formProgress.value.paketProgressFisikId;
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
            paketProgressFisikId: targetId,
            monthNumber: Number(formProgress.value.monthNumber) || 1,
            mingguKe: Number(formProgress.value.mingguKe) || 1,
            monthName: String(monthStr || formProgress.value.monthName || "JANUARI"),
            actualNominal: Number(formProgress.value.actualNominal) || 0,
            actualPercentage: Number(formProgress.value.actualPercentage) || 0,
            planPercentage: Number(formProgress.value.planPercentage) || 0,
            deviationFisik: Number(formProgress.value.deviationFisik) || 0,
            status: selectedStatus.value || formProgress.value.status || "Sesuai Target",
            keterangan: formProgress.value.keterangan,
            tindakLanjut: formProgress.value.tindakLanjut,
        };

        for (const key in formProgress.value) {
            if (key == 'id') {
                continue;
            }
            if (!fullPayload[key]) {
                fullPayload[key] = formProgress.value[key];
            }
        }


        console.log('fullPayload', fullPayload);

        const isUpdate = !!editingId.value;
        const payloadToSend = isUpdate ? getChangedPayload(originalData.value, fullPayload) : fullPayload;

        if (isUpdate && Object.keys(payloadToSend).length === 0) {
            console.log("Tidak ada perubahan data.");
            modalVisible.value = false;
            return;
        }

        const url = isUpdate
            ? `/progress-fisik/${editingId.value}`
            : `/progress-fisik`;

        console.log(`Submitting progress fisik (${isUpdate ? 'PUT' : 'POST'}) 🚀:`, payloadToSend);

        const response = isUpdate
            ? await api.put(url, payloadToSend, { headers: { "Content-Type": "multipart/form-data" } })
            : await api.post(url, payloadToSend, { headers: { "Content-Type": "multipart/form-data" } });

        let statusKondisiPaket = props.paket.statusKondisi;
        console.log("response");
        console.log(response);

        if (isUpdate && lastProgressId.value !== editingId.value) {
            modalVisible.value = false;
            emit("saved", response.data.data);
            return;
        }


        if (formProgress.value.planPercentage <= 70) {
            // PERIODE I (Target 0% - 70%)
            statusKondisiPaket = 'aman'
            if (formProgress.value.deviationFisik <= 0 && formProgress.value.deviationFisik > -10) {
                statusKondisiPaket = 'perhatian'; // Deviasi lebih buruk dari -10%
                console.log('perhatian status');

            } else if (formProgress.value.deviationFisik < -10) {
                statusKondisiPaket = 'kritis'; // Deviasi antara -0.1% s/d -10%
                console.log('kritis status');

            }
        } else if (formProgress.value.planPercentage > 70 && formProgress.value.planPercentage <= 100) {
            // PERIODE II & III (Target > 70%)
            statusKondisiPaket = 'aman'
            if (formProgress.value.deviationFisik <= 0 && formProgress.value.deviationFisik > -5) {
                statusKondisiPaket = 'perhatian'; // Lintas tahun anggaran
            } else if (formProgress.value.deviationFisik < -5) {
                statusKondisiPaket = 'kritis'; // Deviasi lebih buruk dari -5%
            }
        }

        let isUpdatedPaket = props.paket.statusProgress
        let nextInputFisik = props.paket.nextInputFisik
        let futureNextInput = new Date(props.paket?.nextInputFisik)
        const today = new Date()
        // 1. Get the current day of the week (0 = Sunday, 6 = Saturday)
        const dayOfWeek = today.getDay();

        // 2. Calculate the difference to reach Saturday (6)
        const distanceToSaturday = 6 - dayOfWeek;

        // 3. Set the date to Saturday of this week
        const initNextInput = new Date(today);
        initNextInput.setDate(today.getDate() + distanceToSaturday);
        // CHECK NEXT INPUT FISIK
        if (nextInputFisik) {
            futureNextInput.setDate(futureNextInput.getDate() + 7)
        } else {
            futureNextInput = initNextInput
        }

        console.log('future', futureNextInput.toDateString())
        console.log("isPaketUpdated", statusKondisiPaket);
        console.log(statusKondisiPaket, "statusKondisiPaket");
        const updatePaketStatus = await api.put(`/paket/${props.paket?.id}`, { statusKondisi: statusKondisiPaket, nextInputFisik: futureNextInput });

        console.log(updatePaketStatus, "updatePaketStatus");

        console.log("Progress Fisik berhasil disimpan 🚀:", response.data);
        modalVisible.value = false;
        emit("saved", response.data.data);
    } catch (error) {

        console.error("Error submitting progress fisik:", error.response?.data || error.message);
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
                            {{ isEditMode ? 'Edit Laporan Progres Fisik' : 'Tambah Laporan Progres Fisik' }}
                        </h3>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
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
                                <!-- <input v-if="isEditMode && !dateMonth" type="text" v-model="formProgress.monthName"
                                    class="w-full bg-slate-50 text-sm font-bold text-blue-950 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                    placeholder="Contoh: JANUARI"> -->
                                <Select v-model="formProgress.monthName" :options="monthName" optionLabel="label"
                                    optionValue="value" placeholder="Pilih Bulan"
                                    :pt="{ root: 'w-full! bg-slate-50! text-sm! font-bold! text-blue-950! rounded-xl! px-2! py-[3px]! border-none! shadow-none! focus:ring-2! focus:ring-orange-500! focus:outline-none! cursor-pointer' }" />
                                <!-- <DatePicker v-else fluid="true" v-model="dateMonth" view="month" dateFormat="MM"
                                    :manualInput="false"
                                    input-class="w-full! bg-slate-50! text-sm! font-bold! text-blue-950! rounded-xl! px-4! py-3! border-none! shadow-none! focus:ring-2! focus:ring-orange-500! focus:outline-none!" /> -->
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
                                <Select v-model="formProgress.status" :options="statusOptions" optionLabel="label"
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
                            <div class="col-span-1">
                                <label
                                    class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nominal
                                </label>
                                <InputNumber placeholder="Masukkan Nominal" name="actualNominal"
                                    v-model="formProgress.actualNominal" :minFractionDigits="2" :maxFractionDigits="2"
                                    mode="currency" currency="IDR" locale="id-ID" class="w-full"
                                    input-class="w-full! bg-slate-50! text-sm! font-bold! text-blue-950! rounded-xl! px-4! py-3! border-none! focus:ring-2! focus:ring-orange-500! focus:outline-none!" />
                                <!-- <input type="number" v-model="formProgress.actualNominal"
                                    class="w-full bg-slate-50 text-sm font-bold text-blue-950 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none"> -->
                            </div>
                            <!-- <div>
                                <label
                                    class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nilai
                                    Adendum (Rp)</label>
                                <input type="number" v-model="formProgress.nilaiAdendum"
                                    class="w-full bg-slate-50 text-sm font-bold text-blue-950 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none">
                            </div>
                            -->
                            <div class="grid grid-cols-2 gap-3">


                                <div class="col-span-1">
                                    <label
                                        class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Progress
                                        Rencana</label>
                                    <InputNumber id="planPercentage" v-model="formProgress.planPercentage"
                                        mode="decimal" :minFractionDigits="0" :maxFractionDigits="2" suffix="%"
                                        input-class="w-full! bg-slate-50! text-sm! font-bold! text-blue-950! rounded-xl!
                                    px-4! py-3! border-none! focus:ring-2! focus:ring-orange-500! focus:outline-none!" />

                                </div>


                                <div class="col-span-1">
                                    <label
                                        class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Progress
                                        Aktual</label>
                                    <InputNumber id="actualPercentage" v-model="formProgress.actualPercentage"
                                        mode="decimal" :minFractionDigits="0" :maxFractionDigits="2" suffix="%"
                                        input-class="w-full! bg-slate-50! text-sm! font-bold! text-blue-950! rounded-xl! px-4! py-3! border-none! focus:ring-2! focus:ring-orange-500! focus:outline-none!" />
                                </div>
                            </div>

                            <div>
                                <label
                                    class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Deviasi
                                    (%)</label>
                                <InputNumber id="deviationFisik" v-model="formProgress.deviationFisik" mode="decimal"
                                    :minFractionDigits="0" :maxFractionDigits="2" suffix="%" class="w-full" input-class="w-full! bg-slate-50! text-sm! font-bold! text-blue-950! rounded-xl! px-4!
                                py-3! border-none! focus:ring-2! focus:ring-orange-500! focus:outline-none!" />

                            </div>
                            <!-- <div>
                                <label
                                    class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Deviasi
                                    Keuangan</label>
                                <input type="text" readonly v-model="formProgress.deviationFinance"
                                    class="w-full bg-red-50 text-sm font-bold text-red-600 rounded-xl px-4 py-3 border-none focus:outline-none">
                            </div> -->

                            <div class="md:col-span-3">
                                <div class="grid grid-cols-2 gap-3">
                                    <div class="col-start-1 col-end-2">

                                        <label
                                            class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Keterangan
                                            / Kendala</label>
                                        <textarea rows="2" :required="formProgress.status == 'Terlambat'"
                                            v-model="formProgress.keterangan"
                                            class="w-full bg-slate-50 text-sm font-medium text-blue-950 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
                                            placeholder="Tuliskan keterangan laporan..."></textarea>
                                    </div>
                                    <div class="col-start-2 col-end-3">

                                        <label
                                            class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tindak Lanjut</label>
                                        <textarea rows="2" :required="formProgress.status == 'Terlambat'"
                                            v-model="formProgress.tindakLanjut"
                                            class="w-full bg-slate-50 text-sm font-medium text-blue-950 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
                                            placeholder="Tuliskan keterangan tindak lanjut..."></textarea>
                                    </div>
                                    <!-- <Message severity="error" size="small" variant="simple"
                                        v-if="formProgress.status == 'Terlambat'">Harap isi keterangan / kendala
                                    </Message> -->
                                </div>
                            </div>
                            <div class="md:col-span-3 flex flex-row justify-center">
                                <ImageUpload v-model="formProgress.fotoTipikal" label="Tipikal Potongan Melintang"
                                    :isEditMode="isEditMode" :existing-url="existingFotos.fotoTipikal" />
                                <ImageUpload v-model="formProgress.fotoStreetMap" label="Street Map"
                                    :isEditMode="isEditMode" :existing-url="existingFotos.fotoStreetMap" />
                                <ImageUpload v-model="formProgress.fotoDokumentasi" label="Dokumentasi"
                                    :isEditMode="isEditMode" :existing-url="existingFotos.fotoDokumentasi" />
                            </div>
                        </div>

                        <!-- ACTION BUTTONS -->
                        <div class="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                            <button type="button" @click="closeCallback"
                                class="px-8 py-3.5 rounded-full text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors">
                                Batal
                            </button>
                            <button v-if="isVisibleSubmitUpdate || !isEditMode" type="submit" :disabled="isLoading"
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
