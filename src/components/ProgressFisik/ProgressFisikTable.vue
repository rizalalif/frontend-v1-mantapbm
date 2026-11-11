<template>
    <div class="bg-white rounded-[24px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col">
        <!-- TOP CONTROLS, CONTRACT INFO & FILTERS -->
        <div class="p-6 border-b border-slate-50 flex justify-between items-center gap-4 flex-wrap">
            <!-- 1. Filters (Status & Bulan) -->
            <div class="flex items-center gap-3 flex-wrap">
                <Select v-model="selectedStatus" :options="statusOptions" optionLabel="label" optionValue="value"
                    placeholder="Pilih status"
                    :pt="{ root: { class: 'bg-slate-50! text-sm! font-semibold! text-slate-600! rounded-full! px-2! border-none! focus:ring-2! focus:ring-orange-500! focus:outline-none! cursor-pointer! appearance-none! relative!' } }" />
                <Select v-model="selectedMonth" :options="monthNames" optionLabel="label" optionValue="value"
                    placeholder="Pilih bulan"
                    :pt="{ root: { class: 'bg-slate-50! text-sm! font-semibold! text-slate-600! rounded-full! px-2! border-none! focus:ring-2! focus:ring-orange-500! focus:outline-none! cursor-pointer! appearance-none! relative!' } }" />
            </div>

            <!-- 2. Contract Info (Diletakkan di antara Filter dan Tombol Action) -->
            <div v-if="effectivePaketId && hasLoaded"
                class="flex items-center gap-4 flex-wrap bg-slate-50/80 px-4 py-2 rounded-xl border border-slate-100 text-xs">
                <div class="text-slate-500">
                    <span class="font-medium text-slate-400 uppercase text-[10px] tracking-wider block">Kontrak
                        Awal</span>
                    <span class="font-bold text-blue-950">Rp {{ formatRupiah(groupedMeta.nilaiKontrakAwal) }}</span>
                </div>
                <div class="h-6 w-px bg-slate-200 hidden sm:block"></div>
                <div>
                    <span class="font-medium text-slate-400 uppercase text-[10px] tracking-wider block">Kontrak
                        Terkini</span>
                    <span class="font-bold" :class="groupedMeta.adendumAktifId ? 'text-orange-600' : 'text-blue-950'">
                        Rp {{ formatRupiah(groupedMeta.nilaiKontrakTerkini) }}
                    </span>
                </div>
                <div v-if="isBackgroundRefreshing"
                    class="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 animate-pulse pl-1">
                    <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                </div>
            </div>

            <!-- 3. Actions (Export & Tambah) -->
            <div class="flex items-center gap-3 flex-wrap">
                <button @click="handleExportExcel"
                    class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full shadow-sm text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer">
                    <FileExcel :size="40" />
                    Export
                </button>

                <button @click="openAddModal"
                    class="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-2.5 px-6 rounded-full flex items-center gap-2 transition-colors shadow-md shadow-orange-500/20 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4">
                        </path>
                    </svg>
                    Tambah
                </button>
            </div>
        </div>

        <!-- STATE LOADING (Skeleton DataTable seperti di PaketPekerjaan.vue) -->
        <div v-if="isLoading" class="p-4">
            <DataTable :value="[1, 2, 3, 4]" :pt="{
                table: { class: 'w-full text-xs text-left text-slate-600 border-collapse table-fixed' },
                thead: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 border-b border-slate-200' },
                tbody: { class: 'divide-y divide-slate-100' },
                bodyRow: { class: 'border-b! border-slate-50/70!' }
            }">
                <Column header="Periode" style="width: 15%;"><template #body>
                        <Skeleton width="70%" />
                    </template>
                </Column>
                <Column header="Bulan" style="width: 12%;"><template #body>
                        <Skeleton width="60%" />
                    </template></Column>
                <Column header="Nominal Progress" style="width: 18%;"><template #body>
                        <Skeleton width="80%" />
                    </template></Column>
                <Column header="Progress Rencana" style="width: 12%;"><template #body>
                        <Skeleton width="50%" class="mx-auto" />
                    </template></Column>
                <Column header="Progress Aktual" style="width: 12%;"><template #body>
                        <Skeleton width="50%" class="mx-auto" />
                    </template>
                </Column>
                <Column header="Deviasi" style="width: 10%;"><template #body>
                        <Skeleton width="45%" class="mx-auto" />
                    </template>
                </Column>
                <Column header="Status" style="width: 13%;"><template #body>
                        <Skeleton width="75%" class="mx-auto" />
                    </template></Column>
                <Column header="" style="width: 8%;"><template #body>
                        <Skeleton width="40%" class="mx-auto" />
                    </template></Column>
            </DataTable>
        </div>

        <!-- STATE ERROR DENGAN TOMBOL COBA LAGI -->
        <div v-else-if="isError" class="p-8 text-center my-4 bg-red-50/70 rounded-2xl border border-red-100 mx-4">
            <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h4 class="text-slate-800 font-bold text-sm mb-1">Gagal Memuat Progres Fisik</h4>
            <p class="text-xs text-slate-500 mb-4 max-w-md mx-auto">{{ errorMessage }}</p>
            <button @click="fetchGroupedProgressFisik({ showSkeleton: true })"
                class="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer">
                Coba Lagi
            </button>
        </div>

        <!-- STATE TABEL ACCORDION GROUPING (Mengacu pada PaketPekerjaan.vue) -->
        <div v-else class="overflow-x-auto p-2">
            <DataTable :value="flattenedGroupedItems" dataKey="_rowKey" rowGroupMode="subheader" groupRowsBy="faseKe"
                sortMode="single" sortField="faseKe" :sortOrder="1" expandableRowGroups
                v-model:expandedRowGroups="expandedRowGroups" @row-click="handleRowClick"
                class="table-group-custom w-full"
                :rowClass="(data) => data.canEdit === false ? 'bg-slate-50/40! text-slate-600 hover:bg-slate-100/70! transition-colors! border-b! border-slate-50/70! cursor-pointer!' : 'hover:bg-slate-50/70! transition-colors! border-b! border-slate-50/70! cursor-pointer!'"
                :pt="{
                    table: { class: 'w-full text-xs text-left text-slate-600 border-collapse table-fixed' },
                    thead: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 border-b border-slate-200' },
                    tbody: { class: 'divide-y divide-slate-100' },
                    rowGroupHeaderCell: { colspan: 8, class: 'p-0! bg-slate-50/90! hover:bg-slate-100/90! transition-colors! relative! border-b! border-slate-200!' },
                    rowGroupToggler: { class: 'absolute! left-2! top-1/2! -translate-y-1/2! z-10! w-6! h-6! inline-flex! items-center! justify-center! text-blue-600 hover:text-blue-800 cursor-pointer!' }
                }">

                <!-- 1. PERIODE (15%) -->
                <Column field="periode" header="Periode" style="width: 15%;" :pt="{
                    columnHeaderContent: { class: 'p-3! justify-center!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center!' }
                }">
                    <template #body="slotProps">
                        <div
                            class="py-3 px-2 text-center font-bold text-blue-950 flex items-center justify-center gap-1.5">
                            <span>{{ slotProps.data.periode }}</span>
                            <span v-if="slotProps.data.canEdit === false"
                                class="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-semibold"
                                title="Data arsip dari fase kontrak asal (klik untuk lihat detail, hanya baca)">
                                Arsip
                            </span>
                        </div>
                    </template>
                </Column>

                <!-- 2. BULAN (12%) -->
                <Column field="bulan" header="Bulan" style="width: 12%;" :pt="{
                    columnHeaderContent: { class: 'p-3! justify-center!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center!' }
                }">
                    <template #body="slotProps">
                        <div class="py-3 px-2 text-center font-semibold text-blue-950">
                            {{ slotProps.data.bulan }}
                        </div>
                    </template>
                </Column>

                <!-- 3. NOMINAL PROGRESS (18%) -->
                <Column field="nominalProgress" header="Nominal Progress" style="width: 18%;" :pt="{
                    columnHeaderContent: { class: 'p-3! justify-end!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider text-right!' }
                }">
                    <template #body="slotProps">
                        <div
                            class="py-3 px-3 font-semibold text-right text-blue-950 flex justify-between items-center w-full">
                            <span class="text-slate-400 text-xs">Rp</span>
                            <span>{{ formatRupiah(slotProps.data.nominalProgress) }}</span>
                        </div>
                    </template>
                </Column>

                <!-- 4. PROGRESS RENCANA (12%) -->
                <Column field="progressRencana" header="Progress Rencana" style="width: 12%;" :pt="{
                    columnHeaderContent: { class: 'p-3! justify-center!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center!' }
                }">
                    <template #body="slotProps">
                        <div class="py-3 text-center font-bold text-blue-950">
                            {{ slotProps.data.progressRencana }}%
                        </div>
                    </template>
                </Column>

                <!-- 5. PROGRESS AKTUAL (12%) -->
                <Column field="progressAktual" header="Progress Aktual" style="width: 12%;" :pt="{
                    columnHeaderContent: { class: 'p-3! justify-center!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center!' }
                }">
                    <template #body="slotProps">
                        <div class="py-3 text-center font-bold text-blue-950">
                            {{ slotProps.data.progressAktual }}%
                        </div>
                    </template>
                </Column>

                <!-- 6. DEVIASI (10%) -->
                <Column field="deviasi" header="Deviasi" style="width: 10%;" :pt="{
                    columnHeaderContent: { class: 'p-3! justify-center!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center!' }
                }">
                    <template #body="slotProps">
                        <div class="py-3 text-center font-bold"
                            :class="Number(slotProps.data.deviasi) < 0 ? 'text-red-500' : 'text-emerald-500'">
                            {{ Number(slotProps.data.deviasi) > 0 ? '+' : '' }}{{ slotProps.data.deviasi }}%
                        </div>
                    </template>
                </Column>

                <!-- 7. STATUS (13%) -->
                <Column field="status" header="Status" style="width: 13%;" :pt="{
                    columnHeaderContent: { class: 'p-3! justify-center!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center!' }
                }">
                    <template #body="slotProps">
                        <div class="py-3 text-center">
                            <span :class="getStatusBadgeClass(slotProps.data.status)"
                                class="inline-block truncate max-w-full">
                                {{ slotProps.data.status || 'Sesuai Target' }}
                            </span>
                        </div>
                    </template>
                </Column>

                <!-- 8. AKSI (8%) -->
                <Column header="" style="width: 8%;" :pt="{
                    columnHeaderContent: { class: 'p-3! justify-center!' },
                    columnTitle: { class: 'text-center!' }
                }">
                    <template #body="slotProps">
                        <div class="py-3 flex justify-center items-center" @click.stop>
                            <DeleteModal v-if="slotProps.data.canDelete !== false" title="Hapus Progress fisik"
                                deskripsi="Apakah Anda yakin ingin menghapus laporan progres fisik periode ini?"
                                :action-hapus="() => deleteProgress(slotProps.data.id)" />
                            <div v-else class="flex items-center gap-1">
                                <button type="button" @click="openEditModal(slotProps.data)"
                                    class="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                                    title="Lihat Detail (Arsip)">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                                <span class="text-slate-300 p-1 cursor-not-allowed"
                                    title="Data arsip dari fase kontrak asal hanya dapat dihapus pada grup asalnya">
                                    <svg class="w-4 h-4 text-slate-300" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </template>
                </Column>

                <!-- CUSTOM GROUP HEADER (ACCORDION SUBHEADER - Persis Pola PaketPekerjaan.vue) -->
                <template #groupheader="slotProps">
                    <div @click="onGroupHeaderClick($event, slotProps.data._groupMeta.faseKe)"
                        class="w-full flex items-center py-4 cursor-pointer select-none transition-colors">

                        <!-- Col 1 + 2 (15% + 12% = 27%): Ruang pl-10 untuk tombol Chevron PrimeVue -->
                        <div class="w-[27%] pl-10 pr-2 flex flex-col min-w-0 shrink-0 gap-0.5">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="font-extrabold text-blue-950 text-xs uppercase tracking-wide truncate">
                                    {{ slotProps.data._groupMeta.namaGrup }}
                                </span>
                                <span v-if="slotProps.data._groupMeta.isActiveGroup"
                                    class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[9px] font-bold uppercase tracking-wider">
                                    Aktif
                                </span>
                                <span
                                    class="px-2 py-0.5 bg-slate-200/70 text-slate-600 rounded-full text-[9px] font-bold">
                                    {{ slotProps.data._groupMeta.totalBaris }} baris
                                </span>
                            </div>
                            <div class="text-[10px] font-semibold text-slate-500 truncate">
                                <span v-if="slotProps.data._groupMeta.noAdendum">{{ slotProps.data._groupMeta.noAdendum
                                    }} • </span>
                                Kontrak: Rp {{ formatRupiah(slotProps.data._groupMeta.nilaiKontrakAcuan) }}
                            </div>
                        </div>

                        <!-- Col 3 (18%): Total Nominal Progress Grup -->
                        <div
                            class="w-[18%] px-3 font-extrabold text-xs text-blue-950 flex justify-between items-center shrink-0">
                            <span class="text-slate-400 text-xs">Rp</span>
                            <span>{{ formatRupiah(slotProps.data._groupMeta.summaryNominal) }}</span>
                        </div>

                        <!-- Col 4 (12%): Progress Rencana Kumulatif Grup -->
                        <div class="w-[12%] px-2 font-extrabold text-xs text-center text-blue-950 shrink-0">
                            {{ slotProps.data._groupMeta.summaryRencana }}%
                        </div>

                        <!-- Col 5 (12%): Progress Aktual Kumulatif Grup -->
                        <div class="w-[12%] px-2 font-extrabold text-xs text-center text-blue-950 shrink-0">
                            {{ slotProps.data._groupMeta.summaryAktual }}%
                        </div>

                        <!-- Col 6 (10%): Deviasi Kumulatif Grup -->
                        <div class="w-[10%] px-2 font-extrabold text-xs text-center shrink-0"
                            :class="slotProps.data._groupMeta.summaryDeviasi < 0 ? 'text-red-500' : 'text-emerald-500'">
                            {{ slotProps.data._groupMeta.summaryDeviasi > 0 ? '+' : '' }}{{
                                slotProps.data._groupMeta.summaryDeviasi }}%
                        </div>

                        <!-- Col 7 + 8 (13% + 8% = 21%): Status Terakhir Grup -->
                        <div class="w-[13%] px-3 flex justify-center items-center shrink-0">
                            <span :class="getStatusBadgeClass(slotProps.data._groupMeta.summaryStatus)"
                                class="inline-block truncate max-w-full">
                                {{ slotProps.data._groupMeta.summaryStatus }}
                            </span>
                        </div>
                    </div>
                </template>

                <!-- EMPTY STATE JIKA BELUM ADA DATA -->
                <template #empty>
                    <div class="text-center py-12 text-slate-400 text-sm font-medium">
                        Belum ada riwayat laporan progres fisik untuk paket ini.
                    </div>
                </template>
            </DataTable>
        </div>

        <!-- MODAL REUSABLE UNTUK TAMBAH & EDIT -->
        <ProgressFisikModal ref="modalRef" :paket-id="effectivePaketId" :paket="paket"
            :nilai-kontrak-aktif="groupedMeta.nilaiKontrakTerkini" @saved="getProgress" />
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import api from '@/services/api';
import { useAuth } from '@/lib/Auth';
import DeleteModal from '@/components/utils/DeleteModal.vue';
import ProgressFisikModal from './ProgressFisikModal.vue';
import { FileExcel } from '@primeicons/vue';
import { generateExcel } from '@/lib/Helper.js';
import { useToast } from 'primevue';

