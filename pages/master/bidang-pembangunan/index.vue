<template>
  <div>
    <SharedUiBreadcrumb
      :title="pages.title"
      :breadcrumbs="breadcrumbs"
    ></SharedUiBreadcrumb>

    <TableListBidangPembangunan
      :headers="headers"
      :tableData="tableData"
      :loading="isLoading"
      title="Data Master Daftar Prioritas Program dan Kegiatan"
      permission="BIDANG_PEMBANGUNAN"
      @fetchData="loadAll"
      @addItem="addItem"
      @editItem="editItem"
      @deleteItem="deleteItem"
    >
    </TableListBidangPembangunan>

    <DialogForm
      :show="dialog"
      :persistent="true"
      :reset="resetDialog"
      :formTitle="dialogTitle"
      :isLoading="isLoadingSave"
      @handleSave="handleSave"
      @handleClose="handleClose"
    >
      <v-label class="mb-2 font-weight-medium">Nama Bidang Pembangunan</v-label>
      <v-text-field
        v-model="editedItem.namaBidang"
        density="compact"
        :rules="[(v: any) => !!v || 'Nama Bidang wajib diisi']"
        placeholder="Contoh: Bidang Pelaksanaan Pembangunan Desa"
        hide-details="auto"
        variant="outlined"
        color="primary"
      ></v-text-field>
    </DialogForm>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, onMounted } from "vue";
import Swal from "sweetalert2";
import bidangPembangunanService from "@/services/bidang_pembangunan.service";
import { useToast } from "@/composables/useToast";
import { usePermission } from "@/composables/usePermission";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

const pages = ref({ title: "Bidang Pembangunan" });
const breadcrumbs = ref([
  { text: "Dashboard", disabled: false, href: "/dashboard" },
  { text: "Master Data", disabled: true, href: "#" },
  { text: "Bidang Pembangunan", disabled: true, href: "#" },
]);

const isLoading = ref(false);
const isLoadingSave = ref(false);
const dialog = ref(false);
const resetDialog = ref(true);
const dialogTitle = ref("Tambah Bidang Pembangunan");

// Menggunakan object format Pagination standar
const tableData = ref<any>({
  items: [],
  meta: { totalItems: 0 },
});

const headers = ref([
  { title: "No", key: "no", width: "5%", align: "center", sortable: false },
  { title: "Nama Bidang Pembangunan", key: "namaBidang" },
  { title: "Aksi", key: "actions", align: "center", width: "15%", sortable: false },
]);

const editedItem = ref<any>({});
const { checkPermission } = usePermission();
const route = useRoute();

onBeforeMount(() => {
  checkPermission("BIDANG_PEMBANGUNAN.VIEW");
});

onMounted(() => {
  loadAll();
});

async function loadAll() {
  const { pageNumber, pageSize, q, sortBy, sortType } = route.query;
  isLoading.value = true;
  try {
    const res: any = await bidangPembangunanService().retrievePaging({
      q: q || "",
      pageSize: pageSize ?? 10,
      pageNumber: pageNumber ?? 1,
      sortBy: sortBy || "createdAt",
      sortType: sortType || "desc",
    });
    
    const payload = res.data?.data || res.data || {};
    const items = payload.items || (Array.isArray(payload) ? payload : []);
    const meta = payload.meta || {};
    const total = meta.totalItems ?? meta.totalData ?? meta.total_items ?? meta.total ?? items.length ?? 0;

    tableData.value = {
      items: items,
      meta: { totalItems: total },
    };
  } catch (err) {
    console.error(err);
    tableData.value = { items: [], meta: { totalItems: 0 } };
  } finally {
    isLoading.value = false;
  }
}

function handleSave() {
  isLoadingSave.value = true;
  bidangPembangunanService()
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
  editedItem.value = {};
  dialogTitle.value = "Tambah Bidang Pembangunan";
  dialog.value = true;
}

async function editItem(x: any) {
  resetDialog.value = false;
  try {
    const res: any = await bidangPembangunanService().retrieveById(x.id);
    if (res.data.id) {
      editedItem.value = res.data;
      dialogTitle.value = "Edit Bidang Pembangunan";
      dialog.value = true;
    }
  } catch (err) {
    console.error(err);
  }
}

async function deleteItem(x: any) {
  Swal.fire({
    title: "Hapus Data",
    text: `Yakin ingin menghapus ${x.namaBidang}?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#95a5a6",
    confirmButtonText: "Ya, Hapus!",
    cancelButtonText: "Batal",
    allowOutsideClick: false,
  }).then((result: any) => {
    if (result.isConfirmed) {
      bidangPembangunanService()
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