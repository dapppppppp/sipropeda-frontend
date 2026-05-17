<template>
  <div>
    <SharedUiBreadcrumb
      :title="pages.title"
      :breadcrumbs="breadcrumbs"
    ></SharedUiBreadcrumb>

    <TableListUser
      :headers="headers"
      :tableData="tableData"
      :loading="isLoading"
      defaultSortBy="createdAt"
      title="Data User"
      searchTitle="Cari User"
      :listRole="listRole"
      permission="USER"
      @fetchData="loadAll"
      @addItem="addItem"
      @editItem="editItem"
      @deleteItem="deleteItem"
      @reset="resetPassword"
    >
    </TableListUser>

    <DialogForm
      :show="dialog"
      :persistent="true"
      :reset="resetDialog"
      :formTitle="dialogTitle"
      :isLoading="isLoadingSave"
      @handleSave="handleSave"
      @handleClose="handleClose"
    >
      <v-label class="mb-2 font-weight-medium">Role</v-label>
      <v-autocomplete
        v-model="editedItem.roleId"
        :items="listRole"
        item-value="id"
        item-title="name"
        color="primary"
        variant="outlined"
        density="compact"
        :rules="[(v) => !!v || 'Wajib diisi']"
        placeholder="Role"
        hide-details="auto"
      ></v-autocomplete>

      <v-label class="mb-2 mt-2 font-weight-medium">Nama</v-label>
      <v-text-field
        v-model="editedItem.name"
        density="compact"
        :rules="[(v) => !!v || 'Wajib diisi']"
        hide-details="auto"
        placeholder="Nama Lengkap"
        clearable
      >
      </v-text-field>

      <v-label class="mb-2 mt-2 font-weight-medium">Username</v-label>
      <v-text-field
        v-model="editedItem.username"
        density="compact"
        :rules="[(v) => !!v || 'Wajib diisi']"
        placeholder="Username"
        hide-details="auto"
      ></v-text-field>

      <v-label class="mb-2 mt-2 font-weight-medium">Email</v-label>
      <v-text-field
        v-model="editedItem.email"
        density="compact"
        :rules="emailRules"
        placeholder="Email"
        hide-details="auto"
      ></v-text-field>

      <v-label class="mb-2 mt-2 font-weight-medium">Password</v-label>
      <v-text-field
        v-model="editedItem.password"
        density="compact"
        :rules="!editedItem.id ? passwordRules : []"
        placeholder="Password"
        :type="showPassword ? 'text' : 'password'"
        :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append-inner="showPassword = !showPassword"
        hide-details="auto"
      ></v-text-field>
      <v-text-field
        v-model="editedItem.password"
        density="compact"
        :rules="!editedItem.id ? passwordRules : []"
        placeholder="Password"
        :type="showPassword ? 'text' : 'password'"
        :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append-inner="showPassword = !showPassword"
        hide-details="auto"
      ></v-text-field>
      <p v-if="editedItem.id" style="font-size: 12px" class="mb-0 mt-2">
        *Kosongkan password, jika tidak ingin merubah password.
      </p>
    </DialogForm>
  </div>
</template>

<script setup lang="ts">
import Swal from "sweetalert2";
import userService from "@/services/user.service";
import roleService from "@/services/role.service";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

const pages = ref({ title: "User" });
const breadcrumbs = ref([
  {
    text: "Dashboard",
    disabled: false,
    href: "/dashboard",
  },
  {
    text: "Pengaturan",
    disabled: true,
    href: "#",
  },
  {
    text: "User",
    disabled: true,
    href: "#",
  },
]);

const passwordRules = ref([
  (v: any) => !!v || "Wajib diisi",
  (v: string | any[]) => (v && v.length >= 8) || "Password minimal 8 karakter",
]);

const emailRules = ref([
  (v: any) => !!v || "Wajib diisi",
  (v: string) => /.+@.+\..+/.test(v) || "Email tidak valid",
]);
const route = useRoute();
const isLoading: any = ref(false);
const isLoadingSave: any = ref(false);
const dialog: any = ref(false);
const resetDialog = ref(true);
const showPassword = ref(false);
const dialogTitle = ref("Tambah User");
const page = ref(1);
const itemPerPage = ref(10);
const listRole = ref([]);
const filter = ref({
  q: "",
  pageNumber: 1,
  pageSize: itemPerPage.value,
  sortBy: "",
  sortType: "",
});
var tableData: any = ref({
  items: [],
  meta: {
    totalItems: 0,
  },
});
const headers = ref([
  { title: "No", key: "no", width: "5%", align: "center", sortable: false },
  { title: "Nama", key: "name" },
  { title: "Email", key: "email" },
  { title: "Role", key: "role" },
  {
    title: "Aksi",
    key: "actions",
    align: "center",
    width: "10%",
    sortable: false,
  },
]);
const editedItem: any = ref({});
const { checkPermission } = usePermission();

const authStore = useAuthStore();
const dataUser = computed(() =>
  authStore.dataUser
);

onBeforeMount(() => {
  checkPermission("USER.VIEW");
});

onMounted(async () => {
  loadAll();
  loadAllRole();
});

function loadAllRole() {
  roleService()
    .retrieveAll({})
    .then((res: any) => {
      listRole.value = res.data || [];
    });
}

async function loadAll() {
  const { pageNumber, pageSize, q, sortBy, sortType, idRole} = route.query;
  isLoading.value = true;
  await userService()
    .retrieve({
      q: q || "",
      pageSize: pageSize ? pageSize : itemPerPage.value,
      pageNumber: pageNumber ? pageNumber : 1,
      sortBy: sortBy,
      sortType: sortType,
      roleId: idRole,
    })
    .then((res: any) => {
      isLoading.value = false;
      tableData.value = {
        items: res.data != null ? res.data.items : [],
        meta: res.data != null ? res.data.meta : { totalItems: 0 },
      };
    }).catch(() => { isLoading.value = false; });
}

function handleSave() {
  editedItem.value.status = "1";
  isLoadingSave.value = true;
  userService()
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
  dialogTitle.value = "Tambah User";
  dialog.value = true;
}

async function editItem(x: any) {
  resetDialog.value = false;
  await userService()
    .retrieveById(x.id)
    .then((res: any) => {
      if (res.data.id) {
        editedItem.value = res.data;
        dialogTitle.value = "Edit User";
        editedItem.value.password = null;
        dialog.value = true;
      }
    });
}

async function deleteItem(x: any) {
  Swal.fire({
    title: "Hapus Data",
    text: "Apakah Anda yakin menghapus data [" + x.name + "] !",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#95a5a6",
    confirmButtonText: "Ya",
    cancelButtonText: "Batal",
    showLoaderOnConfirm: true,
    allowOutsideClick: false,
  }).then((result: any) => {
    if (result.isConfirmed) {
      userService()
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

// Menghapus fungsi lookup yang tidak digunakan agar bersih dari error compile

function resetPassword(item: any): void {
  const reset = {
    id: item.id,
    newPassword: "12345678",
    oldPassword: "12345678",
  };
  userService()
    .resetPassword(reset)
    .then((res: any) => {
      useToast("success", "[" + item.username + "] berhasil di reset");
    })
    .catch((err: any) => {
      console.log(err);
    });
}
</script>