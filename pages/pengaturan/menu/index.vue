<template>
  <div>
    <SharedUiBreadcrumb
      :title="pages.title"
      :breadcrumbs="breadcrumbs"
    ></SharedUiBreadcrumb>

    <v-card>
      <div class="d-sm-flex align-center justify-space-between bg-primary">
        <v-card-title>Data Menu</v-card-title>
      </div>
      <v-divider></v-divider>
      <v-tabs v-model="tab" bg-color="">
        <v-tab value="menu">Menu</v-tab>
        <v-tab value="permission">Hak Akses</v-tab>
      </v-tabs>
      <v-divider></v-divider>
      <v-card-text>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item value="menu">
            <PagesMenu />
          </v-tabs-window-item>
          <v-tabs-window-item value="permission">
            <PagesMenuPermission />
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
// Jika composable ini belum diimplementasikan sepenuhnya, biarkan saja
// const { checkPermission } = usePermission() 

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

onBeforeMount(() => {
  // checkPermission("MENU.VIEW")
})

onMounted(async () => {})

const tab = ref(null);
const pages = ref({ title: "Menu" });
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
    text: "Menu",
    disabled: true,
    href: "#",
  },
]);
</script>