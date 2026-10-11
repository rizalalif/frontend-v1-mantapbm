<script setup>
import router from '@/router';
import { useRoute } from 'vue-router';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Chart from 'chart.js/auto';
import { useAuth } from '@/lib/Auth';
import CardTop from './Dashboard/CardTop.vue';
import api from '@/services/api';
import PaketKritisCard from './Dashboard/PaketKritisCard.vue';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { formatRupiah } from '@/lib/Helper.js';
import { Expand } from '@primeicons/vue';

Chart.register(ChartDataLabels);
let mapInstance = null;
let chartFisikInstance = null;
let chartKeuanganInstance = null;
let chartKategoriInstance = null;
let modalChartInstance = null;
const auth = useAuth();
const isLoading = ref(false);
const route = useRoute();

const chartFisikRef = ref(null)
const chartUangRef = ref(null)
const chartKategoriRef = ref(null)
const isEmptyFisik = ref(false)
const dashboardData = ref({
    totalPaket: 0,
    berjalan: 0,
    terlambat: 0,
    selesai: 0,
    nilaiKontrak: 0,
    percentageFisik: 0,
    percentageKeuangan: 0,
    rataFisik: 0,
    rataKeuangan: 0,
    paketKritis: [],
    dokumentasiTerbaru: [],
    summaryJenisPekerjaan: [],
    kurvaUang: {
        chartKeuanganKey: 0,
        kurvaRealisasi: [],
        kurvaRencana: [],
        labels: [],
    },
    kurvaFisik: {
        chartFisikKey: 0,
        kurvaRealisasi: [],
        // kurvaRencana: [],
        labels: [],
    },
    chartData: {
        labels: [],
        datasets: []
    }
});

const sebaranProyek = ref([
    {
        id_paket: "BM-2025-017",
        nama_paket: "Peningkatan Jalan AW Syahranie",
        kategori: "Jalan",
        latitude: -0.470512,
        longitude: 117.140233,
        progres_fisik: 76,
        status: "Berjalan",
        nilai_kontrak: "Rp 12,5 Miliar",
        lokasi: "Kec. Samarinda Ulu"
    },
    {
        id_paket: "BM-2025-024",
        nama_paket: "Rehabilitasi Jembatan Sungai Karang Mumus",
        kategori: "Jembatan",
        latitude: -0.493245,
        longitude: 117.152876,
        progres_fisik: 45,
        status: "Terlambat",
        nilai_kontrak: "Rp 8,2 Miliar",
        lokasi: "Kec. Samarinda Kota"
    },
    {
        id_paket: "BM-2025-036",
        nama_paket: "Pembangunan Irigasi Lempake",
        kategori: "Irigasi",
        latitude: -0.428522,
        longitude: 117.172591,
        progres_fisik: 100,
        status: "Selesai",
        nilai_kontrak: "Rp 4,1 Miliar",
        lokasi: "Kec. Samarinda Utara"
    },
    {
        id_paket: "BM-2025-041",
        nama_paket: "Pemeliharaan Rutin Jl. PM Noor",
        kategori: "Jalan",
        latitude: -0.463211,
        longitude: 117.155843,
        progres_fisik: 15,
        status: "Berjalan",
        nilai_kontrak: "Rp 2,3 Miliar",
        lokasi: "Kec. Sungai Pinang"
    },
    {
        id_paket: "BM-2025-055",
        nama_paket: "Peningkatan Jalan Cipto Mangunkusumo",
        kategori: "Jalan",
        latitude: -0.525544,
        longitude: 117.123512,
        progres_fisik: 90,
        status: "Berjalan",
        nilai_kontrak: "Rp 15,4 Miliar",
        lokasi: "Kec. Loa Janan Ilir"
    }
]);



const onKeyDown = (event) => {
    if (event.key === "Escape") {
        closeModal();
    }
};

const onModalOverlayClick = (e) => {
    const modalEl = document.getElementById('chartModal');
    if (e.target === modalEl) {
        if (modalChartInstance) {
            modalChartInstance.destroy();
            modalChartInstance = null;
        }
        closeModal();
    }
};