const auth = useAuth();
const emit = defineEmits(['refresh', 'submit-success']);
const toast = useToast();

const props = defineProps({
    progressList: {
        type: Array,
        default: () => []
    },
    isVisibleHeader: [Boolean, String],
    paket: Object,
    paketId: String,
    isActive: {
        type: Boolean,
        default: false
    }
});

const effectivePaketId = computed(() => props.paketId || props.paket?.id || null);

// State Lazy Loading & Grouping
const isLoading = ref(false);
const isBackgroundRefreshing = ref(false);
const isError = ref(false);
const errorMessage = ref('');
const hasLoaded = ref(false);

const groupedMeta = ref({
    paketId: null,
    namaPaket: '',
    nilaiKontrakAwal: 0,
    nilaiKontrakTerkini: 0,
    adendumAktifId: null
});
const apiGroups = ref([]);
const expandedRowGroups = ref([]);

// Opsi Filter
const statusOptions = ref([
    { label: "Semua Status", value: "all" },
    { label: "Sesuai Target", value: "sesuai" },
    { label: "Lebih Cepat", value: "Lebih Cepat" },
    { label: "Terlambat", value: "Terlambat" },
    { label: "Kritis", value: "Kritis" },
]);
const selectedStatus = ref(null);

const monthNames = ref([
    { label: "Semua Bulan", value: "all" },
    { label: "Januari", value: "Januari" },
    { label: "Februari", value: "Februari" },
    { label: "Maret", value: "Maret" },
    { label: "April", value: "April" },
    { label: "Mei", value: "Mei" },
    { label: "Juni", value: "Juni" },
    { label: "Juli", value: "Juli" },
    { label: "Agustus", value: "Agustus" },
    { label: "September", value: "September" },
    { label: "Oktober", value: "Oktober" },
    { label: "November", value: "November" },
    { label: "Desember", value: "Desember" },
]);
const selectedMonth = ref(null);

