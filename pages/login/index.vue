<script setup lang="ts">
definePageMeta({
  layout: "blank",
});
// Kita tidak lagi memanggil userService untuk forgotPassword
// karena reset password akan ditangani oleh Admin Desa di dalam sistem.
</script>

<template>
  <div class="pa-0">
    <v-row class="h-100vh mh-100 ma-0 auth">
      
      <v-col
        cols="12"
        lg="7"
        xl="8"
        class="d-none d-lg-flex align-center justify-center position-relative login-bg"
      >
        <div class="text-center text-white px-10">
          <v-icon size="100" class="mb-4 text-white">mdi-domain</v-icon>
          <h1 class="text-h2 font-weight-bold mb-4">SIPROPEDA</h1>
          <p class="text-h5 font-weight-light" style="opacity: 0.9;">
            Sistem Pendukung Keputusan Prioritas Pembangunan <br> Infrastruktur Desa Menggunakan Metode TOPSIS
          </p>
        </div>
      </v-col>

      <v-col cols="12" lg="5" xl="4" class="d-flex align-center justify-center bg-surface">
        <div class="pa-6 pa-sm-10 w-100 auth-max-width">
          
          <div class="d-lg-none d-flex align-center mb-6 text-primary">
            <v-icon size="40" class="mr-2">mdi-domain</v-icon>
            <h2 class="text-h4 font-weight-bold mb-0">SIPROPEDA</h2>
          </div>

          <h2 class="text-h3 font-weight-bold mb-2 text-primary">Login</h2>
          <div class="text-subtitle-1 mb-6 text-medium-emphasis">
            Silakan login menggunakan username dan password Anda.
          </div>

          <AuthLoginForm />

          <div class="text-center mt-10">
            <p class="mb-0 text-caption text-medium-emphasis">
              Copyright © {{ new Date().getFullYear() }} SIPROPEDA - SPK Infrastruktur Desa
            </p>
          </div>
          
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.h-100vh {
  height: 100vh;
}

.auth-max-width {
  width: 100%;
  max-width: 450px;
}

/* Background gradasi hijau khas SIPROPEDA sebagai pengganti gambar CHM */
.login-bg {
  background: linear-gradient(135deg, #2e7d32, #81c784);
  min-height: 100%;
}
</style>