onMounted(async () => {
    await fetchDashboardData();
    // await loadKurvaUang()
    // await loadKurvaFisik()

    Chart.defaults.font.size = 10;
    Chart.defaults.plugins.legend.position = 'top';
    Chart.defaults.plugins.legend.labels.boxWidth = 10;

    const labelsBulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];

    // const ctxFisik = document.getElementById('chartFisik');
    // if (ctxFisik) {
    //     chartFisikInstance = new Chart(ctxFisik.getContext('2d'), {
    //         type: 'line',
    //         data: {
    //             labels: labelsBulan,
    //             datasets: [
    //                 {
    //                     label: 'Rencana (%)',
    //                     data: [15, 25, 35, 45, 54.2, 60, 65, 70, 75, 80, null, null],
    //                     borderColor: '#3b82f6',
    //                     backgroundColor: '#3b82f6',
    //                     tension: 0.6,
    //                     borderWidth: 2
    //                 },
    //                 {
    //                     label: 'Realisasi (%)',
    //                     data: [12, 20, 28, 38, 48.05, null, null, null, null, null, null, null],
    //                     borderColor: '#eab308',
    //                     backgroundColor: '#eab308',
    //                     tension: 0.4,
    //                     borderWidth: 2
    //                 }
    //             ]
    //         },
    //         options: {
    //             responsive: true,
    //             maintainAspectRatio: false,
    //             scales: {
    //                 x: { grid: { display: false } },
    //                 y: { ticks: { display: false }, border: { display: false }, grid: { display: false }, beginAtZero: true, max: 100 }
    //             }
    //         }
    //     });
    // }

    // const ctxKeuangan = document.getElementById('chartKeuangan');
    // if (ctxKeuangan) {
    //     const { labels, kurvaRencana, kurvaRealisasi } = dashboardData.value.kurvaUang
    //     chartKeuanganInstance = new Chart(ctxKeuangan.getContext('2d'), {
    //         type: 'line',
    //         data: {
    //             labels: labels,
    //             datasets: [
    //                 {
    //                     label: 'Rencana (%)',
    //                     data: kurvaRencana,
    //                     borderColor: '#22c55e',
    //                     backgroundColor: '#22c55e',
    //                     tension: 0.4,
    //                     borderWidth: 2
    //                 },
    //                 {
    //                     label: 'Realisasi (%)',
    //                     data: kurvaRealisasi,
    //                     borderColor: '#f97316',
    //                     backgroundColor: '#f97316',
    //                     tension: 0.4,
    //                     borderWidth: 2
    //                 }
    //             ]
    //         },
    //         options: {
    //             responsive: true,
    //             maintainAspectRatio: false,
    //             scales: {
    //                 x: { grid: { display: false } },
    //                 y: { ticks: { display: false }, border: { display: false }, grid: { display: false }, beginAtZero: true, max: 100 }
    //             }
    //         }
    //     });
    // }

    // const ctxKategori = document.getElementById('chartKategori');
    // if (ctxKategori) {
    //     chartKategoriInstance = new Chart(ctxKategori.getContext('2d'), {
    //         type: 'doughnut',
    //         data: {
    //             labels: ['0% - 25%', '25% - 50%', '50% - 75%', '75% - 100%'],
    //             datasets: [{
    //                 data: [12, 28, 38, 20],
    //                 backgroundColor: ['#3b82f6', '#f97316', '#eab308', '#22c55e'],
    //                 borderWidth: 0
    //             }]
    //         },
    //         options: {
    //             responsive: true,
    //             maintainAspectRatio: false,
    //             plugins: { legend: { display: false } },
    //             cutout: '75%'
    //         }
    //     });
    // }

    const modalEl = document.getElementById('chartModal');
    if (modalEl) {
        modalEl.addEventListener('click', onModalOverlayClick);
    }
    document.addEventListener('keydown', onKeyDown);
});

