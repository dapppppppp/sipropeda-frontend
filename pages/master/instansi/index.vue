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
      title="Data Instansi"
      searchTitle="Cari . . ."
      permission="INSTANSI"
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
      <v-label class="my-2 font-weight-medium">Nama Instansi</v-label>
      <CustomBaseInput
        type="input"
        v-model="editedItem.nama"
        :rules="[(v:any) => !!v || 'Wajib diisi!']"
        label=""
        placeholder="Masukkan Nama Instansi"
        variant="outlined"
        density="default"
        hide-details="auto"
      ></CustomBaseInput>

      <v-label class="my-2 font-weight-medium">Singkatan Instansi</v-label>
      <CustomBaseInput
        type="input"
        v-model="editedItem.singkatan"
        :rules="[(v:any) => !!v || 'Wajib diisi!']"
        label=""
        placeholder="Masukkan Singkatan Instansi"
        variant="outlined"
        density="default"
        hide-details="auto"
      ></CustomBaseInput>

      <v-label class="my-2 font-weight-medium">Alamat</v-label>
      <CustomBaseInput
        type="input"
        v-model="editedItem.alamat"
        :rules="[(v:any) => !!v || 'Wajib diisi!']"
        label=""
        placeholder="Masukkan Alamat"
        variant="outlined"
        density="default"
        hide-details="auto"
      ></CustomBaseInput>

      <v-label class="my-2 font-weight-medium">Email</v-label>
      <CustomBaseInput
        type="input"
        v-model="editedItem.email"
        :rules="emailRules"
        label=""
        placeholder="Masukkan Email"
        variant="outlined"
        density="default"
        hide-details="auto"
      ></CustomBaseInput>

      <v-label class="my-2 font-weight-medium">Telepon</v-label>
      <CustomBaseInput
        type="input"
        :rules="phoneRules"
        v-model="editedItem.telepon"
        label=""
        placeholder="Masukkan Telepon"
        variant="outlined"
        density="default"
        jenis="number"
        hide-details="auto"
      ></CustomBaseInput>

      <v-label class="my-2 font-weight-medium">Fax</v-label>
      <CustomBaseInput
        type="input"
        v-model="editedItem.fax"
        :rules="[(v:any) => !!v || 'Wajib diisi!']"
        label=""
        placeholder="Masukkan Fax"
        variant="outlined"
        density="default"
        hide-details="auto"
      ></CustomBaseInput>

      <v-label class="my-2 font-weight-medium">Nama System</v-label>
      <CustomBaseInput
        type="autocomplete"
        v-model="editedItem.configId"
        :rules="[(v:any) => !!v || 'Wajib diisi!']"
        :items="listApp"
        item-title="namaSistem"
        item-value="id"
        label=""
        placeholder="Masukkan Nama System"
        variant="outlined"
        density="default"
        :hide-details="false"
      ></CustomBaseInput>
    </DialogForm>
  </div>
</template>
<script setup lang="ts">
import Swal from "sweetalert2";
import instansiService from "@/services/instansi.service";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

const pages = ref({ title: "Instansi" });
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
    text: "Instansi",
    disabled: true,
    to: "#",
  },
]);
const dialog: any = ref(false);
const resetDialog = ref(true);
const dialogTitle = ref("Tambah Instansi");
const isLoadingSave: any = ref(false);
const isLoading: any = ref(false);
const listApp = ref([]);

const tableData: any = ref({
  items: [],
  meta: {
    totalItems: 0,
  },
});
const headers = ref([
  { title: "No", key: "no", width: "5%", align: "center", sortable: false },
  { title: "Nama", key: "nama" },
  { title: "Alamat", key: "alamat" },
  { title: "Email", key: "email" },
  { title: "Telepon", key: "telepon" },
  {
    title: "Aksi",
    key: "actions",
    align: "center",
    width: "10%",
    sortable: false,
  },
]);
const editedItem: any = ref({});

const emailRules = ref([
  (v: string) => !!v || "E-mail wajib diisi",
  (v: string) => /.+@.+\..+/.test(v) || "E-mail must be valid",
]);
const phoneRules = ref([
  (v: string) => !!v || "Nomor telepon wajib diisi",
  (v: string) => /^\d+$/.test(v) || "Nomor telepon hanya boleh berisi angka",
  (v: string) => (v && v.length >= 9) || "Nomor telepon minimal 9 digit",
  (v: string) => (v && v.length <= 15) || "Nomor telepon maksimal 15 digit",
]);

const route = useRoute();
const { checkPermission } = usePermission();

onBeforeMount(() => {
  checkPermission("INSTANSI.VIEW");
});

onMounted(async () => {
  loadAllApp();
});

function loadAllApp() {
  instansiService()
    .retrieveAllApp({})
    .then((res: any) => {
      listApp.value = res.data;
    });
}

async function loadAll() {
  const { pageNumber, pageSize, q, sortBy, sortType } = route.query;
  isLoading.value = true;
  await instansiService()
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
  instansiService()
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
  dialogTitle.value = "Tambah Instansi";
  editedItem.value = {};
  dialog.value = true;
}

async function editItem(x: any) {
  resetDialog.value = false;
  await instansiService()
    .retrieveById(x.id)
    .then((res: any) => {
      if (res.data.id) {
        editedItem.value = res.data;
        dialogTitle.value = "Edit Instansi";
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
      instansiService()
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
