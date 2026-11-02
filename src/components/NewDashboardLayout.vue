<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { RouterView, useRoute, RouterLink, useRouter } from 'vue-router';
import { useAuth } from '@/lib/Auth';
import Notifikasi from './Notifikasi.vue';
import { onClickOutside } from '@vueuse/core';
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core';
import Breadcrumb from 'primevue/breadcrumb';
import { useBreadcrumb } from '@/composables/useBreadcrumb';
import { useDashboardExport } from '@/composables/useDashboardExport';
import logoKaltim from '@/assets/images/logo_pemprov_kaltim.webp';
import logoBinaMarga from '@/assets/images/logo_binamarga.webp';
import motifKaltim from '@/assets/images/motif_kaltim.jpg';
import SidebarIcon from '@primeicons/vue/sidebar';
const { isGeneratingPdf, triggerExport } = useDashboardExport();
const breakpoints = useBreakpoints(breakpointsTailwind)

// Check if screen is greater than or equal to 'sm' (640px)
const smAndLarger = breakpoints.greaterOrEqual('sm')
const isMobile = breakpoints.smaller('lg');
const currentBreakpoint = breakpoints.active()
// Check a specific range
const isLaptop = breakpoints.between('md', 'lg')
const auth = useAuth();
const router = useRouter();
const route = useRoute();

const { currentPaketName, currentUserName } = useBreadcrumb();

const home = computed(() => ({
    label: 'Overview Proyek',
    route: '/dashboard'
}));

const breadcrumbItems = computed(() => {
    const items = [];

    if (route.path.startsWith('/paket')) {
        items.push({ label: 'Daftar Paket', route: '/paket' });
        if (route.params.kodePaket) {
            items.push({ label: currentPaketName.value || 'Detail Paket' });
        } else if (route.path === '/paket/add') {
            items.push({ label: 'Tambah Paket Baru' });
        }
    } else if (route.path.startsWith('/peta-proyek')) {
        items.push({ label: 'Peta Proyek', route: '/peta-proyek' });
    } else if (route.path.startsWith('/user')) {
        items.push({ label: 'Manajemen User', route: '/user' });
        if (route.path === '/user/register') {
            items.push({ label: 'Tambah User' });
        } else if (route.path.startsWith('/user/edit/')) {
            items.push({ label: currentUserName.value || 'Profil User' });
        }
    } else if (route.path.startsWith('/progress-fisik')) {
        items.push({ label: 'Progress Fisik', route: '/progress-fisik' });
    } else if (route.path.startsWith('/progress-keuangan')) {
        items.push({ label: 'Progress Keuangan', route: '/progress-keuangan' });
    } else {
        items.push({ label: "Overview Proyek", route: "/dashboard" })
    }

    return items;
});

// const user = ref(JSON.parse(auth.isLoggedIn))
const isCurrentRoute = (pageRoute) => {

    return route.name ? String(route.name).includes(pageRoute) : false;
};

