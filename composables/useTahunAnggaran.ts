import { ref } from "vue";
import usulanProyekService from "@/services/usulan_proyek.service";

// Composable untuk menghasilkan daftar tahun anggaran yang dinamis.
// Selalu menampilkan: 5 tahun ke belakang, tahun ini, 5 tahun ke depan
// + semua tahun yang sudah ada di database (agar tidak ada data yang "hilang" dari dropdown)
export const useTahunAnggaran = () => {
  const currentYear = new Date().getFullYear();
  
  // Buat list default: 5 tahun lalu s.d. 5 tahun ke depan
  const defaultYears: number[] = [];
  for (let y = currentYear - 5; y <= currentYear + 5; y++) {
    defaultYears.push(y);
  }

  const listTahun = ref<number[]>([...defaultYears]);

  async function loadTahunFromDB() {
    try {
      const res: any = await usulanProyekService().getAvailableYears();
      const fromDB: number[] = res.data?.data || res.data || [];

      // Gabungkan dengan default, hapus duplikat, urutkan
      const merged = Array.from(new Set([...defaultYears, ...fromDB]));
      merged.sort((a, b) => a - b);
      listTahun.value = merged;
    } catch {
      // Jika API gagal, tetap gunakan list default
      listTahun.value = [...defaultYears];
    }
  }

  return { listTahun, loadTahunFromDB, currentYear };
};