onUnmounted(() => {
    if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
    }
    if (chartFisikInstance) chartFisikInstance.destroy();
    if (chartKeuanganInstance) chartKeuanganInstance.destroy();
    if (chartKategoriInstance) chartKategoriInstance.destroy();
    if (modalChartInstance) modalChartInstance.destroy();

    const modalEl = document.getElementById('chartModal');
    if (modalEl) {
        modalEl.removeEventListener('click', onModalOverlayClick);
    }
    document.removeEventListener('keydown', onKeyDown);
});

function openModal(canvasId, titleText) {
    const sourceChart = Chart.getChart(canvasId);
    if (!sourceChart) {
        console.error("Chart belum selesai di-render atau ID tidak ditemukan.");
        return;
    }
    const modalEl = document.getElementById('chartModal');
    if (modalEl) modalEl.classList.remove('hidden');

    const titleEl = document.getElementById('modalTitle');
    if (titleEl) titleEl.innerText = titleText;

    const modalCanvas = document.getElementById('modalCanvas');
    if (modalCanvas) {
        const ctxModal = modalCanvas.getContext('2d');
        Chart.defaults.font.size = 14;

        if (modalChartInstance) {
            modalChartInstance.destroy();
        }

        modalChartInstance = new Chart(ctxModal, {
            type: sourceChart.config.type,
            data: sourceChart.config.data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { padding: 20 } },
                    tooltip: {
                        bodyFont: { size: 14 },
                        titleFont: { size: 16 }
                    }, datalabels: {
                        display: true,              // Tampilkan label
                        align: 'top',               // Posisikan tulisan di atas titik
                        anchor: 'end',              // Tumpuan ada di ujung titik
                        offset: 6,                  // Jarak tulisan dari titik (px)
                        color: '#0f172a',           // Warna tulisan (slate-900)
                        font: {
                            weight: 'bold',           // Huruf tebal
                            size: 11
                        },
                        // 4. Format angka agar lebih rapi (misal ditambah lambang %)
                        formatter: (value) => {
                            // Jika datanya null, undefined, atau 0, jangan tampilkan apa-apa
                            if (value === null || value === undefined || value === 0) {
                                return '';
                            }
                            return value + '%';
                        }
                    }
                },
                scales: sourceChart.config.type === 'line' ? { y: { max: 100, beginAtZero: true } } : {}
            }
        });
    }
}

function closeModal() {
    const modalEl = document.getElementById('chartModal');
    if (modalEl) modalEl.classList.add('hidden');

    if (modalChartInstance) {
        modalChartInstance.destroy();
        modalChartInstance = null;
    }

    Chart.defaults.font.size = 10;
}

