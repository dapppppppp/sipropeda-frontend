<template>
  <div>
    <SharedUiBreadcrumb
      :title="pages.title"
      :breadcrumbs="breadcrumbs"
    ></SharedUiBreadcrumb>

    <v-alert
      v-if="totalBobot !== 1"
      type="warning"
      variant="tonal"
      icon="mdi-alert-circle"
      class="mb-4 font-weight-bold"
    >
      Peringatan: Total Bobot Kriteria saat ini adalah {{ totalBobot.toFixed(2) }}. Total bobot harus tepat 1.0 agar perhitungan TOPSIS valid!
    </v-alert>

    <div class="d-flex justify-end mb-3">
      <v-btn 
        color="info" 
        variant="tonal" 
        prepend-icon="mdi-help-circle-outline" 
        @click="showGuideDialog = true"
      >
        Panduan Kriteria TOPSIS
      </v-btn>
    </div>

    <TableListKriteria
      :headers="headers"
      :tableData="filteredData"
      :loading="isLoading"
      title="Data Kriteria TOPSIS"
      permission="KRITERIA"
      @fetchData="loadAll"
      @addItem="addItem"
      @editItem="editItem"
      @deleteItem="deleteItem"
    >
    </TableListKriteria>

    <v-dialog v-model="showGuideDialog" max-width="700">
      <v-card>
        <v-card-title class="bg-info text-white d-flex align-center">
          <v-icon class="mr-2">mdi-information</v-icon>
          Panduan Kriteria TOPSIS
        </v-card-title>
        <v-card-text class="pt-4 text-body-1">
          <strong class="text-subtitle-1">Aturan Penetapan Kriteria:</strong>
          <ul class="ml-4 mt-2 mb-4">
            <li class="mb-2">
              <strong>Total Bobot:</strong> Jumlah keseluruhan bobot kriteria harus bernilai mutlak <strong>1.0</strong>. 
              <br>
              <v-chip size="small" :color="totalBobot === 1 ? 'success' : 'error'" class="mt-1 font-weight-bold">
                Total Bobot Saat Ini: {{ totalBobot.toFixed(2) }}
              </v-chip>
            </li>
            <li class="mb-2">
              <strong>Jenis BENEFIT (<v-icon size="small" color="success">mdi-arrow-up</v-icon>):</strong> Pilih ini jika nilai atribut semakin <span class="text-success font-weight-bold">besar</span> semakin baik (Misal: Tingkat Urgensi, Penerima Manfaat).
            </li>
            <li class="mb-2">
              <strong>Jenis COST (<v-icon size="small" color="error">mdi-arrow-down</v-icon>):</strong> Pilih ini jika nilai atribut semakin <span class="text-error font-weight-bold">kecil</span> semakin baik (Misal: Rencana Anggaran Biaya, Durasi Pengerjaan).
            </li>
            <li class="text-error font-weight-medium">
              <strong>Perhatian:</strong> Jika Anda menambah/menghapus kriteria baru, Anda <strong>wajib mengedit form penilaian usulan</strong> yang sudah ada sebelumnya agar sistem tidak <i>error</i> saat menghitung.
            </li>
          </ul>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="showGuideDialog = false">Mengerti</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <DialogForm
      :show="dialog"
      :persistent="true"
      :reset="resetDialog"
      :formTitle="dialogTitle"
      :isLoading="isLoadingSave"
      @handleSave="handleSave"
      @handleClose="handleClose"
    >
      <v-label class="mb-2 font-weight-medium">Kode Kriteria</v-label>
      <v-text-field
        v-model="editedItem.kode"
        density="compact"
        :rules="[(v: any) => !!v || 'Wajib diisi']"
        placeholder="Contoh: C1"
        hide-details="auto"
      ></v-text-field>

      <v-label class="mb-2 mt-3 font-weight-medium">Nama Kriteria</v-label>
      <v-text-field
        v-model="editedItem.nama"
        density="compact"
        :rules="[(v: any) => !!v || 'Wajib diisi']"
        placeholder="Contoh: Kondisi Jalan"
        hide-details="auto"
      ></v-text-field>

      <v-row class="mt-1">
        <v-col cols="12" md="6">
          <v-label class="mb-2 font-weight-medium">Bobot</v-label>
          <v-text-field
            v-model.number="editedItem.bobot"
            type="number"
            step="0.1"
            density="compact"
            :rules="[(v: any) => !!v || 'Wajib diisi', (v: any) => v > 0 || 'Harus lebih dari 0']"
            placeholder="Contoh: 0.2"
            hide-details="auto"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-label class="mb-2 font-weight-medium">Jenis Kriteria</v-label>
          <v-autocomplete
            v-model="editedItem.jenis"
            :items="['benefit', 'cost']"
            color="primary"
            variant="outlined"
            density="compact"
            :rules="[(v: any) => !!v || 'Wajib diisi']"
            placeholder="Pilih Jenis"
            hide-details="auto"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props">
                <template v-slot:append>
                  <v-chip size="x-small" :color="item.raw === 'benefit' ? 'success' : 'error'">
                    {{ item.raw === 'benefit' ? 'Besar = Baik' : 'Kecil = Baik' }}
                  </v-chip>
                </template>
              </v-list-item>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>
    </DialogForm>
  </div>
