<template>
  <div>
    <SharedUiBreadcrumb
      :title="pages.title"
      :breadcrumbs="breadcrumbs"
    ></SharedUiBreadcrumb>

    <v-card class="mb-6 elevation-3 border-top-primary">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="4">
            <v-label class="mb-2 font-weight-bold">Pilih Tahun Anggaran</v-label>
            <v-autocomplete
              v-model="selectedTahun"
              :items="listTahun"
              color="primary"
              variant="outlined"
              density="compact"
              hide-details
            ></v-autocomplete>
          </v-col>
          <v-col cols="12" md="4">
            <v-label class="mb-2 font-weight-bold">Tahap / Versi</v-label>
          <v-autocomplete
            v-model="selectedTahap"
            :items="['RKP', 'RAPBDes']"
            color="primary"
            variant="outlined"
            density="compact"
            hide-details
          ></v-autocomplete>
          </v-col>
          <v-col cols="12" md="4" class="text-right mt-6">
            <v-btn 
              color="success" 
              size="large" 
              prepend-icon="mdi-calculator"
              :loading="isCalculating"
              @click="hitungTopsis"
              v-if="hasPermission('CREATE')"
            >
              HITUNG TOPSIS
            </v-btn>
            <v-btn 
              color="primary" 
              size="large" 
              variant="outlined"
              class="ml-2"
              prepend-icon="mdi-magnify"
              :loading="isLoading"
              @click="loadHasil"
            >
              TAMPILKAN
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <TableListPerankingan
      v-if="tableData.length > 0 || isLoading"
      :headers="headers"
      :tableData="tableData"
      :loading="isLoading"
      :title="`Hasil Perankingan Tahun ${selectedTahun} - Tahap ${selectedTahap}`"
    >
    </TableListPerankingan>

    <v-alert
      v-else-if="!isLoading && hasSearched"
      type="info"
      variant="tonal"
      class="mt-4"
    >
      Belum ada hasil perankingan untuk Tahun {{ selectedTahun }} Tahap {{ selectedTahap }}. Silakan klik tombol "HITUNG TOPSIS".
    </v-alert>

  </div>
</template>
<script setup lang="ts">
import Swal from "sweetalert2";
import perankinganService from "@/services/perankingan.service";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

const pages = ref({ title: "Perankingan TOPSIS" });
const breadcrumbs = ref([
  { text: "Dashboard", disabled: false, href: "/dashboard" },
  { text: "Transaksi", disabled: true, href: "#" },
  { text: "Perankingan", disabled: true, href: "#" },
]);

const isLoading = ref(false);
const isCalculating = ref(false);
const hasSearched = ref(false);

const currentYear = new Date().getFullYear();
const listTahun = ref([currentYear - 1, currentYear, currentYear + 1]);
const selectedTahun = ref(currentYear);
const selectedTahap = ref('RKP');
const tableData = ref<any[]>([]);

const headers = ref([
  { title: "Peringkat", key: "ranking", width: "10%", align: "center" },
  { title: "Nama Usulan Proyek", key: "usulanName" },
  { title: "Tahap", key: "tahapVersi", align: "center" },
  { title: "Nilai Preferensi (V)", key: "nilaiPreferensiV", align: "center" },
]);

// --- PERBAIKAN ERROR 1: Mengambil `hasPermission` untuk mengecek UI ---
const { checkPermission, hasPermission: checkUI } = usePermission();

function hasPermission(val: string) {
  const tag = `PERANKINGAN.${val}`;
  return checkUI(tag); // Mengecek boolean (true/false) untuk tombol
}

onBeforeMount(() => {
  checkPermission("PERANKINGAN.VIEW"); // Mengecek rute saat halaman dimuat
});

onMounted(() => {
  loadHasil(); // Otomatis load hasil tahun dan tahap saat ini ketika halaman dibuka
});

// Mengambil arsip hasil perankingan dari DB
async function loadHasil() {
  isLoading.value = true;
  hasSearched.value = true;
  tableData.value = [];
  try {
    // --- PERBAIKAN ERROR 2: Memanggil getArsip() dan menyesuaikan parameternya ---
    const req = { tahun: selectedTahun.value, tahap: selectedTahap.value };
    const res: any = await perankinganService().getArsip(req);
    tableData.value = res.data || [];
  } catch (err) {
    console.error("Gagal load hasil perankingan", err);
  } finally {
    isLoading.value = false;
  }
}

// Menjalankan kalkulasi algoritma TOPSIS
function hitungTopsis() {
  Swal.fire({
    title: "Mulai Perhitungan?",
    text: `Sistem akan menghitung ulang prioritas usulan untuk Tahun ${selectedTahun.value} Tahap ${selectedTahap.value}. Pastikan semua usulan sudah dinilai!`,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#28a745",
    cancelButtonColor: "#95a5a6",
    confirmButtonText: "Ya, Hitung!",
    cancelButtonText: "Batal",
    allowOutsideClick: false,
  }).then(async (result: any) => {
    if (result.isConfirmed) {
      isCalculating.value = true;
      try {
        const payload = {
          tahunAnggaran: selectedTahun.value,
          tahapVersi: selectedTahap.value
        };
        // --- PERBAIKAN ERROR 3: Memanggil hitungTopsis() ---
        const res: any = await perankinganService().hitungTopsis(payload);
        
        useToast("success", "Perhitungan TOPSIS Selesai!");
        
        // Load ulang tabel hasil setelah kalkulasi sukses
        loadHasil();
      } catch (err: any) {
        // Menangkap error dari backend (misal: "data kriteria tidak ditemukan")
        Swal.fire("Gagal", err.response?.data?.error || "Terjadi kesalahan saat menghitung", "error");
      } finally {
        isCalculating.value = false;
      }
    }
  });
}
</script>