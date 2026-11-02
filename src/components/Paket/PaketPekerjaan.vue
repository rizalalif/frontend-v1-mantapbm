<script setup>
import router from '@/router';
import { computed, onMounted, ref, nextTick } from 'vue';
import api from '@/services/api';
import { useAuth } from '@/lib/Auth';
import DeleteModal from '../utils/DeleteModal.vue';
import { FileExcel, FilePdf } from '@primeicons/vue';
import * as XLSX from 'xlsx';
import { generateExcel } from '@/lib/Helper.js';
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
const pakets = ref([]);
const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');
const emit = defineEmits(['refresh']);

const breakpoints = useBreakpoints({
    phone: 0,       // Small vertical phones
    tablet: 640,    // Vertical tablets / large phones
    laptop: 1024,   // Horizontal tablets & small laptops
    desktop: 1280,
})
// const breakpoints = useBreakpoints(breakpointsTailwind)
const currentBreakpoint = breakpoints.active()
const isMobile = breakpoints.between('phone', 'tablet')
const isTablet = breakpoints.between('tablet', 'laptop')
const auth = useAuth()

const statusOptions = ref([
    { label: "Semua Status", value: null },
    { label: "Berjalan", value: "berjalan" },
    { label: "Paket Saya", value: "my" },
    { label: "Draft", value: "draft" },
    { label: "Selesai", value: "selesai" },
    { label: "Batal", value: "batal" },
]);

const selectedStatus = ref(null);
const yearOptions = ref([
    { label: "Semua", value: null },
    { label: "2026", value: 2026 },
    { label: "2025", value: 2025 },
]);
const selectedYear = ref(null);
const searchQuery = ref('');
const showOverlay = ref(false);
const searchContainer = ref(null);

// State untuk Export PDF
const tablePrintContainerRef = ref(null);
const isGeneratingPdf = ref(false);
const isPdfMode = ref(false);

const progressFisik = ref([
    {
        id_paket: "BM-2025-017",
        nama_paket: "Peningkatan Jalan AW Syahranie",
        kategori: "Jalan",
        latitude: -0.470512,
        longitude: 117.140233,
        progres_fisik: 76,
        status: "Berjalan", // Pin warna Biru/Hijau
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
        status: "Terlambat", // Pin warna Merah
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
        status: "Selesai", // Pin warna Abu-abu/Hijau Gelap
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
        status: "Berjalan", // Pin warna Biru/Hijau
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
        status: "Berjalan", // Pin warna Biru/Hijau
        nilai_kontrak: "Rp 15,4 Miliar",
        lokasi: "Kec. Loa Janan Ilir"
    }
]);
// Daftar properti/kolom yang bisa dijadikan filter spesifik
const availableProperties = [
    { key: 'name', label: 'Nama Paket' },
    { key: 'noKontrak', label: 'Nomor Kontrak' },
    { key: 'kodePaket', label: 'Kode RUP' },
    { key: 'kodeKegiatan', label: 'Kode Kegiatasn' },

];

// ==========================================
// LOGIKA SARAN PENCARIAN DINAMIS (BARU)
// ==========================================
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

// Fungsi saat opsi di klik
const applySuggestion = (fullText) => {
    searchQuery.value = fullText;
    showOverlay.value = false; // Tutup overlay setelah memilih

    // ✅ LANGKAH BARU: Segera trigger pencarian
    // Ini akan langsung memfilter daftar paket berdasarkan kata kunci yang dipilih
};

// Fungsi untuk memasukkan format "property: " saat user mengklik overlay
const selectPropertyFilter = (propertyKey) => {
    searchQuery.value = `${propertyKey}: `;
    showOverlay.value = false;
    // Opsional: Fokuskan kembali ke input box (bisa gunakan template ref pada input jika mau)
};

const clearSearch = () => {
    searchQuery.value = '';
    showOverlay.value = false;
};

// ==========================================
// LOGIKA FILTERING DATA
// ==========================================
const filteredPaket = computed(() => {
    let query = searchQuery.value.trim().toLowerCase();
    if (!query) return pakets.value; // Jika kosong, tampilkan semua

    // Cek apakah user menggunakan pencarian spesifik (mengandung tanda titik dua ":")
    // Contoh input: "penyedia: JALADARA"
    const colonIndex = query.indexOf(':');

    if (colonIndex !== -1 && colonIndex < query.length - 1) {
        // Mode Pencarian Spesifik
        const filterKey = query.substring(0, colonIndex).trim(); // Hasil: "penyedia"
        const filterValue = query.substring(colonIndex + 1).trim(); // Hasil: "jaladara"

        // Jika kata kunci kosong (misal baru ngetik "penyedia: "), kembalikan semua data
        if (!filterValue) return pakets.value;

        return pakets.value.filter(paket => {

            // Mapping filterKey ke atribut asli objek dari database
            switch (filterKey) {
                case 'name':
                    return paket.name?.toLowerCase().includes(filterValue);
                case 'kodepaket':
                    return paket.kodePaket?.toLowerCase().includes(filterValue);
                case 'noKontrak':
                    return paket.noKontrak?.toLowerCase().includes(filterValue);
                case 'kodeKegiatan':
                    return paket.kodeKegiatan?.toLowerCase().includes(filterValue);
                default:
                    // Jika key tidak dikenali, abaikan filter spesifik dan lakukan pencarian global
                    return searchGlobal(paket, filterValue);
            }
        });
    } else {
        // Mode Pencarian Global (User ngetik teks biasa tanpa ":")
        return pakets.value.filter(paket => searchGlobal(paket, query));
    }
});

// Fungsi pembantu untuk mencari ke SELURUH kolom (Pencarian Global)
const searchGlobal = (paket, text) => {
    return (
        paket.name?.toLowerCase().includes(text) ||
        paket.noKontrak?.toLowerCase().includes(text) ||
        paket.kodeKegiatan?.toLowerCase().includes(text) ||
        paket.kodeRup?.toLowerCase().includes(text) ||
        String(paket.tahun).includes(text)
    );
};

