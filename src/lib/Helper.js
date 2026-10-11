import * as XLSX from 'xlsx';

export const getChangedPayload = (original, current) => {
    const payload = {};

    // Looping semua key di data form saat ini
    for (const key in current) {
        // Jika nilainya berbeda dengan data original, masukkan ke payload
        if (current[key] !== original[key]) {
            payload[key] = current[key];
        }
    }
    return payload;
};

export const generateExcel = (data, columns, filename = 'Export_Data', sheetName = 'Sheet1') => {
    try {
        // 1. Mapping ulang data agar nama properti (key) berubah menjadi nama Header
        // dan urutan kolomnya sesuai dengan yang ada di konfigurasi 'columns'
        const mappedData = data.map(item => {
            const rowData = {};
            columns.forEach(col => {
                // Ambil value dari item berdasarkan col.key, lalu jadikan col.header sebagai nama propertinya
                rowData[col.header] = item[col.key];
            });
            return rowData;
        });

        // 2. Ubah format Array of Object menjadi Worksheet Excel
        const worksheet = XLSX.utils.json_to_sheet(mappedData);

        // 3. Atur lebar kolom (wch: width character) secara dinamis
        const columnWidths = columns.map(col => ({
            wch: col.width || 15 // Default lebar 15 jika tidak diisi
        }));
        worksheet['!cols'] = columnWidths;

        // 4. Buat file Workbook baru dan masukkan Worksheet ke dalamnya
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        // 5. Trigger download file
        const finalFilename = `${filename}_${new Date().getTime()}.xlsx`;
        XLSX.writeFile(workbook, finalFilename);

    } catch (error) {
        console.error('Gagal mengekspor Excel di Helper:', error);
        throw error;
    }
};

export const formatRupiah = (val) => {
    if (val === null || val === undefined || isNaN(val)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(val);
};

export const listOfMonths = [
    { label: "Januari", value: "JANUARI" },
    { label: "Februari", value: "FEBRUARI" },
    { label: "Maret", value: "MARET" },
    { label: "April", value: "APRIL" },
    { label: "Mei", value: "MEI" },
    { label: "Juni", value: "JUNI" },
    { label: "Juli", value: "JULI" },
    { label: "Agustus", value: "AGUSTUS" },
    { label: "September", value: "SEPTEMBER" },
    { label: "Oktober", value: "OKTOBER" },
    { label: "November", value: "NOVEMBER" },
    { label: "Desember", value: "DESEMBER" },
]
export const getStatusBadgeClass = (status) => {
    if (!status) return ' bg-emerald-100 text-emerald-700';
    const s = String(status).toLowerCase();
    if (s.includes('terlambat') || s.includes('rendah') || s.includes('minus')) {
        return ' bg-red-100 text-red-700';
    }
    if (s.includes('perhatian') || s.includes('tinggi') || s.includes('surplus')) {
        return ' bg-blue-100 text-blue-700';
    }
    return ' bg-emerald-100 text-emerald-700';
};

