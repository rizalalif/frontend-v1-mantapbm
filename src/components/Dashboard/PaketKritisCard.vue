<script setup>
const props = defineProps({ data: Array })
const getStatusBadgeClass = (status) => {
    if (!status) return 'px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold';
    const s = String(status).toLowerCase();
    if (s.includes('kritis')) {
        return 'px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-[10px] font-bold';
    }
    if (s.includes('aman')) {
        return 'px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold';
    }
    if (s.includes('perhatian')) {
        return 'px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-md text-[10px] font-bold';
    }
    return 'px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold';
};
</script>
<template>
    <div
        class="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 h-full flex flex-col lg:col-span-1 overflow-y-auto custom-scrollbar-x">
        <div class="flex items-center justify-between mb-6">
            <h3 class="font-bold text-sm text-blue-950 uppercase tracking-wide">Paket Perlu Perhatian</h3>
        </div>

        <div class="flex-1 flex flex-col gap-5 overflow-y-auto pr-2 ">
            <!-- List 1 -->
            <div v-if="data.length === 0" class="flex flex-col items-center justify-center h-full text-slate-400">
                <svg class="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                    </path>
                </svg>
                <span class="text-xs italic">Tidak ada kendala.</span>
            </div>
            <div v-else v-for="paket in data" class="pb-4 border-b border-slate-50">
                <div class="flex justify-between items-center mb-1">
                    <p class="text-[10px] font-bold text-slate-400">{{ paket.tglLaporan }} <span class="mx-1">•</span>
                        {{ paket.kodePaket }}</p>
                    <span :class="getStatusBadgeClass(paket.status)">{{ paket.status
                        }}</span>
                </div>
                <p class="text-sm font-semibold text-slate-700 leading-snug">{{ paket.keterangan }}.</p>
            </div>
            <!-- List 2 -->


        </div>
    </div>
</template>

<style scoped>
.custom-scrollbar-x::-webkit-scrollbar {
    height: 8px;
}

.custom-scrollbar-x::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar-x::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 10px;
}

.custom-scrollbar-x::-webkit-scrollbar-thumb:hover {
    background-color: #94a3b8;
}
</style>