// ==========================================
// EVENT LISTENER: Menutup Overlay jika klik di luar
// ==========================================
const handleClickOutside = (event) => {
    if (searchContainer.value && !searchContainer.value.contains(event.target)) {
        showOverlay.value = false;
    }
};
const handleExportExcel = () => {
    // 1. Siapkan datanya (Tambahkan nomor urut atau pastikan tipe data angka)
    const dataToExport = filteredPaket.value.map((paket, index) => {
        const plan = getPaketPlanPercentage(paket);
        const actual = getPaketActualPercentage(paket);
        const deviation = getPaketDeviationPercentage(paket);

        return {
            no: index + 1,
            name: paket.name || '-',
            jenisPekerjaan: paket.jenisPekerjaan || '-',
            noKontrak: paket.noKontrak || '-',
            penyediaJasa: paket.penyediaJasa || paket.namaPenyediaJasa || '-',
            nilaiPagu: Number(paket.nilaiPagu) || 0,
            nilaiKontrak: Number(paket.nilaiKontrak) || 0,
            rencanaFisik: `${plan.toFixed(2)}%`,
            aktualFisik: `${actual.toFixed(2)}%`,
            deviasiFisik: `${deviation > 0 ? '+' : ''}${deviation.toFixed(2)}%`,
            aktualKeuangan: paket.totalKeuanganPercentage != null
                ? `${Number(paket.totalKeuanganPercentage).toFixed(2)}%`
                : '0%',
            tanggalMulai: formatDateShort(paket.tanggalMulai),
            tanggalAkhir: formatDateShort(paket.tanggalAkhir),
            statusKondisi: capitalizeFirstLetter(paket.statusKondisi || 'Aman'),
            statusMonitoring: getStatusProgress(paket) || '-',
            statusPaket: paket.statusPaket ? capitalizeFirstLetter(paket.statusPaket) : '-',
            panjangKm: Number(paket.panjangKm) || 0,
            sumberDana: paket.sumberDana || '-',
            ppkom: paket.ppkom || '-',
            konsultanSupervisi: paket.konsultanSupervisi || '-',
            programKegiatan: paket.programKegiatan || '-',
            subProgramKegiatan: paket.subProgramKegiatan || '-',
            kodeRup: paket.kodeRup || paket.kodePaket || '-',
            kodeKegiatan: paket.kodeKegiatan || '-',
            tahun: paket.tahun || '2026',
            lokasi: [paket.ruasLokasi, paket.kecamatan, paket.city].filter(Boolean).join(', ') || '-',
            longitude: paket.longitude || '-',
            latitude: paket.latitude || '-',
        };
    });

    // 2. Definisikan struktur kolom (Header Excel, Key di objek dataToExport, dan Lebar Excel)
    const columnsConfig = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Nama Paket Pekerjaan', key: 'name', width: 45 },
        { header: 'Jenis Pekerjaan', key: 'jenisPekerjaan', width: 30 },
        { header: 'Nomor Kontrak', key: 'noKontrak', width: 25 },
        { header: 'Penyedia Jasa', key: 'penyediaJasa', width: 35 },
        { header: 'Nilai Pagu (Rp)', key: 'nilaiPagu', width: 20 },
        { header: 'Nilai Kontrak (Rp)', key: 'nilaiKontrak', width: 20 },
        { header: 'Rencana Fisik (%)', key: 'rencanaFisik', width: 18 },
        { header: 'Aktual Fisik (%)', key: 'aktualFisik', width: 18 },
        { header: 'Deviasi Fisik (%)', key: 'deviasiFisik', width: 18 },
        { header: 'Aktual Keuangan (%)', key: 'aktualKeuangan', width: 20 },
        { header: 'Tanggal Mulai', key: 'tanggalMulai', width: 15 },
        { header: 'Tanggal Selesai', key: 'tanggalAkhir', width: 15 },
        { header: 'Status Kondisi', key: 'statusKondisi', width: 15 },
        { header: 'Status Monitoring', key: 'statusMonitoring', width: 18 },
        { header: 'Status Paket', key: 'statusPaket', width: 15 },
        { header: 'Panjang Ruas (Km)', key: 'panjangKm', width: 18 },
        { header: 'Sumber Dana', key: 'sumberDana', width: 15 },
        { header: 'PPKOM', key: 'ppkom', width: 25 },
        { header: 'Konsultan Supervisi', key: 'konsultanSupervisi', width: 25 },
        { header: 'Program Kegiatan', key: 'programKegiatan', width: 30 },
        { header: 'Sub Program Kegiatan', key: 'subProgramKegiatan', width: 30 },
        { header: 'Kode RUP', key: 'kodeRup', width: 20 },
        { header: 'Kode Kegiatan', key: 'kodeKegiatan', width: 20 },
        { header: 'Tahun Anggaran', key: 'tahun', width: 15 },
        { header: 'Lokasi Ruas', key: 'lokasi', width: 30 },
        { header: 'Longitude', key: 'longitude', width: 20 },
        { header: 'Latitude', key: 'latitude', width: 20 },
    ];

    // 3. Panggil fungsi Helper
    try {
        generateExcel(
            dataToExport,          // Data mentah yang sudah dirapikan
            columnsConfig,         // Konfigurasi Header & Lebar Kolom
            'Rekap_Daftar_Paket',  // Nama File
            'Data Paket'           // Nama Sheet
        );
    } catch (error) {
        alert('Terjadi kesalahan saat mengunduh Excel.', error);
    }
};