const modalRef = ref(null);

// 1. FUNGSI FETCH GROUPED DATA DARI ENDPOINT BARU (LAZY LOAD)
const fetchGroupedProgressFisik = async ({ showSkeleton = false } = {}) => {
    if (!effectivePaketId.value) return;

    if (showSkeleton) {
        isLoading.value = true;
    } else {
        isBackgroundRefreshing.value = true;
    }
    isError.value = false;
    errorMessage.value = '';

    try {
        const res = await api.get(`/paket/${effectivePaketId.value}/progress-fisik`);
        const payload = res.data?.data;

        if (payload) {
            groupedMeta.value = {
                paketId: payload.paketId,
                namaPaket: payload.namaPaket || '',
                nilaiKontrakAwal: Number(payload.nilaiKontrakAwal ?? 0),
                nilaiKontrakTerkini: Number(payload.nilaiKontrakTerkini ?? 0),
                adendumAktifId: payload.adendumAktifId ?? null
            };

            const nextGroups = Array.isArray(payload.groups) ? payload.groups : [];
            const prevGroupFases = new Set(apiGroups.value.map(g => g.faseKe));
            apiGroups.value = nextGroups;

            if (!hasLoaded.value) {
                // Initial load: expand grup aktif (atau grup dengan faseKe terbesar)
                const activeGroup = nextGroups.find(
                    g => groupedMeta.value.adendumAktifId
                        ? g.riwayatAdendumId === groupedMeta.value.adendumAktifId
                        : g.faseKe === 0
                ) || nextGroups[nextGroups.length - 1];

                expandedRowGroups.value = activeGroup ? [activeGroup.faseKe] : [];
            } else {
                // Refresh berikutnya: pertahankan grup yang masih valid + buka grup baru jika ada
                const validFaseSet = new Set(nextGroups.map(g => g.faseKe));
                const preserved = expandedRowGroups.value.filter(f => validFaseSet.has(f));
                const newlyAddedFases = nextGroups
                    .filter(g => !prevGroupFases.has(g.faseKe))
                    .map(g => g.faseKe);
                expandedRowGroups.value = [...new Set([...preserved, ...newlyAddedFases])];
            }

            hasLoaded.value = true;
        }
    } catch (err) {
        console.error('Error fetching grouped progress fisik:', err);
        isError.value = true;
        errorMessage.value = err.response?.data?.message || err.message || 'Gagal memuat data progres fisik.';
    } finally {
        isLoading.value = false;
        isBackgroundRefreshing.value = false;
    }
};

