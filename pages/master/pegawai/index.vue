<template>
  <div>
    <SharedUiBreadcrumb
      :title="pages.title"
      :breadcrumbs="breadcrumbs"
    ></SharedUiBreadcrumb>

    <TableListPegawai
      :headers="headers"
      :tableData="tableData"
      :listInstansi="listInstansi"
      :listUnor="listUnorFilter"
      :loading="isLoading"
      defaultSortBy="createdAt"
      title="Data Pegawai"
      searchTitle="Cari . . ."
      permission="PEGAWAI"
      @fetchData="loadAll"
      @addItem="addItem"
      @editItem="editItem"
      @deleteItem="deleteItem"
      @changeInstansi="changeInstansi"
    >
    </TableListPegawai>

    <DialogForm
      :show="dialog"
      :persistent="false"
      :reset="resetDialog"
      :formTitle="dialogTitle"
      :isLoading="isLoadingSave"
      @handleSave="handleSave"
      @handleClose="handleClose"
    >
      <v-label class="my-2 font-weight-medium">NIP</v-label>
      <CustomBaseInput
        type="input"
        v-model="editedItem.nip"
        :rules="nipRules"
        label=""
        placeholder="Masukkan NIP"
        variant="outlined"
        density="default"
        hide-details="auto"
        jenis="number"
      ></CustomBaseInput>

      <v-label class="my-2 font-weight-medium">Nama Pegawai</v-label>
      <CustomBaseInput
        type="input"
        v-model="editedItem.nama"
        :rules="[(v:any) => !!v || 'Wajib diisi!']"
        label=""
        placeholder="Masukkan Nama Pegawai"
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

      <v-label class="my-2 font-weight-medium">No HP</v-label>
      <CustomBaseInput
        type="input"
        :rules="phoneRules"
        v-model="editedItem.noHp"
        label=""
        placeholder="Masukkan No HP"
        variant="outlined"
        density="default"
        jenis="number"
        hide-details="auto"
      ></CustomBaseInput>

      <v-label class="my-2 font-weight-medium">Alamat</v-label>
      <CustomBaseInput
        type="input"
        v-model="editedItem.alamat"
        label=""
        placeholder="Masukkan Alamat"
        variant="outlined"
        density="default"
        hide-details="auto"
      ></CustomBaseInput>

      <v-label class="my-2 font-weight-medium">Jenis Kelamin</v-label>
      <CustomBaseInput
        type="autocomplete"
        v-model="editedItem.idJk"
        :rules="[(v:any) => !!v || 'Wajib diisi!']"
        :items="listJk"
        item-title="nama"
        item-value="id"
        label=""
        placeholder="Masukkan Jabatan"
        variant="outlined"
        density="default"
        :hide-details="false"
      ></CustomBaseInput>

      <v-label class="my-2 font-weight-medium">Jabatan</v-label>
      <CustomBaseInput
        type="autocomplete"
        v-model="editedItem.idJabatan"
        :rules="[(v:any) => !!v || 'Wajib diisi!']"
        :items="listJabatan"
        item-title="nama"
        item-value="id"
        label=""
        placeholder="Masukkan Jabatan"
        variant="outlined"
        density="default"
        :hide-details="false"
      ></CustomBaseInput>

      <v-label class="my-2 font-weight-medium">Golongan</v-label>
      <CustomBaseInput
        type="autocomplete"
        v-model="editedItem.idGolongan"
        :rules="[(v:any) => !!v || 'Wajib diisi!']"
        :items="listGologan"
        item-title="nama"
        item-value="id"
        label=""
        placeholder="Masukkan Golongan"
        variant="outlined"
        density="default"
        :hide-details="false"
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

      <v-label class="my-2 font-weight-medium">Unit Kerja</v-label>
      <CustomBaseInput
        type="autocomplete"
        v-model="editedItem.idUnitKerja"
        :items="listUnor"
        item-title="nama"
        item-value="id"
        label=""
        placeholder="Masukkan Unit Kerja"
        variant="outlined"
        density="default"
        :hide-details="false"
      ></CustomBaseInput>
    </DialogForm>
  </div>
