<template>
  <div>
    <div class="hide-on-print">
      <SharedUiBreadcrumb :title="pages.title" :breadcrumbs="breadcrumbs"></SharedUiBreadcrumb>

      <v-card class="mb-4 elevation-3">
        <v-card-text>
          <v-row align="center">
            <v-col cols="12" md="4">
              <v-autocomplete
                v-model="selectedTahun"
                :items="listTahun"
                label="Pilih Tahun Anggaran"
                color="primary"
                variant="outlined"
                density="compact"
                hide-details
                @update:modelValue="loadData"
              ></v-autocomplete>
            </v-col>
            <v-col cols="12" md="8" class="text-right">
              <v-btn 
                color="primary" 
                prepend-icon="mdi-printer" 
                size="large"
                @click="cetakDokumen"
                :disabled="tableData.length === 0"
              >
                Cetak Dokumen (PDF)
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>

    <TableListAPBDes
      :headers="headers"
      :tableData="tableData"
      :loading="isLoading"
      :tahun="selectedTahun"
      title="Daftar Infrastruktur APBDes"
    >
    </TableListAPBDes>
  </div>
</template>

<script setup lang="ts">
import usulanProyekService from "@/services/usulan_proyek.service";

definePageMeta({ layout: "admin", middleware: ["auth"] });

const pages = ref({ title: "Dokumen APBDes" });
const breadcrumbs = ref([
  { text: "Dashboard", disabled: false, href: "/dashboard" },
  { text: "Transaksi", disabled: true, href: "#" },
  { text: "APBDes", disabled: true, href: "#" },
]);

const currentYear = new Date().getFullYear();
const listTahun = ref([currentYear - 1, currentYear, currentYear + 1]);
const selectedTahun = ref(currentYear);

const isLoading = ref(false);
const tableData = ref<any[]>([]);

const headers = ref([
  { title: "No", key: "no", width: "5%", align: "center", sortable: false },
  { title: "Nama Usulan Proyek", key: "namaProyek" },
  { title: "Lokasi", key: "lokasi" },
  { title: "Sifat", key: "statusSifat", align: "center" },
  { title: "Alokasi RAB", key: "nilaiRab", align: "right" }
]);

const { checkPermission } = usePermission();

onBeforeMount(() => {
  // Anggap label permission-nya adalah APBDES
  checkPermission("APBDES.VIEW");
});

onMounted(() => {
  loadData();
});

async function loadData() {
  isLoading.value = true;
  try {
    const res: any = await usulanProyekService().retrieve();
    const semuaUsulan = res.data || [];

    // HANYA tarik yang statusnya APBDes dan tahunnya sesuai (UR-F19)
    tableData.value = semuaUsulan.filter((u: any) => u.tahunAnggaran === selectedTahun.value && u.statusTahapan === 'APBDes');
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}

function cetakDokumen() {
  // Fungsi ini akan memanggil dialog print bawaan OS/Browser
  // Yang mana secara otomatis menyediakan opsi "Save as PDF"
  window.print();
}
</script>

<style scoped>
/* Sembunyikan elemen kontrol saat diprint */
@media print {
  .hide-on-print {
    display: none !important;
  }
  
  /* Sembunyikan sidebar dan header utama admin panel (Vuetify layout default) */
  :deep(.v-navigation-drawer), 
  :deep(.v-app-bar) {
    display: none !important;
  }
  
  :deep(.v-main) {
    padding: 0 !important;
  }
}
</style>