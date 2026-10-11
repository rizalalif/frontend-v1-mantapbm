<template>
    <div
        class="bg-white rounded-[24px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col min-h-full">
        <div class="p-3 flex lg:flex-row lg:items-center justify-between gap-4">

            <!-- Search & Filters -->
            <!-- <div class="flex items-center justify-between gap-3"> -->
            <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>
                <input type="text" v-model="searchQuery" @focus="showOverlay = true" @keydown.esc="showOverlay = false"
                    placeholder="Cari"
                    class="bg-slate-50 text-sm font-medium text-blue-950 rounded-full pl-10 pr-4 py-2.5 w-64 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-400">
                <!-- Tombol Clear (X) -->
                <button v-if="searchQuery" @click="clearSearch"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12">
                        </path>
                    </svg>
                </button>
                <div v-if="showOverlay && dynamicSuggestions.length > 0"
                    class="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                    <div
                        class="px-3 py-2 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Saran Filter Pencarian
                    </div>
                    <ul class="max-h-60 overflow-y-auto">
                        <li v-for="suggestion in dynamicSuggestions" :key="suggestion.key"
                            @click="applySuggestion(suggestion.fullText)"
                            class="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2 group transition-colors">
                            <span
                                class="bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-800 text-xs font-mono px-2 py-0.5 rounded border border-slate-200 group-hover:border-blue-300 transition-colors">
                                {{ suggestion.label }}:
                            </span>

                            <!-- Teks yang diketik user muncul di sini -->
                            <span v-if="suggestion.searchValue" class="text-sm font-bold text-slate-800">
                                {{ suggestion.searchValue }}
                            </span>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- </div> -->
            <button @click="$router.push('/user/register')"
                class="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-2.5 px-6 rounded-full flex items-center gap-2 transition-colors shadow-md shadow-orange-500/20">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4">
                    </path>
                </svg>
                Tambah Pengguna
            </button>


        </div>
        <!-- TABLE DATA -->
        <div class="overflow-x-auto p-2">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th class="text-start px-4 py-4 rounded-tl-xl">Email</th>
                        <th class="text-start px-4 py-4">Nama Lengkap</th>
                        <th class="text-start px-4 py-4 text-right">Role</th>
                        <!-- <th class="px-4 py-4 w-40">Progres Fisik</th>
                        <th class="px-4 py-4 w-40">Progres Keuangan</th> -->
                        <!-- <th class="px-4 py-4 text-center rounded-tr-xl">Aksi</th> -->
                    </tr>
                </thead>
                <tbody class="text-sm">

                    <!-- ROW 1 -->
                    <tr v-for="user in filteredUsers" :key="user.id"
                        @click="$router.push({ name: 'edit-user', params: { id: user.id } })"
                        class="hover:bg-slate-50/50 transition-colors border-b border-slate-50/70 group">
                        <!-- <RouterLink :to="'/paket/detail'"> -->
                        <td class="text-start px-4 py-5 font-bold text-blue-950">{{ user.email }}</td>

                        <td class="text-start px-4 py-5 font-bold text-blue-950">{{ user.fullName }}</td>
                        <td class="text-start px-4 py-5 font-bold text-blue-950">{{ user.role }}</td>
                        <td class="text-start px-4 py-5 font-bold text-blue-950">
                            <DeleteModal title="Hapus User" deskripsi="Apakah Anda yakin ingin menghapus User ini?"
                                :action-hapus="() => deleteUser(user.id)" />
                        </td>

                        <!-- </RouterLink to="/paket/detail"> -->
                    </tr>




                </tbody>
            </table>
        </div>


    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import DeleteModal from '../utils/DeleteModal.vue';

const emits = defineEmits(['delete-user'])
const router = useRouter
const props = defineProps({
    users: {
        type: Array,
        default: () => []
    }
});


const searchQuery = ref('');
const showOverlay = ref(false);
const searchContainer = ref(null);

// Daftar properti/kolom yang bisa dijadikan filter spesifik
const availableProperties = [
    { key: 'name', label: 'Nama' },
    { key: 'email', label: 'Email' },
]
const clearSearch = () => {
    searchQuery.value = '';
    showOverlay.value = false;
};

const applySuggestion = (fullText) => {
    searchQuery.value = fullText;
    showOverlay.value = false; // Tutup overlay setelah memilih

    // ✅ LANGKAH BARU: Segera trigger pencarian
    // Ini akan langsung memfilter daftar paket berdasarkan kata kunci yang dipilih
    console.log('🚀 Pencarian diterapkan untuk:', fullText);
};

const dynamicSuggestions = computed(() => {
    const query = searchQuery.value.trim();

    // 1. Jika user sudah mengetik titik dua ':', sembunyikan overlay
    // karena diasumsikan user sudah memilih mode pencarian spesifik
    if (query.includes(':')) {
        return [];
    }

    // 2. Jika input masih kosong, tampilkan default properties saja
    if (!query) {
        return availableProperties.map(prop => ({
            ...prop,
            searchValue: '', // Belum ada yang diketik
            fullText: `${prop.key}: `
        }));
    }

    // 3. Jika user mengetik kata kunci (misal: "Jaladara")
    // Generate dinamis: "nama: Jaladara", "penyedia: Jaladara", dst.
    return availableProperties.map(prop => ({
        ...prop,
        searchValue: query, // Kata kunci yang sedang diketik
        fullText: `${prop.key}: ${query}` // Hasil gabungan yang akan diset ke input saat di-klik
    }));
});


const filteredUsers = computed(() => {
    let query = searchQuery.value.trim().toLowerCase();
    if (!query) return props.users; // Jika kosong, tampilkan semua

    // Cek apakah user menggunakan pencarian spesifik (mengandung tanda titik dua ":")
    // Contoh input: "penyedia: JALADARA"
    const colonIndex = query.indexOf(':');

    if (colonIndex !== -1 && colonIndex < query.length - 1) {
        // Mode Pencarian Spesifik
        const filterKey = query.substring(0, colonIndex).trim(); // Hasil: "penyedia"
        const filterValue = query.substring(colonIndex + 1).trim(); // Hasil: "jaladara"

        // Jika kata kunci kosong (misal baru ngetik "penyedia: "), kembalikan semua data
        if (!filterValue) return props.users;

        return props.users.filter(user => {
            console.log("filterKey", filterKey);
            console.log(" search", user);

            // Mapping filterKey ke atribut asli objek dari database
            switch (filterKey) {
                case 'name':
                    return user.fullName?.toLowerCase().includes(filterValue);
                case 'email':
                    return user.email?.toLowerCase().includes(filterValue);
                default:
                    // Jika key tidak dikenali, abaikan filter spesifik dan lakukan pencarian global
                    return searchGlobal(user, filterValue);
            }
        });
    } else {
        // Mode Pencarian Global (User ngetik teks biasa tanpa ":")
        return []
    }
});

const deleteUser = (userId) => {
    emits('delete-user', userId);
}

</script>