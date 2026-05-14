<template>
  <SharedUiBreadcrumb
    :title="page.title"
    :breadcrumbs="breadcrumbs"
  ></SharedUiBreadcrumb>

  <v-row class="justify-center">
    <v-col cols="12">
      <v-card elevation="10" rounded="md">
        <v-tabs
          v-model="tab"
          bg-color="transparent"
          min-height="70"
          height="70"
          color="primary"
        >
          <v-tab value="Account" class="text-medium-emphasis">
            <UserCircleIcon class="mr-2" size="20" /> Profil
          </v-tab>
          <v-tab value="Password" class="text-medium-emphasis">
            <LockIcon class="mr-2" size="20" /> Ubah Password
          </v-tab>
        </v-tabs>
        <v-divider></v-divider>
        <v-card-text class="pa-sm-6 pa-3 pb-sm-6 pb-6">
          <v-window v-model="tab">
            <v-window-item value="Account">
              <ProfileTab />
            </v-window-item>
            <v-window-item value="Password">
              <PasswordTab />
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { UserCircleIcon, LockIcon } from "vue-tabler-icons";
import ProfileTab from "@/components/profile/ProfileTab.vue";
import PasswordTab from "@/components/profile/PasswordTab.vue";

const tab = ref(null);
definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

const page = ref({ title: "Profil Pengguna" });
const breadcrumbs = ref([
  {
    text: "Dashboard",
    disabled: false,
    to: "/dashboard",
  },
  {
    text: "Profil",
    disabled: true,
    to: "#",
  },
]);
</script>

