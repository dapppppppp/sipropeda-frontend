<template>
  <div>
    <SharedUiBreadcrumb
      :title="pages.title"
      :breadcrumbs="breadcrumbs"
    ></SharedUiBreadcrumb>

    <TableListUsulanProyek
      :headers="headers"
      :tableData="tableData"
      :loading="isLoading"
      title="Data Usulan Kegiatan (Draft RKP)"
      permission="USULAN_PROYEK"
      @fetchData="loadAll"
      @addItem="addItem"
      @editItem="editItem"
      @deleteItem="deleteItem"
      @importItem="handleImportItem"
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
          <v-label class="mb-2 font-weight-medium">Nama Kegiatan</v-label>
          <v-text-field
            v-model="editedItem.namaProyek"
            density="compact"
            :rules="[(v) => !!v || 'Wajib diisi']"
            placeholder="Contoh: Pelatihan Digital Marketing BUMDes"
            hide-details="auto"
          ></v-text-field>
        </v-col>
      </v-row>

      <v-label class="mb-2 mt-3 font-weight-medium">Bidang Pembangunan</v-label>
      <v-autocomplete
        v-model="editedItem.bidangId"
        :items="listBidang"
        item-value="id"
        item-title="namaBidang"
        color="primary"
        variant="outlined"
        density="compact"
        :rules="[(v) => !!v || 'Wajib diisi']"
        placeholder="Pilih Bidang Pembangunan Sesuai Siskeudes"
        hide-details="auto"
      ></v-autocomplete>

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
            :rules="[(v) => !!v || 'Wajib diisi']"
            placeholder="Pilih Sumber Dana"
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
import { useToast } from "@/composables/useToast"; 
import { usePermission } from "@/composables/usePermission";
import bidangPembangunanService from "@/services/bidang_pembangunan.service";

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

// Mengubah struktur data menjadi objek penampung terpaginasi (Sama seperti Pegawai)
const tableData = ref<any>({
  items: [],
  meta: {
    totalItems: 0,
  },
});
const listSumberDana = ref<any[]>([]);
const listBidang = ref<any[]>([]); 

const currentYear = new Date().getFullYear();
const listTahun = ref([currentYear - 1, currentYear, currentYear + 1, currentYear + 2]);

const headers = ref([
  { title: "No", key: "no", width: "5%", align: "center", sortable: false },
  { title: "Tahun", key: "tahunAnggaran", width: "10%", align: "center" },
  { title: "Nama Kegiatan/Proyek", key: "namaProyek" },
  { title: "Sumber Dana", key: "sumberDanaName" }, 
  { title: "Sifat", key: "statusSifat", align: "center" },
  { title: "Nilai RAB", key: "nilaiRab", align: "right" },
  { title: "Aksi", key: "actions", align: "center", width: "12%", sortable: false },
  { title: "Tahapan", key: "statusTahapan", align: "center", width: "12%" },
  { title: "Bidang", key: "bidangName" },
]);

const editedItem = ref<any>({});
const { checkPermission } = usePermission();
const route = useRoute(); // Menggunakan route komposer Nuxt/Vue

onBeforeMount(() => {
  checkPermission("USULAN_PROYEK.VIEW");
});

onMounted(() => {
  loadMasterSumberDana();
  loadMasterBidang(); 
});

async function loadMasterBidang() {
  try {
    const res: any = await bidangPembangunanService().retrieve();
    listBidang.value = res.data || [];
  } catch (err) {
    console.error("Gagal load bidang pembangunan", err);
  }
}

async function loadMasterSumberDana() {
  try {
    const res: any = await sumberDanaService().retrieve();
    listSumberDana.value = res.data || [];
  } catch (err) {
    console.error("Gagal load sumber dana", err);
  }
}

// Logic loadAll disesuaikan membaca State Query Params URL
async function loadAll() {
  const { pageNumber, pageSize, q, sortBy, sortType } = route.query;
  isLoading.value = true;
  try {
    const res: any = await usulanProyekService().retrieve({
      q: q || "",
      pageSize: pageSize ?? 10,
      pageNumber: pageNumber ?? 1,
      sortBy: sortBy,
      sortType: sortType,
    });
    
    // 1. Ekstraksi cerdas: Deteksi apakah data dibungkus dalam properti 'data' lagi (response.Base)
    const payload = res.data?.data || res.data || {};
    
    // 2. Ambil array items-nya
    const items = payload.items || (Array.isArray(payload) ? payload : []);
    const meta = payload.meta || {};

    // 3. SAPU BERSIH: Cari tahu apa nama properti total data yang dipakai oleh Golang
    const total = meta.totalItems ?? meta.totalData ?? meta.total_items ?? meta.total ?? items.length ?? 0;

    // 4. Petakan ke format baku yang diminta oleh komponen ListUsulanProyek.vue
    tableData.value = {
      items: items,
      meta: {
        totalItems: total,
      },
    };
  } catch (err) {
    console.error("Gagal memuat data Usulan Proyek:", err);
    tableData.value = { items: [], meta: { totalItems: 0 } };
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

// ... Fungsi Tambah, Edit, Hapus, dan Import Excel tetap dipertahankan utuh ...
function addItem() {
  resetDialog.value = false;
  editedItem.value = { 
    tahunAnggaran: currentYear + 1,
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

async function handleImportItem(file: File) {
  const { value: tahun } = await Swal.fire({
    title: 'Tahun Anggaran',
    input: 'number',
    inputLabel: 'Masukkan Tahun Anggaran untuk dokumen RKP ini:',
    inputValue: currentYear + 1,
    showCancelButton: true,
    confirmButtonText: 'Mulai Import',
    cancelButtonText: 'Batal',
    inputValidator: (value) => {
      if (!value) return 'Tahun anggaran wajib diisi!';
    }
  });

  if (tahun) {
    isLoading.value = true;
    const formData = new FormData();
    formData.append('file_excel', file);
    formData.append('tahun_anggaran', tahun.toString());

    try {
      const res: any = await usulanProyekService().importExcel(formData);
      useToast("success", res.data?.message || `Berhasil mengimpor data usulan proyek!`);
      loadAll(); 
    } catch (err: any) {
      console.error(err);
      Swal.fire("Gagal Import", err.response?.data?.message || "Format Excel tidak valid atau gagal dibaca.", "error");
    } finally {
      isLoading.value = false;
    }
  }
}
</script>