</template>
<script setup lang="ts">
import Swal from "sweetalert2";
import pegawaiService from "@/services/pegawai.service";
import instansiService from "@/services/instansi.service";
import unitKerjaService from "@/services/unitKerja.service";
import jabatanService from "@/services/jabatan.service";
import golonganService from "@/services/golongan.service";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

const pages = ref({ title: "Pegawai" });
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
    text: "Pegawai",
    disabled: true,
    to: "#",
  },
]);
const dialog: any = ref(false);
const resetDialog = ref(true);
const dialogTitle = ref("Tambah Pegawai");
const isLoadingSave: any = ref(false);
const isLoading: any = ref(false);
const listJabatan = ref([]);
const listJk = ref([
  {
    nama: "Laki-laki",
    id: "L",
  },
  {
    nama: "Perempuan",
    id: "P",
  },
]);
const listGologan = ref([]);
const listInstansi = ref([]);
const listUnor = ref([]);
const listUnorFilter = ref([]);

const tableData: any = ref({
  items: [],
  meta: {
    totalItems: 0,
  },
});
const headers = ref([
  { title: "No", key: "no", width: "5%", align: "center", sortable: false },
  { title: "Nip", key: "nip" },
  { title: "Nama Pegawai", key: "nama" },
  { title: "Email", key: "email" },
  { title: "Instansi", key: "namaInstansi" },
  { title: "Unit Kerja", key: "namaUnitKerja" },
  {
    title: "Aksi",
    key: "actions",
    align: "center",
    width: "10%",
    sortable: false,
  },
]);
const editedItem: any = ref({});

const nipRules = ref([
  (v: string) => !!v || "NIP  wajib diisi",
  (v: string) => /^\d+$/.test(v) || "Nip hanya boleh berisi angka",
  (v: string) => (v && v.length >= 18) || "NIP minimal 18 digit",
]);
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
  checkPermission("PEGAWAI.VIEW");
});

onMounted(async () => {
  loadAllInstansi();
  loadAllJabatan();
  loadAllGolongan();
});

function loadAllJabatan() {
  jabatanService()
    .retrieveAll({})
    .then((res: any) => {
      listJabatan.value = res.data || [];
    });
}

function loadAllGolongan() {
  golonganService()
    .retrieveAll({})
    .then((res: any) => {
      listGologan.value = res.data || [];
    });
}

function loadAllInstansi() {
  instansiService()
    .retrieveAll({})
    .then((res: any) => {
      listInstansi.value = res.data || [];
    });
}

function unorParent() {
  unitKerjaService()
    .retrieveAll({
      idInstansi: editedItem.value.idInstansi,
    })
    .then((res: any) => {
      listUnor.value = res.data || [];
    });
}

function changeInstansi(x: any) {
  const { instansiId } = route.query;
  unitKerjaService()
    .retrieveAll({
      idInstansi: x ? x : instansiId,
    })
    .then((res: any) => {
      listUnorFilter.value = res.data || [];
    });
}

async function loadAll() {
  const { pageNumber, pageSize, q, sortBy, sortType, instansiId, unitKerjaId } =
    route.query;
  isLoading.value = true;
  await pegawaiService()
    .retrieve({
      q: q,
      pageSize: pageSize ?? 10,
      pageNumber: pageNumber ?? 1,
      sortBy: sortBy,
      sortType: sortType,
      instansiId: instansiId ?? null,
      unitKerjaId: unitKerjaId ?? null,
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
  pegawaiService()
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
  dialogTitle.value = "Tambah Pegawai";
  editedItem.value = {};
  dialog.value = true;
}

async function editItem(x: any) {
  resetDialog.value = false;
  await pegawaiService()
    .retrieveById(x.id)
    .then((res: any) => {
      if (res.data.id) {
        editedItem.value = res.data;
        dialogTitle.value = "Edit Pegawai";
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
      pegawaiService()
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
