<template>
  <div>
    <SharedUiBreadcrumb :title="pages.title" :breadcrumbs="breadcrumbs"></SharedUiBreadcrumb>

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
              class="mr-2"
            >
              HITUNG TOPSIS
            </v-btn>

            <v-btn
               color="info"
               size="large"
               prepend-icon="mdi-printer"
               @click="cetakRKP"
               :disabled="tableData.items.length === 0 || !isAllCalculated"
            >
              CETAK DOKUMEN RKP
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-alert
      v-if="!isAllCalculated && tableData.items.length > 0"
      type="error"
      variant="tonal"
      class="mb-4 font-weight-bold"
      icon="mdi-calculator-variant-outline"
    >
      PERHATIAN: Ada usulan yang belum dihitung! Silakan klik tombol "HITUNG TOPSIS" terlebih dahulu agar bisa dicetak dan dipromosikan.
    </v-alert>

    <v-alert
      v-else-if="tableData.items.length > 0 && !isPrinted"
      type="warning"
      variant="tonal"
      class="mb-4 font-weight-bold"
      icon="mdi-alert-circle"
    >
      SOP WAJIB: Anda HARUS mencetak Dokumen Laporan RKP terlebih dahulu sebelum mempromosikan usulan proyek ke RAPBDes.
    </v-alert>

    <TableListPerankingan
      v-if="tableData.items && tableData.items.length > 0 || isLoading"
      :headers="headers"
      :tableData="tableData"
      :loading="isLoading"
      :isPrinted="isPrinted" 
      :title="`Daftar Draft RKP Tahun ${selectedTahun}`"
      @fetchData="loadHasil"
      @promosikan="handlePromosi"
      @luncurkan="handleLuncurkan"
    >
    </TableListPerankingan>
    
    <v-alert
      v-else-if="!isLoading"
      type="info"
      variant="tonal"
      class="mt-4"
    >
      Belum ada usulan proyek untuk draft RKP Tahun {{ selectedTahun }}.
    </v-alert>

    <ExportAPBDES 
      ref="exportDoc" 
      :data="dataCetakLengkap" 
      :tahun="selectedTahun" 
      jenisDokumen="RKP"
    />
  </div>
</template>

<script setup lang="ts">
import Swal from "sweetalert2";
import perankinganService from "@/services/perankingan.service";
import usulanProyekService from "@/services/usulan_proyek.service";
import ExportAPBDES from "@/components/reports/ExportAPBDES.vue";
import { ref, computed, onBeforeMount, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePermission } from "@/composables/usePermission";
import { useToast } from "@/composables/useToast";

definePageMeta({ layout: "admin", middleware: ["auth"] });

const pages = ref({ title: "Perankingan TOPSIS" });
const breadcrumbs = ref([
  { text: "Dashboard", disabled: false, href: "/dashboard" },
  { text: "Transaksi", disabled: true, href: "#" },
  { text: "Perankingan", disabled: true, href: "#" },
]);

const isLoading = ref(false);
const isCalculating = ref(false);

const isPrinted = ref(false); 
const exportDoc = ref<any>(null); 
const dataCetakLengkap = ref<any[]>([]); 

const currentYear = new Date().getFullYear();
const listTahun = ref([currentYear, currentYear + 1, currentYear + 2]); 
const selectedTahun = ref(currentYear + 1); 
const selectedTahap = ref('RKP');

const route = useRoute();
const router = useRouter();

const tableData = ref<any>({
  items: [],
  meta: { totalItems: 0 },
});

