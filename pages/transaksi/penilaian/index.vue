<template>
  <div>
    <SharedUiBreadcrumb
      :title="pages.title"
      :breadcrumbs="breadcrumbs"
    ></SharedUiBreadcrumb>

    <TableListPenilaian
      :headers="headers"
      :tableData="filteredData"
      :loading="isLoading"
      title="Daftar Usulan (Pilih untuk Dinilai)"
      permission="PENILAIAN"
      @fetchData="loadAll"
      @nilaiItem="openDialogPenilaian"
    >
    </TableListPenilaian>

<DialogForm
:show="dialog"
:persistent="true"
:reset="resetDialog"
:formTitle="dialogTitle"
:isLoading="isLoadingSave"
@handleSave="handleSave"
@handleClose="handleClose"
>
<v-alert
  v-if="listKriteria.length === 0"
  type="warning"
  variant="tonal"
  class="mb-4"
>
  Belum ada data Kriteria! Silakan isi Master Kriteria terlebih dahulu.
</v-alert>

<div v-else>
  <v-alert
    type="info"
    variant="tonal"
    class="mb-4 text-body-2"
    icon="mdi-information-outline"
  >
    <strong class="text-subtitle-2">Panduan Pengisian Nilai:</strong>
    <ul class="ml-4 mt-1">
      <li>Gunakan <strong>Nilai Riil</strong> (misal: Rp 10.000.000, atau 500 Meter) ATAU <strong>Skala Angka</strong> (misal: 1 - 100). Pastikan skalanya konsisten untuk semua usulan!</li>
      <li><strong><v-icon size="small" color="success">mdi-arrow-up</v-icon> Kriteria BENEFIT:</strong> Semakin <span class="text-success font-weight-bold">besar</span> nilainya, semakin baik (Prioritas naik).</li>
      <li><strong><v-icon size="small" color="error">mdi-arrow-down</v-icon> Kriteria COST:</strong> Semakin <span class="text-error font-weight-bold">kecil</span> nilainya, semakin baik (Prioritas naik).</li>
    </ul>
  </v-alert>

  <p class="mb-4 text-subtitle-2 text-medium-emphasis">
    Silakan masukkan nilai untuk usulan ini:
  </p>

  <v-row v-for="(kriteria, index) in listKriteria" :key="index" class="mb-1">
    <v-col cols="12">
      <v-label class="mb-2 font-weight-medium">
        {{ kriteria.kode }} - {{ kriteria.nama }} 
        <v-chip size="x-small" :color="kriteria.jenis === 'benefit' ? 'success' : 'error'" class="ml-2">
          {{ kriteria.jenis.toUpperCase() }}
        </v-chip>
      </v-label>
      <v-text-field
        v-model.number="formNilai[kriteria.id]"
        type="number"
        density="compact"
        variant="outlined"
        :rules="[(v) => v !== null && v !== '' && v >= 0 || 'Wajib diisi angka (Min: 0)']"
        :placeholder="`Masukkan nilai untuk ${kriteria.nama}`"
        :hint="kriteria.jenis === 'benefit' ? 'Nilai besar lebih baik' : 'Nilai kecil lebih baik'"
        persistent-hint
      ></v-text-field>
    </v-col>
  </v-row>
</div>
</DialogForm>
  </div>
</template>

<script setup lang="ts">
import usulanProyekService from "@/services/usulan_proyek.service";
import kriteriaService from "@/services/kriteria.service";
import penilaianService from "@/services/penilaian_usulan.service";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

const pages = ref({ title: "Penilaian Usulan" });
const breadcrumbs = ref([
  { text: "Dashboard", disabled: false, href: "/dashboard" },
  { text: "Transaksi", disabled: true, href: "#" },
  { text: "Penilaian", disabled: true, href: "#" },
]);

const isLoading = ref(false);
const isLoadingSave = ref(false);
const dialog = ref(false);
const resetDialog = ref(true);
const dialogTitle = ref("Form Penilaian");

const tableData = ref<any[]>([]);
const filteredData = ref<any[]>([]);
const listKriteria = ref<any[]>([]);

// State untuk menyimpan nilai input dinamis
const formNilai = ref<any>({});
const selectedUsulan = ref<any>(null);

const headers = ref([
  { title: "No", key: "no", width: "5%", align: "center", sortable: false },
  { title: "Tahun", key: "tahunAnggaran", width: "10%", align: "center" },
  { title: "Nama Proyek", key: "namaProyek" },
  { title: "Lokasi", key: "lokasi" },
  { title: "Aksi", key: "actions", align: "center", width: "12%", sortable: false },
]);

const { checkPermission } = usePermission();

onBeforeMount(() => {
  checkPermission("PENILAIAN.VIEW");
});

onMounted(() => {
  loadAll();
  loadMasterKriteria();
});

async function loadMasterKriteria() {
  try {
    const res: any = await kriteriaService().retrieve();
    listKriteria.value = res.data || [];
  } catch (err) {
    console.error("Gagal load kriteria", err);
  }
}

async function loadAll(searchQuery = "") {
  isLoading.value = true;
  try {
    // Menarik data usulan untuk ditampilkan di tabel
    const res: any = await usulanProyekService().retrieve();
    tableData.value = res.data || [];
    
    if (searchQuery) {
      filteredData.value = tableData.value.filter((item: any) => 
        item.namaProyek?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lokasi?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      filteredData.value = tableData.value;
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}

async function openDialogPenilaian(usulan: any) {
  resetDialog.value = false;
  selectedUsulan.value = usulan;
  dialogTitle.value = `Nilai Usulan: ${usulan.namaProyek}`;
  
  // Kosongkan form nilai sebelumnya
  formNilai.value = {};

  isLoading.value = true;
  try {
    // Tarik nilai yang sudah ada di database (jika sudah pernah dinilai)
    const res: any = await penilaianService().getByUsulanId(usulan.id);
    if (res && res.data) {
      res.data.forEach((item: any) => {
        formNilai.value[item.kriteriaId] = item.nilaiInput;
      });
    }
  } catch (err) {
    console.error("Gagal menarik riwayat penilaian", err);
  } finally {
    isLoading.value = false;
    dialog.value = true;
  }
}

function handleSave() {
  isLoadingSave.value = true;

  // Susun data sesuai RequestBulkPenilaian di Golang
  const dataPenilaian = listKriteria.value.map((k) => {
    return {
      kriteriaId: k.id,
      nilaiInput: Number(formNilai.value[k.id]) || 0 // Default 0 jika kosong
    };
  });

  const payload = {
    usulanId: selectedUsulan.value.id,
    data: dataPenilaian
  };

  penilaianService()
    .saveBulk(payload)
    .then(() => {
      handleClose();
      useToast("success", "Penilaian Berhasil Disimpan");
    })
    .catch(() => {
      isLoadingSave.value = false;
    });
}

function handleClose() {
  isLoadingSave.value = false;
  resetDialog.value = true;
  formNilai.value = {};
  selectedUsulan.value = null;
  dialog.value = false;
}
</script>