const fetchDashboardData = async () => {
    isLoading.value = true;
    console.log('route query');
    console.log(route.query);

    const tahun = route.query.tahun || new Date().getFullYear();

    try {
        // Jalankan request ke berbagai endpoint secara BERSAMAAN (Paralel)
        const [totalData, paketBerjalan, paketSelesai, nilaiKontrak, paketKritis, percentageFisik, percentageKeuangan, dokumentasi] = await Promise.all([
            await api.get("/dashboard/total-paket", { params: { tahun } }),
            await api.get("/dashboard/total-paket-berjalan", { params: { tahun } }),
            await api.get("/dashboard/total-paket-selesai", { params: { tahun } }),
            await api.get("/dashboard/total-nilai-kontrak", { params: { tahun } }),
            await api.get("/dashboard/paket-kritis", { params: { tahun } }),
            await api.get("/dashboard/persentase-fisik", { params: { tahun } }),
            await api.get("/dashboard/persentase-keuangan", { params: { tahun } }),
            await api.get("/documentation"),
        ]);

        console.log("Data total: ", totalData.data);

        dashboardData.value.totalPaket = totalData.data.data;
        dashboardData.value.berjalan = paketBerjalan.data.data;
        dashboardData.value.selesai = paketSelesai.data.data;
        dashboardData.value.nilaiKontrak = nilaiKontrak.data.data;
        dashboardData.value.percentageFisik = percentageFisik.data.data;
        dashboardData.value.percentageKeuangan = percentageKeuangan.data.data;
        dashboardData.value.dokumentasiTerbaru = dokumentasi.data.data
        dashboardData.value.paketKritis = paketKritis.data.data.map((paket, i) => {
            console.log("paketKristisMap", paket);

            let keterangan = null;
            let tglLaporan = null;

            const status = paket.statusKondisi ?? '-';

            if (paket.progressFisiks.length > 0) {
                keterangan = paket.progressFisiks[0].keterangan ?? '-';
                tglLaporan = paket.progressFisiks[0].tglLaporan ?? '-';
            }

            return { name: paket.name, kodePaket: paket.kodePaket, keterangan, tglLaporan: new Date(tglLaporan).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }), status }

        });


        console.log("paketKritis.data.data", paketKritis.data.data);
        console.log("docs.data.data", dokumentasi.data.data);
        console.log("dashboardData.value.data", dashboardData.value.paketKritis);
        console.log("percentage_keuangan", percentageKeuangan.data);

        dashboardData.value.kurvaUang.chartKeuanganKey++;
    } catch (error) {
        console.error("Gagal memuat dashboard", error);
    } finally {
        // Matikan efek loading apa pun yang terjadi (berhasil atau gagal)
        isLoading.value = false;
    }
};

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

const loadSummaryByJenisPekerjaan = async () => {

    console.log('loaded jenis');
    const tahun = route.query.tahun || new Date().getFullYear();

    try {
        const response = await api.get("/dashboard/summary-jenis", { params: { tahun } })
        dashboardData.value.summaryJenisPekerjaan = response.data.data;
        console.log("response.data.data jenis pekerjaan", response);
    } catch (error) {
        console.error("Gagal memuat kurva jenis", error);
    }
}

const loadChartJenisPekerjaan = async () => {

    console.log('loaded jenis');
    const tahun = route.query.tahun || new Date().getFullYear();

    try {
        const response = await api.get("/dashboard/paket-jenis", { params: { tahun } })
        if (chartKategoriInstance) {

            chartKategoriInstance.destroy();
            chartKategoriInstance = null;
        }
        console.log("response.data.data jenis pekerjaan", response.data.data);

        const { labels, data } = response.data.data
        const backgroundColors = Array.from({ length: labels.length }, getRandomColor);
        chartKategoriInstance = new Chart(chartKategoriRef.value, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                cutout: '75%'
            }
        });
    } catch (error) {
        console.error("Gagal memuat kurva jenis", error);

    }
}

