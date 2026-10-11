<script setup>
import { useAuth } from '@/lib/Auth';
import { getChangedPayload } from '@/lib/Helper';
// import router from '@/router';
import axios from 'axios';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import z from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { Form, FormField } from '@primevue/forms';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
const toast = useToast();

const router = useRouter()
const route = useRoute()
const props = defineProps({
    paket: {
        type: Object,
        default: () => ({})
    }
})
const emit = defineEmits(['submit-success'])
const isEditMode = computed(() => !!route.params.kodePaket);
const isVisibleSubmitUpdate = computed(() => {
    // if (!isEditMode.value) return false
    const payload = getChangedPayload(originalData.value, paket);
    console.log('Payload Perubahan:', payload);

    // Cek apakah ada perubahan sama sekali
    if (Object.keys(payload).length === 0) {
        console.log("payload kosong");
        return false
    }
    return true
});
function switchTab(tabId, event) {
    // Sembunyikan semua konten tab
    // document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));

    // Tampilkan tab yang dipilih
    // document.getElementById(tabId).classList.add('active');

    // Reset gaya semua tombol
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.className = "tab-btn px-6 py-[4px] rounded-l-lg rounded-r-lg text-sm font-bold transition-all text-slate-500 hover:text-blue-950";
    });

    // Aktifkan gaya tombol yang diklik
    const btnElement = event.currentTarget;
    btnElement.className = "tab-btn px-6 py-[4px] rounded-l-lg rounded-r-3xl text-sm font-bold transition-all bg-blue-950 text-white shadow-md";
}


const statusProgress = ref(null)
const nilaiKontrak = ref(null);
const selectedTahun = ref(null);
const filteredTahun = ref([]);
const selectedJenisPekerjaan = ref(null);
const filteredJenisPekerjaan = ref([]);
const selectedPic = ref(null);
const filteredPic = ref([]);
const selectedStatus = ref(null);
const filteredStatus = ref([]);
const tahunOptions = ref([
    {
        label: '2026',
        value: 2026
    },
    {
        label: '2025',
        value: 2025
    },
    {
        label: '2024',
        value: 2024
    }
]);
const jenisPekerjaanOptions = ref([
    {
        label: 'Peningkatan Jalan',
        value: 'Peningkatan Jalan'
    },
    {
        label: 'Pembangunan Jembatan',
        value: 'Pembangunan Jembatan'
    },
    {
        label: 'Rehabilitasi Irigasi',
        value: 'Rehabilitasi Irigasi'
    }
]);
const sumberDanaOptions = ref([{ label: 'APBN', value: "APBN" }, { label: 'APBD', value: "APBD" }, { label: 'BLUD', value: "BLUD" }]);
const statusOptions = ref([
    { label: 'Aman', value: 'aman' },
    { label: 'Perhatian', value: 'perhatian' },
    { label: 'Kritis', value: 'kritis' }
]);
const picOptions = ref([]);
const filteredSumberDana = ref([]);
const selectedSumberDana = ref(null);

const auth = useAuth()
// const user = ref(auth.state.user.id)
const searchTahun = (event) => {
    if (!event.query || !event.query.trim().length) {
        filteredTahun.value = [...tahunOptions.value];
    } else {
        filteredTahun.value = tahunOptions.value.filter((tahun) => {
            return tahun.toLowerCase().includes(event.query.toLowerCase());
        });
    }
};

const searchJenisPekerjaan = (event) => {
    if (!event.query || !event.query.trim().length) {
        filteredJenisPekerjaan.value = [...jenisPekerjaanOptions.value];
    } else {
        filteredJenisPekerjaan.value = jenisPekerjaanOptions.value.filter((jenisPekerjaan) => {
            return jenisPekerjaan.toLowerCase().includes(event.query.toLowerCase());
        });
    }
};
const searchSumberDana = (event) => {
    if (!event.query || !event.query.trim().length) {
        filteredSumberDana.value = [...sumberDanaOptions.value];
    } else {
        filteredSumberDana.value = sumberDanaOptions.value.filter((sumberDana) => {
            return sumberDana.toLowerCase().includes(event.query.toLowerCase());
        });
    }
};

