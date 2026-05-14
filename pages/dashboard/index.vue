<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
</script>

<template>
  <v-container fluid class="pa-0">
    <v-row>
      <v-col cols="12">
        <v-card class="pa-8 rounded-xl" style="background: linear-gradient(135deg, #2e7d32, #81c784);" elevation="10" border>
          <div class="d-flex align-center justify-space-between">
            <div>
              <h2 class="text-h3 font-weight-bold text-white mb-2">
                Selamat Datang di SIPROPEDA, {{ authStore.user?.nama || 'Admin Desa' }}! 👋
              </h2>
              <p class="text-subtitle-1 text-white opacity-90 mt-2" style="max-width: 600px;">
                Sistem Pendukung Keputusan (SPK) Prioritas Pembangunan Infrastruktur Desa Menggunakan Metode TOPSIS dengan Pembobotan Dinamis.
              </p>
            </div>
            <v-icon size="120" color="white" class="opacity-30 d-none d-md-block">mdi-home-city-outline</v-icon>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>