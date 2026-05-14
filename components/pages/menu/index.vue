<template>
  <div>
    <TableListMenu
      :headers="headers"
      :tableData="tableData"
      :loading="isLoading"
      defaultSortBy="createdAt"
      permission="MENU"
      @fetchData="loadAll"
      @addItem="addItem"
      @editItem="editItem"
      @deleteItem="deleteItem"
    ></TableListMenu>

    <DialogForm
      :show="dialog"
      :persistent="true"
      :formTitle="dialogTitle"
      :reset="resetDialog"
      :isLoading="isLoadingSave"
      width="800"
      @handleSave="handleSave"
      @handleClose="handleClose"
    >
      <h4 class="mt-2 mb-3" style="color: #333">Menu</h4>
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="editedItem.name"
            label="Nama"
            :rules="[(v: any) => !!v || 'Wajib diisi']"
            density="compact"
            required
          ></v-text-field>
          <v-text-field
            v-model="editedItem.link"
            label="Link"
            :rules="[(v: any) => !!v || 'Wajib diisi']"
            density="compact"
            required
          ></v-text-field>
          <v-textarea
            v-model="editedItem.description"
            label="Keterangan"
            density="compact"
            rows="1"
          ></v-textarea>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="editedItem.icon"
            label="Icon"
            density="compact"
          ></v-text-field>
          <v-select
            v-model="editedItem.level"
            :items="listLevel"
            :rules="[(v: any) => !!v || 'Wajib diisi']"
            label="Level"
            density="compact"
          />
          <div v-if="editedItem.level == 2">
            <v-autocomplete
              v-model="editedItem.parentId"
              :items="listMenu"
              color="blue-grey-lighten-2"
              item-title="name"
              item-value="id"
              label="Parent Menu"
              density="compact"
              variant="outlined"
              clearable
            >
            <template v-slot:item="slotProps">
                <v-list-item
                  v-bind="slotProps.props"
                  :subtitle="`Link : ${slotProps.item?.raw?.link}`"
                  :title="slotProps.item?.raw?.name"
                ></v-list-item>
              </template>
            </v-autocomplete>
          </div>
          <v-text-field
            v-model="editedItem.seq"
            label="Urut"
            density="compact"
            :rules="[(v: any) => !!v || 'Wajib diisi']"
            type="number"
          ></v-text-field>
        </v-col>
      </v-row>

      <h4 class="mb-3" style="color: #333">Permission</h4>
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="editedItem.permissionLabel"
            label="Label Permission"
            :rules="[(v: any) => !!v || 'Wajib diisi']"
            density="compact"
            hide-details="auto"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-autocomplete
            v-model="editedItem.actionList"
            :items="listAction"
            :rules="[(v: any) => !!v || 'Wajib diisi']"
            color="blue-grey-lighten-2"
            label="Action"
            density="compact"
            variant="outlined"
            chips
            closable-chips
            multiple
            hide-details="auto"
          >
          </v-autocomplete>
        </v-col>
      </v-row>
    </DialogForm>
  </div>
</template>

<script setup lang="ts">
import Swal from "sweetalert2";
import menuService from "@/services/menu.service"; // Pastikan path import benar

const route = useRoute();
const isLoading: any = ref(false);
const isLoadingSave: any = ref(false);
const dialog: any = ref(false);
const resetDialog = ref(true);
const dialogTitle = ref("Tambah Menu");
const itemPerPage = ref(10);

// PERBAIKAN: Berikan tipe 'any' agar TypeScript mengenali property 'raw' pada slot autocomplete
const listMenu = ref<any[]>([]);
const listLevel = [1, 2];
const listAction = ["VIEW", "CREATE", "UPDATE", "DELETE"];

var tableData: any = ref({
  items: [],
  meta: {
    totalItems: 0,
  },
});

const headers = ref([
  { title: "No", key: "no", width: "5%", align: "center", sortable: false },
  { title: "Nama", key: "name" },
  { title: "Link", key: "link" },
  { title: "Icon", key: "icon" },
  { title: "Parent", key: "parentMenu" },
  { title: "Keterangan", key: "description" },
  {
    title: "Aksi",
    key: "actions",
    align: "center",
    width: "10%",
    sortable: false,
  },
]);
const editedItem: any = ref({ actionList: [] });

onMounted(async () => {
  loadAll();
  loadAllMenu();
});

async function loadAll() {
  const { pageNumber, pageSize, q, sortBy, sortType } = route.query;
  isLoading.value = true;
  await menuService()
    .retrieve({
      q: q || "",
      pageSize: pageSize ? Number(pageSize) : itemPerPage.value,
      pageNumber: pageNumber ? Number(pageNumber) : 1,
      sortBy: sortBy || "",
      sortType: sortType || "",
    })
    .then((res: any) => {
      isLoading.value = false;
      tableData.value = {
        items: res.data != null ? res.data.items : [],
        meta: res.data != null ? res.data.meta : { totalItems: 0 },
      };
    }).catch(() => { isLoading.value = false; });
}

function loadAllMenu() {
  menuService()
    .retrieveAll()
    .then((response: any) => {
      listMenu.value = response.data || [];
    });
}

function handleSave() {
  isLoadingSave.value = true;
  let action = editedItem.value.actionList ? editedItem.value.actionList.join(",") : "";
  editedItem.value.action = action || null;
  editedItem.value.level = Number(editedItem.value.level);
  editedItem.value.seq = Number(editedItem.value.seq);
  
  menuService()
    .save(editedItem.value)
    .then((res: any) => {
      handleClose();
      useToast("success", "Data Berhasil Disimpan");
      loadAll();
      loadAllMenu();
    })
    .catch((err: any) => {
      isLoadingSave.value = false;
    });
}

function addItem() {
  resetDialog.value = false;
  editedItem.value = { actionList: [] };
  dialogTitle.value = "Tambah Menu";
  dialog.value = true;
}

async function editItem(x: any) {
  resetDialog.value = false;
  await menuService()
    .retrieveById(x.id)
    .then((res: any) => {
      if (res.data && res.data.id) {
        editedItem.value = res.data;
        dialogTitle.value = "Edit Menu";
        if (editedItem.value.action) {
          let action = editedItem.value.action.split(",");
          editedItem.value.actionList = action;
        } else {
          editedItem.value.actionList = [];
        }
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
      menuService()
        .destroy(x.id)
        .then((response: any) => {
          if (response.data) {
            useToast("success", "Data Berhasil Dihapus");
            loadAll();
            loadAllMenu();
          }
        });
    }
  });
}

function handleClose() {
  isLoadingSave.value = false;
  resetDialog.value = true;
  editedItem.value = { actionList: [] };
  dialog.value = false;
}
</script>