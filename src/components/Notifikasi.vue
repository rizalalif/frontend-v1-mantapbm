<template>
    <!-- Notifikasi Banner akan muncul jika showReminder = true -->
    <Toast v-if="showReminder" />
    <!-- <Button severity="info" variant="outlined" @click="show()">Info</Button> -->

    <Transition name="slide-down">
        <div v-if="showReminder" class="bg-blue-600 px-6 py-3 shadow-lg flex items-center justify-between text-white">
            <div class="flex items-center gap-3">
                <!-- Icon Bell/Pengingat -->
                <svg class="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9">
                    </path>
                </svg>
                <div>
                    <p class="font-bold text-sm">Pengingat Mingguan!</p>
                    <p class="text-xs text-blue-100">Hari ini adalah hari Jumat. Jangan lupa untuk memperbarui data
                        progres fisik dan keuangan minggu ini.</p>
                </div>
            </div>

            <!-- Tombol Tutup (Dismiss) -->
            <button @click="tutupPengingat"
                class="p-2 hover:bg-blue-700 rounded-full transition-colors focus:outline-none" title="Tutup Pengingat">
                <svg class="w-5 h-5 text-blue-200 hover:text-white" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12">
                    </path>
                </svg>
            </button>
        </div>
    </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
// import { Button } from '@/components/ui/button';
const toast = useToast();
const show = () => {
    toast.add({ summary: 'Successfully completed', detail: 'The task was completed successfully. You can now view the details.', life: 3000 });
};

const showReminder = ref(false);

const cekJadwalPengingat = () => {
    const hariIni = new Date();
    const indexHari = hariIni.getDay(); // 0: Minggu, 1: Senin, ..., 5: Jumat, 6: Sabtu

    // Jika hari ini adalah JUMAT (5)
    if (indexHari === 0) {
        console.log('day' + indexHari);

        // Cek apakah user sudah menutup notifikasi hari ini
        const tanggalString = hariIni.toDateString(); // Contoh output: "Fri Sep 25 2026"
        const lastDismissed = localStorage.getItem('dismissedProgressReminder');
        console.log('dismiss', lastDismissed);

        // Jika data di localStorage BUKAN tanggal hari ini, berarti belum di-close hari ini
        if (lastDismissed !== tanggalString) {
            showReminder.value = true;
        }
    } else {
        // Opsional: Bersihkan localStorage jika sudah bukan hari Jumat
        localStorage.removeItem('dismissedProgressReminder');
    }
};

const tutupPengingat = () => {
    // Sembunyikan notifikasi
    showReminder.value = false;

    // Simpan tanggal hari ini ke localStorage agar tidak muncul lagi jika halaman di-refresh
    const tanggalString = new Date().toDateString();
    localStorage.setItem('dismissedProgressReminder', tanggalString);
};

// Jalankan pengecekan saat komponen dimuat
onMounted(() => {
    console.log('reminder');

    cekJadwalPengingat();
    showInfo
});
</script>

<style scoped>
/* Animasi muncul dari atas */
.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.4s ease-out;
}

.slide-down-enter-from,
.slide-down-leave-to {
    transform: translateY(-100%);
    opacity: 0;
}
</style>