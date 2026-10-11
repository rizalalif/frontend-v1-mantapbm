<script setup>
import { reactive, ref } from 'vue';

const progressFisik = reactive([
    {
        id_paket: "BM-2025-017",
        nama_paket: "Peningkatan Jalan AW Syahranie",
        kategori: "Jalan",
        plan: 76,
        actual: 76,
        deviasi: 10,
        bulanKe: 1,
        mingguKe: 1,
        status: "Berjalan", // Pin warna Biru/Hijau
        nilai_kontrak: "Rp 12,5 Miliar",
        lokasi: "Kec. Samarinda Ulu"
    },
    {
        id_paket: "BM-2025-024",
        nama_paket: "Rehabilitasi Jembatan Sungai Karang Mumus",
        kategori: "Jembatan",
        plan: 45,
        actual: 45,
        bulanKe: 1,
        deviasi: 10,
        mingguKe: 1,
        status: "Terlambat", // Pin warna Merah
        nilai_kontrak: "Rp 8,2 Miliar",
        lokasi: "Kec. Samarinda Kota"
    },
    {
        id_paket: "BM-2025-036",
        nama_paket: "Pembangunan Irigasi Lempake",
        kategori: "Irigasi",
        plan: 100,
        actual: 100,
        bulanKe: 1,
        deviasi: 10,
        mingguKe: 1,
        status: "Selesai", // Pin warna Abu-abu/Hijau Gelap
        nilai_kontrak: "Rp 4,1 Miliar",
        lokasi: "Kec. Samarinda Utara"
    },
    {
        id_paket: "BM-2025-041",
        nama_paket: "Pemeliharaan Rutin Jl. PM Noor",
        kategori: "Jalan",
        plan: 15,
        actual: 15,
        bulanKe: 1,
        deviasi: 10,
        mingguKe: 1,
        status: "Berjalan", // Pin warna Biru/Hijau
        nilai_kontrak: "Rp 2,3 Miliar",
        lokasi: "Kec. Sungai Pinang"
    },
    {
        id_paket: "BM-2025-055",
        nama_paket: "Peningkatan Jalan Cipto Mangunkusumo",
        kategori: "Jalan",
        plan: 90,
        actual: 90,
        bulanKe: 1,
        deviasi: 10,
        mingguKe: 1,
        status: "Berjalan", // Pin warna Biru/Hijau
        nilai_kontrak: "Rp 15,4 Miliar",
        lokasi: "Kec. Loa Janan Ilir"
    }
]);
</script>

<template>
    <div
        class="bg-white rounded-[24px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col min-h-full">

        <!-- TOP CONTROLS (Search, Filter, Add Button) -->
        <div class="p-6 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">

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

            <!-- Add Button -->
            <!-- <button
                class="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-2.5 px-6 rounded-full flex items-center gap-2 transition-colors shadow-md shadow-orange-500/20">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4">
                    </path>
                </svg>
                Tambah Paket
            </button> -->
        </div>

        <!-- TABLE DATA -->
        <div class="overflow-x-auto p-2">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th class="px-4 py-4 rounded-tl-xl">No Kontrak / Nama Paket</th>
                        <th class="px-4 py-4">Plan</th>
                        <th class="px-4 py-4">Actual</th>
                        <th class="px-4 py-4">Deviasi</th>
                        <th class="px-4 py-4">Bulan Ke</th>
                        <th class="px-4 py-4">Minggu Ke</th>
                        <th class="px-4 py-4">Status</th>
                        <!-- <th class="px-4 py-4 w-40">Progres Fisik</th>
                        <th class="px-4 py-4 w-40">Progres Keuangan</th> -->
                        <!-- <th class="px-4 py-4">Status</th> -->
                        <!-- <th class="px-4 py-4 text-center rounded-tr-xl">Aksi</th> -->
                    </tr>
                </thead>
                <tbody class="text-sm">

                    <!-- ROW 1 -->

                    <tr v-for="item in progressFisik" :key="item.id"
                        class="hover:bg-slate-50/50 transition-colors border-b border-slate-50/70 group">
                        <!-- <RouterLink :to="'/paket/detail'"> -->
                        <td class="px-4 py-5">
                            <p class="text-[10px] font-bold text-slate-400 mb-0.5">{{ item.id_paket }}</p>
                            <p class="font-bold text-blue-950">{{ item.nama_paket }}</p>
                        </td>
                        <!-- <td class="px-4 py-5 font-semibold text-slate-600">{{ item.plan }}%</td> -->
                        <td class="px-4 py-5">
                            <div class="flex items-center gap-2">
                                <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div class="h-full bg-blue-500 rounded-full" :style="{ width: item.plan + '%' }">
                                    </div>
                                </div>
                                <span class="text-xs font-bold text-blue-950">{{ item.plan }}%</span>
                            </div>
                        </td>
                        <td class="px-4 py-5">
                            <div class="flex items-center gap-2">
                                <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div class="h-full bg-orange-400 rounded-full"
                                        :style="{ width: item.actual + '%' }">
                                    </div>
                                </div>
                                <span class="text-xs font-bold text-blue-950">{{ item.actual }}%</span>
                            </div>
                        </td>
                        <td class="px-4 py-5 font-bold text-blue-950 text-right text-nowrap">{{ item.deviasi }}%</td>
                        <!-- <td class="px-4 py-5 font-bold text-blue-950 text-right text-nowrap">{{ item.actual }}%</td> -->
                        <td class="px-4 py-5 font-bold text-blue-950 text-right text-nowrap">{{ item.bulanKe }}</td>
                        <td class="px-4 py-5 font-bold text-blue-950 text-right text-nowrap">{{ item.mingguKe }}</td>
                        <!-- <td class="px-4 py-5 font-bold text-blue-950 text-right text-nowrap">{{ item.status }}</td> -->
                        <!-- <td class="px-4 py-5">
                            <div class="flex items-center gap-2">
                                <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div class="h-full bg-blue-500 rounded-full" style="width: 76%"></div>
                                </div>
                                <span class="text-xs font-bold text-blue-950">76%</span>
                            </div>
                        </td> -->
                        <!-- <td class="px-4 py-5">
                            <div class="flex items-center gap-2">
                                <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div class="h-full bg-orange-400 rounded-full" style="width: 70%"></div>
                                </div>
                                <span class="text-xs font-bold text-blue-950">70%</span>
                            </div>
                        </td> -->
                        <td class="px-4 py-5">
                            <span
                                class="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold tracking-wide">Berjalan</span>
                        </td>

                        <!-- </RouterLink to="/paket/detail"> -->
                    </tr>




                </tbody>
            </table>
        </div>

        <!-- PAGINATION (Bottom) -->
        <div class="p-5 border-t border-slate-50 flex items-center justify-between mt-auto">
            <p class="text-xs font-semibold text-slate-400">Menampilkan 1 hingga 4 dari 45 Paket</p>
            <div class="flex items-center gap-1">
                <button
                    class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-400 transition-colors"><svg
                        class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7">
                        </path>
                    </svg></button>
                <button
                    class="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500 text-white font-bold text-sm shadow-md shadow-orange-500/20">1</button>
                <button
                    class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-600 font-bold text-sm transition-colors">2</button>
                <button
                    class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-600 font-bold text-sm transition-colors">3</button>
                <button
                    class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-400 transition-colors"><svg
                        class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7">
                        </path>
                    </svg></button>
            </div>
        </div>

    </div>
</template>
<style scoped></style>