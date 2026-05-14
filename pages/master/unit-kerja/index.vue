<template>
  <div>
    <SharedUiBreadcrumb
      :title="pages.title"
      :breadcrumbs="breadcrumbs"
    ></SharedUiBreadcrumb>

    <TableListUnitKerja
      :headers="headers"
      :tableData="tableData"
      :listInstansi="listInstansi"
      :loading="isLoading"
      defaultSortBy="createdAt"
      title="Data Unit Kerja"
      searchTitle="Cari . . ."
      permission="UNITKERJA"
      @fetchData="loadAll"
      @addItem="addItem"
      @editItem="editItem"
      @deleteItem="deleteItem"
    >
    </TableListUnitKerja>

    <DialogForm
      :show="dialog"
      :persistent="false"
      :reset="resetDialog"
      :formTitle="dialogTitle"
      :isLoading="isLoadingSave"
      @handleSave="handleSave"
      @handleClose="handleClose"
    >
      <v-label class="my-2 font-weight-medium">Nama Unit Kerja</v-label>
      <CustomBaseInput
        type="input"
        v-model="editedItem.nama"
        :rules="[(v:any) => !!v || 'Wajib diisi!']"
        label=""
        placeholder="Masukkan Nama Unit Kerja"
        variant="outlined"
        density="default"
        hide-details="auto"
      ></CustomBaseInput>

      <v-label class="my-2 font-weight-medium">Pejabat</v-label>
      <CustomBaseInput
        type="input"
        v-model="editedItem.subjekUnit"
        :rules="[(v:any) => !!v || 'Wajib diisi!']"
        label=""
        placeholder="Masukkan Pejabat"
        variant="outlined"
        density="default"
        hide-details="auto"
      ></CustomBaseInput>

      <v-label class="my-2 font-weight-medium">Instansi</v-label>
      <CustomBaseInput
        type="autocomplete"
        v-model="editedItem.idInstansi"
        :rules="[(v:any) => !!v || 'Wajib diisi!']"
        :items="listInstansi"
        item-title="nama"
        @update:modelValue="unorParent"
        item-value="id"
        label=""
        placeholder="Masukkan Instansi"
        variant="outlined"
        density="default"
        :hide-details="false"
      ></CustomBaseInput>

      <v-label class="my-2 font-weight-medium">Level/Heararki</v-label>
      <CustomBaseInput
        type="input"
        v-model="editedItem.level"
        :rules="[(v:any) => !!v || 'Wajib diisi!']"
        label=""
        placeholder="Masukkan Level/Heararki"
        pattern="/^-?\d+\.?\d*$/"
        onKeyPress="if(this.value.length==3) return false;"
        variant="outlined"
        density="default"
        hide-details="auto"
        jenis="number"
      ></CustomBaseInput>

      <v-label class="my-2 font-weight-medium">Unit Parent</v-label>
      <CustomBaseInput
        type="autocomplete"
        v-model="editedItem.idUnitParent"
        :items="listUnor"
        item-title="nama"
        item-value="id"
        label=""
        placeholder="Masukkan Unit Parent"
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
import unitKerjaService from "@/services/unitKerja.service";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

const pages = ref({ title: "Unit Kerja" });
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
    text: "Unit Kerja",
    disabled: true,
    to: "#",
  },
]);
const dialog: any = ref(false);
const resetDialog = ref(true);
const dialogTitle = ref("Tambah Unit Kerja");
const isLoadingSave: any = ref(false);
const isLoading: any = ref(false);
const listInstansi = ref([]);
const listUnor = ref([]);

const tableData: any = ref({
  items: [],
  meta: {
    totalItems: 0,
  },
});
const headers = ref([
  { title: "No", key: "no", width: "5%", align: "center", sortable: false },
  { title: "Nama", key: "nama" },
  { title: "Pejabat", key: "subjekUnit" },
  { title: "Instansi", key: "namaInstansi" },
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
  checkPermission("UNITKERJA.VIEW");
});

onMounted(async () => {
  loadAllInstansi();
});

function loadAllInstansi() {
  instansiService()
    .retrieveAll({})
    .then((res: any) => {
      listInstansi.value = res.data;
    });
}

function unorParent() {
  unitKerjaService()
    .retrieveAll({
      idInstansi: editedItem.value.idInstansi,
    })
    .then((res: any) => {
      listUnor.value = res.data;
    });
}

async function loadAll() {
  const { pageNumber, pageSize, q, sortBy, sortType, instansiId } = route.query;
  isLoading.value = true;
  await unitKerjaService()
    .retrieve({
      q: q,
      pageSize: pageSize ?? 10,
      pageNumber: pageNumber ?? 1,
      sortBy: sortBy,
      sortType: sortType,
      instansiId: instansiId ?? null,
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
  editedItem.value.level = parseInt(editedItem.value.level);
  isLoadingSave.value = true;
  unitKerjaService()
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
  dialogTitle.value = "Tambah Unit Kerja";
  editedItem.value = {};
  dialog.value = true;
}

async function editItem(x: any) {
  resetDialog.value = false;
  await unitKerjaService()
    .retrieveById(x.id)
    .then((res: any) => {
      if (res.data.id) {
        editedItem.value = res.data;
        dialogTitle.value = "Edit Unit Kerja";
        dialog.value = true;
        unorParent();
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
      unitKerjaService()
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