// ============================================================
// LOGIKA EXPORT PDF MULTI-HALAMAN DENGAN SMART ROW-BOUNDARY SLICING
// ============================================================
const handleExportPdf = async () => {
    if (isGeneratingPdf.value || !tablePrintContainerRef.value) return;

    if (!filteredPaket.value || filteredPaket.value.length === 0) {
        alert('Tidak ada data paket untuk diekspor ke PDF.');
        return;
    }

    try {
        isGeneratingPdf.value = true;
        isPdfMode.value = true;

        // 1. SIMPAN STATUS ACCORDION PENGGUNA SEBELUMNYA
        const previousExpanded = Array.isArray(expandedRowGroups.value)
            ? [...expandedRowGroups.value]
            : [];

        console.log("previousExpanded")
        console.log(previousExpanded)

        // 2. BUKA SELURUH GROUPING ACCORDION
        const allGroups = [...new Set(filteredPaket.value.map(p => p.jenisPekerjaan))];
        expandedRowGroups.value = allGroups;

        // 3. TUNGGU RENDER DOM SELESAI LENGKAP
        await nextTick();
        await new Promise(resolve => setTimeout(resolve, 350));

        const targetEl = tablePrintContainerRef.value;
        if (!targetEl) throw new Error('Elemen tabel tidak ditemukan');

        // 4. CAPTURE ELEMEN MENJADI CANVAS RESOLUSI TINGGI
        const canvas = await html2canvas(targetEl, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: 1440, // Standar desktop agar seluruh 11 kolom proporsional
            onclone: (clonedDoc, clonedElement) => {
                // Tampilkan kop judul PDF di DOM tiruan
                const pdfHeader = clonedElement.querySelector('#pdf-table-header');
                if (pdfHeader) {
                    pdfHeader.style.display = 'block';
                }

                // Sembunyikan kolom "Aksi" pada header thead dan baris data (bukan baris group header)
                // PENTING: Jangan menyembunyikan td pada baris group header agar baris accordion grouping tetap utuh tampil di PDF!
                const aksiHeaders = clonedElement.querySelectorAll('thead th:last-child');
                aksiHeaders.forEach(th => th.style.display = 'none');
                const dataRows = clonedElement.querySelectorAll('tbody tr:not(.p-datatable-row-group-header)');
                dataRows.forEach(row => {
                    const lastTd = row.querySelector('td:last-child');
                    if (lastTd) lastTd.style.display = 'none';
                });

                // Pastikan baris accordion grouping (groupheader) tetap terlihat jelas dengan background kontras
                const groupHeaders = clonedElement.querySelectorAll('.p-datatable-row-group-header, [data-pc-section="rowgroupheader"]');
                groupHeaders.forEach(gh => {
                    gh.style.backgroundColor = '#f1f5f9';
                    gh.style.display = 'table-row';
                });

                // Hilangkan bayangan & atur background putih bersih
                clonedElement.style.boxShadow = 'none';
                clonedElement.style.border = 'none';
                clonedElement.style.padding = '8px 12px';
            }
        });

        // 5. UKUR KOORDINAT BATAS BAWAH SETIAP BARIS (<tr>) UNTUK ANTI-POTONG
        const rows = targetEl.querySelectorAll('tr');
        const tableRect = targetEl.getBoundingClientRect();
        const scaleY = canvas.height / targetEl.offsetHeight;

        const rowBottoms = [];
        rows.forEach(tr => {
            const rect = tr.getBoundingClientRect();
            const bottomInCanvas = (rect.bottom - tableRect.top) * scaleY;
            if (bottomInCanvas > 0) {
                rowBottoms.push(bottomInCanvas);
            }
        });
        rowBottoms.sort((a, b) => a - b);

        // 6. INISIALISASI DOKUMEN PDF (A4 LANDSCAPE)
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = 297;  // mm
        const pageHeight = 210; // mm
        const margin = 10;      // mm
        const printableWidth = pageWidth - (margin * 2);   // 277 mm
        const printableHeight = pageHeight - (margin * 2); // 190 mm

        // Konversi rasio: 1 mm di PDF = berapa px di canvas
        const mmToPx = canvas.width / printableWidth;
        const maxPageCanvasHeight = printableHeight * mmToPx;

        // 7. SLICING PER HALAMAN DENGAN MENJAGA INTEGRITAS BARIS (ZERO CUT)
        let currentY = 0;
        let pageIndex = 0;

        while (currentY < canvas.height - 2) {
            if (pageIndex > 0) {
                pdf.addPage();
            }

            const targetMaxY = currentY + maxPageCanvasHeight;
            let sliceEndY = canvas.height;

            // Jika masih melebihi satu halaman, cari baris terakhir yang masuk penuh
            if (targetMaxY < canvas.height) {
                let bestBottom = currentY;
                for (let i = 0; i < rowBottoms.length; i++) {
                    if (rowBottoms[i] > currentY && rowBottoms[i] <= targetMaxY) {
                        bestBottom = rowBottoms[i];
                    }
                }

                if (bestBottom > currentY) {
                    sliceEndY = Math.round(bestBottom);
                } else {
                    sliceEndY = Math.round(targetMaxY);
                }
            }

            const sliceHeight = sliceEndY - currentY;

            // Buat canvas sementara per halaman
            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = canvas.width;
            pageCanvas.height = sliceHeight;
            const pageCtx = pageCanvas.getContext('2d');

            pageCtx.drawImage(
                canvas,
                0, currentY, canvas.width, sliceHeight,
                0, 0, canvas.width, sliceHeight
            );

            const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
            const renderedHeightMm = sliceHeight / mmToPx;

            pdf.addImage(
                pageImgData,
                'JPEG',
                margin,
                margin,
                printableWidth,
                renderedHeightMm,
                undefined,
                'FAST'
            );

            currentY = sliceEndY;
            pageIndex++;
        }

        // 8. TAMBAHKAN NOMOR HALAMAN DI FOOTER
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setTextColor(140, 140, 140);
            pdf.text(
                `Halaman ${i} dari ${totalPages}  •  Sistem Monitoring MANTAP BM  •  Dicetak pada: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
                pageWidth / 2,
                pageHeight - 5,
                { align: 'center' }
            );
        }

        // 9. SIMPAN FILE PDF
        const tahunStr = selectedYear.value ? `_${selectedYear.value}` : '';
        pdf.save(`Daftar_Paket_Pekerjaan${tahunStr}.pdf`);

        // 10. KEMBALIKAN KONDISI ACCORDION PENGGUNA KE SEMULA
        expandedRowGroups.value = previousExpanded;

    } catch (err) {
        console.error('Gagal mengekspor PDF:', err);
        alert('Terjadi kesalahan saat memproses PDF. Silakan coba lagi.');
    } finally {
        isPdfMode.value = false;
        isGeneratingPdf.value = false;
    }
};

async function getPaket() {
    loading.value = true;
    try {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        error.value = false;

        if (auth.isLoggedIn) {
            const response = await api.get("/paket", {
                params: {
                    statusPaket: selectedStatus.value,
                    tahun: selectedYear.value,
                    // paketUserId: auth.userRole.value === 'user' ? auth.state.user.id : null
                }
            });

            pakets.value = response.data.data;
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        error.value = true;
        errorMessage.value = error.message || "Gagal memuat data paket";
    } finally {
        loading.value = false;
    }
}

const toDetail = (event) => {

    const paketId = event.data.kodePaket;
    if (!paketId) return;
    router.push({ name: 'paket-detail', params: { kodePaket: paketId } })

}

const formatRupiah = (val) => {
    if (val === null || val === undefined || isNaN(val)) return '0';

    return new Intl.NumberFormat('id-ID', {
        // style: 'currency',
        currency: 'IDR',
        notation: isTablet.value ? 'compact' : 'standard',
        compactDisplay: isTablet.value ? 'short' : 'long',
        maximumFractionDigits: 0
    }).format(val);
};

// Format tanggal menjadi D/M/YY (Contoh: "2026-11-01" -> "1/11/26")
const formatDateShort = (val) => {
    if (!val) return '-';
    const str = String(val).split('T')[0].trim();
    const parts = str.split('-');
    if (parts.length === 3) {
        const [year, month, day] = parts;
        const d = parseInt(day, 10);
        const m = parseInt(month, 10);
        const y = String(year).slice(-2);
        if (!isNaN(d) && !isNaN(m)) {
            return `${d}/${m}/${y}`;
        }
    }
    return str;
};

const deletePaket = async (id) => {
    try {
        const response = await api.delete(`/paket/${id}`);
        await getPaket();
        // emit('refresh');
    } catch (error) {
        console.error("Error deleting progress:", error.response?.data || error.message);
        alert(error.response?.data?.message || "Gagal menghapus data progress fisik");
    }
};

const expandedRowGroups = ref([])
// Fungsi menghitung Total Pagu per Grup
const hitungTotalPaguGrup = (namaGrup) => {
    return filteredPaket.value
        .filter(p => p.jenisPekerjaan === namaGrup)
        .reduce((sum, p) => sum + (Number(p.nilaiPagu) || 0), 0);
};

// Fungsi menghitung Total Kontrak per Grup
const hitungTotalKontrakGrup = (namaGrup) => {
    return filteredPaket.value
        .filter(p => p.jenisPekerjaan === namaGrup && p.nilaiKontrak != null)
        .reduce((sum, p) => sum + (Number(p.nilaiKontrak) || 0), 0);
}
// Fungsi menghitung Total Kontrak per Grup
const hitungTotalFisikPercentage = (namaGrup) => {
    const totalProgress = filteredPaket.value
        .filter(p => p.jenisPekerjaan === namaGrup)
        .reduce((sum, p) => sum + (Number(p.totalFisikNominal) || 0), 0);

    const totalKontrak = hitungTotalKontrakGrup(namaGrup)
    const totalFisikPercentage = ((totalProgress / totalKontrak) * 100).toFixed(2)
    return isNaN(totalFisikPercentage) || !isFinite(totalFisikPercentage) ? 0 : totalFisikPercentage
}
const hitungTotalKeuanganPercentage = (namaGrup) => {
    const totalProgress = filteredPaket.value
        .filter(p => p.jenisPekerjaan === namaGrup && p.nilaiKontrak != null)
        .reduce((sum, p) => sum + (Number(p.totalKeuanganNominal) || 0), 0);

    const totalKontrak = hitungTotalKontrakGrup(namaGrup)
    const totalKeuanganPercentage = ((totalProgress / totalKontrak) * 100).toFixed(2)
    return isNaN(totalKeuanganPercentage) || !isFinite(totalKeuanganPercentage) ? 0 : totalKeuanganPercentage
}

// ==========================================
// HELPER PERHITUNGAN PROGRESS FISIK PER PAKET & GRUP
// ==========================================
const getPaketPlanPercentage = (paket) => {
    if (!paket) return 0;
    if (paket.totalPlanPercentage !== undefined && paket.totalPlanPercentage !== null) {
        return Number(paket.totalPlanPercentage) || 0;
    }
    if (Array.isArray(paket.progressFisiks) && paket.progressFisiks.length > 0) {
        return paket.progressFisiks.reduce((sum, item) => sum + (Number(item?.planPercentage) || 0), 0);
    }
    if (paket.planPercentage !== undefined && paket.planPercentage !== null) {
        return Number(paket.planPercentage) || 0;
    }
    return 0;
};

const getPaketActualPercentage = (paket) => {
    if (!paket) return 0;
    if (paket.totalActualPercentage !== undefined && paket.totalActualPercentage !== null) {
        return Number(paket.totalActualPercentage) || 0;
    }
    if (Array.isArray(paket.progressFisiks) && paket.progressFisiks.length > 0) {
        return paket.progressFisiks.reduce((sum, item) => sum + (Number(item?.actualPercentage) || 0), 0);
    }
    if (paket.totalFisikPercentage !== undefined && paket.totalFisikPercentage !== null) {
        return Number(paket.totalFisikPercentage) || 0;
    }
    return 0;
};

const getPaketDeviationPercentage = (paket) => {
    if (!paket) return 0;
    if (paket.totalDeviationPercentage !== undefined && paket.totalDeviationPercentage !== null) {
        return Number(paket.totalDeviationPercentage) || 0;
    }
    return getPaketActualPercentage(paket) - getPaketPlanPercentage(paket);
};

const hitungTotalPlanFisikGrup = (namaGrup) => {
    const groupItems = filteredPaket.value.filter(p => p.jenisPekerjaan === namaGrup);
    if (!groupItems.length) return '0.00';
    const sumPlan = groupItems.reduce((acc, p) => acc + getPaketPlanPercentage(p), 0);
    return (sumPlan / groupItems.length).toFixed(2);
};

const hitungTotalActualFisikGrup = (namaGrup) => {
    const groupItems = filteredPaket.value.filter(p => p.jenisPekerjaan === namaGrup);
    if (!groupItems.length) return '0.00';
    const sumActual = groupItems.reduce((acc, p) => acc + getPaketActualPercentage(p), 0);
    return (sumActual / groupItems.length).toFixed(2);
};

const hitungTotalDeviasiGrup = (namaGrup) => {
    const actual = Number(hitungTotalActualFisikGrup(namaGrup)) || 0;
    const plan = Number(hitungTotalPlanFisikGrup(namaGrup)) || 0;
    return (actual - plan).toFixed(2);
};

const getStatusProgress = (paket) => {
    if (!paket) return null;

    if (paket.statusPaket === "selesai") {
        return 'Updated';
    }

    if (!paket.nextInputFisik) {
        return 'Not Updated';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(paket.nextInputFisik);
    targetDate.setHours(0, 0, 0, 0);

    if (today < targetDate) {
        return 'Updated';
    } else {
        return 'Not Updated';
    }
};

const getStatusProgressBadgeClass = (status) => {
    if (!status) return 'px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold';
    const s = String(status).toLowerCase();
    if (s.includes('not updated')) {
        return 'px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold';
    }
    if (s.includes('updated')) {
        return 'px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold';
    }
    return 'px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold';
};

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

function capitalizeFirstLetter(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

onMounted(() => {

    getPaket();
});


</script>

<template>

    <div class="flex flex-col gap-3">
        <!-- Header -->
        <div class="bg-white rounded-[24px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)]  flex flex-col">
            <div class="p-3 flex lg:items-center justify-between ">

                <!-- Search & Filters -->
                <div class="flex md:flex-col lg:flex-row justify-start items-center gap-3 md:w-[45%] lg:w-[60%]">
                    <!-- <div class="relative">
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
                     -->
                    <div class="relative md:w-full lg:w-full">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                        <input type="text" v-model="searchQuery" @focus="showOverlay = true"
                            @keydown.esc="showOverlay = false" placeholder="Cari"
                            class="bg-slate-50 w-full text-sm font-medium text-blue-950 rounded-full pl-10 pr-4 py-2.5 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-400">
                        <!-- Tombol Clear (X) -->
                        <button v-if="searchQuery" @click="clearSearch"
                            class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12"></path>
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

                    <div class="flex gap-3">
                        <Select v-model="selectedStatus" :options="statusOptions" optionLabel="label"
                            optionValue="value" placeholder="Pilih status" @change="getPaket()"
                            :pt="{ root: { class: 'bg-slate-50! text-sm! font-semibold! text-slate-600! rounded-full! px-1! border-none! focus:ring-2! focus:ring-orange-500! focus:outline-none! cursor-pointer! appearance-none! relative!' } }" />
                        <Select v-model="selectedYear" :options="yearOptions" optionLabel="label" optionValue="value"
                            placeholder="Pilih tahun" @change="getPaket()"
                            :pt="{ root: { class: 'bg-slate-50! text-sm! font-semibold! text-slate-600! rounded-full! px-1! border-none! focus:ring-2! focus:ring-orange-500! focus:outline-none! cursor-pointer! appearance-none! relative!' } }" />
                    </div>

                </div>

                <!-- Add Button -->
                <div class="flex justify-center md:flex-col-reverse lg:flex-row gap-3">
                    <!-- Tombol Export PDF (Merah, di sebelah kiri Export Excel) -->
                    <button type="button" @click="handleExportPdf" :disabled="isGeneratingPdf"
                        class="bg-red-600 hover:bg-red-700 active:scale-95 text-white px-4 py-2 rounded-full shadow-sm text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                        <!-- Spinner saat render -->
                        <svg v-if="isGeneratingPdf" class="animate-spin h-4 w-4 text-white" fill="none"
                            viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        <FilePdf v-else :size="40" />
                        <span>{{ isGeneratingPdf ? 'Menyiapkan PDF...' : 'Export PDF' }}</span>
                    </button>

                    <!-- Tombol Export Excel -->
                    <button @click="handleExportExcel"
                        class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full shadow-sm text-sm font-semibold flex items-center gap-2 transition-all">
                        <FileExcel :size="40" />
                        Export Excel
                    </button>
                    <button @click="router.push('/paket/add')"
                        class="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-2.5 px-6 rounded-full flex items-center gap-2 transition-colors shadow-md shadow-orange-500/20">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4">
                            </path>
                        </svg>
                        Tambah Paket
                    </button>
                </div>
            </div>
        </div>
        <!-- end header -->
        <div v-if="loading"
            class="bg-white rounded-[24px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col gap-4 min-h-full p-4">
            <!-- <Skeleton width="100%" height="6rem" borderRadius="24px" class="bg-slate-100!" />
            <Skeleton width="100%" height="6rem" borderRadius="24px" class="bg-slate-100!" />
            <Skeleton width="100%" height="6rem" borderRadius="24px" class="bg-slate-100!" />
            <Skeleton width="100%" height="6rem" borderRadius="24px" class="bg-slate-100!" /> -->
            <DataTable :value="[1, 2, 3]" :pt="{
                table: { class: 'w-full text-xs text-left text-slate-600 border-collapse table-fixed' },
                thead: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 border-b border-slate-200' },
                tbody: { class: 'divide-y divide-slate-100' },
                rowGroupHeaderCell: { colspan: 12, class: 'bg-slate-50! flex!' },
                rowGroupToggler: { class: 'inline-flex! items-center justify-start! mr-3 text-blue-600 hover:text-blue-800' },
                bodyRow: { class: 'hover:bg-slate-50/50! transition-colors! border-b! border-slate-50/70! group!' }
            }">
                <Column field="name" header="Nama Paket" style="width: 15%;" :pt="{
                    columnHeaderContent: { class: 'p-2! justify-start!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider py-2! pl-3!' }
                }">
                    <template #body>
                        <Skeleton />
                    </template>
                </Column>
                <Column field="nilaiPagu" header="Nilai Pagu" style="width: 15%;" :pt="{
                    columnHeaderContent: { class: 'p-2! justify-end!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider py-2! pr-2!' }
                }">
                    <template #body>
                        <Skeleton />
                    </template>
                </Column>
                <Column field="nilaiKontrak" header="Nilai Kontrak" style="width: 15%;" :pt="{
                    columnHeaderContent: { class: 'p-2! justify-end!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider py-2! pr-2!' }
                }">
                    <template #body>
                        <Skeleton />
                    </template>
                </Column>
                <Column field="progress" header="Fisik Ren." style="width: 6%;" :pt="{
                    columnHeaderContent: { class: 'p-2! justify-center!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider py-2! text-center!' }
                }">
                    <template #body>
                        <Skeleton />
                    </template>
                </Column>
                <Column field="progress" header="Fisik Akt." style="width: 6%;" :pt="{
                    columnHeaderContent: { class: 'p-2! justify-center!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider py-2! text-center!' }
                }">
                    <template #body>
                        <Skeleton />
                    </template>
                </Column>
                <Column field="progress" header="Deviasi" style="width: 6%;" :pt="{
                    columnHeaderContent: { class: 'p-2! justify-center!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider py-2! text-center!' }
                }">
                    <template #body>
                        <Skeleton />
                    </template>
                </Column>
                <Column field="progress" header="Keuangan" style="width: 6%;" :pt="{
                    columnHeaderContent: { class: 'p-2! justify-center!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider py-2! text-center!' }
                }">
                    <template #body>
                        <Skeleton />
                    </template>
                </Column>
                <Column field="tanggalMulai" header="Mulai" style="width: 7%;" :pt="{
                    columnHeaderContent: { class: 'p-2! justify-center!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider py-2! text-center!' }
                }">
                    <template #body>
                        <Skeleton />
                    </template>
                </Column>
                <Column field="tanggalAkhir" header="Selesai" style="width: 7%;" :pt="{
                    columnHeaderContent: { class: 'p-2! justify-center!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider py-2! text-center!' }
                }">
                    <template #body>
                        <Skeleton />
                    </template>
                </Column>
                <Column field="statusKondisi" header="Kondisi" style="width: 6%;" :pt="{
                    columnHeaderContent: { class: 'p-2! justify-center!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider py-2! text-center!' }
                }">
                    <template #body>
                        <Skeleton />
                    </template>
                </Column>
                <Column field="statusPaket" header="Status" style="width: 6%;" :pt="{
                    columnHeaderContent: { class: 'p-2! justify-center!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider py-2! text-center!' }
                }">
                    <template #body>
                        <Skeleton />
                    </template>
                </Column>
                <Column header="Aksi" style="width: 5%;" :pt="{
                    columnHeaderContent: { class: 'p-2! justify-center!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider py-2! text-center!' }
                }">
                    <template #body>
                        <Skeleton />
                    </template>
                </Column>
            </DataTable>

        </div>
        <div v-else="!loading" ref="tablePrintContainerRef"
            class="bg-white rounded-[24px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col min-h-full">

            <!-- KOP JUDUL KHUSUS DOKUMEN PDF (Tersembunyi di Web, Muncul di PDF) -->
            <div id="pdf-table-header" style="display: none;"
                class="mb-3 p-4 bg-white border-b-2 border-slate-800 rounded-xl">
                <div class="flex justify-between items-center">
                    <div>
                        <h1 class="text-xl font-black text-slate-900 uppercase tracking-tight">
                            LAPORAN DAFTAR PAKET PEKERJAAN
                        </h1>
                        <p class="text-xs font-semibold text-slate-500 mt-0.5">
                            Sistem Informasi Pemantauan & Manajemen Proyek (MANTAP BM)
                        </p>
                    </div>
                    <div class="text-right text-xs text-slate-700">
                        <p><strong>Tahun:</strong> {{ selectedYear || 'Semua Tahun' }} &nbsp;|&nbsp;
                            <strong>Status:</strong> {{
                                selectedStatus ? capitalizeFirstLetter(selectedStatus) : 'Semua Status' }}
                        </p>
                        <p class="text-[11px] text-slate-500 mt-1">Total Data: <strong>{{ filteredPaket.length
                        }}</strong> Paket
                            Pekerjaan</p>
                    </div>
                </div>
            </div>

            <!-- Data Table -->
            <DataTable :value="filteredPaket" rowGroupMode="subheader" groupRowsBy="jenisPekerjaan" sortMode="single"
                sortField="jenisPekerjaan" :sortOrder="1" expandableRowGroups class="table-group-custom w-full"
                v-model:expandedRowGroups="expandedRowGroups" @row-click="toDetail" :pt="{
                    table: { class: 'w-full text-xs text-left text-slate-600 border-collapse table-fixed' },
                    thead: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 border-b border-slate-200' },
                    tbody: { class: 'divide-y divide-slate-100' },
                    rowGroupHeaderCell: { colspan: 12, class: 'p-0! bg-slate-50/90! hover:bg-slate-100/90! transition-colors! relative! border-b! border-slate-200!' },
                    rowGroupToggler: { class: 'absolute! left-2! top-1/2! -translate-y-1/2! z-10! w-6! h-6! inline-flex! items-center! justify-center! text-blue-600 hover:text-blue-800 cursor-pointer!' },
                    bodyRow: { class: 'hover:bg-slate-50/50! transition-colors! border-b! border-slate-50/70! group!' }
                }">

                <!-- 1. KOLOM NAMA PAKET (15%) -->
                <Column field="name" header="Nama Paket" style="width: 13%;" :pt="{
                    columnHeaderContent: { class: 'p-2! justify-start!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider py-2! pl-3!' }
                }">
                    <template #body="slotProps">
                        <div class="py-2.5 pl-3 pr-2 font-bold text-left text-blue-950 text-xs tracking-wide break-words whitespace-normal leading-snug"
                            :title="slotProps.data.name">
                            {{ slotProps.data.name }}
                        </div>
                    </template>
                </Column>

                <!-- 2. KOLOM NILAI PAGU (15%) -->
                <Column field="nilaiPagu" header="Nilai Pagu" style="width: 14%;" :pt="{
                    columnHeaderContent: { class: 'p-2! justify-end!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider py-2! pr-2!' }
                }">
                    <template #body="slotProps">
                        <div class="py-2.5 px-2 font-semibold text-right text-blue-950 text-xs flex justify-between items-center w-full"
                            :title="formatRupiah(slotProps.data.nilaiPagu)">
                            <span>Rp.</span>
                            <span>{{ formatRupiah(slotProps.data.nilaiPagu) }}</span>
                        </div>
                    </template>
                </Column>

                <!-- 3. KOLOM NILAI KONTRAK (15%) -->
                <Column field="nilaiKontrak" header="Nilai Kontrak" style="width: 14%;" :pt="{
                    columnHeaderContent: { class: 'p-2! justify-end!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider py-2! pr-2!' }
                }">
                    <template #body="slotProps">
                        <div class="py-2.5 px-2 font-semibold text-right text-blue-950 text-xs flex justify-between items-center w-full"
                            :title="formatRupiah(slotProps.data.nilaiKontrak)">
                            <span>Rp.</span>
                            <span>{{ formatRupiah(slotProps.data.nilaiKontrak) }}</span>
                        </div>
                    </template>
                </Column>

                <!-- 4. KOLOM FISIK RENCANA (6%) -->
                <Column field="progress" header="Rencana Fisik" style="width: 6%;" :pt="{
                    columnHeaderContent: { class: 'p-2! justify-center!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider py-2! text-center!' }
                }">
                    <template #body="slotProps">
                        <div class="py-2.5 font-bold text-center text-blue-950 text-xs">
                            {{ getPaketPlanPercentage(slotProps.data).toFixed(2) }}%
                        </div>
                    </template>
                </Column>

                <!-- 5. KOLOM FISIK AKTUAL (6%) -->
                <Column field="progress" header="Aktual Fisik" style="width: 6%;" :pt="{
                    columnHeaderContent: { class: 'p-2! justify-center!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider py-2! text-center!' }
                }">
                    <template #body="slotProps">
                        <div class="py-2.5 font-bold text-center text-blue-950 text-xs">
                            {{ getPaketActualPercentage(slotProps.data).toFixed(2) }}%
                        </div>
                    </template>
                </Column>

                <!-- 6. KOLOM DEVIASI FISIK (6%) -->
                <Column field="progress" header="Deviasi" style="width: 6%;" :pt="{
                    columnHeaderContent: { class: 'p-2! justify-center!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider py-2! text-center!' }
                }">
                    <template #body="slotProps">
                        <div class="py-2.5 font-bold text-center text-xs"
                            :class="getPaketDeviationPercentage(slotProps.data) < 0 ? 'text-red-500' : 'text-emerald-500'">
                            {{ getPaketDeviationPercentage(slotProps.data) > 0 ? '+' : '' }}{{
                                getPaketDeviationPercentage(slotProps.data).toFixed(2) }}%
                        </div>
                    </template>
                </Column>

                <!-- 7. KOLOM PROGRESS KEUANGAN (6%) -->
                <Column field="progress" header="Aktual Keuangan" style="width: 6%;" :pt="{
                    columnHeaderContent: { class: 'p-2! justify-center!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider py-2! text-center!' }
                }">
                    <template #body="slotProps">
                        <div class="py-2.5 font-bold text-center text-blue-950 text-xs">
                            {{ slotProps.data.totalKeuanganPercentage ?
                                slotProps.data.totalKeuanganPercentage.toFixed(1) + '%' : '0%' }}
                        </div>
                    </template>
                </Column>

                <!-- 8. KOLOM TGL MULAI (7%) -->
                <Column field="tanggalMulai" header="Tanggal Mulai" style="width: 7%;" :pt="{
                    columnHeaderContent: { class: 'p-2! justify-center!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider py-2! text-center!' }
                }">
                    <template #body="slotProps">
                        <div class="py-2.5 font-bold text-center text-blue-950 text-xs truncate"
                            :title="slotProps.data.tanggalMulai || '-'">
                            {{ formatDateShort(slotProps.data.tanggalMulai) }}
                        </div>
                    </template>
                </Column>

                <!-- 9. KOLOM TGL SELESAI (7%) -->
                <Column field="tanggalAkhir" header="Tanggal Selesai" style="width: 7%;" :pt="{
                    columnHeaderContent: { class: 'p-2! justify-center!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider py-2! text-center!' }
                }">
                    <template #body="slotProps">
                        <div class="py-2.5 font-bold text-center text-blue-950 text-xs truncate"
                            :title="slotProps.data.tanggalAkhir || '-'">
                            {{ formatDateShort(slotProps.data.tanggalAkhir) }}
                        </div>
                    </template>
                </Column>

                <!-- 10. KOLOM KONDISI (6%) -->
                <Column field="statusKondisi" header="Kondisi" style="width: 8%;" :pt="{
                    columnHeaderContent: { class: 'p-2! justify-center!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider py-2! text-center!' }
                }">
                    <template #body="slotProps">
                        <div class="py-2.5 text-center px-1">
                            <span :class="getStatusBadgeClass(slotProps.data.statusKondisi)"
                                class="px-1.5 py-0.5 rounded text-[10px] font-bold inline-block truncate max-w-full">
                                {{ capitalizeFirstLetter(slotProps.data.statusKondisi || 'Aman') }}
                            </span>
                        </div>
                    </template>
                </Column>

                <!-- 11. KOLOM STATUS PROGRESS (8%) -->
                <Column field="statusProgress" header="Status" style="width: 8%;" :pt="{
                    columnHeaderContent: { class: 'p-2! justify-center!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider py-2! text-center!' }
                }">
                    <template #body="slotProps">
                        <div class="py-2.5 text-center px-1">
                            <span :class="getStatusProgressBadgeClass(getStatusProgress(slotProps.data))"
                                class="inline-block truncate max-w-full">
                                {{ getStatusProgress(slotProps.data) }}
                            </span>
                        </div>
                    </template>
                </Column>

                <!-- 12. KOLOM DELETE / AKSI (5%) -->
                <Column header="Aksi" style="width: 5%;" :pt="{
                    columnHeaderContent: { class: 'p-2! justify-center!' },
                    columnTitle: { class: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider py-2! text-center!' }
                }">
                    <template #body="slotProps">
                        <div class="py-2.5 flex justify-center items-center">
                            <DeleteModal title="Hapus Paket" deskripsi="Apakah Anda yakin ingin menghapus Paket ini?"
                                :action-hapus="() => deletePaket(slotProps.data.id)" />
                        </div>
                    </template>
                </Column>

                <!-- CUSTOM HEADER GRUP (Baris Expandable) -->
                <!-- Ini adalah baris "jenisPekerjaan" yang bisa di-klik untuk buka/tutup -->
                <template #groupheader="slotProps">
                    <div class="w-full flex items-center py-6 transition-colors">
                        <!-- Kolom 1: Nama Kategori / Jenis Pekerjaan (15%) - Ruang pl-9 untuk Chevron, susun kebawah jika panjang -->
                        <div class="w-[15%] pl-9 pr-2 flex items-center min-w-0 shrink-0">
                            <span
                                class="font-extrabold text-blue-950 text-xs uppercase tracking-wide break-words whitespace-normal leading-relaxed"
                                :title="slotProps.data.jenisPekerjaan == '' ? 'N/A' : slotProps.data.jenisPekerjaan">
                                {{ slotProps.data.jenisPekerjaan == '' ? 'N/A' : slotProps.data.jenisPekerjaan }}
                            </span>
                        </div>

                        <!-- Kolom 2: Total Nilai Pagu Grup (15%) -->
                        <div class="w-[13%] px-2 font-extrabold text-xs text-blue-950 flex justify-between items-center shrink-0"
                            :title="formatRupiah(hitungTotalPaguGrup(slotProps.data.jenisPekerjaan))">
                            <span>Rp.</span>
                            <span>{{ formatRupiah(hitungTotalPaguGrup(slotProps.data.jenisPekerjaan)) }}</span>
                        </div>

                        <!-- Kolom 3: Total Nilai Kontrak Grup (15%) -->
                        <div class="w-[13%] px-2 font-extrabold text-xs text-blue-950 flex justify-between items-center shrink-0"
                            :title="formatRupiah(hitungTotalKontrakGrup(slotProps.data.jenisPekerjaan))">
                            <span>Rp.</span>
                            <span>{{ formatRupiah(hitungTotalKontrakGrup(slotProps.data.jenisPekerjaan)) }}</span>
                        </div>

                        <!-- Kolom 4: Total Fisik Rencana (6%) -->
                        <div class="w-[6%] font-bold text-xs text-center text-emerald-700 shrink-0">
                            <!-- {{ hitungTotalPlanFisikGrup(slotProps.data.jenisPekerjaan) }}% -->
                        </div>

                        <!-- Kolom 5: Total Fisik Aktual (6%) -->
                        <div class="w-[6%] font-bold text-xs text-center text-emerald-700 shrink-0">
                            {{ hitungTotalFisikPercentage(slotProps.data.jenisPekerjaan) }}%
                            <!-- {{ hitungTotalActualFisikGrup(slotProps.data.jenisPekerjaan) }}% -->
                        </div>

                        <!-- Kolom 6: Deviasi (6%) -->
                        <div class="w-[6%] font-bold text-xs text-center shrink-0"
                            :class="Number(hitungTotalDeviasiGrup(slotProps.data.jenisPekerjaan)) < 0 ? 'text-red-500' : 'text-emerald-700'">
                            <!-- {{ Number(hitungTotalDeviasiGrup(slotProps.data.jenisPekerjaan)) > 0 ? '+' : '' }}{{ hitungTotalDeviasiGrup(slotProps.data.jenisPekerjaan) }}% -->
                        </div>

                        <!-- Kolom 7: Total Keuangan (6%) -->
                        <div class="w-[6%] font-bold text-xs text-center text-indigo-700 shrink-0">
                            {{ hitungTotalKeuanganPercentage(slotProps.data.jenisPekerjaan) }}%
                        </div>

                        <!-- Kolom 8-12: Placeholder Sisa (31%) -->
                        <div class="w-[33%] shrink-0"></div>
                    </div>
                </template>

            </DataTable>
            <!-- Data Table -->

        </div>
    </div>

</template>
<style scoped>
:deep(.table-group-custom .p-datatable-row-group-header td) {
    padding: 0 !important;
    vertical-align: middle !important;
    position: relative !important;
}

:deep(.table-group-custom .p-datatable-row-group-header .p-datatable-row-toggle-button) {
    position: absolute !important;
    left: 0.5rem !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    z-index: 10 !important;
}
</style>