const searchPic = (event) => {
    if (!event.query || !event.query.trim().length) {
        console.log("pic", picOptions.value);
        const users = picOptions.value.map((user) => {
            return user.fullName
        })

        filteredPic.value = users;
    } else {
        filteredPic.value = picOptions.value.filter((pic) => {
            return pic.name.toLowerCase().includes(event.query.toLowerCase());
        });
    }
};
const getPic = async () => {
    try {
        const response = await axios.get("http://100.114.142.21:3002/api/v1/users", {
            headers: {
                Authorization: `Bearer ${auth.state.token || localStorage.getItem("token")}`,
            },
        });
        const rawUsers = response.data.data?.users || response.data.users || response.data.data || response.data || [];
        if (auth.userRole.value == 'admin') {
            picOptions.value = (Array.isArray(rawUsers) ? rawUsers : []).map((u) => ({
                id: u.id,
                name: u.fullName || u.name || u.email || 'Tanpa Nama'
            }));
        } else {
            // const user = auth.state.user;
            picOptions.value = [{
                id: auth.state.user.id,
                name: auth.state.user.fullName || auth.state.user.email || 'Tanpa Nama'
            }];
        }
        console.log("picOptions 🚀", picOptions.value);
    } catch (error) {
        console.error("Error fetching users for PIC:", error);
    }
}


const searchStatus = (event) => {
    if (!event.query || !event.query.trim().length) {
        filteredStatus.value = [...statusOptions.value];
    } else {
        filteredStatus.value = statusOptions.value.filter((status) => {
            return status.toLowerCase().includes(event.query.toLowerCase());
        });
    }
};




// Validation Schema
const schema = z.object({
    name: z.string().min(1, { message: "Nama Paket harus diisi" }),
    tahun: z.coerce.number({
        required_error: "Tahun harus diisi",
        invalid_type_error: "Tahun harus berupa angka",
    }).min(4, { message: "Tahun harus diisi" }),
    jenisPekerjaan: z.any().optional(),
    sumberDana: z.any().optional(),
    kecamatan: z.any().optional(),
    kelurahan: z.any().optional(),
    ruasLokasi: z.any().optional(),
    panjangKm: z.any().optional(),
    nilaiKontrak: z.any().optional(),
    noKontrak: z.any().optional(),
    paketUserId: z.any().optional(),
    longitude: z.any().optional(),
    latitude: z.any().optional(),
    kodePaket: z.string().min(1, { message: "Nama RUP harus diisi" }),
    // kodePaket: z.string().min(1, { message: "Kode Paket harus diisi" }),
    kodeKegiatan: z.any().optional(),
    programKegiatan: z.any().optional(),
    subProgramKegiatan: z.any().optional(),
    ppkom: z.any().optional(),
    statusKondisi: z.any().optional(),
    keterangan: z.any().optional(),
});
const resolver = ref(zodResolver(schema));
// const paket = reactive({
//     nama_paket: '',
//     program_kegiatan: '',
//     sub_program_kegiatan: '',
//     deskripsi: '',
//     kecamatan: '',
//     kelurahan: '',
//     panjang_ruas: '',
//     ruas: '',
//     jenis_pekerjaan: '',
//     nilai_kontrak: '',
//     no_kontrak: '',
//     ppk: '',
//     penyedia_jasa: '',
//     lokasi: '',
//     sumber_dana: '',
//     tahun: '',
//     item_pekerjaan: ''
// })

// Data Dummy untuk Development
const fillDummyData = () => {
    Object.assign(paket, {
        // ID User yang bertanggung jawab (Bisa diisi UUID atau ID random sementara)
        paketUserId: auth.userRole.value === 'admin' ? null : auth.state.user.id,

        // Info Utama Proyek
        name: "Peningkatan Jalan Ruas Muara Wahau - Bts. Bulungan " + Math.floor(Math.random() * 100),
        description: "Proyek perbaikan dan pengaspalan ulang jalan provinsi untuk meningkatkan konektivitas antar kabupaten.",
        tahun: "2026", // Menggunakan tahun saat ini
        kodePaket: `BM-2026-${Math.floor(Math.random() * 900) + 100}`, // Format: BM-2026-XXX
        kodeKegiatan: "1223",
        // Klasifikasi Pekerjaan
        jenisPekerjaan: "Peningkatan Jalan",
        programKegiatan: "Penyelenggaraan Jalan Provinsi",
        subProgramKegiatan: "Rehabilitasi / Pemeliharaan Berkala Jalan",
        sumberDana: "APBD Provinsi",

        // Lokasi Proyek (Relevan dengan Kaltim)
        city: "Kutai Timur",
        kecamatan: "Muara Wahau",
        kelurahan: "Wahau Baru",
        ruasLokasi: "Ruas Simpang 4 Wahau - Perbatasan",

        // Koordinat Geografis
        longitude: "116.8225",
        latitude: "1.1213",

        // Detail Teknis dan Keuangan
        panjangKm: Math.random() * 100, // Tipe number sesuai default
        noKontrak: "600/123/BM-KONTRAK/V/2026",
        nilaiKontrak: Math.random() * 10000000000, // Rp 18,5 Miliar (tipe number)

        // Pihak Terlibat
        penyediaJasa: "PT. Borneo Konstruksi Abadi",
        konsultanSupervisi: "CV. Enggal Enginering",
        ppkom: "Ir. H. Budi Santoso, M.T.",

        // Status dan Item
        statusPaket: "berjalan",
        statusKondisi: "aman",
        itemPekerjaan: "Lapis Pondasi Agregat Kelas A, Lapis Resap Pengikat, AC-WC, Marka Jalan"
    });
};

