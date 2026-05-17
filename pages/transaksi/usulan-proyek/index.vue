<template>
  <div>
    <SharedUiBreadcrumb
      :title="pages.title"
      :breadcrumbs="breadcrumbs"
    ></SharedUiBreadcrumb>

    <TableListUsulanProyek
      :headers="headers"
      :tableData="filteredData"
      :loading="isLoading"
      title="Data Usulan Proyek"
      permission="USULAN_PROYEK"
      @fetchData="loadAll"
      @addItem="addItem"
      @editItem="editItem"
      @deleteItem="deleteItem"
    >
    </TableListUsulanProyek>

    <DialogForm
      :show="dialog"
      :persistent="true"
      :reset="resetDialog"
      :formTitle="dialogTitle"
      :isLoading="isLoadingSave"
      @handleSave="handleSave"
      @handleClose="handleClose"
    >
      <v-row>
        <v-col cols="12" md="3">
          <v-label class="mb-2 font-weight-medium">Tahun</v-label>
          <v-autocomplete
            v-model="editedItem.tahunAnggaran"
            :items="listTahun"
            color="primary"
            variant="outlined"
            density="compact"
            :rules="[(v) => !!v || 'Wajib diisi']"
            hide-details="auto"
          ></v-autocomplete>
        </v-col>
        <v-col cols="12" md="9">
          <v-label class="mb-2 font-weight-medium">Nama Proyek / Kegiatan</v-label>
          <v-text-field
            v-model="editedItem.namaProyek"
            density="compact"
            :rules="[(v) => !!v || 'Wajib diisi']"
            placeholder="Contoh: Pelatihan Digital Marketing BUMDes"
            hide-details="auto"
          ></v-text-field>
        </v-col>
      </v-row>

      <v-label class="mb-2 mt-3 font-weight-medium">Lokasi / Sasaran</v-label>
      <v-textarea
        v-model="editedItem.lokasi"
        density="compact"
        rows="2"
        variant="outlined"
        :rules="[(v) => !!v || 'Wajib diisi']"
        placeholder="Contoh: Balai Desa Sumber Makmur"
        hide-details="auto"
      ></v-textarea>

      <v-row class="mt-1">
        <v-col cols="12" md="6">
          <v-label class="mb-2 font-weight-medium">Sifat Kegiatan</v-label>
          <v-autocomplete
            v-model="editedItem.statusSifat"
            :items="['Reguler', 'Mandatori']"
            color="primary"
            variant="outlined"
            density="compact"
            :rules="[(v) => !!v || 'Wajib diisi']"
            hide-details="auto"
          ></v-autocomplete>
        </v-col>
        <v-col cols="12" md="6">
          <v-label class="mb-2 font-weight-medium">Sumber Dana</v-label>
          <v-autocomplete
            v-model="editedItem.sumberDanaId"
            :items="listSumberDana"
            item-value="id"
            item-title="namaSumber"
            color="primary"
            variant="outlined"
            density="compact"
            clearable
            placeholder="Pilih Sumber Dana (Opsional)"
            hide-details="auto"
          ></v-autocomplete>
        </v-col>
      </v-row>

      <v-label class="mb-2 mt-3 font-weight-medium">Nilai RAB (Rp)</v-label>
      <v-text-field
        v-model.number="editedItem.nilaiRab"
        type="number"
        density="compact"
        :rules="[(v) => !!v || 'Wajib diisi', (v) => v > 0 || 'RAB harus lebih dari 0']"
        placeholder="Contoh: 15000000"
        hide-details="auto"
      ></v-text-field>
      <p v-if="editedItem.nilaiRab" class="text-caption mt-1 text-success font-weight-bold">
        Terbilang: {{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(editedItem.nilaiRab) }}
      </p>

    </DialogForm>
  </div>
</template>

<script setup lang="ts">
import Swal from "sweetalert2";
import usulanProyekService from "@/services/usulan_proyek.service";
import sumberDanaService from "@/services/sumber_dana.service";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

const pages = ref({ title: "Usulan Proyek" });
const breadcrumbs = ref([
  { text: "Dashboard", disabled: false, href: "/dashboard" },
  { text: "Transaksi", disabled: true, href: "#" },
  { text: "Usulan Proyek", disabled: true, href: "#" },
]);

const isLoading = ref(false);
const isLoadingSave = ref(false);
const dialog = ref(false);
const resetDialog = ref(true);
const dialogTitle = ref("Tambah Usulan Proyek");

const tableData = ref<any[]>([]);
const filteredData = ref<any[]>([]);
const listSumberDana = ref<any[]>([]);

const currentYear = new Date().getFullYear();
const listTahun = ref([currentYear - 1, currentYear, currentYear + 1, currentYear + 2]);

const headers = ref([
  { title: "No", key: "no", width: "5%", align: "center", sortable: false },
  { title: "Tahun", key: "tahunAnggaran", width: "10%", align: "center" },
  { title: "Nama Kegiatan/Proyek", key: "namaProyek" },
  { title: "Lokasi/Sasaran", key: "lokasi" },
  { title: "Sifat", key: "statusSifat", align: "center" },
  { title: "Nilai RAB", key: "nilaiRab", align: "right" },
  { title: "Aksi", key: "actions", align: "center", width: "12%", sortable: false },
]);

const editedItem = ref<any>({});
const { checkPermission } = usePermission();

onBeforeMount(() => {
  checkPermission("USULAN_PROYEK.VIEW");
});

onMounted(() => {
  loadAll();
  loadMasterSumberDana();
});

async function loadMasterSumberDana() {
  try {
    const res: any = await sumberDanaService().retrieve();
    listSumberDana.value = res.data || [];
  } catch (err) {
    console.error("Gagal load sumber dana", err);
  }
}

async function loadAll(searchQuery = "") {
  isLoading.value = true;
  try {
    const res: any = await usulanProyekService().retrieve();
    tableData.value = res.data || [];
    
    if (searchQuery) {
      filteredData.value = tableData.value.filter((item: any) => 
        item.namaProyek?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lokasi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tahunAnggaran.toString().includes(searchQuery)
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
  usulanProyekService()
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
  editedItem.value = { 
    tahunAnggaran: currentYear,
    statusSifat: 'Reguler'
  };
  dialogTitle.value = "Tambah Usulan Proyek";
  dialog.value = true;
}

async function editItem(x: any) {
  resetDialog.value = false;
  try {
    const res: any = await usulanProyekService().retrieveById(x.id);
    if (res.data.id) {
      editedItem.value = res.data;
      dialogTitle.value = "Edit Usulan Proyek";
      dialog.value = true;
    }
  } catch (err) {
    console.error(err);
  }
}

async function deleteItem(x: any) {
  Swal.fire({
    title: "Hapus Data",
    text: `Yakin ingin menghapus Usulan: ${x.namaProyek}?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#95a5a6",
    confirmButtonText: "Ya, Hapus!",
    cancelButtonText: "Batal",
    allowOutsideClick: false,
  }).then((result: any) => {
    if (result.isConfirmed) {
      usulanProyekService()
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