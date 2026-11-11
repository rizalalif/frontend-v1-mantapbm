<template>
    <div class="bg-white rounded-[24px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col">
        <!-- TOP CONTROLS, CONTRACT & PAGU INFO, & FILTERS -->
        <div class="p-6 border-b border-slate-50 flex justify-between items-center gap-4 flex-wrap">
            <!-- 1. Filters (Bulan) -->
            <div class="flex items-center gap-3 flex-wrap">
                <Select v-model="selectedMonth" :options="monthNames" optionLabel="label" optionValue="value"
                    placeholder="Pilih bulan"
                    :pt="{ root: { class: 'bg-slate-50! text-sm! font-semibold! text-slate-600! rounded-full! px-2! border-none! focus:ring-2! focus:ring-orange-500! focus:outline-none! cursor-pointer! appearance-none! relative!' } }" />
            </div>

            <!-- 2. Pagu & Contract Info (Diletakkan di antara Filter dan Tombol Action) -->
            <div v-if="effectivePaketId && hasLoaded"
                class="flex items-center gap-4 flex-wrap bg-slate-50/80 px-4 py-2 rounded-xl border border-slate-100 text-xs">
                <div class="text-slate-500">
                    <span class="font-medium text-slate-400 uppercase text-[10px] tracking-wider block">Nilai Pagu</span>
                    <span class="font-bold text-blue-950">Rp {{ formatRupiah(groupedMeta.nilaiPagu) }}</span>
                </div>
                <div class="h-6 w-px bg-slate-200 hidden sm:block"></div>
                <div class="text-slate-500">
                    <span class="font-medium text-slate-400 uppercase text-[10px] tracking-wider block">Kontrak Awal</span>
                    <span class="font-bold text-blue-950">Rp {{ formatRupiah(groupedMeta.nilaiKontrakAwal) }}</span>
                </div>
                <div class="h-6 w-px bg-slate-200 hidden sm:block"></div>
                <div>
                    <span class="font-medium text-slate-400 uppercase text-[10px] tracking-wider block">Kontrak Terkini</span>
                    <span class="font-bold" :class="groupedMeta.adendumAktifId ? 'text-orange-600' : 'text-blue-950'">
                        Rp {{ formatRupiah(groupedMeta.nilaiKontrakTerkini) }}
                    </span>
                </div>
                <div v-if="isBackgroundRefreshing" class="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 animate-pulse pl-1">
                    <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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

        <!-- STATE LOADING (Skeleton DataTable) -->
        <div v-if="isLoading" class="p-4">
            <DataTable :value="[1, 2, 3, 4]" :pt="{
                table: { class: 'w-full text-xs text-left text-slate-600 border-collapse table-fixed' },
                thead: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 border-b border-slate-200' },
                tbody: { class: 'divide-y divide-slate-100' },
                bodyRow: { class: 'border-b! border-slate-50/70!' }
            }">
                <Column header="Periode" style="width: 16%;"><template #body><Skeleton width="70%" /></template></Column>
                <Column header="Bulan" style="width: 14%;"><template #body><Skeleton width="60%" /></template></Column>
                <Column header="Nominal Progress" style="width: 24%;"><template #body><Skeleton width="80%" /></template></Column>
                <Column header="Terhadap Pagu" style="width: 19%;"><template #body><Skeleton width="50%" class="mx-auto" /></template></Column>
                <Column header="Terhadap Kontrak" style="width: 19%;"><template #body><Skeleton width="50%" class="mx-auto" /></template></Column>
                <Column header="" style="width: 8%;"><template #body><Skeleton width="40%" class="mx-auto" /></template></Column>
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
            <h4 class="text-slate-800 font-bold text-sm mb-1">Gagal Memuat Progres Keuangan</h4>
            <p class="text-xs text-slate-500 mb-4 max-w-md mx-auto">{{ errorMessage }}</p>
            <button @click="fetchGroupedProgressKeuangan({ showSkeleton: true })"
                class="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer">
                Coba Lagi
            </button>
        </div>

        <!-- STATE TABEL ACCORDION GROUPING -->
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
                    rowGroupHeaderCell: { colspan: 6, class: 'p-0! bg-slate-50/90! hover:bg-slate-100/90! transition-colors! relative! border-b! border-slate-200!' },
                    rowGroupToggler: { class: 'absolute! left-2! top-1/2! -translate-y-1/2! z-10! w-6! h-6! inline-flex! items-center! justify-center! text-blue-600 hover:text-blue-800 cursor-pointer!' }
                }">

                <!-- 1. PERIODE (16%) -->
                <Column field="periode" header="Periode" style="width: 16%;" :pt="{
                    columnHeaderContent: { class: 'p-3! justify-center!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center!' }
                }">
                    <template #body="slotProps">
                        <div class="py-3 px-2 text-center font-bold text-blue-950 flex items-center justify-center gap-1.5">
                            <span>{{ slotProps.data.periode }}</span>
                            <span v-if="slotProps.data.canEdit === false"
                                class="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-semibold"
                                title="Data arsip dari fase kontrak asal (klik untuk lihat detail, hanya baca)">
                                Arsip
                            </span>
                        </div>
                    </template>
                </Column>

                <!-- 2. BULAN (14%) -->
                <Column field="bulan" header="Bulan" style="width: 14%;" :pt="{
                    columnHeaderContent: { class: 'p-3! justify-center!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center!' }
                }">
                    <template #body="slotProps">
                        <div class="py-3 px-2 text-center font-semibold text-blue-950">
                            {{ slotProps.data.bulan }}
                        </div>
                    </template>
                </Column>

                <!-- 3. NOMINAL PROGRESS (24%) -->
                <Column field="nominalProgress" header="Nominal Progress" style="width: 24%;" :pt="{
                    columnHeaderContent: { class: 'p-3! justify-end!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider text-right!' }
                }">
                    <template #body="slotProps">
                        <div class="py-3 px-3 font-semibold text-right text-blue-950 flex justify-between items-center w-full">
                            <span class="text-slate-400 text-xs">Rp</span>
                            <span>{{ formatRupiah(slotProps.data.nominalProgress) }}</span>
                        </div>
                    </template>
                </Column>

                <!-- 4. TERHADAP PAGU (19%) -->
                <Column field="persentasePagu" header="Terhadap Pagu" style="width: 19%;" :pt="{
                    columnHeaderContent: { class: 'p-3! justify-center!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center!' }
                }">
                    <template #body="slotProps">
                        <div class="py-3 text-center font-bold text-blue-950">
                            {{ slotProps.data.persentasePagu }}%
                        </div>
                    </template>
                </Column>

                <!-- 5. TERHADAP KONTRAK (19%) -->
                <Column field="persentaseKontrak" header="Terhadap Kontrak" style="width: 19%;" :pt="{
                    columnHeaderContent: { class: 'p-3! justify-center!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center!' }
                }">
                    <template #body="slotProps">
                        <div class="py-3 text-center font-bold text-blue-950">
                            {{ slotProps.data.persentaseKontrak }}%
                        </div>
                    </template>
                </Column>

                <!-- 6. AKSI (8%) -->
                <Column header="" style="width: 8%;" :pt="{
                    columnHeaderContent: { class: 'p-3! justify-center!' },
                    columnTitle: { class: 'text-center!' }
                }">
                    <template #body="slotProps">
                        <div class="py-3 flex justify-center items-center" @click.stop>
                            <DeleteModal v-if="slotProps.data.canDelete !== false" title="Hapus Progress Keuangan"
                                deskripsi="Apakah Anda yakin ingin menghapus laporan progres keuangan periode ini?"
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
                                    <svg class="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </template>
                </Column>

                <!-- CUSTOM GROUP HEADER (ACCORDION SUBHEADER) -->
                <template #groupheader="slotProps">
                    <div @click="onGroupHeaderClick($event, slotProps.data._groupMeta.faseKe)"
                        class="w-full flex items-center py-4 cursor-pointer select-none transition-colors">

                        <!-- Col 1 + 2 (16% + 14% = 30%): Ruang pl-10 untuk tombol Chevron PrimeVue -->
                        <div class="w-[30%] pl-10 pr-2 flex flex-col min-w-0 shrink-0 gap-0.5">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="font-extrabold text-blue-950 text-xs uppercase tracking-wide truncate">
                                    {{ slotProps.data._groupMeta.namaGrup }}
                                </span>
                                <span v-if="slotProps.data._groupMeta.isActiveGroup"
                                    class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[9px] font-bold uppercase tracking-wider">
                                    Aktif
                                </span>
                                <span class="px-2 py-0.5 bg-slate-200/70 text-slate-600 rounded-full text-[9px] font-bold">
                                    {{ slotProps.data._groupMeta.totalBaris }} baris
                                </span>
                            </div>
                            <div class="text-[10px] font-semibold text-slate-500 truncate">
                                <span v-if="slotProps.data._groupMeta.noAdendum">{{ slotProps.data._groupMeta.noAdendum }} • </span>
                                Kontrak: Rp {{ formatRupiah(slotProps.data._groupMeta.nilaiKontrakAcuan) }}
                            </div>
                        </div>

                        <!-- Col 3 (24%): Total Nominal Progress Grup -->
                        <div class="w-[24%] px-3 font-extrabold text-xs text-blue-950 flex justify-between items-center shrink-0">
                            <span class="text-slate-400 text-xs">Rp</span>
                            <span>{{ formatRupiah(slotProps.data._groupMeta.summaryNominal) }}</span>
                        </div>

                        <!-- Col 4 (19%): Progress Terhadap Pagu Kumulatif Grup -->
                        <div class="w-[19%] px-2 font-extrabold text-xs text-center text-blue-950 shrink-0">
                            {{ slotProps.data._groupMeta.summaryPagu }}%
                        </div>

                        <!-- Col 5 (19%): Progress Terhadap Kontrak Kumulatif Grup -->
                        <div class="w-[19%] px-2 font-extrabold text-xs text-center text-blue-950 shrink-0">
                            {{ slotProps.data._groupMeta.summaryKontrak }}%
                        </div>

                        <!-- Col 6 (8%): Spacer Aksi -->
                        <div class="w-[8%] shrink-0"></div>
                    </div>
                </template>

                <!-- EMPTY STATE JIKA BELUM ADA DATA -->
                <template #empty>
                    <div class="text-center py-12 text-slate-400 text-sm font-medium">
                        Belum ada riwayat laporan progres keuangan untuk paket ini.
                    </div>
                </template>
            </DataTable>
        </div>

        <!-- MODAL REUSABLE UNTUK TAMBAH & EDIT -->
        <ProgressKeuanganModal ref="modalRef" :paket-id="effectivePaketId" :paket="paket"
            :nilai-kontrak-aktif="groupedMeta.nilaiKontrakTerkini" :nilai-pagu-aktif="groupedMeta.nilaiPagu"
            @saved="getProgress" />
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import api from '@/services/api';
import { useAuth } from '@/lib/Auth';
import DeleteModal from '@/components/utils/DeleteModal.vue';
import ProgressKeuanganModal from './ProgressKeuanganModal.vue';
import { FileExcel } from '@primeicons/vue';
import { generateExcel } from '@/lib/Helper.js';
import { useToast } from 'primevue';

