<script setup lang="ts">
definePageMeta({
  layout: "blank",
});
</script>

<template>
  <div class="pa-0">
    <v-row class="h-100vh mh-100 ma-0 auth">
      
      <!-- Panel Kiri: Ilustrasi -->
      <v-col
        cols="12"
        lg="7"
        xl="8"
        class="d-none d-lg-flex align-center justify-center position-relative login-bg pa-0"
      >
        <!-- Gambar Ilustrasi -->
        <img
          src="/images/login-illustration.png"
          alt="Ilustrasi Pembangunan Desa"
          class="login-illustration"
        />

        <!-- Overlay Gradient -->
        <div class="login-overlay"></div>

        <!-- Teks di atas gambar -->
        <div class="position-relative z-2 text-center text-white px-10 login-text-content">
          <div class="d-flex align-center justify-center mb-5">
            <v-icon size="52" class="text-white mr-3">mdi-domain</v-icon>
            <h1 class="text-h2 font-weight-black mb-0 tracking-wide">SIPROPEDA</h1>
          </div>
          <p class="text-h6 font-weight-light mb-8" style="opacity: 0.92; line-height: 1.7;">
            Sistem Pendukung Keputusan<br>
            Prioritas Pembangunan Desa<br>
            <span class="text-body-1" style="opacity: 0.8;">Menggunakan Metode TOPSIS</span>
          </p>

          <!-- Info cards -->
          <v-row justify="center" class="mt-4 px-6" dense>
            <v-col cols="4">
              <div class="info-chip">
                <v-icon size="24" class="mb-1">mdi-calculator-variant</v-icon>
                <div class="text-caption font-weight-bold">Metode TOPSIS</div>
              </div>
            </v-col>
            <v-col cols="4">
              <div class="info-chip">
                <v-icon size="24" class="mb-1">mdi-scale-balance</v-icon>
                <div class="text-caption font-weight-bold">Objektif & Transparan</div>
              </div>
            </v-col>
            <v-col cols="4">
              <div class="info-chip">
                <v-icon size="24" class="mb-1">mdi-file-document-check-outline</v-icon>
                <div class="text-caption font-weight-bold">Terdokumentasi</div>
              </div>
            </v-col>
          </v-row>
        </div>
      </v-col>

      <!-- Panel Kanan: Form Login -->
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
              Copyright © {{ new Date().getFullYear() }} SIPROPEDA - Daffa Reyhansyah Ahmad
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

.login-bg {
  min-height: 100%;
  overflow: hidden;
}

.login-illustration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.login-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(27, 94, 32, 0.82) 0%,
    rgba(46, 125, 50, 0.70) 50%,
    rgba(129, 199, 132, 0.60) 100%
  );
  z-index: 1;
}

.login-text-content {
  position: relative;
  z-index: 2;
}

.info-chip {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  padding: 12px 8px;
  text-align: center;
  color: white;
  transition: background 0.2s;
}

.info-chip:hover {
  background: rgba(255, 255, 255, 0.25);
}

.tracking-wide {
  letter-spacing: 2px;
}
</style>
