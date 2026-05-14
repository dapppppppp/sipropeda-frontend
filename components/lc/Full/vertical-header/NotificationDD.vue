<script setup lang="ts">
import { ref } from "vue";
import { BellRingingIcon } from "vue-tabler-icons";

// Kita matikan fitur notifikasi realtime (Firebase) untuk SIPROPEDA
const menuNotif = ref(false);
</script>

<template>
  <v-menu
    v-model="menuNotif"
    :close-on-content-click="true"
  >
    <template v-slot:activator="{ props }">
      <v-btn
        icon
        variant="text"
        color="primary"
        class="custom-hover-primary"
        size="small"
        v-bind="props"
      >
        <BellRingingIcon stroke-width="1.5" size="22" />
      </v-btn>
    </template>
    <v-sheet rounded="md" width="360" elevation="10">
      <div class="px-8 pb-4 pt-6">
        <h6 class="text-h5">Notifikasi</h6>
      </div>
      <div class="pa-4 text-center text-medium-emphasis">
        <p>Tidak ada notifikasi baru.</p>
      </div>
    </v-sheet>
  </v-menu>
</template>