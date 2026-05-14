<script setup lang="ts">
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";
import { UserIcon } from "vue-tabler-icons";

const authStore = useAuthStore();
const dataUser = computed(() => authStore.dataUser);
const router = useRouter();

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

<template>
  <v-menu :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn class="custom-hover-primary" variant="text" v-bind="props" icon>
        <v-avatar size="35" color="primary">
          <span class="text-white font-weight-bold">{{ dataUser?.nama?.charAt(0) || 'U' }}</span>
        </v-avatar>
      </v-btn>
    </template>
    <v-sheet rounded="md" width="300" elevation="10">
      <div class="px-6 pt-6 pb-4">
        <h6 class="text-h5 font-weight-bold mb-4">Profil Pengguna</h6>
        <div class="d-flex align-center">
          <v-avatar size="60" color="primary">
             <span class="text-h5 text-white font-weight-bold">{{ dataUser?.nama?.charAt(0) || 'U' }}</span>
          </v-avatar>
          <div class="ml-4">
            <h6 class="text-h6 mb-1">{{ dataUser?.nama || 'Admin Desa' }}</h6>
            <div class="d-flex align-center">
              <UserIcon size="16" stroke-width="1.5" class="text-medium-emphasis mr-1" />
              <span class="text-body-2 text-medium-emphasis">
                {{ dataUser?.role?.name || 'Administrator' }} 
              </span>
            </div>
          </div>
        </div>
      </div>
      <v-divider></v-divider>
      <div class="pa-4">
        <v-btn color="error" variant="tonal" block @click="handleLogout()">
          Logout
        </v-btn>
      </div>
    </v-sheet>
  </v-menu>
</template>