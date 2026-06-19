<template>
  <div>
    <SharedUiBreadcrumb
      :title="pages.title"
      :breadcrumbs="breadcrumbs"
    ></SharedUiBreadcrumb>

    <TableListRole
      :headers="headers"
      :tableData="tableData"
      :loading="isLoading"
      title="Data Role"
      permission="ROLE"
      @fetchData="loadAll"
      @addItem="addItem"
      @editItem="editItem"
      @deleteItem="deleteItem"
    >
    </TableListRole>

    <DialogForm
      :show="dialog"
      :persistent="true"
      :reset="resetDialog"
      :formTitle="dialogTitle"
      :isLoading="isLoadingSave"
      @handleSave="handleSave"
      @handleClose="handleClose"
    >
      <v-label class="mb-2 font-weight-medium">Nama Role</v-label>
      <v-text-field
        v-model="editedItem.name"
        density="compact"
        :rules="[(v: any) => !!v || 'Wajib diisi']"
        placeholder="Contoh: Admin Desa"
        hide-details="auto"
      ></v-text-field>

      <v-label class="mb-2 mt-3 font-weight-medium">Deskripsi</v-label>
      <v-textarea
        v-model="editedItem.description"
        density="compact"
        rows="3"
        variant="outlined"
        placeholder="Keterangan mengenai hak akses role ini"
        hide-details="auto"
      ></v-textarea>
    </DialogForm>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, onMounted } from "vue";
import Swal from "sweetalert2";
import roleService from "@/services/role.service";
import { useRoute } from "vue-router";
import { usePermission } from "@/composables/usePermission";
import { useToast } from "@/composables/useToast";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

const pages = ref({ title: "Manajemen Role" });
const breadcrumbs = ref([
  { text: "Dashboard", disabled: false, href: "/dashboard" },
  { text: "Pengaturan", disabled: true, href: "#" },
  { text: "Role", disabled: true, href: "#" },
]);

const isLoading = ref(false);
const isLoadingSave = ref(false);
const dialog = ref(false);
const resetDialog = ref(true);
const dialogTitle = ref("Tambah Role");

// Menggunakan format Object Pagination
const tableData = ref<any>({
  items: [],
  meta: { totalItems: 0 },
});

const headers = ref([
  { title: "No", key: "no", width: "5%", align: "center", sortable: false },
  { title: "Nama Role", key: "name", width: "25%" },
  { title: "Deskripsi", key: "description" },
  { title: "Aksi", key: "actions", align: "center", width: "15%", sortable: false },
]);

const editedItem = ref<any>({});
const { checkPermission } = usePermission();
const route = useRoute();

onBeforeMount(() => {
  checkPermission("ROLE.VIEW");
});

onMounted(() => {
  loadAll();
});

async function loadAll() {
  const { pageNumber, pageSize, q, sortBy, sortType } = route.query;
  isLoading.value = true;
  try {
    const res: any = await roleService().retrievePaging({
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
  roleService()
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
  dialogTitle.value = "Tambah Role";
  dialog.value = true;
}

async function editItem(x: any) {
  resetDialog.value = false;
  try {
    const res: any = await roleService().retrieveById(x.id);
    if (res.data.id) {
      editedItem.value = res.data;
      dialogTitle.value = "Edit Role";
      dialog.value = true;
    }
  } catch (err) {
    console.error(err);
  }
}

async function deleteItem(x: any) {
  Swal.fire({
    title: "Hapus Data",
    text: `Apakah Anda yakin menghapus role [${x.name}]?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#95a5a6",
    confirmButtonText: "Ya, Hapus!",
    cancelButtonText: "Batal",
    allowOutsideClick: false,
  }).then((result: any) => {
    if (result.isConfirmed) {
      roleService()
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