// Cek apakah semua data sudah dihitung (nilainya lebih dari 0)
const isAllCalculated = computed(() => {
  if (tableData.value.items.length === 0) return false;
  return tableData.value.items.every((item: any) => item.isCalculated);
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

function hasPermission(val: string) { return checkUI(`PERANKINGAN.${val}`); }

onBeforeMount(() => { checkPermission("PERANKINGAN.VIEW"); });

function handleTahunChange() {
  const currentQuery = { ...route.query };
  currentQuery.pageNumber = "1";
  router.replace({ path: route.path, query: currentQuery });
  
  isPrinted.value = false;
  loadHasil();
}

async function loadHasil() {
  isLoading.value = true;
  try {
    const { pageNumber, pageSize, q, sortBy, sortType } = route.query;
    
    // 1. Ambil data mentah langsung dari usulan_proyek (Bukan dari Arsip)
    const resUsulan: any = await usulanProyekService().retrieveAllData();
    const semuaUsulan = resUsulan.data?.data || resUsulan.data || [];

    // 2. Filter hanya yang RKP di tahun yang dipilih
    let dataTabel = semuaUsulan.filter((u: any) => 
      u.tahunAnggaran === selectedTahun.value && u.statusTahapan === 'RKP'
    );

    if (q) {
      const queryStr = String(q).toLowerCase();
      dataTabel = dataTabel.filter((u: any) => u.namaProyek?.toLowerCase().includes(queryStr));
    }

    // 3. Sorting
    const sortKey = (sortBy as string) || 'nilaiPreferensiV';
    const order = (sortType as string) || 'desc';
    
    dataTabel.sort((a: any, b: any) => {
      let valA = a[sortKey] ?? 0;
      let valB = b[sortKey] ?? 0;
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });

    // 4. Mapping Data agar sesuai dengan tabel & cek status "Belum Dihitung"
    const mappedData = dataTabel.map((u: any, index: number) => {
      const isDihitung = u.nilaiPreferensiV > 0;
      return {
        ...u,
        usulanId: u.id,
        usulanName: u.namaProyek,
        tahapVersi: u.statusTahapan,
        isCalculated: isDihitung, // 👈 Indikator apakah TOPSIS sudah jalan
        rankingRender: isDihitung ? (index + 1) : '-'
      };
    });

    const size = parseInt(pageSize as string) || 10;
    const page = parseInt(pageNumber as string) || 1;
    const totalItems = mappedData.length;
    const start = (page - 1) * size;
    const paginatedItems = mappedData.slice(start, start + size);

    tableData.value = {
      items: paginatedItems,
      meta: { totalItems }
    };

    // Karena sudah ambil dari usulan_proyek, kita langsung lempar ke cetakan PDF!
    dataCetakLengkap.value = mappedData;

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
    text: `Sistem akan menghitung ulang prioritas usulan untuk Tahun ${selectedTahun.value}.`,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#28a745",
    confirmButtonText: "Ya, Hitung!",
    allowOutsideClick: false,
  }).then(async (result: any) => {
    if (result.isConfirmed) {
      isCalculating.value = true;
      try {
        await perankinganService().hitungTopsis({
          tahunAnggaran: selectedTahun.value,
          tahapVersi: selectedTahap.value
        });
        useToast("success", "Perhitungan TOPSIS Selesai!");
        
        isPrinted.value = false;
        loadHasil(); // Refresh untuk melihat nilainya
      } catch (err: any) {
        Swal.fire("Gagal", err.response?.data?.error || "Terjadi kesalahan", "error");
      } finally {
        isCalculating.value = false;
      }
    }
  });
}

async function cetakRKP() {
  if (exportDoc.value && isAllCalculated.value) {
    await nextTick();
    await exportDoc.value.generateReport();
    isPrinted.value = true;
  }
}

async function handlePromosi(item: any) {
  if (!item.isCalculated) {
    Swal.fire("Peringatan", "Usulan ini belum dihitung, silakan klik HITUNG TOPSIS terlebih dahulu.", "warning");
    return;
  }
  
  Swal.fire({
    title: "Promosikan Usulan?",
    text: `Anda akan memindahkan [${item.usulanName}] ke tahap RAPBDes. Lanjutkan?`,
    icon: "info",
    showCancelButton: true,
    confirmButtonColor: "#1e88e5",
    confirmButtonText: "Ya, Promosikan!",
  }).then(async (result: any) => {
    if (result.isConfirmed) {
      isLoading.value = true;
      try {
        const resUsulan: any = await usulanProyekService().retrieveById(item.usulanId);
        let usulanData = resUsulan.data;

        usulanData.statusTahapan = 'RAPBDes';
        await usulanProyekService().save(usulanData);
        
        useToast("success", "Berhasil dipromosikan ke RAPBDes");
        loadHasil(); 
      } catch (err) {
        Swal.fire("Gagal", "Terjadi kesalahan sistem saat mempromosikan", "error");
      } finally {
        isLoading.value = false;
      }
    }
  });
}

async function handleLuncurkan(item: any) {
  Swal.fire({
    title: "Tunda Usulan?",
    text: `Usulan [${item.usulanName}] akan ditunda dan diluncurkan (carry-over) ke draft RKP Tahun ${Number(selectedTahun.value) + 1}.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    confirmButtonText: "Ya, Tunda ke Tahun Depan!",
  }).then(async (result: any) => {
    if (result.isConfirmed) {
      isLoading.value = true;
      try {
        const resUsulan: any = await usulanProyekService().retrieveById(item.usulanId);
        let usulanData = resUsulan.data;

        usulanData.statusTahapan = 'RKP'; 
        usulanData.tahunAnggaran = Number(usulanData.tahunAnggaran) + 1; 
        
        // Memaksa reset dengan memberikan tipe float 0.0, jika Golang menolak 0, 
        // fallback frontend (isCalculated) akan menangkapnya sebagai Belum Dihitung.
        usulanData.nilaiPreferensiV = 0.0; 
        
        await usulanProyekService().save(usulanData);
        
        useToast("success", "Usulan berhasil ditunda ke tahun depan.");
        loadHasil(); 
      } catch (err) {
        Swal.fire("Gagal", "Terjadi kesalahan sistem saat memproses.", "error");
      } finally {
        isLoading.value = false;
      }
    }
  });
}
</script>