const defaultPaket = {
    paketUserId: "",
    name: "",
    description: "",
    tahun: null,
    kodePaket: null,
    kodeKegiatan: "",
    jenisPekerjaan: "",
    programKegiatan: "",
    subProgramKegiatan: "",
    sumberDana: "",
    city: "",
    kecamatan: "",
    kelurahan: "",
    ruasLokasi: "",
    longitude: "",
    latitude: "",
    panjangKm: 0,
    noKontrak: "",
    nilaiPagu: 0,
    nilaiKontrak: 0,
    penyediaJasa: "",
    konsultanSupervisi: "",
    ppkom: "",
    statusPaket: "berjalan",
    statusKondisi: "aman",
    itemPekerjaan: "",
}

const originalData = ref({})
const formData = ref({})

const paket = reactive({
    paketUserId: auth.userRole.value === 'admin' ? null : auth.state.user.id,
    name: "",
    description: "",
    tahun: null,
    kodePaket: "",
    kodeKegiatan: null,
    jenisPekerjaan: "",
    programKegiatan: "",
    subProgramKegiatan: "",
    sumberDana: "",
    city: "",
    kecamatan: "",
    kelurahan: "",
    ruasLokasi: "",
    longitude: "",
    latitude: "",
    panjangKm: 0,
    noKontrak: "",
    nilaiPagu: 0,
    nilaiKontrak: 0,
    penyediaJasa: "",
    konsultanSupervisi: "",
    ppkom: "",
    statusPaket: auth.userRole.value === 'admin' ? 'draft' : 'berjalan',
    statusKondisi: "aman",
    itemPekerjaan: "",
    nextInputFisik: null,
    statusProgress: false,
})