</template>

<script setup lang="ts">
import Swal from "sweetalert2";
import kriteriaService from "@/services/kriteria.service";
import { ref, computed, onBeforeMount } from "vue";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

const pages = ref({ title: "Master Kriteria" });
const breadcrumbs = ref([
  { text: "Dashboard", disabled: false, href: "/dashboard" },
  { text: "Master Data", disabled: true, href: "#" },
  { text: "Kriteria", disabled: true, href: "#" },
]);

// State untuk memunculkan Dialog Panduan
const showGuideDialog = ref(false);

const isLoading = ref(false);
const isLoadingSave = ref(false);
const dialog = ref(false);
const resetDialog = ref(true);
const dialogTitle = ref("Tambah Kriteria");

const tableData = ref<any[]>([]);
const filteredData = ref<any[]>([]);

const headers = ref([
  { title: "No", key: "no", width: "5%", align: "center", sortable: false },
  { title: "Kode", key: "kode", width: "10%" },
  { title: "Nama Kriteria", key: "nama" },
  { title: "Bobot", key: "bobot", width: "15%", align: "center" },
  { title: "Jenis", key: "jenis", width: "15%", align: "center" },
  { title: "Aksi", key: "actions", align: "center", width: "15%", sortable: false },
]);

const editedItem = ref<any>({});
const { checkPermission } = usePermission();

onBeforeMount(() => {
  checkPermission("KRITERIA.VIEW");
});

// Menghitung total bobot secara reaktif
const totalBobot = computed(() => {
  const sum = tableData.value.reduce((acc, current) => acc + (Number(current.bobot) || 0), 0);
  return Math.round(sum * 100) / 100; 
});

async function loadAll(searchQuery = "") {
  isLoading.value = true;
  try {
    const res: any = await kriteriaService().retrieve();
    tableData.value = res.data || [];
    
    if (searchQuery) {
      filteredData.value = tableData.value.filter((item: any) => 
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.kode.toLowerCase().includes(searchQuery.toLowerCase())
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

function handleSave() {
  isLoadingSave.value = true;
  kriteriaService()
    .save(editedItem.value)
    .then(() => {
      handleClose();
      useToast("success", "Data Berhasil Disimpan");
      loadAll();
    })
    .catch(() => {
      isLoadingSave.value = false;
    });
}

function addItem() {
  resetDialog.value = false;
  editedItem.value = { bobot: 0, jenis: 'benefit' };
  dialogTitle.value = "Tambah Kriteria";
  dialog.value = true;
}

async function editItem(x: any) {
  resetDialog.value = false;
  try {
    const res: any = await kriteriaService().retrieveById(x.id);
    if (res.data.id) {
      editedItem.value = res.data;
      dialogTitle.value = "Edit Kriteria";
      dialog.value = true;
    }
  } catch (err) {
    console.error(err);
  }
}

async function deleteItem(x: any) {
  Swal.fire({
    title: "Hapus Data",
    text: `Apakah Anda yakin menghapus kriteria [${x.kode} - ${x.nama}]?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#95a5a6",
    confirmButtonText: "Ya, Hapus!",
    cancelButtonText: "Batal",
    allowOutsideClick: false,
  }).then((result: any) => {
    if (result.isConfirmed) {
      kriteriaService()
        .destroy(x.id)
        .then(() => {
          useToast("success", "Data Berhasil Dihapus");
          loadAll();
        });
    }
  });
}

function handleClose() {
  isLoadingSave.value = false;
  resetDialog.value = true;
  editedItem.value = {};
  dialog.value = false;
}
</script>