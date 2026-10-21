<script setup>
import { computed, onBeforeMount, onMounted, ref, watch } from 'vue';
import api from '@/services/api';
import { useAuth } from '@/lib/Auth';
import AddPaket from './AddPaket.vue';
import { useRoute, useRouter } from 'vue-router';
import ProgressFisikForm from '../ProgressKeuangan/ProgressFisikForm.vue';
import ProgressKeuanganForm from '../ProgressKeuangan/ProgressKeuanganForm.vue';
import ProgressKeuanganTable from '../ProgressKeuangan/ProgressKeuanganTable.vue';
import ProgressFisikTable from '../ProgressFisik/ProgressFisikTable.vue';
import Documentation from '../PaketDocumentation/Documentation.vue';
import SummaryDetailPaket from './SummaryDetailPaket.vue';
import { useToast } from 'primevue';

const toast = useToast()
const auth = useAuth()
const router = useRouter()
const route = useRoute()
const self = this
const isLoading = ref(false)
const error = ref(false)
const errorMessage = ref('')
const isAdd = computed(() => !route.params.kodePaket);
const activeTab = ref('dashboard')
const paket = ref({
    tahun: '',
    jenisPekerjaan: '',
    sumberDana: '',
    panjangKm: '',
    ppkom: '',
    kecamatan: '',
    city: '',
    nilaiKontrak: '',
    penyediaJasa: '',
    status: '',
    konsultanSupervisi: '',
});

const props = defineProps({
    kodePaket: {
        type: String,
        required: true
    }
})
// function switchTab(tabId, event) {
//     // Sembunyikan semua konten tab
//     document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));

//     // Tampilkan tab yang dipilih
//     document.getElementById(tabId).classList.add('active');

//     // Reset gaya semua tombol
//     document.querySelectorAll('.tab-btn').forEach(btn => {
//         btn.className = "tab-btn px-6 py-2.5 rounded-full text-sm font-bold transition-all text-slate-500 hover:text-blue-950";
//     });

//     // Aktifkan gaya tombol yang diklik
//     const btnElement = event.currentTarget;
//     btnElement.className = "tab-btn px-6 py-2.5 rounded-full text-sm font-bold transition-all bg-blue-950 text-white shadow-md";
// }

import { useBreadcrumb } from '@/composables/useBreadcrumb';
import AdendumTable from '../Adendum/AdendumTable.vue';
import SerahTerimaForm from '../SerahTerima/SerahTerimaForm.vue';

const { setPaketName } = useBreadcrumb();

