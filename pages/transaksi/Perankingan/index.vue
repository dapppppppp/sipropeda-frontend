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
      @promosikan="handlePromosi"

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
import usulanProyekService from "@/services/usulan_proyek.service"; // Tambahan service

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

// Jadikan headers menggunakan 'computed' agar kolom aksi hanya muncul saat di tahap RKP
const headers = computed(() => {
  let baseHeaders = [
    { title: "Peringkat", key: "ranking", width: "10%", align: "center" },
    { title: "Nama Usulan Proyek", key: "usulanName" },
    { title: "Tahap", key: "tahapVersi", align: "center" },
    { title: "Nilai Preferensi (V)", key: "nilaiPreferensiV", align: "center" },
  ];
  return baseHeaders;
});

const { checkPermission, hasPermission: checkUI } = usePermission();

function hasPermission(val: string) {
  const tag = `PERANKINGAN.${val}`;
  return checkUI(tag);
}

onBeforeMount(() => {
  checkPermission("PERANKINGAN.VIEW");
});

onMounted(() => {
  loadHasil();
});

async function loadHasil() {
  isLoading.value = true;
  hasSearched.value = true;
  tableData.value = [];
  try {
    const req = { tahun: selectedTahun.value, tahap: selectedTahap.value };
    const res: any = await perankinganService().getArsip(req);
    tableData.value = res.data || [];
  } catch (err) {
    console.error("Gagal load hasil perankingan", err);
  } finally {
    isLoading.value = false;
  }
}

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
        const res: any = await perankinganService().hitungTopsis(payload);
        useToast("success", "Perhitungan TOPSIS Selesai!");
        loadHasil();
      } catch (err: any) {
        Swal.fire("Gagal", err.response?.data?.error || "Terjadi kesalahan saat menghitung", "error");
      } finally {
        isCalculating.value = false;
      }
    }
  });
}

// FUNGSI BARU: Promosikan ke RAPBDes
async function handlePromosi(item: any) {
  Swal.fire({
    title: "Promosikan Usulan?",
    text: `Anda akan memindahkan [${item.usulanName}] ke tahap RAPBDes. Lanjutkan?`,
    icon: "info",
    showCancelButton: true,
    confirmButtonColor: "#1e88e5",
    cancelButtonColor: "#95a5a6",
    confirmButtonText: "Ya, Promosikan!",
    cancelButtonText: "Batal",
    allowOutsideClick: false,
  }).then(async (result: any) => {
    if (result.isConfirmed) {
      isLoading.value = true;
      try {
        // 1. Tarik data usulan proyek aslinya
        const resUsulan: any = await usulanProyekService().retrieveById(item.usulanId);
        let usulanData = resUsulan.data;

        // 2. Ubah statusnya menjadi RAPBDes
        usulanData.statusTahapan = 'RAPBDes';

        // 3. Simpan kembali ke database
        await usulanProyekService().save(usulanData);
        
        Swal.fire("Berhasil", "Usulan berhasil dipromosikan ke RAPBDes", "success");
        // Hapus sementara dari list frontend agar tidak bisa dipencet 2x
        tableData.value = tableData.value.filter(u => u.id !== item.id);
        
      } catch (err) {
        console.error("Gagal mempromosikan usulan", err);
        Swal.fire("Gagal", "Terjadi kesalahan sistem saat mempromosikan", "error");
      } finally {
        isLoading.value = false;
      }
    }
  });
}
</script>