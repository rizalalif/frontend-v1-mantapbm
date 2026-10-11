<script setup>

</script>
<template>
    <aside class="w-64 bg-primary text-gray-300 flex flex-col shadow-xl z-20">
        <div class="p-4 flex items-center gap-3 border-b border-gray-700">
            <div class="w-8 h-8 bg-white rounded flex items-center justify-center text-primary font-bold">
                <i class="fa-solid fa-bridge"></i>
            </div>
            <div>
                <h1 class="font-bold text-white leading-tight">MANTAP BM</h1>
                <p class="text-[10px]">Monitoring Bina Marga</p>
            </div>
        </div>

        <nav class="flex-1 overflow-y-auto py-4">
            <ul class="space-y-1 px-2">
                <li>
                    <a href="#"
                        class="flex items-center gap-3 px-3 py-2 bg-accent text-primary font-semibold rounded-md">
                        <i class="fa-solid fa-border-all w-5"></i> Beranda
                    </a>
                </li>
                <li>
                    <a href="#"
                        class="flex items-center gap-3 px-3 py-2 hover:bg-secondary hover:text-white rounded-md transition">
                        <i class="fa-solid fa-box-open w-5"></i> Paket Pekerjaan
                    </a>
                </li>
                <li>
                    <a href="#"
                        class="flex items-center gap-3 px-3 py-2 hover:bg-secondary hover:text-white rounded-md transition">
                        <i class="fa-solid fa-chart-line w-5"></i> Progres Fisik
                    </a>
                </li>
                <li>
                    <a href="#"
                        class="flex items-center gap-3 px-3 py-2 hover:bg-secondary hover:text-white rounded-md transition">
                        <i class="fa-solid fa-coins w-5"></i> Progres Keuangan
                    </a>
                </li>
                <li>
                    <a href="#"
                        class="flex items-center gap-3 px-3 py-2 hover:bg-secondary hover:text-white rounded-md transition">
                        <i class="fa-solid fa-map-location-dot w-5"></i> Peta Proyek
                    </a>
                </li>
                <li>
                    <a href="#"
                        class="flex items-center gap-3 px-3 py-2 hover:bg-secondary hover:text-white rounded-md transition">
                        <i class="fa-solid fa-triangle-exclamation w-5"></i> Kendala
                    </a>
                </li>
                <li>
                    <a href="#"
                        class="flex items-center gap-3 px-3 py-2 hover:bg-secondary hover:text-white rounded-md transition">
                        <i class="fa-solid fa-camera w-5"></i> Dokumentasi
                    </a>
                </li>
            </ul>

            <div class="mt-8 px-4">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Filter</h3>
                <div class="space-y-3">
                    <div>
                        <label class="block text-[11px] mb-1">Tahun Anggaran</label>
                        <select class="w-full bg-secondary border border-gray-600 rounded p-1.5 text-xs text-white">
                            <option>2025</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-[11px] mb-1">Sumber Dana</label>
                        <select class="w-full bg-secondary border border-gray-600 rounded p-1.5 text-xs text-white">
                            <option>Semua</option>
                        </select>
                    </div>
                    <button
                        class="w-full mt-2 border border-accent text-accent hover:bg-accent hover:text-primary transition py-1.5 rounded text-xs font-semibold">
                        Terapkan Filter
                    </button>
                </div>
            </div>
        </nav>
    </aside>
    <div class="flex-1 flex flex-col h-screen overflow-hidden">

            <header class="bg-primary text-white p-4 flex justify-between items-center shadow z-10">
                <div>
                    <h2 class="font-bold text-lg leading-none">DASHBOARD MONITORING PROYEK BINA MARGA</h2>
                    <p class="text-gray-400 text-xs mt-1">PROVINSI KALIMANTAN TIMUR</p>
                </div>
                <div class="flex items-center gap-4">
                    <div
                        class="bg-secondary px-3 py-1.5 rounded border border-gray-600 text-xs flex items-center gap-2">
                        <span>Periode Data: 31 Mei 2025</span>
                        <i class="fa-solid fa-chevron-down text-[10px]"></i>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                            <i class="fa-solid fa-user"></i>
                        </div>
                        <div class="text-xs">
                            <p class="font-bold">Admin BM</p>
                            <p class="text-gray-400">Dinas PUPR & PERA Kaltim</p>
                        </div>
                    </div>
                </div>
            </header>

            <main class="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#f8fafc]">

                <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                    <div class="bg-primary text-white rounded-lg p-4 shadow-sm flex flex-col justify-between">
                        <p class="text-xs text-gray-300 font-semibold mb-1">TOTAL PAKET</p>
                        <div class="flex justify-between items-end">
                            <div>
                                <h3 class="text-2xl font-bold">128</h3>
                                <p class="text-[10px] text-gray-400 mt-1">100% dari total</p>
                            </div>
                            <i class="fa-solid fa-clipboard-list text-2xl text-gray-400 opacity-50"></i>
                        </div>
                    </div>
                    <div class="bg-blue-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-between">
                        <p class="text-xs text-blue-200 font-semibold mb-1">PAKET BERJALAN</p>
                        <div class="flex justify-between items-end">
                            <div>
                                <h3 class="text-2xl font-bold">98</h3>
                                <p class="text-[10px] text-blue-300 mt-1">76,56% dari total</p>
                            </div>
                            <i class="fa-solid fa-briefcase text-2xl text-blue-400 opacity-50"></i>
                        </div>
                    </div>
                    <div class="bg-green-600 text-white rounded-lg p-4 shadow-sm flex flex-col justify-between">
                        <p class="text-xs text-green-200 font-semibold mb-1">PAKET SELESAI</p>
                        <div class="flex justify-between items-end">
                            <div>
                                <h3 class="text-2xl font-bold">30</h3>
                                <p class="text-[10px] text-green-200 mt-1">23,44% dari total</p>
                            </div>
                            <i class="fa-solid fa-check-circle text-2xl text-green-300 opacity-50"></i>
                        </div>
                    </div>
                    <div class="bg-indigo-900 text-white rounded-lg p-4 shadow-sm flex flex-col justify-between">
                        <p class="text-xs text-indigo-300 font-semibold mb-1">TOTAL NILAI KONTRAK</p>
                        <div class="flex justify-between items-end">
                            <div>
                                <h3 class="text-2xl font-bold">Rp 2,45 T</h3>
                                <p class="text-[10px] text-indigo-300 mt-1">100% dari total</p>
                            </div>
                            <i class="fa-solid fa-rupiah-sign text-2xl text-indigo-400 opacity-50"></i>
                        </div>
                    </div>
                    <div class="bg-teal-600 text-white rounded-lg p-4 shadow-sm flex flex-col justify-between">
                        <p class="text-xs text-teal-200 font-semibold mb-1">RATA-RATA PROGRES FISIK</p>
                        <div class="flex justify-between items-end">
                            <div>
                                <h3 class="text-2xl font-bold">54,32%</h3>
                                <p class="text-[10px] text-teal-100 mt-1">Deviasi <span
                                        class="text-red-300">-6,15%</span></p>
                            </div>
                            <i class="fa-solid fa-arrow-trend-up text-2xl text-teal-300 opacity-50"></i>
                        </div>
                    </div>
                    <div class="bg-cyan-700 text-white rounded-lg p-4 shadow-sm flex flex-col justify-between">
                        <p class="text-xs text-cyan-200 font-semibold mb-1">RATA-RATA PROGRES KEUANGAN</p>
                        <div class="flex justify-between items-end">
                            <div>
                                <h3 class="text-2xl font-bold">48,75%</h3>
                                <p class="text-[10px] text-cyan-100 mt-1">Deviasi <span
                                        class="text-red-300">-5,80%</span></p>
                            </div>
                            <i class="fa-solid fa-sack-dollar text-2xl text-cyan-300 opacity-50"></i>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                        <h3 class="text-xs font-bold text-gray-700 mb-4 uppercase">Grafik Progres Fisik (Rencana vs
                            Realisasi)</h3>
                        <div class="h-48 relative w-full">
                            <canvas id="chartFisik"></canvas>
                        </div>
                    </div>
                    <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                        <h3 class="text-xs font-bold text-gray-700 mb-4 uppercase">Grafik Progres Keuangan (Rencana vs
                            Realisasi)</h3>
                        <div class="h-48 relative w-full">
                            <canvas id="chartKeuangan"></canvas>
                        </div>
                    </div>
                    <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex flex-col">
                        <h3 class="text-xs font-bold text-gray-700 mb-2 uppercase">Peta Sebaran Proyek</h3>
                        <div
                            class="flex-1 bg-blue-50 rounded border border-gray-200 overflow-hidden relative min-h-[12rem]">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31890.65593175402!2d117.1130635!3d-0.502106!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2df67f33db5ebbb3%3A0x6b09312521dd9f25!2sSamarinda%2C%20Kalimantan%20Timur!5e0!3m2!1sid!2sid!4v1689123456789!5m2!1sid!2sid"
                                class="absolute inset-0 w-full h-full" style="border:0;" allowfullscreen=""
                                loading="lazy">
                            </iframe>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                        <h3 class="text-xs font-bold text-gray-700 mb-4 uppercase">Progres Fisik Berdasarkan Kategori
                        </h3>
                        <div class="h-40 relative w-full flex justify-center">
                            <canvas id="chartKategori"></canvas>
                        </div>
                        <p class="text-xs text-gray-500 mt-4 text-center">Total: 98 Paket</p>
                    </div>

                    <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                        <h3 class="text-xs font-bold text-gray-700 mb-4 uppercase">Kendala Terbaru</h3>
                        <div class="space-y-4">
                            <div class="border-b border-gray-100 pb-2">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <p class="text-[10px] text-gray-400">30 Mei 2025 | BM-2025-017</p>
                                        <p class="text-xs font-semibold text-gray-700 mt-0.5">Pengiriman material
                                            agregat terlambat</p>
                                    </div>
                                    <span
                                        class="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded font-bold">Tinggi</span>
                                </div>
                            </div>
                            <div class="border-b border-gray-100 pb-2">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <p class="text-[10px] text-gray-400">29 Mei 2025</p>
                                        <p class="text-xs font-semibold text-gray-700 mt-0.5">Cuaca ekstrem / hujan
                                            berlebih</p>
                                    </div>
                                    <span
                                        class="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded font-bold">Sedang</span>
                                </div>
                            </div>
                            <div class="pb-1">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <p class="text-[10px] text-gray-400">28 Mei 2025</p>
                                        <p class="text-xs font-semibold text-gray-700 mt-0.5">Kendala lahan dan izin
                                            masyarakat</p>
                                    </div>
                                    <span
                                        class="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded font-bold">Sedang</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                        <h3 class="text-xs font-bold text-gray-700 mb-4 uppercase">Dokumentasi Terbaru</h3>
                        <div class="grid grid-cols-2 gap-2">
                            <div class="relative group rounded overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1541888086925-926eb1b6c57d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                                    alt="Proyek 1" class="w-full h-20 object-cover">
                                <div
                                    class="absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-[9px] p-1 truncate">
                                    BM-2025-017 Long Bagun</div>
                            </div>
                            <div class="relative group rounded overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                                    alt="Proyek 2" class="w-full h-20 object-cover">
                                <div
                                    class="absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-[9px] p-1 truncate">
                                    BM-2025-024 Muara Wahau</div>
                            </div>
                            <div class="relative group rounded overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                                    alt="Proyek 3" class="w-full h-20 object-cover">
                                <div
                                    class="absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-[9px] p-1 truncate">
                                    BM-2025-036 Kaubun</div>
                            </div>
                            <div class="relative group rounded overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1621501103258-3e0aecc6a04e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                                    alt="Proyek 4" class="w-full h-20 object-cover">
                                <div
                                    class="absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-[9px] p-1 truncate">
                                    BM-2025-041 Batu Sopang</div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
</template>
<style scoped></style>