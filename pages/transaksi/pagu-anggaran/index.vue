<template>
  <div>
    <SharedUiBreadcrumb
      :title="pages.title"
      :breadcrumbs="breadcrumbs"
    ></SharedUiBreadcrumb>

    <TableListPaguAnggaran
      :headers="headers"
      :tableData="filteredData"
      :loading="isLoading"
      title="Data Pagu Anggaran"
      permission="PAGU_ANGGARAN"
      @fetchData="loadAll"
      @addItem="addItem"
      @editItem="editItem"
      @deleteItem="deleteItem"
    >
    </TableListPaguAnggaran>

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
        <v-col cols="12" md="4">
          <v-label class="mb-2 font-weight-medium">Tahun Anggaran</v-label>
          <v-autocomplete
            v-model="editedItem.tahun"
            :items="listTahun"
            color="primary"
            variant="outlined"
            density="compact"
            :rules="[(v) => !!v || 'Wajib diisi']"
            placeholder="Pilih Tahun"
            hide-details="auto"
          ></v-autocomplete>
        </v-col>

        <v-col cols="12" md="8">
          <v-label class="mb-2 font-weight-medium">Sumber Dana</v-label>
          <v-autocomplete
            v-model="editedItem.sumberDanaId"
            :items="listSumberDana"
            item-value="id"
            item-title="namaSumber"
            color="primary"
            variant="outlined"
            density="compact"
            :rules="[(v) => !!v || 'Wajib diisi']"
            placeholder="Pilih Sumber Dana"
            hide-details="auto"
          ></v-autocomplete>
        </v-col>
      </v-row>

      <v-alert
        v-if="isAutoFilled"
        type="info"
        variant="tonal"
        class="mt-4 mb-2 py-2"
        density="compact"
      >
        Pagu Estimasi terisi otomatis dari Pagu Definitif tahun sebelumnya. Silakan ubah jika ada info perubahan kuota.
      </v-alert>

      <v-label class="mb-2 mt-3 font-weight-medium">Pagu Estimasi (Tahap RKP)</v-label>
      <v-text-field
        v-model.number="editedItem.paguEstimasi"
        type="number"
        density="compact"
        color="primary"
        variant="outlined"
        :rules="[(v) => !!v || 'Wajib diisi', (v) => v > 0 || 'Pagu harus lebih dari 0']"
        placeholder="Contoh: 100000000"
        hide-details="auto"
      ></v-text-field>
      <p v-if="editedItem.paguEstimasi" class="text-caption mt-1 text-success font-weight-bold">
        Terbilang: {{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(editedItem.paguEstimasi) }}
      </p>

      <v-label class="mb-2 mt-3 font-weight-medium">Pagu Definitif (Tahap RAPBDes)</v-label>
      <v-text-field
        v-model.number="editedItem.paguDefinitif"
        type="number"
        density="compact"
        color="secondary"
        variant="outlined"
        placeholder="Isi 0 jika SK Dana belum turun"
        hide-details="auto"
      ></v-text-field>
      <p v-if="editedItem.paguDefinitif" class="text-caption mt-1 text-primary font-weight-bold">
        Terbilang: {{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(editedItem.paguDefinitif) }}
      </p>
      <p v-else class="text-caption mt-1 text-medium-emphasis">
        *Bisa dibiarkan 0 (nol) jika dana resmi dari pusat/daerah belum turun.
      </p>
    </DialogForm>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeMount } from "vue";
import Swal from "sweetalert2";
import paguAnggaranService from "@/services/pagu_anggaran.service";
import sumberDanaService from "@/services/sumber_dana.service";
import { useToast } from "@/composables/useToast"; // Pastikan import toast jika dipakai
import { usePermission } from "@/composables/usePermission"; // Pastikan import permission

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

const pages = ref({ title: "Pagu Anggaran" });
const breadcrumbs = ref([
  { text: "Dashboard", disabled: false, href: "/dashboard" },
  { text: "Transaksi", disabled: true, href: "#" },
  { text: "Pagu Anggaran", disabled: true, href: "#" },
]);

