<template>
  <div>
    <v-row class="mt-1">
      <v-col cols="12" md="4">
        <v-autocomplete
          v-model="filter.roleId"
          :items="listRole"
          item-title="name"
          item-value="id"
          label="Role"
          density="compact"
          variant="outlined"
          hide-details="auto"
          @update:modelValue="loadMenus"
        ></v-autocomplete>
      </v-col>
      <v-col cols="12" md="4">
        <div>
          <v-btn
            v-if="listMenu.length > 0"
            class="info mb-2 ml-2 bg-primary"
            :loading="isLoading"
            @click="save()"
            >Simpan</v-btn
          >
        </div>
      </v-col>
      <v-col cols="12" md="4">
        <!-- <v-autocomplete
          v-model="filter.commodityId"
          :items="listKomoditas"
          item-title="nama"
          item-value="id"
          label="Komoditas"
          density="compact"
          variant="outlined"
          hide-details="auto"
          @update:modelValue="loadMenus"
          clearable
        ></v-autocomplete> -->
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="12">
        <v-table
          class="tableMenu"
          density="compact"
          fixed-header
          :height="listMenu.length ? '400' : ''"
        >
          <thead>
            <tr class="tableHeadMenu">
              <th class="text-center" style="width: 40%">Menu</th>
              <th class="text-center" style="width: 10%">View / Read</th>
              <th class="text-center" style="width: 10%">Create</th>
              <th class="text-center" style="width: 10%">Update</th>
              <th class="text-center" style="width: 10%">Delete</th>
            </tr>
          </thead>
          <tbody v-if="listMenu.length > 0">
            <template v-for="(x, i) in listMenu" :key="'A' + i">
              <tr :class="x.children ? 'bgRowHeader' : ''">
                <td>
                  <div class="d-flex">
                    <UiIcon :item="x.icon" /> &nbsp;&nbsp;
                    <span style="margin-top: 2px">{{ x.name }}</span>
                  </div>
                </td>
                <td>
                  <v-checkbox
                    v-if="x.viewVisible"
                    v-model="x.view"
                    class="ml-10"
                    density="compact"
                    color="primary"
                    hide-details="auto"
                  ></v-checkbox>
                </td>
                <td>
                  <v-checkbox
                    v-if="x.createVisible"
                    v-model="x.create"
                    density="compact"
                    color="primary"
                    hide-details="auto"
                    class="ml-10"
                  ></v-checkbox>
                </td>
                <td>
                  <v-checkbox
                    v-if="x.updateVisible"
                    v-model="x.update"
                    density="compact"
                    color="primary"
                    hide-details="auto"
                    class="ml-10"
                  ></v-checkbox>
                </td>
                <td class="borderRightTransparent">
                  <v-checkbox
                    v-if="x.deleteVisible"
                    v-model="x.delete"
                    density="compact"
                    color="primary"
                    hide-details="auto"
                    class="ml-10"
                  ></v-checkbox>
                </td>
              </tr>
              <tr v-for="(d, j) in x.children || []" :key="i + 'B' + j">
                <td>
                  <div class="d-flex" style="padding-left: 24px">
                    <UiIcon :item="d.icon" /> &nbsp;&nbsp;
                    <span style="margin-top: 2px">{{ d.name }}</span>
                  </div>
                </td>
                <td>
                  <v-checkbox
                    v-if="d.viewVisible"
                    v-model="d.view"
                    density="compact"
                    color="primary"
                    hide-details="auto"
                    class="ml-10"
                  ></v-checkbox>
                </td>
                <td>
                  <v-checkbox
                    v-if="d.createVisible"
                    v-model="d.create"
                    density="compact"
                    color="primary"
                    hide-details="auto"
                    class="ml-10"
                  ></v-checkbox>
                </td>
                <td>
                  <v-checkbox
                    v-if="d.updateVisible"
                    v-model="d.update"
                    density="compact"
                    color="primary"
                    hide-details="auto"
                    class="ml-10"
                  ></v-checkbox>
                </td>
                <td>
                  <v-checkbox
                    v-if="d.deleteVisible"
                    v-model="d.delete"
                    density="compact"
                    color="primary"
                    hide-details="auto"
                    class="ml-10"
                  ></v-checkbox>
                </td>
              </tr>
            </template>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="5">Data Tidak Ditemukan</td>
            </tr>
          </tbody>
        </v-table>
        <v-divider></v-divider>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import menuService from "@/services/menu.service";