// Reset state saat berpindah ke paket lain
watch(() => effectivePaketId.value, (newId, oldId) => {
    if (newId !== oldId) {
        hasLoaded.value = false;
        apiGroups.value = [];
        expandedRowGroups.value = [];
        groupedMeta.value = {
            paketId: null,
            namaPaket: '',
            nilaiKontrakAwal: 0,
            nilaiKontrakTerkini: 0,
            adendumAktifId: null
        };
    }
});

// Lazy Load Watcher: fetch HANYA jika tab sedang aktif dan paketId sudah ada
watch(
    () => [props.isActive, effectivePaketId.value],
    ([active, id]) => {
        if (active && id) {
            fetchGroupedProgressFisik({ showSkeleton: !hasLoaded.value });
        }
    },
    { immediate: true }
);

// Fallback untuk penggunaan standalone di ProgressFisik.vue (tanpa paketId)
const activeSourceGroups = computed(() => {
    if (effectivePaketId.value) {
        return apiGroups.value;
    }

    // Fallback mode jika props.progressList diberikan langsung tanpa paketId
    if (!props.progressList || !Array.isArray(props.progressList) || props.progressList.length === 0) {
        return [];
    }

    const sortedList = [...props.progressList].sort((a, b) => {
        const mA = Number(a?.monthNumber) || 0;
        const mB = Number(b?.monthNumber) || 0;
        if (mA !== mB) return mA - mB;
        const wA = Number(a?.mingguKe) || 0;
        const wB = Number(b?.mingguKe) || 0;
        return wA - wB;
    });

    let runningActual = 0;
    let runningPlan = 0;
    let runningNominal = 0;

    const items = sortedList.map(item => {
        const nominal = Number(item?.actualNominal ?? item?.nominalProgress ?? 0);
        runningNominal += nominal;
        runningActual += Number(item?.actualPercentage ?? 0);
        runningPlan += Number(item?.planPercentage ?? 0);
        const deviasi = parseFloat((runningActual - runningPlan).toFixed(2));

        return {
            id: item?.id,
            riwayatAdendumId: null,
            periode: `B-${item?.monthNumber || 1} / M-${item?.mingguKe || 1}`,
            bulan: item?.monthName || item?.bulan || 'JANUARI',
            monthNumber: Number(item?.monthNumber) || 1,
            mingguKe: Number(item?.mingguKe) || 1,
            nominalProgress: nominal,
            nominalKumulatif: runningNominal,
            progressRencana: parseFloat(runningPlan.toFixed(2)),
            progressAktual: parseFloat(runningActual.toFixed(2)),
            deviasi,
            status: item?.status || 'Sesuai Target',
            keterangan: item?.keterangan,
            tindakLanjut: item?.tindakLanjut,
            tglLaporan: item?.tglLaporan,
            documentations: item?.documentations || [],
            canDelete: true,
            canEdit: true
        };
    });

    return [
        {
            faseKe: 0,
            riwayatAdendumId: null,
            namaGrup: 'Riwayat Progress Fisik',
            noAdendum: props.paket?.noKontrak || null,
            tglAdendum: null,
            nilaiKontrakAcuan: Number(props.paket?.nilaiKontrak ?? 0),
            totalBaris: items.length,
            items
        }
    ];
});

