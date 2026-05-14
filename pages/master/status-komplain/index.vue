<template>
  <div>
    <SharedUiBreadcrumb
      :title="pages.title"
      :breadcrumbs="breadcrumbs"
    ></SharedUiBreadcrumb>

    <TableList
      :headers="headers"
      :tableData="tableData"
      :loading="isLoading"
      defaultSortBy="createdAt"
      title="Data Status Komplain"
      searchTitle="Cari . . ."
      permission="STATUS_KOMPLAIN"
      @fetchData="loadAll"
      @addItem="addItem"
      @editItem="editItem"
      @deleteItem="deleteItem"
    >
    </TableList>

    <DialogForm
      :show="dialog"
      :persistent="false"
      :reset="resetDialog"
      :formTitle="dialogTitle"
      :isLoading="isLoadingSave"
      @handleSave="handleSave"
      @handleClose="handleClose"
    >
      <v-label class="my-2 font-weight-medium">Nama</v-label>
      <CustomBaseInput
        type="input"
        v-model="editedItem.nama"
        :rules="[(v:any) => !!v || 'Wajib diisi!']"
        label=""
        placeholder="Masukkan Nama"
        variant="outlined"
        density="default"
        hide-details="auto"
      ></CustomBaseInput>
    </DialogForm>
  </div>
</template>
<script setup lang="ts">
import Swal from "sweetalert2";
import statusKomplainService from "@/services/status_komplain.service";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

const pages = ref({ title: "Status Komplain" });
const breadcrumbs = ref([
  {
    text: "Dashboard",
    disabled: false,
    to: "/dashboard",
  },
  {
    text: "Master",
    disabled: true,
    to: "#",
  },
  {
    text: "Status Komplain",
    disabled: true,
    to: "#",
  },
]);
const dialog: any = ref(false);
const resetDialog = ref(true);
const dialogTitle = ref("Tambah Status Komplain");
const isLoadingSave: any = ref(false);
const isLoading: any = ref(false);

const tableData: any = ref({
  items: [],
  meta: {
    totalItems: 0,
  },
});
const headers = ref([
  { title: "No", key: "no", width: "5%", align: "center", sortable: false },
  { title: "Nama", key: "nama" },
  {
    title: "Aksi",
    key: "actions",
    align: "center",
    width: "10%",
    sortable: false,
  },
]);
const editedItem: any = ref({});

const route = useRoute();
const { checkPermission } = usePermission();

onBeforeMount(() => {
  checkPermission("STATUS_KOMPLAIN.VIEW");
});

async function loadAll() {
  const { pageNumber, pageSize, q, sortBy, sortType } = route.query;
  isLoading.value = true;
  await statusKomplainService()
    .retrieve({
      q: q,
      pageSize: pageSize ?? 10,
      pageNumber: pageNumber ?? 1,
      sortBy: sortBy,
      sortType: sortType,
    })
    .then((res: any) => {
      isLoading.value = false;
      tableData.value = {
        items: res.data != null ? res.data.items : [],
        meta: res.data.meta,
      };
    });
}

function handleSave() {
  isLoadingSave.value = true;
  statusKomplainService()
    .save(editedItem.value)
    .then((res: any) => {
      handleClose();
      useToast("success", "Data Berhasil Disimpan");
      loadAll();
    })
    .catch((err: any) => {
      isLoadingSave.value = false;
    });
}

function addItem() {
  resetDialog.value = false;
  editedItem.value = {};
  dialogTitle.value = "Tambah Status Komplain";
  editedItem.value = {
    active: true,
  };
  dialog.value = true;
}

async function editItem(x: any) {
  resetDialog.value = false;
  await statusKomplainService()
    .retrieveById(x.id)
    .then((res: any) => {
      if (res.data.id) {
        editedItem.value = res.data;
        dialogTitle.value = "Edit Status Komplain";
        dialog.value = true;
      }
    });
}

async function deleteItem(x: any) {
  Swal.fire({
    title: "Hapus Data",
    text: "Apakah Anda yakin menghapus data " + x.nama + " ?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#95a5a6",
    confirmButtonText: "Ya",
    cancelButtonText: "Batal",
    showLoaderOnConfirm: true,
    allowOutsideClick: true,
  }).then((result: any) => {
    if (result.isConfirmed) {
      statusKomplainService()
        .destroy(x.id)
        .then((response) => {
          if (response.data) {
            useToast("success", "Data Berhasil Dihapus");
            loadAll();
          }
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
