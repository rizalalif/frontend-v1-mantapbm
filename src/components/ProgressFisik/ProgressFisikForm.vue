<script setup>
const props = defineProps({
    paket: Object
})

console.log("paket in prop", props.paket)
</script>
<template>
    <!-- Form Input Progres Fisik -->
    <div
        class="bg-white rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mb-6 relative overflow-hidden">
        <!-- Aksen warna hiasan form -->

        <h3 class="font-bold text-sm text-blue-950 uppercase tracking-wide mb-6">Tambah Laporan Progres Fisik
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
            <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Bulan
                    Ke-</label>
                <input type="number" value="4"
                    class="w-full bg-slate-50 text-sm font-bold text-blue-950 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none">
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Minggu
                    Ke-</label>
                <input type="number" value="16"
                    class="w-full bg-slate-50 text-sm font-bold text-blue-950 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none">
            </div>
            <div class="md:col-span-2">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tanggal
                    Laporan</label>
                <input type="date" value="2026-05-30"
                    class="w-full bg-slate-50 text-sm font-bold text-slate-500 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none">
            </div>

            <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Plan
                    Fisik
                    (%)</label>
                <input type="number" value="82.5"
                    class="w-full bg-slate-50 text-sm font-bold text-blue-950 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none">
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Aktual
                    Fisik
                    (%)</label>
                <input type="number" value="76.0"
                    class="w-full bg-slate-50 text-sm font-bold text-blue-950 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none">
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Deviasi</label>
                <!-- Deviasi Minus (Warna Merah) -->
                <input type="text" readonly value="-6.5%"
                    class="w-full bg-red-50 text-sm font-bold text-red-600 rounded-xl px-4 py-3 border-none focus:outline-none">
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                <select
                    class="w-full bg-slate-50 text-sm font-bold text-blue-950 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer">
                    <option>Terlambat</option>
                    <option>Sesuai Target</option>
                    <option>Lebih Cepat</option>
                </select>
            </div>

            <div class="md:col-span-4">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Keterangan
                    /
                    Kendala</label>
                <textarea rows="2"
                    class="w-full bg-slate-50 text-sm font-medium text-blue-950 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none">Pengiriman material agregat terlambat ke lokasi hulu sungai akibat cuaca.</textarea>
            </div>
        </div>

        <div class="flex justify-end">
            <button
                class="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-3 px-8 rounded-xl shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-0.5">
                Simpan Progres Fisik
            </button>
        </div>
    </div>

    <!-- Tabel Riwayat Progres Fisik -->
    <div class="bg-white rounded-[24px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col">
        <div class="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 class="font-bold text-sm text-blue-950 uppercase tracking-wide">Riwayat Laporan Fisik</h3>
        </div>
        <div class="overflow-x-auto p-2">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th class="px-4 py-4 rounded-tl-xl w-24">Bulan/Mg</th>
                        <th class="px-4 py-4">Tgl Laporan</th>
                        <th class="px-4 py-4">Plan %</th>
                        <th class="px-4 py-4">Aktual %</th>
                        <th class="px-4 py-4">Deviasi</th>
                        <th class="px-4 py-4">Status</th>
                        <th class="px-4 py-4 rounded-tr-xl">Aksi</th>
                    </tr>
                </thead>
                <tbody class="text-sm">
                    <tr class="hover:bg-slate-50/50 transition-colors border-b border-slate-50/70">
                        <td class="px-4 py-4 font-bold text-blue-950">B-4 / M-15</td>
                        <td class="px-4 py-4 font-medium text-slate-500">23 Mei 2026</td>
                        <td class="px-4 py-4 font-semibold text-slate-600">75.0%</td>
                        <td class="px-4 py-4 font-bold text-blue-950">72.0%</td>
                        <td class="px-4 py-4 font-bold text-red-500">-3.0%</td>
                        <td class="px-4 py-4"><span
                                class="px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-[10px] font-bold">Terlambat</span>
                        </td>
                        <td class="px-4 py-4"><button
                                class="text-blue-500 font-bold text-xs hover:underline">Edit</button></td>
                    </tr>
                    <tr class="hover:bg-slate-50/50 transition-colors border-b border-slate-50/70">
                        <td class="px-4 py-4 font-bold text-blue-950">B-4 / M-14</td>
                        <td class="px-4 py-4 font-medium text-slate-500">16 Mei 2026</td>
                        <td class="px-4 py-4 font-semibold text-slate-600">68.0%</td>
                        <td class="px-4 py-4 font-bold text-blue-950">69.5%</td>
                        <td class="px-4 py-4 font-bold text-emerald-500">+1.5%</td>
                        <td class="px-4 py-4"><span
                                class="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold">Aman</span>
                        </td>
                        <td class="px-4 py-4"><button
                                class="text-blue-500 font-bold text-xs hover:underline">Edit</button></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>