import roleService from "@/services/role.service";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const filter: any = ref({
  roleId: null,
  commodityId: null,
});
const listMenu: any = ref([]);
const listRole: any = ref([]);
const listKomoditas: any = ref([]);
const isLoading = ref(false);
const authStore = useAuthStore();

onMounted(async () => {
  loadAllRole();
});

function loadAllRole() {
  roleService()
    .retrieveAll({})
    .then((res: any) => {
      listRole.value = res.data || [];
    });
}

async function loadMenuStore() {
  const roleID = authStore.user.roleId;
  const commodityId = authStore.user.commodityId;
  if (
    roleID != filter.value.roleId &&
    commodityId != filter.value.commodityId
  ) {
    return;
  }

  await authStore
    .loadAuthMenu({
      roleId: roleID,
      commodityId: commodityId,
    })
    .catch((err: any) => {
      console.log("err log : ", err);
    });
}

function loadMenus() {
  menuService()
    .retrieveRoleMenuTrx({
      roleId: filter.value.roleId,
      commodityId: filter.value.commodityId,
    })
    .then((response) => {
      let menus = response.data || [];
      listMenu.value = menus;

      for (let index = 0; index < listMenu.value.length; index++) {
        let el: any = listMenu.value[index];

        // cek permission
        el.view = hasMenuPermission(el.permissionList, "VIEW");
        el.create = hasMenuPermission(el.permissionList, "CREATE");
        el.update = hasMenuPermission(el.permissionList, "UPDATE");
        el.delete = hasMenuPermission(el.permissionList, "DELETE");

        el.viewVisible = hasMenuPermission(el.actionList, "VIEW");
        el.createVisible = hasMenuPermission(el.actionList, "CREATE");
        el.updateVisible = hasMenuPermission(el.actionList, "UPDATE");
        el.deleteVisible = hasMenuPermission(el.actionList, "DELETE");

        if (el.children) {
          for (let ind = 0; ind < el.children.length; ind++) {
            const el2 = el.children[ind];

            // cek permission
            el2.view = hasMenuPermission(el2.permissionList, "VIEW");
            el2.create = hasMenuPermission(el2.permissionList, "CREATE");
            el2.update = hasMenuPermission(el2.permissionList, "UPDATE");
            el2.delete = hasMenuPermission(el2.permissionList, "DELETE");

            el2.viewVisible = hasMenuPermission(el2.actionList, "VIEW");
            el2.createVisible = hasMenuPermission(el2.actionList, "CREATE");
            el2.updateVisible = hasMenuPermission(el2.actionList, "UPDATE");
            el2.deleteVisible = hasMenuPermission(el2.actionList, "DELETE");
          }
        }
      }
    });
}

function hasMenuPermission(arr: any, val: any) {
  if (!arr) {
    return false;
  }

  const find = arr.find((el: any) => el == val);
  return find ? true : false;
}

function joinPermission(x: any) {
  let permission = [];
  if (x.view) {
    permission.push("VIEW");
  }

  if (x.create) {
    permission.push("CREATE");
  }

  if (x.update) {
    permission.push("UPDATE");
  }

  if (x.delete) {
    permission.push("DELETE");
  }
  let join = permission.join(",");
  return join;
}

function save() {
  let menu: any = [];
  listMenu.value.forEach((el: any) => {
    let permission = joinPermission(el);
    if (permission) {
      menu.push({
        id: el.id,
        menuId: el.menuId,
        roleId: filter.value.roleId,
        commodityId: filter.value.commodityId,
        permission: permission || null,
      });
    }

    if (el.children) {
      el.children.forEach((el2: any) => {
        let permission = joinPermission(el2);
        if (permission) {
          menu.push({
            id: el2.id,
            menuId: el2.menuId,
            roleId: filter.value.roleId,
            commodityId: filter.value.commodityId,
            permission: permission || null,
          });
        }
      });
    }
  });

  isLoading.value = true;
  menuService()
    .CreateBulkRoleMenu({
      data: menu,
    })
    .then((res) => {
      isLoading.value = false;
      useToast("success", "Data Berhasil Disimpan");
      loadMenus();
      loadMenuStore();
    })
    .catch((err: any) => {
      isLoading.value = false;
    });
}
</script>

<style scoped>
.bgRowHeader {
  background: rgb(245 245 245) !important;
}

.tableHeadMenu th {
  background: rgb(245 245 245) !important;
  border-right: 1px solid rgb(245 245 245) !important;
  border-left: 1px solid rgb(245 245 245) !important;
  padding: 10px !important;
  font-size: 14px !important;
}
</style>
