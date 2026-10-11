<template>
    <div class="bg-white rounded-[24px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)]  flex flex-col">
        <div class="p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-4">

            <!-- Search & Filters -->
            <div class="flex items-center gap-3 flex-wrap">
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                    <input type="text"
                        class="bg-slate-50 text-sm font-medium text-blue-950 rounded-full pl-10 pr-4 py-2.5 w-64 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-400"
                        placeholder="Cari nama paket atau no kontrak...">
                </div>

                <select
                    class="bg-slate-50 text-sm font-semibold text-slate-600 rounded-full px-5 py-2.5 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer appearance-none pr-10 relative">
                    <option>Semua Status</option>
                    <option>Berjalan</option>
                    <option>Selesai</option>
                    <option>Kritis</option>
                </select>

                <select
                    class="bg-slate-50 text-sm font-semibold text-slate-600 rounded-full px-5 py-2.5 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer appearance-none">
                    <option>Tahun 2026</option>
                    <option>Tahun 2025</option>
                </select>
            </div>
            <button @click="$router.push('/user/register')"
                class="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-2.5 px-6 rounded-full flex items-center gap-2 transition-colors shadow-md shadow-orange-500/20">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4">
                    </path>
                </svg>
                Tambah Pengguna
            </button>


        </div>
    </div>


</template>
<script setup>

</script>
<style scoped></style>