const isLoading = ref(false);
const isLoadingSave = ref(false);
const dialog = ref(false);
const resetDialog = ref(true);
const dialogTitle = ref("Tambah Pagu Anggaran");
const isAutoFilled = ref(false); // Penanda apakah angka hasil autofill

const tableData = ref<any[]>([]);
const filteredData = ref<any[]>([]);
const listSumberDana = ref<any[]>([]);

// Generate Tahun Dinamis (Tahun ini - 2 sampai Tahun ini + 3)
const currentYear = new Date().getFullYear();
const listTahun = ref([currentYear - 1, currentYear, currentYear + 1, currentYear + 2]);

// Mengubah Header Tabel untuk memunculkan 2 Pagu
const headers = ref([
  { title: "No", key: "no", width: "5%", align: "center", sortable: false },
  { title: "Tahun", key: "tahun", width: "10%", align: "center" },
  { title: "Sumber Dana", key: "sumberDanaName" },
  { title: "Pagu Estimasi (RKP)", key: "paguEstimasi", width: "20%", align: "right" },
  { title: "Pagu Definitif (RAPBDes)", key: "paguDefinitif", width: "20%", align: "right" },
  { title: "Aksi", key: "actions", align: "center", width: "15%", sortable: false },
]);

const editedItem = ref<any>({});
const { checkPermission } = usePermission();

// ======== LOGIKA AUTO-FILL PAGU ESTIMASI ========
watch(
  () => [editedItem.value.tahun, editedItem.value.sumberDanaId],
  ([newTahun, newSumberDanaId]) => {
    // Hanya lakukan auto-fill jika ini data BARU (belum punya ID) dan form tahun & sumber dana sudah terisi
    if (!editedItem.value.id && newTahun && newSumberDanaId) {
      const prevYear = (newTahun as number) - 1;
      
      // Cari apakah ada pagu definitif di tahun sebelumnya untuk sumber dana yang sama
      const prevData = tableData.value.find(
        (item: any) => item.tahun === prevYear && item.sumberDanaId === newSumberDanaId
      );

      if (prevData && prevData.paguDefinitif > 0) {
        editedItem.value.paguEstimasi = prevData.paguDefinitif;
        isAutoFilled.value = true;
      } else {
        isAutoFilled.value = false;
      }
    }
  }
);
// ================================================

onBeforeMount(() => {
  checkPermission("PAGU_ANGGARAN.VIEW");
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
    const res: any = await paguAnggaranService().retrieve();
    tableData.value = res.data || [];
    
    if (searchQuery) {
      filteredData.value = tableData.value.filter((item: any) => 
        item.sumberDanaName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tahun.toString().includes(searchQuery)
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
  // Set default definitif ke 0 jika kosong
  if (!editedItem.value.paguDefinitif) {
    editedItem.value.paguDefinitif = 0;
  }

  isLoadingSave.value = true;
  paguAnggaranService()
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
  isAutoFilled.value = false;
  editedItem.value = { 
    tahun: currentYear + 1, // Di set ke Tahun Depan sebagai default penyusunan RKP
    paguEstimasi: null,
    paguDefinitif: 0 
  }; 
  dialogTitle.value = "Tambah Pagu Anggaran";
  dialog.value = true;
}

async function editItem(x: any) {
  resetDialog.value = false;
  isAutoFilled.value = false;
  try {
    const res: any = await paguAnggaranService().retrieveById(x.id);
    if (res.data.id) {
      editedItem.value = res.data;
      dialogTitle.value = "Edit Pagu Anggaran";
      dialog.value = true;
    }
  } catch (err) {
    console.error(err);
  }
}

async function deleteItem(x: any) {
  Swal.fire({
    title: "Hapus Data",
    text: `Hapus Pagu Anggaran Tahun ${x.tahun} - ${x.sumberDanaName}?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#95a5a6",
    confirmButtonText: "Ya, Hapus!",
    cancelButtonText: "Batal",
    allowOutsideClick: false,
  }).then((result: any) => {
    if (result.isConfirmed) {
      paguAnggaranService()
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
  isAutoFilled.value = false;
  dialog.value = false;
}
</script>