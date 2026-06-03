<template>
  <v-menu :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn class="custom-hover-primary" variant="text" v-bind="props" icon>
        <v-avatar size="35" color="primary">
          <img v-if="photoUrl" :src="photoUrl" height="35" alt="user" cover />
          <span v-else class="text-white font-weight-bold">{{ dataUser?.nama?.charAt(0) || 'U' }}</span>
        </v-avatar>
      </v-btn>
    </template>
    <v-sheet rounded="md" width="300" elevation="10">
      <div class="px-6 pt-6 pb-4">
        <h6 class="text-h5 font-weight-bold mb-4">User Profile</h6>
        <div class="d-flex align-center">
          <v-avatar size="60" color="primary">
            <img v-if="photoUrl" :src="photoUrl" height="60" alt="user" cover />
            <span v-else class="text-h5 text-white font-weight-bold">{{ dataUser?.nama?.charAt(0) || 'U' }}</span>
          </v-avatar>
          <div class="ml-4">
            <h6 class="text-h6 mb-1">{{ dataUser?.nama || 'Admin Desa' }}</h6>
            <div class="d-flex align-center">
              <UserIcon size="16" stroke-width="1.5" class="text-medium-emphasis mr-1" />
              <span class="text-body-2 text-medium-emphasis text-uppercase">
                {{ dataUser?.role?.name || dataUser?.roleName || 'ADMINISTRATOR' }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <v-divider></v-divider>

      <v-list class="px-2">
        <v-list-item to="/pengaturan/user/profile" rounded="md" class="mb-1" color="primary">
          <template v-slot:prepend>
            <v-avatar size="40" color="lightprimary" class="mr-3">
              <UserIcon size="22" stroke-width="1.5" color="primary" />
            </v-avatar>
          </template>
          <v-list-item-title class="text-subtitle-1 font-weight-bold">My Profile</v-list-item-title>
          <v-list-item-subtitle class="text-body-2">Account settings</v-list-item-subtitle>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>

      <div class="pa-4">
        <v-btn color="error" variant="tonal" block @click="handleLogout()">
          Logout
        </v-btn>
      </div>
    </v-sheet>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";
import { UserIcon } from "vue-tabler-icons";
import { useRuntimeConfig } from "nuxt/app";

const authStore = useAuthStore();
const dataUser = computed(() => authStore.dataUser);
const router = useRouter();
const config = useRuntimeConfig();

function getPhotoUrl(foto: string | null) {
    if (!foto) return null;
    const baseUrl = config.public.apiUrl || "http://localhost:8080/v1";
    return `${baseUrl}/files?path=${foto}`;
  }

const photoUrl = computed(() => getPhotoUrl(dataUser.value?.foto));

function handleLogout() {
  Swal.fire({
    title: "Logout",
    text: "Apakah Anda yakin ingin keluar dari aplikasi SIPROPEDA?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#95a5a6",
    confirmButtonText: "Ya, Keluar",
    cancelButtonText: "Batal",
  }).then((result: any) => {
    if (result.isConfirmed) {
      authStore.logout();
    }
  });
}
</script>