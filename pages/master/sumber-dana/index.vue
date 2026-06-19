<template>
  <div>
    <SharedUiBreadcrumb
      :title="pages.title"
      :breadcrumbs="breadcrumbs"
    ></SharedUiBreadcrumb>

    <TableListSumberDana
      :headers="headers"
      :tableData="tableData"
      :loading="isLoading"
      title="Data Sumber Dana"
      permission="SUMBER_DANA"
      @fetchData="loadAll"
      @addItem="addItem"
      @editItem="editItem"
      @deleteItem="deleteItem"
    >
    </TableListSumberDana>

    <DialogForm
      :show="dialog"
      :persistent="true"
      :reset="resetDialog"
      :formTitle="dialogTitle"
      :isLoading="isLoadingSave"
      @handleSave="handleSave"
      @handleClose="handleClose"
    >
      <v-label class="mb-2 font-weight-medium">Nama Sumber Dana</v-label>
      <v-text-field
        v-model="editedItem.namaSumber"
        density="compact"
        :rules="[(v: any) => !!v || 'Wajib diisi']"
        placeholder="Contoh: Dana Desa (DD)"
        hide-details="auto"
      ></v-text-field>
    </DialogForm>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, onMounted } from "vue";
import Swal from "sweetalert2";
import sumberDanaService from "@/services/sumber_dana.service";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

const pages = ref({ title: "Master Sumber Dana" });
const breadcrumbs = ref([
  { text: "Dashboard", disabled: false, href: "/dashboard" },
  { text: "Master Data", disabled: true, href: "#" },
  { text: "Sumber Dana", disabled: true, href: "#" },
]);

const isLoading = ref(false);
const isLoadingSave = ref(false);
const dialog = ref(false);
const resetDialog = ref(true);
const dialogTitle = ref("Tambah Sumber Dana");

// Menggunakan object format Pagination standar
const tableData = ref<any>({
  items: [],
  meta: { totalItems: 0 },
});

const headers = ref([
  { title: "No", key: "no", width: "5%", align: "center", sortable: false },
  { title: "Nama Sumber Dana", key: "namaSumber" },
  { title: "Aksi", key: "actions", align: "center", width: "15%", sortable: false },
]);

const editedItem = ref<any>({});
const { checkPermission } = usePermission();
const route = useRoute();

onBeforeMount(() => {
  checkPermission("SUMBER_DANA.VIEW");
});

onMounted(() => {
  loadAll();
});

async function loadAll() {
  const { pageNumber, pageSize, q, sortBy, sortType } = route.query;
  isLoading.value = true;
  try {
    // Memanggil retrievePaging khusus melayani tabel data
    const res: any = await sumberDanaService().retrievePaging({
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
  sumberDanaService()
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
  dialogTitle.value = "Tambah Sumber Dana";
  dialog.value = true;
}

async function editItem(x: any) {
  resetDialog.value = false;
  try {
    const res: any = await sumberDanaService().retrieveById(x.id);
    if (res.data.id) {
      editedItem.value = res.data;
      dialogTitle.value = "Edit Sumber Dana";
      dialog.value = true;
    }
  } catch (err) {
    console.error(err);
  }
}

async function deleteItem(x: any) {
  Swal.fire({
    title: "Hapus Data",
    text: `Apakah Anda yakin menghapus [${x.namaSumber}]?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#95a5a6",
    confirmButtonText: "Ya, Hapus!",
    cancelButtonText: "Batal",
    allowOutsideClick: false,
  }).then((result: any) => {
    if (result.isConfirmed) {
      sumberDanaService()
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