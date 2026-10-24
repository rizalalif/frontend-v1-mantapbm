import { ref } from 'vue';

// State bersama (singleton) dalam memori browser
const isGeneratingPdf = ref(false);
const exportAction = ref(null);

export function useDashboardExport() {
  /**
   * Mendaftarkan fungsi cetak dari komponen NewDashboard.vue
   */
  const registerExportAction = (fn) => {
    exportAction.value = fn;
  };

  /**
   * Menghapus fungsi cetak saat halaman NewDashboard.vue di-unmount
   */
  const unregisterExportAction = () => {
    exportAction.value = null;
  };

  /**
   * Memicu eksekusi cetak dari tombol di NewDashboardLayout.vue
   */
  const triggerExport = () => {
    if (typeof exportAction.value === 'function') {
      exportAction.value();
    } else {
      console.warn('Fungsi export PDF belum terdaftar atau halaman dashboard belum siap.');
    }
  };

  return {
    isGeneratingPdf,
    registerExportAction,
    unregisterExportAction,
    triggerExport
  };
}