const pageList = ref([
    { id: 1, isAdmin: false, name: 'Dashboard', route: 'dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 2, isAdmin: false, name: 'Daftar Paket', route: 'paket', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    // { id: 3, isAdmin: true, name: 'Progress Fisik', route: 'progress-fisik', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
    // { id: 4, isAdmin: true, name: 'Progress Keuangan', route: 'progress-keuangan', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 5, isAdmin: false, name: 'Peta Proyek', route: 'peta-proyek', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
    { id: 6, isAdmin: true, name: 'Pengguna', route: 'user', icon: 'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-8a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 10c-4.42 0-8 3.58-8 8v1h16v-1c0-4.42-3.58-8-8-8zm-6.16 7c.46-2.28 2.48-4 4.91-4s4.45 1.72 4.91 4H5.84z' },
    {
        id: 7,
        isAdmin: false,
        name: 'Teras Jalan',
        isExternal: true,
        url: 'https://binamargakaltim.netlify.app/',
        target: '_blank',
        icon: 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
    },
])

const currentYear = new Date().getFullYear();
const yearOptions = ref(
    Array.from({ length: 5 }, (_, i) => {
        const year = currentYear - i;
        return { label: String(year), value: year };
    })
);
const selectedYear = ref(currentYear);

// State untuk minimize/collapse sidebar
const isSidebarMinimized = ref(localStorage.getItem('sidebar_minimized') === 'true');

const toggleSidebar = () => {
    isSidebarMinimized.value = !isSidebarMinimized.value;
    localStorage.setItem('sidebar_minimized', String(isSidebarMinimized.value));
};


// State untuk buka/tutup dropdown
const isDropdownOpen = ref(false);

const toggleDropdown = () => {

    isDropdownOpen.value = !isDropdownOpen.value;
};

// Mengambil inisial nama (Contoh: "Ahmad Rusdianto" -> "AR")
const userInitials = computed(() => {
    const name = auth.state.user?.fullName || 'User';
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
});

const filteredPageList = computed(() => {

    if (auth.userRole.value == "admin") {
        return pageList.value
    } else {
        return pageList.value.filter(page => !page.isAdmin)
    }
});

const setTahun = () => {
    // Update URL tanpa me-reload halaman

    router.replace({
        query: {
            //   ...route.query, // Pertahankan query lain jika ada
            tahun: selectedYear.value
        }
    });
};

const closeModal = (event) => {
    if (event.key === "Escape") {
        isDropdownOpen.value = false;
    }
}

// Handler Logout
const handleLogout = () => {
    isDropdownOpen.value = false;
    auth.logout(); // Menghapus token & user dari state + localStorage
    router.push({ name: 'login' }); // Redirect ke halaman login
};

// LOGIKA CLICK-OUTSIDE (Menutup dropdown saat klik di luar area profil)
const handleClickOutside = (event) => {
    const profileContainer = document.getElementById('profile-menu');
    if (profileContainer && !profileContainer.contains(event.target)) {
        isDropdownOpen.value = false;
    }
};
const onKeyDown = (event) => {
    if (event.key === "Escape") {
        isDropdownOpen.value = false;
    }
};
onMounted(() => {
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', onKeyDown);


});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('keydown', onKeyDown);
});
</script>