const auth = useAuth();
const emit = defineEmits(['refresh', 'submit-success']);
const toast = useToast();

const props = defineProps({
    progressList: {
        type: [Array, Object],
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
    nilaiPagu: 0,
    nilaiKontrakAwal: 0,
    nilaiKontrakTerkini: 0,
    adendumAktifId: null
});
const apiGroups = ref([]);
const expandedRowGroups = ref([]);

// Opsi Filter Bulan
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

// 1. FUNGSI FETCH GROUPED DATA DARI ENDPOINT GET /api/v1/paket/:id/progress-keuangan
const fetchGroupedProgressKeuangan = async ({ showSkeleton = false } = {}) => {
    if (!effectivePaketId.value) return;

    if (showSkeleton) {
        isLoading.value = true;
    } else {
        isBackgroundRefreshing.value = true;
    }
    isError.value = false;
    errorMessage.value = '';

    try {
        const res = await api.get(`/paket/${effectivePaketId.value}/progress-keuangan`);
        const payload = res.data?.data;

        if (payload) {
            groupedMeta.value = {
                paketId: payload.paketId,
                namaPaket: payload.namaPaket || '',
                nilaiPagu: Number(payload.nilaiPagu ?? 0),
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
        console.error('Error fetching grouped progress keuangan:', err);
        isError.value = true;
        errorMessage.value = err.response?.data?.message || err.message || 'Gagal memuat data progres keuangan.';
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
            nilaiPagu: 0,
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
            fetchGroupedProgressKeuangan({ showSkeleton: !hasLoaded.value });
        }
    },
    { immediate: true }
);

// Fallback untuk penggunaan standalone di ProgressKeuangan.vue (tanpa paketId)
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

    let runningActualPercentage = 0;
    let runningPaguPercentage = 0;
    let runningNominal = 0;

    const items = sortedList.map(item => {
        const nominal = Number(item?.actualFinance ?? item?.nominalProgress ?? 0);
        runningNominal += nominal;
        runningActualPercentage += Number(item?.actualPercentage ?? 0);
        runningPaguPercentage += Number(item?.paguPercentage ?? 0);

        return {
            id: item?.id,
            riwayatAdendumId: null,
            periode: `B-${item?.monthNumber || 1} / M-${item?.mingguKe || 1}`,
            bulan: item?.monthName || item?.bulan || 'JANUARI',
            monthNumber: Number(item?.monthNumber) || 1,
            mingguKe: Number(item?.mingguKe) || 1,
            nominalProgress: nominal,
            nominalKumulatif: runningNominal,
            persentaseKontrak: parseFloat(runningActualPercentage.toFixed(2)),
            persentasePagu: parseFloat(runningPaguPercentage.toFixed(2)),
            canDelete: true,
            canEdit: true,
            keterangan: item?.keterangan,
            tglLaporan: item?.tglLaporan
        };
    });

    return [
        {
            faseKe: 0,
            riwayatAdendumId: null,
            namaGrup: 'Riwayat Progress Keuangan',
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

        // Filter bulan per grup
        const filteredItems = items.filter(item => {
            if (!item) return false;

            let matchMonth = true;
            if (selectedMonth.value && selectedMonth.value !== 'all') {
                matchMonth = String(item.bulan || item.monthName || '').toLowerCase() === String(selectedMonth.value).toLowerCase();
            }

            return matchMonth;
        });

        if (filteredItems.length === 0) {
            return;
        }

        // Ringkasan untuk baris groupheader
        const summaryNominal = filteredItems.reduce((acc, it) => acc + (Number(it.nominalProgress) || 0), 0);
        const lastVisible = filteredItems[filteredItems.length - 1];
        const summaryKontrak = Number(lastVisible?.persentaseKontrak ?? 0);
        const summaryPagu = Number(lastVisible?.persentasePagu ?? 0);
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
            summaryKontrak,
            summaryPagu
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
watch(selectedMonth, (mo) => {
    if (mo && mo !== 'all') {
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

    // Prioritas 1: Ambil data mentah dari props.paket.progressKeuangans
    const rawDbRecord = props.paket?.progressKeuangans?.find(p => p.id === progress.id);
    const nilaiKontrakFase = progress._groupMeta?.nilaiKontrakAcuan ?? groupedMeta.value.nilaiKontrakTerkini;

    if (rawDbRecord) {
        modalRef.value.openModal({
            ...rawDbRecord,
            nilaiKontrakAcuan: nilaiKontrakFase,
            _isReadOnly: isReadOnly,
            _groupName: groupName
        });
        return;
    }

    // Prioritas 2 (Fallback): Gunakan data nominalProgress/actualFinance
    const weeklyActualPct = nilaiKontrakFase > 0
        ? parseFloat((((Number(progress.nominalProgress) || 0) / nilaiKontrakFase) * 100).toFixed(2))
        : Number(progress.persentaseKontrak) || 0;

    const weeklyPaguPct = (groupedMeta.value.nilaiPagu > 0)
        ? parseFloat((((Number(progress.nominalProgress) || 0) / groupedMeta.value.nilaiPagu) * 100).toFixed(2))
        : Number(progress.persentasePagu) || 0;

    modalRef.value.openModal({
        ...progress,
        monthName: progress.monthName || progress.bulan,
        actualFinance: progress.nominalProgress ?? progress.actualFinance,
        actualPercentage: weeklyActualPct,
        paguPercentage: weeklyPaguPct,
        nilaiKontrakAcuan: nilaiKontrakFase,
        _isReadOnly: isReadOnly,
        _groupName: groupName
    });
};

const getProgress = async () => {
    await fetchGroupedProgressKeuangan({ showSkeleton: false });
    emit('refresh');
};

const deleteProgress = async (id) => {
    try {
        await api.delete(`/progress-keuangan/${id}`);
        await fetchGroupedProgressKeuangan({ showSkeleton: false });
        emit('refresh');
    } catch (error) {
        console.error("Error deleting progress:", error.response?.data || error.message);
        alert(error.response?.data?.message || "Gagal menghapus data progress keuangan");
    }
};

// HANDLER EXPORT EXCEL
const handleExportExcel = () => {
    try {
        const dataList = flattenedGroupedItems.value;
        if (!dataList || dataList.length === 0) {
            emit('submit-success', 'warn', 'Info', 'Tidak ada data untuk diexport.', 'keuangan');
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
            persentasePagu: progress?.persentasePagu != null ? `${progress.persentasePagu}%` : '-',
            persentaseKontrak: progress?.persentaseKontrak != null ? `${progress.persentaseKontrak}%` : '-',
            status: progress?.status || '-',
            keterangan: progress?.keterangan || '-',
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
            { header: 'Terhadap Pagu (%)', key: 'persentasePagu', width: 20 },
            { header: 'Terhadap Kontrak (%)', key: 'persentaseKontrak', width: 20 },
            { header: 'Status', key: 'status', width: 18 },
            { header: 'Keterangan', key: 'keterangan', width: 30 },
            { header: 'Tanggal Laporan', key: 'tglLaporan', width: 20 },
        ];

        generateExcel(
            dataToExport,
            columnsConfig,
            'Rekap_Daftar_Progress_Keuangan',
            'Data Progress Keuangan'
        );
    } catch (error) {
        console.error('Export Error:', error);
        emit('submit-success', 'error', 'Validasi Error', 'Terjadi kesalahan saat mengunduh excel.', 'keuangan');
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