// FLATTENING DATA UNTUK PRIMEVUE DATATABLE (RowGroup Subheader)
const flattenedGroupedItems = computed(() => {
    const rawGroups = activeSourceGroups.value || [];
    const flattened = [];

    rawGroups.forEach(group => {
        const items = Array.isArray(group.items) ? group.items : [];

        // Filter status & bulan per grup
        const filteredItems = items.filter(item => {
            if (!item) return false;

            let matchStatus = true;
            if (selectedStatus.value && selectedStatus.value !== 'all') {
                const itemStatus = String(item.status || '').toLowerCase();
                const filterVal = String(selectedStatus.value).toLowerCase();

                if (filterVal === 'sesuai' || filterVal === 'sesuai target') {
                    matchStatus = itemStatus === 'sesuai' || itemStatus === 'sesuai target';
                } else {
                    matchStatus = itemStatus === filterVal;
                }
            }

            let matchMonth = true;
            if (selectedMonth.value && selectedMonth.value !== 'all') {
                matchMonth = String(item.bulan || '').toLowerCase() === String(selectedMonth.value).toLowerCase();
            }

            return matchStatus && matchMonth;
        });

        if (filteredItems.length === 0) {
            return;
        }

        // Ringkasan untuk baris groupheader
        const summaryNominal = filteredItems.reduce((acc, it) => acc + (Number(it.nominalProgress) || 0), 0);
        const lastVisible = filteredItems[filteredItems.length - 1];
        const summaryRencana = Number(lastVisible?.progressRencana ?? 0);
        const summaryAktual = Number(lastVisible?.progressAktual ?? 0);
        const summaryDeviasi = Number(lastVisible?.deviasi ?? 0);
        const summaryStatus = lastVisible?.status || 'Sesuai';
        const isActiveGroup = groupedMeta.value.adendumAktifId
            ? group.riwayatAdendumId === groupedMeta.value.adendumAktifId
            : group.faseKe === 0;

        const groupMeta = {
            faseKe: group.faseKe,
            riwayatAdendumId: group.riwayatAdendumId,
            namaGrup: group.namaGrup,
            noAdendum: group.noAdendum,
            tglAdendum: group.tglAdendum,
            nilaiKontrakAcuan: Number(group.nilaiKontrakAcuan ?? 0),
            totalBaris: filteredItems.length,
            isActiveGroup,
            summaryNominal,
            summaryRencana,
            summaryAktual,
            summaryDeviasi,
            summaryStatus
        };

        filteredItems.forEach(item => {
            flattened.push({
                ...item,
                _rowKey: `${group.faseKe}-${item.id}`,
                faseKe: group.faseKe,
                _rawGroupItems: group.items,
                _groupMeta: groupMeta
            });
        });
    });

    return flattened;
});