async function getDetailPaket() {
    console.log("selectedId🚀🚀", props.kodePaket);

    try {
        isLoading.value = true;
        error.value = false;
        if (auth.isLoggedIn) {
            const response = await api.get(`/paket/kode/${props.kodePaket}`);

            console.log("data paket 🚀🚀", response);
            const data = response.data.data;
            if (data) {
                setPaketName(data.name || data.namaPaket || data.kodePaket);
            }
            return data;
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        error.value = true;
        errorMessage.value = error.message || "Gagal memuat data paket";
    } finally {
        isLoading.value = false;
    }
}

const onDataAdded = async (severity, status, message, tabTarget) => {
    console.log("message", message);

    paket.value = await getDetailPaket()
    activeTab.value = tabTarget
    toast.add({
        severity: severity,
        summary: status,
        detail: message,
        group: 'top-center',
        life: 2000
    });
}

onMounted(async () => {
    console.log('route.name', route.name)
    if (route.name == 'paket-detail') {

        isAdd.value = false;
        activeTab.value = 'dashboard'
        paket.value = await getDetailPaket();

    } else if (route.name == 'paket-add') {
        isAdd.value = true;
        activeTab.value = 'info'
    }
    console.log('paketONDetail🚀🚀🚀', paket.value);

});

watch(
    () => route.params.kodePaket,
    async (newId) => {
        if (newId) {
            paket.value = await getDetailPaket()
            // router.go(0)
            // Jika URL tiba-tiba memiliki ID (berarti habis submit form Add),
            // paksa tab pindah ke 'dashboard' secara instan.
            activeTab.value = 'dashboard';

            console.log('isAdd🚀🚀🚀', isAdd.value);

        }
    },
    { immediate: true } // immediate: true memastikan pengecekan berjalan saat halaman pertama kali di-load
);

</script>

<template>
    <Toast />
    <div :key="route.fullPath">

        <div v-if="isLoading">
            <p>Loading page, please wait...</p>
        </div>
        <div v-else>


            <!-- TABS NAVIGATION (Pill Style) -->
            <div v-if="!isAdd"
                class="flex items-center gap-2 p-1.5 bg-white rounded-full w-fit shadow-sm border border-slate-100 mb-6">

                <button @click="activeTab = 'dashboard'"
                    class="px-6 py-2.5 rounded-full text-sm font-bold transition-all"
                    :class="activeTab === 'dashboard' ? 'bg-blue-950 text-white shadow-md' : 'text-slate-500 hover:text-blue-950'">
                    Dashboard
                </button>
                <button @click="activeTab = 'info'" class="px-6 py-2.5 rounded-full text-sm font-bold transition-all"
                    :class="activeTab === 'info' ? 'bg-blue-950 text-white shadow-md' : 'text-slate-500 hover:text-blue-950'">
                    Informasi Paket
                </button>

                <button @click="activeTab = 'fisik'" class="px-6 py-2.5 rounded-full text-sm font-bold transition-all"
                    :class="activeTab === 'fisik' ? 'bg-blue-950 text-white shadow-md' : 'text-slate-500 hover:text-blue-950'">
                    Progres Fisik
                </button>

                <button @click="activeTab = 'keuangan'"
                    class="px-6 py-2.5 rounded-full text-sm font-bold transition-all"
                    :class="activeTab === 'keuangan' ? 'bg-blue-950 text-white shadow-md' : 'text-slate-500 hover:text-blue-950'">
                    Progres Keuangan
                </button>

                <button @click="activeTab = 'dokumentasi'"
                    class="px-6 py-2.5 rounded-full text-sm font-bold transition-all"
                    :class="activeTab === 'dokumentasi' ? 'bg-blue-950 text-white shadow-md' : 'text-slate-500 hover:text-blue-950'">
                    Dokumentasi
                </button>

                <button @click="activeTab = 'adendum'" class="px-6 py-2.5 rounded-full text-sm font-bold transition-all"
                    :class="activeTab === 'adendum' ? 'bg-blue-950 text-white shadow-md' : 'text-slate-500 hover:text-blue-950'">
                    Adendum
                </button>
                <button @click="activeTab = 'stp'" class="px-6 py-2.5 rounded-full text-sm font-bold transition-all"
                    :class="activeTab === 'stp' ? 'bg-blue-950 text-white shadow-md' : 'text-slate-500 hover:text-blue-950'">
                    Serah Terima Pekerjaan
                </button>

            </div>

            <!-- ================= TAB A: INFORMASI ================= -->
            <Transition name="fade">
                <div id="tab-info" class="tab-content" v-show="activeTab === 'info'">
                    <AddPaket :paket="paket" @submit-success="onDataAdded" />
                </div>
            </Transition>

            <!-- ================= TAB B: PROGRES FISIK ================= -->
            <Transition name="fade">
                <div id="tab-fisik" class="tab-content" v-show="activeTab === 'fisik'">

                    <ProgressFisikTable isVisibleHeader="false" :progress-list="paket?.progressFisiks"
                        @submit-success="onDataAdded" :paketId="paket?.id" :paket="paket"
                        @refresh="async () => { paket = await getDetailPaket() }" />
                </div>
            </Transition>

            <!-- ================= TAB C: PROGRES KEUANGAN ================= -->
            <Transition name="fade">
                <div id="tab-keuangan" class="tab-content" v-show="activeTab === 'keuangan'">
                    <ProgressKeuanganTable :isVisibleHeader="true" :progress-list="paket?.progressKeuangans"
                        @submit-success="onDataAdded" :paketId="paket?.id" :paket="paket"
                        @refresh="async () => { paket = await getDetailPaket() }" />

                    <!-- <ProgressKeuanganForm :paket="paket" @refresh="async () => { paket = await getDetailPaket() }" /> -->
                </div>
            </Transition>

            <!-- ================= TAB D: DOKUMENTASI ================= -->
            <Transition name="fade">
                <div id="tab-dokumentasi" class="tab-content" v-show="activeTab === 'dokumentasi'">
                    <Documentation :paketId="paket?.id" />

                </div>
            </Transition>
            <Transition name="fade">
                <!-- MIDDLE SECTION: CHARTS (Left/Center) & KENDALA (Right Vertically) -->
                <div id="tab-dashboard" class="tab-content" v-show="activeTab === 'dashboard'">

                    <SummaryDetailPaket :paketId="paket?.id" :paket="paket"
                        @refresh="async () => { paket = await getDetailPaket() }" />
                </div>
            </Transition>


            <!-- ================= TAB: ADENDUM ================= -->
            <Transition name="fade">
                <div id="tab-adendum" class="tab-content" v-show="activeTab === 'adendum'">
                    <AdendumTable :adendum-list="paket?.riwayatAdendums" :paket-id="paket?.id"
                        :paket="paket" @submit-success="onDataAdded"
                        @refresh="async () => { paket = await getDetailPaket() }" />

                </div>
            </Transition>
            <Transition name="fade">
                <div id="tab-stp" class="tab-content" v-show="activeTab === 'stp'">
                    <SerahTerimaForm :paket="paket" :paket-id="paket?.id" @submit-success="onDataAdded"
                        @refresh="async () => { paket = await getDetailPaket() }" />
                </div>
            </Transition>
        </div>
    </div>

</template>

<style scoped>
.fade-enter-active {
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

/* Kondisi awal sebelum elemen muncul */
.fade-enter-from {
    opacity: 0;
    transform: translateY(10px);
    /* Turun sedikit untuk efek slide up */
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>