<template>
    <div
        class="bg-[url('../assets/images/bg.webp')] bg-cover bg-center flex h-screen w-full overflow-hidden text-slate-800 custom-font">
        <!-- SIDEBAR -->
        <aside v-if="!isMobile" :class="isSidebarMinimized ? 'w-20 px-3 py-6' : 'w-[18%] p-6'"
            class="bg-[#072343] m-4 rounded-3xl flex flex-col z-10 relative shrink-0 transition-all duration-300 ease-in-out overflow-hidden">
            <!-- Ornamen Grafis Tradisional Kaltim (Fade ke Atas & Warna Abu-Abu) -->
            <div class="absolute bottom-0 left-0 right-0 h-[480px] pointer-events-none select-none z-0 overflow-hidden">
                <div class="w-full h-full bg-cover bg-bottom bg-no-repeat grayscale opacity-20 brightness-110 contrast-125"
                    :style="{
                        backgroundImage: `url(${motifKaltim})`,
                        maskImage: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0) 100%)',
                        WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0) 100%)'
                    }">
                </div>
            </div>

            <div :class="isSidebarMinimized ? 'justify-center px-0' : 'justify-between px-2'"
                class="flex items-center mb-10 mt-2 transition-all relative z-10">
                <!-- Area Logo & Teks Brand -->
                <div class="flex items-center gap-3 min-w-0"
                    :class="{ 'cursor-pointer hover:scale-105 transition-transform': isSidebarMinimized }"
                    @click="isSidebarMinimized && toggleSidebar()"
                    :title="isSidebarMinimized ? 'Klik untuk memperbesar sidebar' : ''">
                    <div
                        class="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 shrink-0">
                        <img class="object-fill rounded-md" src="../assets/images/LOGO MANTAP BM REVISI 6 WAHYU.png"
                            alt="Logo Mantap">
                    </div>
                    <!-- Teks Brand (Hanya tampil jika TIDAK minimize) -->
                    <span v-if="!isSidebarMinimized" class="font-bold text-xl text-slate-200 tracking-tight truncate">
                        MANTAP BM
                    </span>
                </div>

                <!-- Tombol Toggle Minimize di samping tulisan MANTAP BM (Hanya tampil saat expanded) -->
                <button v-if="!isSidebarMinimized" type="button" @click.stop="toggleSidebar" title="Minimize sidebar"
                    class="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-1">
                    <!-- Icon Collapse (Chevron Double Left) -->
                    <SidebarIcon />
                </button>
            </div>

            <nav class="flex flex-col gap-12 font-medium relative z-10">
                <div class="flex flex-col gap-1">
                    <!-- Judul Seksi / Garis Pembatas dengan Transisi Fade-Up -->
                    <Transition name="fade-up" mode="out-in">
                        <p v-if="!isSidebarMinimized" key="text"
                            class="text-xs font-bold text-slate-400 tracking-wider mb-2 px-4 uppercase whitespace-nowrap">
                            Menu Utama
                        </p>
                        <div v-else key="divider" class="w-8 h-[1px] bg-white/10 mx-auto my-2"></div>
                    </Transition>

                    <template v-for="page in filteredPageList" :key="page.id">
                        <!-- Link Eksternal (Ghost Button / Card Border Style dengan Suffix Icon & Aksen Gold) -->
                        <a v-if="page.isExternal" :href="page.url" :target="page.target || '_blank'"
                            rel="noopener noreferrer" :title="isSidebarMinimized ? page.name : ''"
                            :class="isSidebarMinimized ? 'justify-center px-0 py-3.5' : 'justify-between px-4 py-3.5'"
                            class="flex items-center rounded-[20px] transition-all border border-white/15 bg-white/5 hover:bg-amber-400/10 hover:border-amber-400/40 text-amber-300 hover:text-amber-200 shadow-sm group">
                            <!-- Label Teks (Prefix jika expanded) -->
                            <span v-if="!isSidebarMinimized" class="truncate font-semibold tracking-wide text-sm capitalize">
                                {{ page.name }}
                            </span>

                            <!-- Suffix Icon (Ikon Eksternal di Sisi Kanan) -->
                            <svg class="w-4 h-4 shrink-0 text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" :d="page.icon">
                                </path>
                            </svg>
                        </a>

                        <!-- RouterLink Internal -->
                        <RouterLink v-else :to="`/${page.route}`" :title="isSidebarMinimized ? page.name : ''" :class="[
                            isCurrentRoute(page.route) ? 'bg-[#007Bff] text-[#072343] shadow-[0_8px_20px_rgba(23,37,84,0.2)]' : 'hover:text-slate-200 hover:text-blue-950 text-slate-400',
                            isSidebarMinimized ? 'justify-center px-0 py-3.5' : 'gap-4 px-4 py-4'
                        ]" class="flex items-center rounded-[20px] transition-all">
                            <svg :class="isCurrentRoute(page.route) ? 'text-[#072343]' : ''" class="w-5 h-5 shrink-0"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" :d="page.icon">
                                </path>
                            </svg>
                            <span v-if="!isSidebarMinimized" class="truncate">{{ page.name }}</span>
                        </RouterLink>
                    </template>
                </div>
                <div v-show="$route.path === '/dashboard'" class="flex flex-col gap-3">
                    <!-- Filter Select (Hanya tampil saat expanded) -->
                    <template v-if="!isSidebarMinimized">
                        <div>
                            <p class="text-xs font-bold text-slate-400 tracking-wider mb-2 px-4 uppercase">Filter</p>
                        </div>
                        <Select v-model="selectedYear" :options="yearOptions" optionLabel="label" optionValue="value"
                            placeholder="Pilih Tahun" :pt="{
                                root: 'w-full! bg-white/10! rounded-xl! px-2! py-1.5! border-none! shadow-none! focus:ring-2! focus:ring-orange-500! focus:outline-none! cursor-pointer!',
                                label: 'text-sm! font-bold! text-slate-200!',
                                item: { class: 'text-sm! font-semibold! text-amve!' },
                            }" @change="setTahun" />
                    </template>

                    <!-- Tombol Action Cetak PDF Dashboard (Tampil di kedua kondisi) -->
                    <button type="button" @click="triggerExport" :disabled="isGeneratingPdf"
                        :title="isSidebarMinimized ? (isGeneratingPdf ? 'Menyiapkan PDF...' : 'Export PDF') : ''"
                        :class="isSidebarMinimized ? 'px-0 py-2.5 justify-center' : 'px-4 py-2.5 justify-center gap-2'"
                        class="w-full flex items-center bg-white/10! hover:bg-blue-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                        <!-- Spinner saat proses render -->
                        <svg v-if="isGeneratingPdf" class="animate-spin h-4 w-4 text-white shrink-0" fill="none"
                            viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        <!-- Icon Download PDF -->
                        <svg v-else class="w-4 h-4 text-orange-400 shrink-0" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span v-if="!isSidebarMinimized">{{ isGeneratingPdf ? 'Menyiapkan PDF...' : 'Export PDF'
                            }}</span>
                    </button>
                    <!-- <Select :showClear="auth.userRole.value === 'admin'" optionLabel="name" optionValue="id"
                        placeholder="Pilih PIC..." filter filterPlaceholder="Cari nama PIC..." :pt="{
                            root: 'w-full !bg-slate-50 !rounded-xl !px-2 !py-1.5 !border-none !shadow-none focus:!ring-2 focus:!ring-orange-500 focus:!outline-none cursor-pointer',
                            label: '!text-sm !font-bold !text-blue-950',
                            item: { class: '!text-sm !font-semibold !text-blue-950' }
                        }" /> -->
                </div>
            </nav>

            <!-- ==================== FOOTER LOGO & SOSIAL MEDIA ==================== -->
            <div class="mt-auto pt-4 border-t border-white/10 flex flex-col gap-4 transition-all relative z-10">
                <!-- Baris Logo: Pemprov Kaltim & Bina Marga -->
                <div :class="isSidebarMinimized ? 'flex-col gap-3' : 'flex-row gap-4'"
                    class="flex items-center justify-center transition-all">
                    <!-- Logo Pemprov Kaltim -->
                    <img :src="logoKaltim" alt="Logo Pemprov Kaltim"
                        :class="isSidebarMinimized ? 'h-8' : 'h-20'"
                        class="w-auto object-contain hover:scale-105 transition-transform drop-shadow"
                        title="Pemerintah Provinsi Kalimantan Timur" />

                    <!-- Logo Bina Marga (Dibungkus Container Bundar) -->
                    <div :class="isSidebarMinimized ? 'w-8 h-8' : 'w-20 h-20'"
                        class="rounded-full overflow-hidden bg-white flex items-center justify-center shrink-0 shadow-md hover:scale-105 transition-transform p-0.5"
                        title="Bina Marga Provinsi Kalimantan Timur">
                        <img :src="logoBinaMarga" alt="Logo Bina Marga Kaltim"
                            class="w-full h-full object-cover rounded-full" />
                    </div>
                </div>

                <!-- Daftar Akun Instagram Resmi -->
                <div :class="isSidebarMinimized ? 'items-center px-0' : 'items-start px-2'"
                    class="flex flex-col gap-2 transition-all">
                    <!-- Akun 1: @dpupr_kaltim -->
                    <a href="https://www.instagram.com/dpupr_kaltim" target="_blank" rel="noopener noreferrer"
                        :title="isSidebarMinimized ? '@dpupr_kaltim' : ''"
                        class="flex items-center gap-2.5 text-slate-300 hover:text-white transition-colors group text-xs font-medium">
                        <!-- Icon Instagram Berwarna Merah -->
                        <svg class="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform shrink-0"
                            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" viewBox="0 0 24 24">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                        <span v-if="!isSidebarMinimized" class="truncate tracking-wide">
                            @dpupr_kaltim
                        </span>
                    </a>

                    <!-- Akun 2: @binamargakaltim -->
                    <a href="https://www.instagram.com/binamargakaltim" target="_blank" rel="noopener noreferrer"
                        :title="isSidebarMinimized ? '@binamargakaltim' : ''"
                        class="flex items-center gap-2.5 text-slate-300 hover:text-white transition-colors group text-xs font-medium">
                        <!-- Icon Instagram Berwarna Merah -->
                        <svg class="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform shrink-0"
                            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" viewBox="0 0 24 24">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                        <span v-if="!isSidebarMinimized" class="truncate tracking-wide">
                            @binamargakaltim
                        </span>
                    </a>
                </div>
            </div>
            <!-- =================================================================== -->
        </aside>

        <div class="flex-1 flex flex-col min-w-0">
            <!-- TOPBAR -->
            <header :class="[
                isMobile
                    ? 'w-[96dvw] left-[48%] -translate-x-1/2'
                    : isSidebarMinimized
                        ? 'w-[calc(100vw-7.5rem)] left-[6.5rem] translate-x-0'
                        : 'w-[78dvw] left-[20%] translate-x-0'
            ]"
                class="fixed h-24 top-0 bg-white mt-4 mx-4 rounded-3xl flex items-center justify-between px-10 z-10 shrink-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-all duration-300 ease-in-out">
                <div class="flex items-center gap-2">
                    <Breadcrumb :model="breadcrumbItems" class="!bg-transparent !border-none !p-0 flex items-center">
                        <template #item="{ item, props }">
                            <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
                                <a :href="href" v-bind="props.action" @click="navigate"
                                    class="text-slate-400 hover:text-blue-950 transition-colors font-medium text-lg">
                                    <span>{{ item.label }}</span>
                                </a>
                            </router-link>
                            <span v-else class="text-lg font-bold text-blue-950 tracking-tight">
                                {{ item.label }}
                            </span>
                        </template>
                        <template #separator>
                            <span class="mx-2 text-slate-300 text-xl font-normal">/</span>
                        </template>
                    </Breadcrumb>
                </div>


                <!-- fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 bg-white/90 backdrop-blur-md shadow-lg rounded-2xl border border-gray-100 transition-all duration-300 -->
                <div v-if="isMobile" v-show="$route.path === '/dashboard'" class="flex flex-col gap-3">
                    <Select v-model="selectedYear" :options="yearOptions" optionLabel="label" optionValue="value"
                        placeholder="Pilih Tahun" :pt="{
                            root: 'w-full !bg-slate-50 !rounded-xl !px-2 !py-1.5 !border-none !shadow-none focus:!ring-2 focus:!ring-orange-500 focus:!outline-none cursor-pointer',
                            label: '!text-sm !font-bold !text-blue-950',
                            item: { class: '!text-sm !font-semibold !text-blue-950' }
                        }" @change="setTahun" />
                    <!-- <Select :showClear="auth.userRole.value === 'admin'" optionLabel="name" optionValue="id"
                        placeholder="Pilih PIC..." filter filterPlaceholder="Cari nama PIC..." :pt="{
                            root: 'w-full !bg-slate-50 !rounded-xl !px-2 !py-1.5 !border-none !shadow-none focus:!ring-2 focus:!ring-orange-500 focus:!outline-none cursor-pointer',
                            label: '!text-sm !font-bold !text-blue-950',
                            item: { class: '!text-sm !font-semibold !text-blue-950' }
                        }" /> -->
                </div>
                <div class="flex items-center gap-5" @click="toggleDropdown">
                    <div v-if="!isMobile"
                        class="flex items-center gap-3 bg-slate-50 p-1.5 pr-4 rounded-full border border-slate-100 cursor-pointer">
                        <div
                            class="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
                            {{ userInitials }}</div>
                        <span v-if="auth.isLoggedIn" class="text-sm font-bold text-blue-950">{{ auth.state.user.fullName
                            }}</span>
                    </div>
                    <div v-if="isMobile"
                        class="flex items-center gap-3 lg:bg-slate-50 p-1.5 pr-4 rounded-full lg:border lg:border-slate-100 cursor-pointer">
                        <div
                            class="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
                            {{ userInitials }}</div>
                        <span v-if="auth.isLoggedIn && !isMobile" class="text-sm font-bold text-blue-950">{{
                            auth.state.user.fullName
                            }}</span>
                    </div>
                    <div v-if="isDropdownOpen"
                        class="absolute right-10 top-17 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <!-- Header Profil (Khusus Mobile saat info nama di tombol tersembunyi) -->
                        <div v-if="!isMobile" class="px-4 py-2 ">
                            <p class="text-sm font-bold text-slate-800">{{ auth.state.user?.fullName || 'User Admin' }}
                            </p>
                            <p class="text-xs text-slate-500 capitalize">{{ auth.userRole }}</p>
                        </div>
                        <div v-if="isMobile" class="flex flex-col gap-2 max-w-2xl px-4 py-4">

                            <div class="px-4 py-2 border-b border-slate-100">
                                <p class="text-sm font-bold text-slate-800">{{ auth.state.user?.fullName || 'User Admin'
                                }}
                                </p>
                                <p class="text-xs text-slate-500 capitalize">{{ auth.userRole }}</p>
                            </div>
                            <template v-for="page in filteredPageList" :key="page.id">
                                <a v-if="page.isExternal" :href="page.url" :target="page.target || '_blank'"
                                    rel="noopener noreferrer"
                                    class="flex items-center justify-between px-4 py-3.5 rounded-xl transition-all border border-slate-200 bg-amber-50/50 hover:bg-amber-100/50 text-amber-700 hover:text-amber-800 group">
                                    <span class="font-semibold text-sm capitalize">{{ page.name }}</span>
                                    <svg class="w-4 h-4 shrink-0 text-amber-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                            :d="page.icon"></path>
                                    </svg>
                                </a>
                                <RouterLink v-else :to="`/${page.route}`"
                                    :class="isCurrentRoute(page.route) ? 'bg-blue-950 text-white' : 'hover:bg-slate-50 hover:text-blue-950 text-slate-400'"
                                    class="flex items-center gap-4 px-4 py-4 rounded-xl transition-all">
                                    <svg :class="isCurrentRoute(page.route) ? 'text-orange-400' : ''" class="w-5 h-5"
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                            :d="page.icon">
                                        </path>
                                    </svg>
                                    <span>{{ page.name }}</span>
                                </RouterLink>
                            </template>
                        </div>

                        <!-- Menu items -->
                        <!-- <router-link to="/profil" @click="isDropdownOpen = false"
                            class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                            <i class="pi pi-user text-slate-400"></i>
                            Profil Saya
                        </router-link> -->

                        <!-- <router-link to="/pengaturan" @click="isDropdownOpen = false"
                            class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                            <i class="pi pi-cog text-slate-400"></i>
                            Pengaturan
                        </router-link> -->

                        <hr class="my-1 border-slate-100" />

                        <!-- Tombol Logout -->
                        <button @click="handleLogout" @click.self="onClickOutside"
                            class="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">
                            <i class="pi pi-sign-out text-red-500"></i>
                            Keluar / Logout
                        </button>
                    </div>
                </div>
            </header>

            <!-- KONTEN UTAMA -->
            <main class="flex-1 p-8 overflow-y-auto main-scroll pt-32">
                <RouterView />

            </main>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.custom-font {
    font-family: 'Plus Jakarta Sans', sans-serif;
}

.main-scroll::-webkit-scrollbar {
    width: 6px;
    height: 6px;
    display: none;
}

.main-scroll::-webkit-scrollbar-track {
    background: transparent;
}

.main-scroll::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
}

/* Transisi Fade Up untuk Menu Utama & Garis Pembatas */
.fade-up-enter-active,
.fade-up-leave-active {
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-up-enter-from {
    opacity: 0;
    transform: translateY(6px);
}

.fade-up-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}
</style>
