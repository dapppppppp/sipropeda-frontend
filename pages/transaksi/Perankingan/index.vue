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
              @update:modelValue="handleTahunChange"
            ></v-autocomplete>
          </v-col>
          
          <v-col cols="12" md="8" class="text-right mt-6">
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
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <TableListPerankingan
      v-if="tableData.items && tableData.items.length > 0 || isLoading"
      :headers="headers"
      :tableData="tableData"
      :loading="isLoading"
      :title="`Hasil Perankingan Tahun ${selectedTahun} - Tahap ${selectedTahap}`"
      @fetchData="loadHasil"
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
import usulanProyekService from "@/services/usulan_proyek.service";

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
const listTahun = ref([currentYear, currentYear + 1, currentYear + 2]); 
const selectedTahun = ref(currentYear + 1); 
const selectedTahap = ref('RKP');

const route = useRoute();
const router = useRouter();

// Menggunakan objek terpaginasi
const tableData = ref<any>({
  items: [],
  meta: {
    totalItems: 0,
  },
});

const headers = computed(() => {
  let baseHeaders = [
    { title: "Peringkat", key: "ranking", width: "10%", align: "center" },
    { title: "Nama Usulan Proyek", key: "usulanName" },
    { title: "Tahap", key: "tahapVersi", align: "center" },
    { title: "Nilai Preferensi (V)", key: "nilaiPreferensiV", align: "center" },
    { title: "Aksi", key: "actions", align: "center", sortable: false }
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

// Ketika user mengganti tahun, reset halaman ke 1 via URL
function handleTahunChange() {
  const currentQuery = { ...route.query };
  currentQuery.pageNumber = "1";
  router.replace({ path: route.path, query: currentQuery });
  loadHasil();
}

async function loadHasil() {
  isLoading.value = true;
  hasSearched.value = true;
  try {
    const { pageNumber, pageSize, q, sortBy, sortType } = route.query;
    
    // Gabungkan parameter spesifik (tahun, tahap) dengan parameter pagination
    const req = { 
      tahun: selectedTahun.value, 
      tahap: selectedTahap.value,
      q: q || "",
      pageSize: pageSize ?? 10,
      pageNumber: pageNumber ?? 1,
      sortBy: sortBy || "ranking",
      sortType: sortType || "asc",
    };
    
    const res: any = await perankinganService().getArsip(req);
    const payload = res.data?.data || res.data || {};
    const items = payload.items || (Array.isArray(payload) ? payload : []);
    const meta = payload.meta || {};
    const total = meta.totalItems ?? meta.totalData ?? meta.total_items ?? meta.total ?? items.length ?? 0;

    tableData.value = {
      items: items,
      meta: {
        totalItems: total,
      },
    };
  } catch (err) {
    console.error("Gagal load hasil perankingan", err);
    tableData.value = { items: [], meta: { totalItems: 0 } };
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
        await perankinganService().hitungTopsis(payload);
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
        const resUsulan: any = await usulanProyekService().retrieveById(item.usulanId);
        let usulanData = resUsulan.data;

        usulanData.statusTahapan = 'RAPBDes';
        await usulanProyekService().save(usulanData);
        
        Swal.fire("Berhasil", "Usulan berhasil dipromosikan ke RAPBDes", "success");
        loadHasil(); // Refresh data dari server
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