// Auto-expand grup saat ada filter yang aktif agar data langsung terlihat
watch([selectedStatus, selectedMonth], ([st, mo]) => {
    if ((st && st !== 'all') || (mo && mo !== 'all')) {
        const matchingFases = [...new Set(flattenedGroupedItems.value.map(it => it.faseKe))];
        expandedRowGroups.value = matchingFases;
    }
});

// HANDLER ACCORDION TOGGLE
const toggleGroup = (faseKe) => {
    const exists = expandedRowGroups.value.includes(faseKe);
    if (exists) {
        expandedRowGroups.value = expandedRowGroups.value.filter(f => f !== faseKe);
    } else {
        expandedRowGroups.value = [...expandedRowGroups.value, faseKe];
    }
};

const onGroupHeaderClick = (event, faseKe) => {
    if (event?.target?.closest('.p-datatable-row-toggle-button')) {
        return;
    }
    toggleGroup(faseKe);
};

// HANDLER ROW CLICK & EDIT/DETAIL MODAL
const handleRowClick = (event) => {
    const row = event?.data;
    if (!row) return;
    openEditModal(row);
};

const openAddModal = () => {
    if (modalRef.value) {
        modalRef.value.openModal(null);
    }
};

const openEditModal = (progress) => {
    if (!modalRef.value || !progress) return;

    const isReadOnly = progress.canEdit === false;
    const groupName = progress._groupMeta?.namaGrup || '';

    // Prioritas 1: Ambil data mentah dari props.paket.progressFisiks agar weekly planPercentage akurat
    const rawDbRecord = props.paket?.progressFisiks?.find(p => p.id === progress.id);
    const nilaiKontrakFase = progress._groupMeta?.nilaiKontrakAcuan ?? groupedMeta.value.nilaiKontrakTerkini;

    if (rawDbRecord) {
        modalRef.value.openModal({
            ...rawDbRecord,
            _nilaiKontrakFase: nilaiKontrakFase,
            _isReadOnly: isReadOnly,
            _groupName: groupName
        });
        return;
    }

    // Prioritas 2 (Fallback): Hitung selisih delta mingguan terhadap baris sebelumnya
    const groupItems = progress._rawGroupItems || [];
    const idx = groupItems.findIndex(it => it.id === progress.id);
    const prevItem = idx > 0 ? groupItems[idx - 1] : null;

    const weeklyPlan = prevItem
        ? parseFloat(((Number(progress.progressRencana) || 0) - (Number(prevItem.progressRencana) || 0)).toFixed(2))
        : Number(progress.progressRencana) || 0;

    const weeklyActualPct = nilaiKontrakFase > 0
        ? parseFloat((((Number(progress.nominalProgress) || 0) / nilaiKontrakFase) * 100).toFixed(2))
        : Number(progress.progressAktual) || 0;

    modalRef.value.openModal({
        ...progress,
        monthName: progress.monthName || progress.bulan,
        actualNominal: progress.actualNominal ?? progress.nominalProgress,
        planPercentage: weeklyPlan,
        actualPercentage: weeklyActualPct,
        deviationFisik: parseFloat((weeklyActualPct - weeklyPlan).toFixed(2)),
        keterangan: progress.keterangan ?? null,
        tindakLanjut: progress.tindakLanjut ?? null,
        tglLaporan: progress.tglLaporan ?? null,
        fotoTipikal: progress.fotoTipikal ?? null,
        fotoStreetMap: progress.fotoStreetMap ?? null,
        documentations: progress.documentations ?? [],
        _nilaiKontrakFase: nilaiKontrakFase,
        _isReadOnly: isReadOnly,
        _groupName: groupName
    });
};

