<template>
  <div>
    <div>
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
                @click="handlePrintPDF"
                :disabled="tableData.length === 0"
              >
                Cetak Dokumen APBDes
              </v-btn>

              <ExportAPBDES 
                ref="exportApbdesRef"
                :data="tableData" 
                :tahun="selectedTahun" 
              />
              
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
      title="Daftar Kegiatan APBDes"
    >
    </TableListAPBDes>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, onMounted } from "vue";
import usulanProyekService from "@/services/usulan_proyek.service";
import ExportAPBDES from "@/components/reports/ExportAPBDES.vue";

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
  { title: "No", key: "nomorUrut", width: "5%", align: "center", sortable: false },
  { title: "Nama Usulan Program/Kegiatan", key: "namaProyek" },
  { title: "Lokasi", key: "lokasi" },
  { title: "Sifat", key: "statusSifat", align: "center" },
  { title: "Alokasi RAB", key: "nilaiRab", align: "right" },
  { title: "Nilai Preferensi (V)", key: "nilaiPreferensiV", align: "center", sortable: true },
]);

const { checkPermission } = usePermission();

const exportApbdesRef = ref<InstanceType<typeof ExportAPBDES> | null>(null);

onBeforeMount(() => {
  checkPermission("APBDES.VIEW");
});

onMounted(() => {
  loadData();
});

async function loadData() {
  isLoading.value = true;
  try {
    // 👇 Memanggil endpoint /all yang baru dibuat!
    const res: any = await usulanProyekService().retrieveAllData(); 
    const semuaUsulan = res.data?.data || res.data || [];
    
    let filteredData = semuaUsulan.filter((u: any) => 
      u.tahunAnggaran === selectedTahun.value && u.statusTahapan === 'APBDes'
    );

    filteredData.sort((a: any, b: any) => {
      const danaA = a.sumberDanaName || '';
      const danaB = b.sumberDanaName || '';
      
      if (danaA !== danaB) {
        return danaA.localeCompare(danaB);
      }
      
      const valA = Number(a.nilaiPreferensiV) || 0;
      const valB = Number(b.nilaiPreferensiV) || 0;
      return valB - valA;
    });

    tableData.value = filteredData.map((item: any, index: number) => ({
      ...item,
      nomorUrut: index + 1
    }));

  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}

const handlePrintPDF = () => {
  if (exportApbdesRef.value) {
    exportApbdesRef.value.generateReport();
  }
};
</script>