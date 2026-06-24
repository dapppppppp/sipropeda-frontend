<template>
  <v-sheet rounded="md" color="lightsecondary" class="px-3 py-3 ExtraBox">
    <div class="d-flex align-center hide-menu">
      <v-avatar size="38">
        <img v-if="photoUrl" :src="photoUrl" alt="User" height="38" cover />
        <v-icon v-else color="primary" size="24">mdi-account-circle</v-icon>
      </v-avatar>
      <div class="ml-3 flex-grow-1 overflow-hidden">
        <h4 class="mb-0 text-body-2 textPrimary font-weight-bold text-truncate" style="max-width: 125px;">
          {{ dataUser.nama || "User" }}
        </h4>
        <div class="text-caption textSecondary text-uppercase text-truncate" style="font-size: 0.65rem; font-weight: 700; letter-spacing: 0.5px; max-width: 125px;">
          {{ dataUser.role?.name || dataUser.roleName || "" }}
        </div>
      </div>
      <div class="ml-auto">
        <v-btn
          variant="text"
          icon
          rounded="md"
          color="primary"
          @click="handleLogout()"
          size="small"
        >
          <PowerIcon size="18" />
          <v-tooltip activator="parent" location="top">Logout</v-tooltip>
        </v-btn>
      </div>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { PowerIcon } from "vue-tabler-icons";
import { useAuthStore } from "@/stores/auth";
import Swal from "sweetalert2";
import { useRuntimeConfig } from "nuxt/app";

const authStore = useAuthStore();
const dataUser = computed(() => authStore.dataUser);
const router = useRouter();
const config = useRuntimeConfig();

function getPhotoUrl(foto: string | null) {
  if (!foto) return "/images/profile/user-1.jpg";
  const baseUrl = config.public.apiUrl || "http://localhost:8080/v1";
  return `${baseUrl}/files?path=${foto}`;
}

const photoUrl = computed(() => getPhotoUrl(dataUser.value?.foto));

function handleLogout() {
  Swal.fire({
    title: "Logout",
    text: "Apakah Anda yakin ingin keluar dari aplikasi?",
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

<style lang="scss">
.ExtraBox {
  position: relative;
  overflow: hidden;
}
.line-height-none {
  line-height: normal;
}
</style>