const getProgress = async () => {
    await fetchGroupedProgressFisik({ showSkeleton: false });
    emit('refresh');
};

const deleteProgress = async (id) => {
    try {
        await api.delete(`/progress-fisik/${id}`);
        await fetchGroupedProgressFisik({ showSkeleton: false });
        emit('refresh');
    } catch (error) {
        console.error("Error deleting progress:", error.response?.data || error.message);
        alert(error.response?.data?.message || "Gagal menghapus data progress fisik");
    }
};

// HANDLER EXPORT EXCEL
const handleExportExcel = () => {
    try {
        const dataList = flattenedGroupedItems.value;
        if (!dataList || dataList.length === 0) {
            emit('submit-success', 'warn', 'Info', 'Tidak ada data untuk diexport.', 'fisik');
            return;
        }

        const dataToExport = dataList.map((progress, index) => ({
            no: index + 1,
            namaGrup: progress?._groupMeta?.namaGrup || '-',
            noAdendum: progress?._groupMeta?.noAdendum || '-',
            nilaiKontrakAcuan: progress?._groupMeta?.nilaiKontrakAcuan ?? '-',
            periode: progress?.periode || '-',
            bulan: progress?.bulan || '-',
            nominalProgress: progress?.nominalProgress ?? '-',
            nominalKumulatif: progress?.nominalKumulatif ?? '-',
            progressRencana: progress?.progressRencana != null ? `${progress.progressRencana}%` : '-',
            progressAktual: progress?.progressAktual != null ? `${progress.progressAktual}%` : '-',
            deviasi: progress?.deviasi != null ? `${Number(progress.deviasi) > 0 ? '+' : ''}${progress.deviasi}%` : '-',
            status: progress?.status || '-',
            keterangan: progress?.keterangan || '-',
            tindakLanjut: progress?.tindakLanjut || '-',
            tglLaporan: progress?.tglLaporan || '-'
        }));

        const columnsConfig = [
            { header: 'No', key: 'no', width: 5 },
            { header: 'Grup Kontrak', key: 'namaGrup', width: 25 },
            { header: 'No Kontrak / Adendum', key: 'noAdendum', width: 25 },
            { header: 'Nilai Kontrak Acuan', key: 'nilaiKontrakAcuan', width: 22 },
            { header: 'Periode', key: 'periode', width: 15 },
            { header: 'Bulan', key: 'bulan', width: 15 },
            { header: 'Nominal Mingguan (Rp)', key: 'nominalProgress', width: 22 },
            { header: 'Nominal Kumulatif (Rp)', key: 'nominalKumulatif', width: 22 },
            { header: 'Progress Rencana (%)', key: 'progressRencana', width: 20 },
            { header: 'Progress Aktual (%)', key: 'progressAktual', width: 20 },
            { header: 'Deviasi (%)', key: 'deviasi', width: 15 },
            { header: 'Status', key: 'status', width: 18 },
            { header: 'Keterangan', key: 'keterangan', width: 30 },
            { header: 'Tindak Lanjut', key: 'tindakLanjut', width: 30 },
            { header: 'Tanggal Laporan', key: 'tglLaporan', width: 20 },
        ];

        generateExcel(
            dataToExport,
            columnsConfig,
            'Rekap_Daftar_Progress_Fisik',
            'Data Progress Fisik'
        );
    } catch (error) {
        console.error('Export Error:', error);
        emit('submit-success', 'error', 'Validasi Error', 'Terjadi kesalahan saat mengunduh excel.', 'fisik');
    }
};

// FORMAT RUPIAH
const formatRupiah = (val) => {
    if (val === null || val === undefined || isNaN(val)) return '0';
    return new Intl.NumberFormat('id-ID', {
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(val);
};

// STATUS BADGE CLASS
const getStatusBadgeClass = (status) => {
    if (!status) return 'px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold';
    const s = String(status).toLowerCase();
    if (s.includes('terlambat') || s.includes('kritis') || s.includes('rendah') || s.includes('minus')) {
        return 'px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-[10px] font-bold';
    }
    if (s.includes('cepat') || s.includes('tinggi') || s.includes('surplus')) {
        return 'px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold';
    }
    return 'px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold';
};
</script>

<style scoped>
:deep(.table-group-custom .p-datatable-row-group-header td) {
    padding: 0 !important;
    vertical-align: middle !important;
    position: relative !important;
}

:deep(.table-group-custom .p-datatable-row-group-header .p-datatable-row-toggle-button) {
    position: absolute !important;
    left: 0.5rem !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    z-index: 10 !important;
}
</style>