const handleSubmitAdd = async () => {
    paket.paketUserId = paket.paketUserId ? paket.paketUserId : null;
    console.log("paketForm 🚀🚀🚀", paket);


    try {

        delete paket.nextInputFisik;
        const response = await axios.post("http://100.114.142.21:3002/api/v1/paket", paket, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        //delete nextInput Before add data paket 
        console.log("responsed ata 🚀🚀🚀🚀", response.data);
        router.push({ name: 'paket-detail', params: { kodePaket: response.data.data.kodePaket } })
        emit('submit-success', 'success', 'Sukses', response.data.message, 'dashboard')
    } catch (error) {
        emit('submit-success', 'error', 'Validasi Error', error.response?.data?.message, 'info')
    }
}
const handleSubmitUpdate = async () => {
    paket.paketUserId = paket.paketUserId ? paket.paketUserId : null;
    console.log("paketForm 🚀🚀🚀", paket);

    const payload = getChangedPayload(originalData.value, paket);
    console.log('Payload Perubahan:', payload);

    // Cek apakah ada perubahan sama sekali
    if (Object.keys(payload).length === 0) {
        console.log("payload kosong");

        return;
    }


    try {
        const response = await axios.put(`http://100.114.142.21:3002/api/v1/paket/${props.paket.id}`, payload, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        console.log("responsed ata 🚀🚀🚀🚀", response.data.message);



        router.push({ name: 'paket-detail', params: { kodePaket: response.data.data.kodePaket } })
        emit('submit-success', 'success', 'Sukses', response.data.message, 'dashboard')
    } catch (error) {
        emit('submit-success', 'error', 'Validasi Error', error.response?.data?.message, 'info')
    }
}


const handleSubmit = (e) => {
    console.log("Form Submit Event:", e);

    if (e.valid === false) {
        console.log("Form tidak valid, batalkan pengiriman:", e.errors);
        return;
    }

    if (isEditMode.value) {
        handleSubmitUpdate(e);
    } else {
        handleSubmitAdd(e);
    }
}
const setPaketUser = async () => {
    const response = await axios.put(`http://100.114.142.21:3002/api/v1/paket/${props.paket.id}`, { paketUserId: auth.state.user.id }, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
}

// Watcher untuk mengisi data form secara otomatis dari props.paket ketika data paket diterima
watch(() => props.paket, (newPaket) => {
    if (isEditMode.value) {
        console.log("newPaket🚀🚀🚀", props.paket);
        if (newPaket && Object.keys(newPaket).length > 0) {
            Object.assign(paket, newPaket);
            if (newPaket.statusPaket) {
                paket.statusPaket = String(newPaket.statusPaket).toLowerCase();
            }
            originalData.value = { ...paket }
            // Object.assign(originalData.value, newPaket);

            // Fallback mapping jika backend menggunakan snake_case vs camelCase
            if (!paket.name && newPaket.nama_paket) paket.name = newPaket.nama_paket;
            if (!paket.kodePaket && newPaket.no_kontrak) paket.kodePaket = newPaket.no_kontrak;
            if (!paket.kodeKegiatan && newPaket.kode_kegiatan) paket.kodeKegiatan = newPaket.kode_kegiatan;
            if (!paket.description && newPaket.deskripsi) paket.description = newPaket.deskripsi;
            if (!paket.panjangKm && newPaket.panjang_ruas) paket.panjangKm = newPaket.panjang_ruas;
            if (!paket.sumberDana && newPaket.sumber_dana) paket.sumberDana = newPaket.sumber_dana;
            if (!paket.jenisPekerjaan && newPaket.jenis_pekerjaan) paket.jenisPekerjaan = newPaket.jenis_pekerjaan;
            if (!paket.programKegiatan && newPaket.program_kegiatan) paket.programKegiatan = newPaket.program_kegiatan;
            if (!paket.subProgramKegiatan && newPaket.sub_program_kegiatan) paket.subProgramKegiatan = newPaket.sub_program_kegiatan;
            if (!paket.penyediaJasa && newPaket.penyedia_jasa) paket.penyediaJasa = newPaket.penyedia_jasa;
            if (!paket.nilaiKontrak && newPaket.nilai_kontrak) paket.nilaiKontrak = newPaket.nilai_kontrak;
            if (!paket.nilaiPagu && newPaket.nilai_pagu) paket.nilaiPagu = newPaket.nilai_pagu;

            if (!paket.nextInputFisik && newPaket.nextInputFisik) paket.nextInputFisik = newPaket.nextInputFisik;
            if (!paket.statusProgress && newPaket.statusProgress) paket.statusProgress = newPaket.statusProgress;

        }

        // Default status jika belum ada
    } else {



        originalData.value = { ...defaultPaket }
    }

}, { immediate: true, deep: true });

watch(
    () => paket.paketUserId,
    (newPicId, oldPicId) => {
        console.log("newPicId", newPicId);
        console.log("oldPicId", oldPicId);

        // Jangan timpa status jika sedang berada dalam mode Edit dan watcher ini dipicu saat load awal
        if (isEditMode.value && oldPicId === undefined) return;

        // 1. Jika PIC dikosongkan (menjadi null atau string kosong)
        if (!newPicId) {
            paket.statusPaket = 'draft';
        }
        // 2. Jika PIC diisi
        else {
            if (!paket.statusPaket || paket.statusPaket === 'draft') {
                paket.statusPaket = 'berjalan';
            }
        }
    }
)

watch(() => props.paket?.progressFisiks,
    (progressFisiks) => {
        const today = new Date()

        console.log('nextInputFisik');
        console.log(new Date(props.paket.nextInputFisik));
        console.log(today.setHours(0, 0, 0, 0) < new Date(props.paket.nextInputFisik).setHours(0, 0, 0, 0));

        if (progressFisiks == undefined) return
        if (progressFisiks.length < 1) return
        if (props?.paket == undefined || props?.paket == null) return


        console.log("today", today)
        const lastInput = progressFisiks[0].createdAt
        if (props.paket.statusPaket == "selesai") {
            statusProgress.value = 'Updated'
            return
        }

        if (today.setHours(0, 0, 0, 0) < new Date(props.paket.nextInputFisik).setHours(0, 0, 0, 0)) {
            console.log('updated');


            statusProgress.value = 'Updated'
        } else {
            console.log('not updated');


            statusProgress.value = 'Belum Upload'
        }

    }, { immediate: true }
)
const getStatusBadgeClass = (status) => {

    if (!status) return 'px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold';
    const s = String(status).toLowerCase();
    if (s.includes('terlambat') || s.includes('rendah') || s.includes('minus') || s.includes('belum upload')) {
        return 'px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-[10px] font-bold';
    }
    if (s.includes('cepat') || s.includes('tinggi') || s.includes('surplus') || s.includes('updated')) {
        return 'px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold';
    }
    return 'px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold';
};
onMounted(() => {
    getPic()
    console.log();

    console.log("props.paket di AddPaket:", props?.paket);
});
</script>

<template>
    <Toast position="top-center" group="top-center" />
    <Form @submit="handleSubmit" :resolver="isEditMode ? null : resolver" :initialValues="paket" v-slot="$form"
        class="max-w-full mx-auto bg-white rounded-[32px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">


        <!-- BAGIAN 1: INFORMASI UMUM -->
        <div class="mb-10">
            <div class="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">

                <h2 class="text-sm font-bold text-blue-950 uppercase tracking-wider  flex items-center gap-2">
                    <span
                        class="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-xs">1</span>
                    Informasi Umum <div v-if="paket.nextInputFisik" class="mx-2 lg:px-2 text-center text-md!"
                        :class="getStatusBadgeClass(statusProgress)">
                        {{ statusProgress }}

                    </div>
                </h2>

                <div class="flex items-center justify-end gap-1">

                    <div class="flex items-center gap-2 p-1.5 bg-white rounded-lg w-fit border border-slate-200">
                        <button type="button" @click="paket.statusPaket = 'draft'"
                            :disabled="auth.userRole.value === 'user'"
                            :class="(paket.statusPaket || '').toLowerCase() == 'draft' ? 'bg-blue-950 text-white' : 'text-slate-500 hover:text-blue-950'"
                            class="tab-btn px-6 py-[4px] rounded-l-lg rounded-r-3xl text-sm font-bold transition-all ">Draft</button>
                        <button type="button" @click="paket.statusPaket = 'berjalan'" :disabled="!paket.paketUserId"
                            :class="(paket.statusPaket || '').toLowerCase() == 'berjalan' ? 'bg-blue-950 text-white' : 'text-slate-500 hover:text-blue-950'"
                            class="tab-btn px-6 py-[4px] rounded-l-lg rounded-r-3xl text-sm font-bold transition-all ">Berjalan</button>
                        <button type="button" @click="paket.statusPaket = 'selesai'"
                            :disabled="!paket.paketUserId && auth.userRole.value !== 'admin'"
                            :class="(paket.statusPaket || '').toLowerCase() == 'selesai' ? 'bg-blue-950 text-white' : 'text-slate-500 hover:text-blue-950'"
                            class="tab-btn px-6 py-[4px] rounded-l-lg rounded-r-3xl text-sm font-bold transition-all">Selesai</button>
                        <button type="button" @click="paket.statusPaket = 'batal'"
                            :disabled="!paket.paketUserId && auth.userRole.value !== 'admin'"
                            :class="(paket.statusPaket || '').toLowerCase() == 'batal' ? 'bg-red-500 text-white' : 'text-slate-500 hover:text-blue-950'"
                            class="tab-btn px-6 py-[4px] rounded-l-lg rounded-r-3xl text-sm font-bold transition-all ">Batal</button>
                    </div>
                </div>

            </div>

            <!-- add paket with dummy data -->
            <button v-if="!isEditMode"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                @click="fillDummyData">
                Isi Data Dummy
            </button>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Full width column -->
                <FormField name="name" v-slot="$field" class="flex flex-col gap-0">
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nama
                        Paket Pekerjaan <span class="text-red-500">*</span></label>
                    <InputText placeholder="Masukkan nama paket..." name="name" v-model="paket.name" :pt="{
                        root: [$field?.invalid ? '!border-red-500 !border-2 placeholder-slate-300!' : '!border-none !text-blue-950', 'w-full !bg-slate-50 !rounded-xl !px-4 !py-3.5 !shadow-none focus:!ring-2 focus:!ring-orange-500 focus:!outline-none text-sm font-bold text-blue-950 placeholder-slate-300!']
                    }" />
                    <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">
                        {{ $field.error?.message }}
                    </Message>
                </FormField>
                <FormField name="kodePaket" v-slot="$field" class="flex flex-col gap-0">
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Kode
                        RUP<span class="text-red-500">*</span></label>
                    <InputText placeholder="Masukkan Kode RUP..." name="kodePaket" v-model="paket.kodePaket" :pt="{
                        root: [$field?.invalid ? '!border-red-500 !border-2 placeholder-slate-300!' : '!border-none !text-blue-950', 'w-full !bg-slate-50 !rounded-xl !px-4 !py-3.5 !shadow-none focus:!ring-2 focus:!ring-orange-500 focus:!outline-none text-sm font-bold text-blue-950 placeholder-slate-300!']
                    }" />
                    <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">
                        {{ $field.error?.message }}
                    </Message>
                </FormField>

                <FormField name="tahun" v-slot="$field" class="flex flex-col gap-0">
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tahun
                        Anggaran <span class="text-red-500">*</span></label>

                    <Select v-model="paket.tahun" name="tahun" :options="tahunOptions" optionLabel="label"
                        optionValue="value" placeholder="Pilih Tahun..." filterPlaceholder="Cari Nama Tahun..." :pt="{
                            root: [$field?.invalid ? '!border-red-500 !border-2' : '!border-none', 'w-full !bg-slate-50 !rounded-xl !px-2 !py-1.5 !shadow-none focus:!ring-2 focus:!ring-orange-500 focus:!outline-none cursor-pointer'],
                            label: '!text-sm !font-bold !text-blue-950',
                            item: { class: '!text-sm !font-semibold !text-blue-950' }
                        }" />
                    <Message v-if="$field?.invalid" severity="error" size="small" variant="simple" class="mt-1">
                        {{ $field.error?.message }}
                    </Message>
                </FormField>
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Jenis
                        Pekerjaan </label>

                    <Select v-model="paket.jenisPekerjaan" :options="jenisPekerjaanOptions" optionLabel="label"
                        optionValue="value" placeholder="Pilih Jenis Pekerjaan..."
                        filterPlaceholder="Cari Nama Pekerjaan..." :pt="{
                            root: 'w-full !bg-slate-50 !rounded-xl !px-2 !py-1.5 !border-none !shadow-none focus:!ring-2 focus:!ring-orange-500 focus:!outline-none cursor-pointer',
                            label: '!text-sm !font-bold !text-blue-950',
                            item: { class: '!text-sm !font-semibold !text-blue-950' }
                        }" />
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Program
                        Kegiatan</label>
                    <input type="text" placeholder="Contoh: Program Penyelenggaraan Jalan"
                        v-model="paket.programKegiatan"
                        class="w-full bg-slate-50 text-sm font-semibold text-blue-950 rounded-xl px-4 py-3.5 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-300">
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sub
                        Program Kegiatan</label>
                    <input type="text" placeholder="Contoh: Pembangunan Jalan Provinsi"
                        v-model="paket.subProgramKegiatan"
                        class="w-full bg-slate-50 text-sm font-semibold text-blue-950 rounded-xl px-4 py-3.5 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-300">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        PIC (Penanggung Jawab)</label>
                    <Select v-model="paket.paketUserId" :options="picOptions"
                        :showClear="auth.userRole.value === 'admin'" optionLabel="name" optionValue="id"
                        placeholder="Pilih PIC..." filter filterPlaceholder="Cari nama PIC..." :pt="{
                            root: 'w-full !bg-slate-50 !rounded-xl !px-2 !py-1.5 !border-none !shadow-none focus:!ring-2 focus:!ring-orange-500 focus:!outline-none cursor-pointer',
                            label: '!text-sm !font-bold !text-blue-950',
                            item: { class: '!text-sm !font-semibold !text-blue-950' }
                        }" />
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Status</label>
                    <Select v-model="paket.statusKondisi" :options="statusOptions" optionLabel="label"
                        optionValue="value" placeholder="Pilih Status..." filterPlaceholder="Cari Nama Status..." :pt="{
                            root: 'w-full !bg-slate-50 !rounded-xl !px-2 !py-1.5 !border-none !shadow-none focus:!ring-2 focus:!ring-orange-500 focus:!outline-none cursor-pointer',
                            label: '!text-sm !font-bold !text-blue-950',
                            item: { class: '!text-sm !font-semibold !text-blue-950' }
                        }" />
                </div>

                <div class="md:col-span-2">
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Deskripsi
                        Singkat</label>
                    <textarea rows="2" placeholder="Tuliskan deskripsi ringkas mengenai paket ini..."
                        v-model="paket.description"
                        class="w-full bg-slate-50 text-sm font-medium text-blue-950 rounded-xl px-4 py-3.5 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none placeholder-slate-300"></textarea>
                </div>
            </div>
        </div>

        <!-- BAGIAN 2: DATA LOKASI -->
        <div class="mb-10">
            <h2
                class="text-sm font-bold text-blue-950 uppercase tracking-wider mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
                <span
                    class="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-xs">2</span>
                Lokasi & Dimensi
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Kota
                    </label>
                    <input type="text" placeholder="Masukkan kecamatan" v-model="paket.city"
                        class="w-full bg-slate-50 text-sm font-semibold text-blue-950 rounded-xl px-4 py-3.5 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-300">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Kecamatan
                    </label>
                    <input type="text" placeholder="Masukkan kecamatan" v-model="paket.kecamatan"
                        class="w-full bg-slate-50 text-sm font-semibold text-blue-950 rounded-xl px-4 py-3.5 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-300">
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Kelurahan
                        / Desa</label>
                    <input type="text" placeholder="Masukkan kelurahan" v-model="paket.kelurahan"
                        class="w-full bg-slate-50 text-sm font-semibold text-blue-950 rounded-xl px-4 py-3.5 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-300">
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Panjang
                        Ruas (Km)</label>
                    <div class="relative">
                        <input type="number" placeholder="0.0" step="0.1" v-model="paket.panjangKm"
                            class="w-full bg-slate-50 text-sm font-bold text-blue-950 rounded-xl pl-4 pr-12 py-3.5 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-300">
                        <span
                            class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Km</span>
                    </div>
                </div>
                <!-- row 2 -->
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Longitude
                    </label>
                    <input type="text" placeholder="Masukkan longitude" v-model="paket.longitude"
                        class="w-full bg-slate-50 text-sm font-semibold text-blue-950 rounded-xl px-4 py-3.5 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-300">
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Latitude
                    </label>
                    <input type="text" placeholder="Masukkan latitude" v-model="paket.latitude"
                        class="w-full bg-slate-50 text-sm font-semibold text-blue-950 rounded-xl px-4 py-3.5 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-300">
                </div>
                <div class="md:col-span-3">
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Ruas
                        / Nama Lokasi Detail</label>
                    <input type="text" placeholder="Contoh: Jl. Poros Utama STA 0+000 s/d 12+500"
                        v-model="paket.ruasLokasi"
                        class="w-full bg-slate-50 text-sm font-semibold text-blue-950 rounded-xl px-4 py-3.5 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-300">

                </div>


                <!-- <div class="md:col-span-3">
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Ruas
                        / Nama Lokasi Detail</label>
                    <input type="text" placeholder="Contoh: Jl. Poros Utama STA 0+000 s/d 12+500" v-model="paket.ruas"
                        class="w-full bg-slate-50 text-sm font-semibold text-blue-950 rounded-xl px-4 py-3.5 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-300">
                </div> -->
            </div>
        </div>

        <!-- BAGIAN 3: ANGGARAN & PELAKSANA -->
        <div class="mb-10">
            <h2
                class="text-sm font-bold text-blue-950 uppercase tracking-wider mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
                <span
                    class="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-xs">3</span>
                Kontrak & Pelaksana
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sumber
                        Dana </label>

                    <Select v-model="paket.sumberDana" :options="sumberDanaOptions" optionLabel="label"
                        optionValue="value" placeholder="Pilih Sumber Dana..." filterPlaceholder="Cari Sumber Dana..."
                        :pt="{
                            root: 'w-full !bg-slate-50 !rounded-xl !px-2 !py-1.5 !border-none !shadow-none focus:!ring-2 focus:!ring-orange-500 focus:!outline-none cursor-pointer',
                            label: '!text-sm !font-bold !text-blue-950',
                            item: { class: '!text-sm !font-semibold !text-blue-950' }
                        }" />
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">No.
                        Kontrak</label>
                    <input type="text" placeholder="Nomor dokumen kontrak..." v-model="paket.noKontrak"
                        class="w-full bg-slate-50 text-sm font-semibold text-blue-950 rounded-xl px-4 py-3.5 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-300">
                </div>


                <FormField name="nilaiPagu" v-slot="$field" class="flex flex-col gap-0">
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2"
                        for="nilaiPagu">Nilai
                        Pagu </label>
                    <InputNumber id="nilaiPagu" v-model="paket.nilaiPagu" mode="currency" :minFractionDigits="2"
                        :maxFractionDigits="2" currency="IDR" locale="id-ID"
                        input-class="w-full! bg-slate-50! text-sm! font-bold! text-blue-950! rounded-xl!
                                    px-4! py-3! border-none! focus:ring-2! focus:ring-orange-500! focus:outline-none!" />

                    <!-- <InputText type="number" placeholder="Nomor dokumen kontrak..." name="nilaiPagu"
                        v-model="paket.nilaiPagu" :pt="{
                            root: [$field?.invalid ? '!border-red-500 !border-2 placeholder-slate-300!' : '!border-none !text-blue-950', 'w-full !bg-slate-50 !rounded-xl !px-4 !py-3.5 !shadow-none focus:!ring-2 focus:!ring-orange-500 focus:!outline-none text-sm font-bold text-blue-950 placeholder-slate-300!']
                        }" /> -->
                    <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">
                        {{ $field.error?.message }}
                    </Message>
                </FormField>
                <FormField name="nilaiKontrak" v-slot="$field" class="flex flex-col gap-0">
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2"
                        for="nilaiKontrak">Nilai
                        Kontrak </label>
                    <InputNumber id="nilaiKontrak" v-model="paket.nilaiKontrak" mode="currency" :minFractionDigits="2"
                        :maxFractionDigits="2" currency="IDR" locale="id-ID"
                        input-class="w-full! bg-slate-50! text-sm! font-bold! text-blue-950! rounded-xl!
                                    px-4! py-3! border-none! focus:ring-2! focus:ring-orange-500! focus:outline-none!" />

                    <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">
                        {{ $field.error?.message }}
                    </Message>
                </FormField>



                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">PPK
                        (Pejabat Pembuat Komitmen)</label>
                    <input type="text" placeholder="Nama PPK..." v-model="paket.ppkom"
                        class="w-full bg-slate-50 text-sm font-semibold text-blue-950 rounded-xl px-4 py-3.5 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-300">
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Penyedia
                        Jasa (Kontraktor) </label>
                    <input type="text" placeholder="Nama perusahaan pemenang..." v-model="paket.penyediaJasa"
                        class="w-full bg-slate-50 text-sm font-bold text-blue-950 rounded-xl px-4 py-3.5 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-300">
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Konsultan
                        Supervisi</label>
                    <input type="text" placeholder="Nama konsultan pengawas..." v-model="paket.konsultanSupervisi"
                        class="w-full bg-slate-50 text-sm font-semibold text-blue-950 rounded-xl px-4 py-3.5 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-300">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Kode
                        Kegiatan</label>
                    <input type="text" placeholder="Kode kegiatan..." v-model="paket.kodeKegiatan"
                        class="w-full bg-slate-50 text-sm font-semibold text-blue-950 rounded-xl px-4 py-3.5 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-300">
                </div>
            </div>
        </div>

        <!-- BAGIAN 4: ITEM PEKERJAAN -->
        <div class="mb-10">
            <h2
                class="text-sm font-bold text-blue-950 uppercase tracking-wider mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
                <span
                    class="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-xs">4</span>
                Item Pekerjaan
            </h2>

            <div class="grid grid-cols-1 gap-6">
                <div>
                    <Editor v-model="paket.itemPekerjaan" editorStyle="height: 320px" />
                </div>
            </div>
        </div>

        <!-- ACTION BUTTONS -->
        <div class="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
            <div v-if="isVisibleSubmitUpdate" class="flex items-center gap-4">

                <button type="button" @click="$router.push({ name: 'paket' })"
                    class="px-8 py-3.5 rounded-full text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors">
                    Batal
                </button>
                <button type="submit"
                    class="px-10 py-3.5 rounded-full text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2 hover:-translate-y-0.5">
                    Simpan Paket
                </button>
            </div>

        </div>

    </Form>
</template>