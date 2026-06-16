<template>
  <v-app>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRuntimeConfig, useHead } from '#app';
import appConfigService from '@/services/app_config.service';

const config = useRuntimeConfig();

// Default favicon yang digunakan jika request gagal/belum selesai
const faviconUrl = ref('/favicon.png');

useHead({
  link: [
    {
      rel: 'icon',
      type: 'image/png',
      href: () => faviconUrl.value // Reactive, otomatis berganti bila faviconUrl berubah
    }
  ]
});

onMounted(async () => {
  try {
    const res: any = await appConfigService().retrieveById("CONF01");
    if (res?.data?.favicon) {
      faviconUrl.value = `${config.public.apiUrl}/files?path=${res.data.favicon}`;
    }
  } catch (err) {
    console.error("Gagal memuat konfigurasi favicon:", err);
  }
});
</script>