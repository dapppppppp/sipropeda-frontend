<template>
  <div>
    <SharedUiBreadcrumb
      :title="pages.title"
      :breadcrumbs="breadcrumbs"
    ></SharedUiBreadcrumb>

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
        :rules="[(v) => !!v || 'Wajib diisi']"
        placeholder="Contoh: C1"
        hide-details="auto"
      ></v-text-field>

      <v-label class="mb-2 mt-3 font-weight-medium">Nama Kriteria</v-label>
      <v-text-field
        v-model="editedItem.nama"
        density="compact"
        :rules="[(v) => !!v || 'Wajib diisi']"
        placeholder="Contoh: Kondisi Jalan"
        hide-details="auto"
      ></v-text-field>

      <v-row class="mt-1">
        <v-col cols="12" md="6">
          <v-label class="mb-2 font-weight-medium">Bobot</v-label>
          <v-text-field
            v-model.number="editedItem.bobot"
            type="number"
            density="compact"
            :rules="[(v) => !!v || 'Wajib diisi']"
            placeholder="Contoh: 5"
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
            :rules="[(v) => !!v || 'Wajib diisi']"
            placeholder="Pilih Jenis"
            hide-details="auto"
          ></v-autocomplete>
        </v-col>
      </v-row>
    </DialogForm>
  </div>
</template>

<script setup lang="ts">
import Swal from "sweetalert2";
import kriteriaService from "@/services/kriteria.service";

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

async function loadAll(searchQuery = "") {
  isLoading.value = true;
  try {
    const res: any = await kriteriaService().retrieve();
    tableData.value = res.data || [];
    
    // Simple frontend search filter
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