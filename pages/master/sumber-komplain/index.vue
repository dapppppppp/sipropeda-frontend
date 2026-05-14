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
      title="Data Sumber Komplain"
      searchTitle="Cari . . ."
      permission="SUMBER_KOMPLAIN"
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
      <v-label class="my-2 font-weight-medium">Kode</v-label>
      <CustomBaseInput
        type="input"
        v-model="editedItem.kode"
        :rules="[(v:any) => !!v || 'Wajib diisi!']"
        label=""
        placeholder="Masukkan Nama"
        variant="outlined"
        density="default"
        hide-details="auto"
      ></CustomBaseInput>
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

      <v-label class="my-2 font-weight-medium">Warna</v-label>
      <v-menu
        v-model="colorMenu"
        :close-on-content-click="false"
        transition="scale-transition"
        :offset="8"
      >
        <template #activator="{ props }">
          <v-text-field
            v-bind="props"
            v-model="selectedColor"
            :rules="[(v:any) => !!v || 'Wajib diisi!']"
            variant="outlined"
            density="default"
            hide-details="auto"
            placeholder="#000000"
            prepend-inner-icon="mdi-palette"
          >
            <template #append-inner>
              <div
                class="color-preview"
                :style="{ backgroundColor: selectedColor }"
              ></div>
            </template>
          </v-text-field>
        </template>
        <v-color-picker
          v-model="selectedColor"
          mode="hex"
          hide-mode-switch
          width="280"
        ></v-color-picker>
      </v-menu>
    </DialogForm>
  </div>
</template>
<script setup lang="ts">
import Swal from "sweetalert2";
import sumberKomplainService from "@/services/sumber_komplain.service";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

const pages = ref({ title: "Sumber Komplain" });
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
    text: "Sumber Komplain",
    disabled: true,
    to: "#",
  },
]);
const dialog: any = ref(false);
const resetDialog = ref(true);
const dialogTitle = ref("Tambah Sumber Komplain");
const isLoadingSave: any = ref(false);
const isLoading: any = ref(false);
const colorMenu = ref(false);
const defaultColor = "#000000";

const tableData: any = ref({
  items: [],
  meta: {
    totalItems: 0,
  },
});
const headers = ref([
  { title: "No", key: "no", width: "5%", align: "center", sortable: false },
  { title: "Kode", key: "kode" },
  { title: "Nama", key: "nama" },
  { title: "Warna", key: "color" },
  {
    title: "Aksi",
    key: "actions",
    align: "center",
    width: "10%",
    sortable: false,
  },
]);
const editedItem: any = ref({});
const selectedColor = computed({
  get: () => editedItem.value.color || defaultColor,
  set: (val: any) => {
    if (!val) {
      editedItem.value.color = defaultColor;
      return;
    }
    if (typeof val === "object") {
      const hex = (val as any).hex || (val as any).hexa;
      editedItem.value.color = normalizeHex(hex || defaultColor);
      return;
    }
    editedItem.value.color = normalizeHex(val);
  },
});

const route = useRoute();
const { checkPermission } = usePermission();

onBeforeMount(() => {
  checkPermission("SUMBER_KOMPLAIN.VIEW");
});

async function loadAll() {
  const { pageNumber, pageSize, q, sortBy, sortType } = route.query;
  isLoading.value = true;
  await sumberKomplainService()
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
  sumberKomplainService()
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
  dialogTitle.value = "Tambah Sumber Komplain";
  editedItem.value = {
    color: defaultColor,
  };
  dialog.value = true;
}

async function editItem(x: any) {
  resetDialog.value = false;
  await sumberKomplainService()
    .retrieveById(x.id)
    .then((res: any) => {
      if (res.data.id) {
        editedItem.value = res.data;
        if (!editedItem.value.color) {
          editedItem.value.color = defaultColor;
        }
        dialogTitle.value = "Edit Sumber Komplain";
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
      sumberKomplainService()
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

function normalizeHex(val: string) {
  const hex = String(val || "").trim();
  if (!hex) return defaultColor;
  return hex.startsWith("#") ? hex : `#${hex}`;
}
</script>
<style scoped>
.color-preview {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}
</style>