const loadKurvaUang = async () => {
    console.log('loaded kurva uang');
    const tahun = route.query.tahun || new Date().getFullYear();
    try {
        const response = await api.get("/dashboard/kurva-uang", { params: { tahun } })
        if (chartKeuanganInstance) {
            console.log("ada");

            chartKeuanganInstance.destroy();
            chartKeuanganInstance = null;
        }
        const { labels, rencana, aktual } = response.data.data
        chartKeuanganInstance = new Chart(chartUangRef.value, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Rencana (%)',
                        data: rencana,
                        borderColor: '#22c55e',
                        backgroundColor: '#22c55e',
                        tension: 0.4,
                        borderWidth: 2
                    },
                    {
                        label: 'Realisasi (%)',
                        data: aktual,
                        borderColor: '#f97316',
                        backgroundColor: '#f97316',
                        tension: 0.2,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                // layout: {
                //     padding: {
                //         top: 30
                //     }
                // },
                maintainAspectRatio: false,
                scales: {
                    x: { grid: { display: false } },
                    y: { ticks: { display: false }, border: { display: false }, grid: { display: false }, beginAtZero: true, max: 100 }
                },
                plugins: {
                    legend: {
                        display: false // Hides the legend
                    },
                    datalabels: {
                        display: true,              // Tampilkan label
                        align: 'top',               // Posisikan tulisan di atas titik
                        anchor: 'end',              // Tumpuan ada di ujung titik
                        offset: 6,                  // Jarak tulisan dari titik (px)
                        color: '#0f172a',           // Warna tulisan (slate-900)
                        font: {
                            weight: 'bold',           // Huruf tebal
                            size: 11
                        },
                        // 4. Format angka agar lebih rapi (misal ditambah lambang %)
                        formatter: (value, context) => {
                            const lastValueIndex = aktual.filter(val => val !== null && val !== undefined).length

                            // Jika datanya null, undefined, atau 0, jangan tampilkan apa-apa
                            if (value === null || value === undefined || value === 0) {
                                return '';
                            }
                            if (context.dataIndex !== lastValueIndex - 1) {
                                console.log('last');
                                console.log(context.dataIndex);
                                console.log(lastValueIndex);

                                return '';
                            }
                            return value + '%';
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error("Gagal memuat kurva uang", error);
    }
}

const loadKurvaFisik = async () => {
    console.log('loaded kurva fisik');

    try {
        const tahun = route.query.tahun || new Date().getFullYear();
        const responseFisik = await api.get("/dashboard/kurva-fisik", { params: { tahun } })
        const responseUang = await api.get("/dashboard/kurva-uang", { params: { tahun } })
        isEmptyFisik.value = false
        const aktualKeuangan = responseUang.data.data.aktual
        if (chartFisikInstance) {
            chartFisikInstance.destroy();
            chartFisikInstance = null;
        }
        const { labels, aktual } = responseFisik.data.data
        if (labels.length === 0 || aktual.length === 0) {
            isEmptyFisik.value = true
            return;
        }
        chartFisikInstance = new Chart(chartFisikRef.value, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Realisasi Fisik',
                        data: aktual,
                        borderColor: '#3b82f6',
                        backgroundColor: '#3b82f6',
                        tension: 0.6,
                        borderWidth: 2,
                        datalabels: {
                            anchor: 'end', // Place at the top of the data point
                            align: 'top'   // Align text above the anchor
                        }
                    },
                    {
                        label: 'Realisasi Keuangan',
                        data: aktualKeuangan,
                        borderColor: '#eab308',
                        backgroundColor: '#eab308',
                        tension: 0.4,
                        borderWidth: 2,
                        datalabels: {
                            anchor: 'start', // Place at the bottom of the data point
                            align: 'bottom'  // Align text below the anchor
                        }
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { grid: { display: false } },
                    y: { ticks: { display: false }, border: { display: false }, grid: { display: false }, beginAtZero: true, max: 100 }
                },
                plugins: {
                    legend: {
                        display: true // Hides the legend
                    },
                    datalabels: {
                        display: true,              // Tampilkan label
                        // align: 'top',               // Posisikan tulisan di atas titik
                        // anchor: 'end',              // Tumpuan ada di ujung titik
                        offset: 6,                  // Jarak tulisan dari titik (px)
                        color: '#0f172a',           // Warna tulisan (slate-900)
                        font: {
                            weight: 'bold',           // Huruf tebal
                            size: 11
                        },
                        // 4. Format angka agar lebih rapi (misal ditambah lambang %)
                        formatter: (value, context) => {
                            const lastValueIndex = aktual.filter(val => val !== null && val !== undefined).length

                            // Only return the label value if it's the last item

                            // Jika datanya null, undefined, atau 0, jangan tampilkan apa-apa
                            if (value === null || value === undefined || value === 0) {
                                return '';
                            }
                            if (context.dataIndex !== lastValueIndex - 1) {
                                console.log('last');
                                console.log(context.dataIndex);
                                console.log(lastValueIndex);

                                return '';
                            }
                            return value + '%';
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error("Gagal memuat kurva fisik", error);

    }
}
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(date);
};
const loadMap = async () => {
    const dataProyek = [
        {
            id_paket: "BM-2025-017",
            nama: "Long Bagun - Long Apung",
            lat: 0.816, lng: 114.331,
            status: "Terlambat",
            warna: "#ef4444"
        },
        {
            id_paket: "BM-2025-024",
            nama: "Muara Wahau - Bts. Kaltara",
            lat: 1.121, lng: 116.822,
            status: "Berjalan",
            warna: "#3b82f6"
        },
        {
            id_paket: "BM-2025-036",
            nama: "Kaubun - Long Iram",
            lat: 0.985, lng: 117.854,
            status: "Selesai",
            warna: "#22c55e"
        },
        {
            id_paket: "BM-2025-041",
            nama: "Batu Sopang - Tanjung Aru",
            lat: -1.916, lng: 115.908,
            status: "Berjalan",
            warna: "#3b82f6"
        },
        {
            id_paket: "BM-2025-058",
            nama: "Sepaku - Waru",
            lat: -0.932, lng: 116.745,
            status: "Berjalan",
            warna: "#3b82f6"
        }
    ];

    console.log('loaded map');

    const tahun = route.query.tahun || new Date().getFullYear();
    try {
        const response = await api.get("/dashboard/paket-location", { params: { tahun } });

        const paketData = response.data.data;

        const mapElement = document.getElementById('map');
        if (mapElement) {
            if (mapElement._leaflet_id) {
                mapElement._leaflet_id = null;
            }
            mapInstance = L.map(mapElement).setView([0.5387, 116.4194], 6);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 18
            }).addTo(mapInstance);



            paketData.forEach(proyek => {
                console.log(proyek.statusKondisi);

                L.circleMarker([proyek.latitude, proyek.longitude], {
                    radius: 7,
                    fillColor: "#3b82f6",
                    color: "#ffffff",
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.9
                }).addTo(mapInstance)
                    .bindPopup(`
            <div class="font-sans">
                <span class="text-[10px] font-bold text-gray-400">${proyek.id}</span>
                <h4 class="text-xs font-bold text-gray-800 mb-1 leading-tight">${proyek.city}</h4>
                <span class="text-[10px] px-2 py-0.5 rounded text-white" style="background-color: #3cb371;">
                    ${proyek.statusKondisi}
                </span>
            </div>
        `);
            });
        }

    } catch (error) {
        console.error("Gagal memuat data peta", error);
    }
}

function formatWithCustomSeparators(number, thousandSep, decimalSep) {
    const parts = new Intl.NumberFormat('id-ID', {
        notation: 'compact',
        compactDisplay: 'short',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).formatToParts(number);

    return parts.map(part => {
        if (part.type === 'group') return thousandSep;
        if (part.type === 'decimal') return decimalSep;
        return part.value;
    }).join('');
}

// Example: Use a space ' ' for thousands and a dot '.' for decimals
// console.log(formatWithCustomSeparators(number, '.', ','));

watch(
    () => route.query.tahun,
    (tahun) => {
        console.log("tahun", tahun);

        fetchDashboardData(tahun);
        loadKurvaUang()
        loadKurvaFisik()
        loadMap()
        loadChartJenisPekerjaan()
        loadSummaryByJenisPekerjaan()

    },
    { deep: true, immediate: true }
);

</script>

<template>
    <div id="chartModal"
        class="fixed inset-0 z-[100] bg-slate-900 bg-opacity-80 hidden flex items-center justify-center p-4 md:p-8 backdrop-blur-sm transition-opacity">
        <div
            class="bg-white rounded-xl shadow-2xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col overflow-hidden animate-bounce-short">

            <!-- Modal Header -->
            <div class="p-4 bg-slate-50 border-b border-gray-200 flex justify-between items-center">
                <h3 id="modalTitle" class="text-lg font-bold text-slate-800 uppercase">Detail Grafik</h3>
                <button @click="closeModal"
                    class="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-colors">
                    <i class="fa-solid fa-xmark text-lg"></i>
                </button>
            </div>

            <!-- Modal Body (Canvas) -->
            <div class="p-4 md:p-6 flex-1 relative w-full h-full min-h-[400px]">
                <canvas id="modalCanvas"></canvas>
            </div>

        </div>
    </div>
    <div>
        <!-- ROW 1: SUMMARY CARDS (6 Kolom) -->
        <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5 mb-6">
            <!-- 1. Total Paket -->
            <CardTop title="Total Paket" :value="dashboardData.totalPaket"></CardTop>
            <!-- 2. Paket Berjalan -->
            <CardTop title="Paket Berjalan" :value="dashboardData.berjalan"></CardTop>
            <!-- 3. Paket Selesai -->
            <CardTop title="Paket Selesai" :value="dashboardData.selesai"></CardTop>
            <!-- <div
            class="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Paket Selesai</p>
            <h2 class="text-3xl font-extrabold text-blue-950 mb-1">30</h2>
        </div> -->
            <!-- 4. Nilai Kontrak -->
            <CardTop title="Total Nilai Kontrak"
                :value="dashboardData.nilaiKontrak ? formatWithCustomSeparators(Number(dashboardData.nilaiKontrak), ',', '.') : 0">
            </CardTop>
            <!-- <div
                class="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Nilai Kontrak
                </p>
                <h2 class="text-3xl font-extrabold text-blue-950 mb-1 text-nowrap">Rp 2,45 <span
                        class="text-lg">T</span></h2>
            </div> -->
            <!-- 5. Rata-rata Progres Fisik -->
            <CardTop title="Realisasi Fisik" :value="dashboardData.percentageFisik + '%'"></CardTop>

            <!-- 6. Rata-rata Progres Keuangan -->
            <CardTop title="Realisasi Keuangan" :value="dashboardData.percentageKeuangan + '%'"></CardTop>

        </div>

        <!-- MIDDLE SECTION: CHARTS (Left/Center) & KENDALA (Right Vertically) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 ">

            <!-- KIRI: 4 Grafik (2 Baris x 2 Kolom) -->
            <div
                class="md:col-start-1 md:col-end-3 bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 h-[300px] flex flex-col">
                <div class="flex justify-between cursor-pointer">
                    <h3 class="font-bold text-sm text-blue-950 uppercase tracking-wide mb-4">Grafik Progres Realisasi
                        <span class="text-slate-400 font-medium normal-case text-[10px]">(Fisik vs
                            Keuangan)</span>
                    </h3>
                    <Expand v-if="!isEmptyFisik"
                        @click="openModal('chartFisik', 'Grafik Progres Fisik (Rencana vs Realisasi)')" />
                </div>
                <div
                    class="flex-1 rounded-2xl flex items-center justify-center text-slate-400 text-sm font-medium relative flex-col pb-4">
                    <div v-if="isEmptyFisik" class="flex flex-col items-center justify-center text-center w-full">
                        <i class="fas fa-chart-line text-gray-300 mb-3" style="font-size: 3rem;"></i>
                        <p class="italic">Belum ada data progres</p>
                    </div>
                    <canvas id="chartFisik" ref="chartFisikRef"></canvas>

                </div>
            </div>
            <!-- Grafik Keuangan -->
            <div
                class="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 h-[300px] flex flex-col">
                <PaketKritisCard :data="dashboardData.paketKritis" :class="'custom-scrollbar-x'" />
            </div>

            <!-- Peta Sebaran -->
            <div @click="$router.push({ path: '/peta-proyek' })"
                class="md:col-span-1 bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 h-[300px] flex flex-col relative">
                <!-- Peta -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex flex-col">
                    <h3 class="text-xs font-bold text-gray-700 mb-2 uppercase">Peta Sebaran Proyek</h3>
                    <!-- ID 'map' akan di-render oleh Leaflet -->
                    <div id="map"
                        class="flex-1 rounded border border-gray-200 overflow-hidden relative min-h-[12rem] z-0">
                    </div>
                </div>
            </div>
            <!-- Summary By Jenis Pekerjaan -->

            <div
                class="md:col-span-2 z-5 bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 h-[300px] flex flex-col">
                <div class="overflow-x-auto ">
                    <table class="w-full text-left border-collapse">
                        <thead class="sticky top-0 z-20 bg-white">
                            <tr class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <th class="px-4 py-4 text-center rounded-tl-xl">SUB PROGRAM KEGIATAN</th>
                                <th class="px-4 py-4 text-center">Nilai Pagu</th>
                                <th class="px-4 py-4 text-center ">Nilai Kontrak</th>
                                <th class="px-4 py-4 text-center ">Progress Fisik</th>
                                <th class="px-4 py-4 text-center ">Progress Keuangan</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm overflow-y-auto">

                            <!-- ROW 1 -->
                            <tr
                                v-if="!dashboardData.summaryJenisPekerjaan || dashboardData.summaryJenisPekerjaan.length === 0">
                                <td colspan="5" class="text-center py-8 text-slate-400 text-sm font-medium">

                                    <div class="flex flex-col justify-center items-center">


                                        <svg class="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                            </path>
                                        </svg>
                                        <span class="text-xs italic">Data belum diinput</span>
                                    </div>
                                </td>
                            </tr>
                            <tr v-for="data in dashboardData.summaryJenisPekerjaan"
                                class="hover:bg-slate-50/50 transition-colors border-b border-slate-50/70 group">
                                <!-- <RouterLink :to="'/paket/detail'"> -->
                                <td class="text-left px-4 py-5">
                                    <p class="font-bold text-blue-950 mb-0.5 line-clamp-2">{{ data.jenisPekerjaan
                                        }}</p>
                                </td>
                                <td class="text-center px-4 py-5 font-bold text-blue-950 text-nowrap">{{
                                    formatRupiah(data.akumulasiPagu)
                                }}</td>
                                <td class="text-center px-4 py-5 font-bold text-blue-950 text-nowrap">{{
                                    formatRupiah(data.akumulasiKontrak) }}</td>

                                <td class="text-center px-4 py-5 font-bold text-blue-950">
                                    {{ data.persenFisik }} %
                                </td>
                                <td class="text-center px-4 py-5 font-bold text-blue-950">
                                    {{ data.persenKeuangan }} %

                                </td>

                                <!-- </RouterLink to="/paket/detail"> -->
                            </tr>




                        </tbody>
                    </table>
                </div>
                <!-- <div
                    class="flex-1 rounded-2xl flex items-center justify-center text-slate-400 text-sm font-medium relative">
                    <canvas id="chartFisik" ref="chartFisikRef"></canvas>
                </div> -->
            </div>


            <!-- <div class=""></div> -->
            <!-- KANAN: Kendala Terbaru (Kolom Vertikal Tinggi) -->

        </div>

        <!-- ROW 3: DOKUMENTASI TERBARU (Horizontal di Bawah) -->
        <div
            class="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col">
            <div class="flex items-center justify-between mb-5">
                <h3 class="font-bold text-sm text-blue-950 uppercase tracking-wide">Galeri Dokumentasi Terbaru</h3>
                <!-- <a href="#" class="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">Lihat
                    Semua →</a> -->
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Image 1 -->
                <div v-for="value in dashboardData.dokumentasiTerbaru"
                    :class="`h-44 bg-[url('http://100.114.142.21:3002/images/${value.fileName}')]`"
                    class="bg-cover bg-center rounded-2xl relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <img :src="`http://100.114.142.21:3002/images/${value.fileName}`" alt=""
                        class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-90">
                    </div>
                    <div class="absolute bottom-4 left-4 right-4">
                        <p class="text-[10px] text-white/70 font-bold mb-0.5">{{ formatDate(value.date) }}</p>
                        <p class="text-sm font-bold text-white leading-tight">{{ value?.paket?.name }}</p>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped>
/* Tambahan animasi smooth munculnya pop up */
@keyframes bounceShort {
    0% {
        transform: scale(0.95);
        opacity: 0;
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}

.animate-bounce-short {
    animation: bounceShort 0.2s ease-out forwards;
}
</style>
