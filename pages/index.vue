<template>
  <DefaultLayout>
    <div
      class="position-relative d-flex align-center justify-center text-white overflow-hidden"
      style="min-height: 500px"
    >
      <div
        class="position-absolute top-0 left-0 right-0 bottom-0"
        style="background: linear-gradient(135deg, #2e7d32, #81c784)"
      ></div>
      <v-container class="position-relative text-center py-12 py-md-16 px-4">
        <v-row align="center" justify="center">
          <v-col cols="12" md="8">
            <v-icon size="80" class="mb-4 text-white">mdi-domain</v-icon>
            <h1 class="text-h2 text-md-h1 font-weight-bold mb-4">
              SIPROPEDA
            </h1>
            <p class="text-subtitle-1 text-md-h5 font-weight-medium mb-6">
              Sistem Pendukung Keputusan Prioritas Pembangunan Infrastruktur Desa
            </p>
            <p
              class="text-body-1 mx-auto mb-8"
              style="max-width: 650px; opacity: 0.95"
            >
              Membantu Kepala Desa dan Perangkat Desa dalam merangking usulan proyek fisik menggunakan metode TOPSIS secara objektif, transparan, dan efisien.
            </p>
            
            <v-btn
              size="x-large"
              color="white"
              variant="elevated"
              class="text-green-darken-3 font-weight-bold px-8"
              to="/login"
            >
              Masuk ke Sistem
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <v-container
      id="feature-section"
      class="max-width-1218 py-16"
      style="scroll-margin-top: 80px"
    >
      <v-row class="mb-12">
        <v-col cols="12" class="text-center">
          <h2 class="text-h4 font-weight-bold mb-2">
            Mengapa Menggunakan SIPROPEDA?
          </h2>
          <p class="text-body-1 text-medium-emphasis">
            Keunggulan sistem dalam menentukan prioritas pembangunan desa
          </p>
        </v-col>
      </v-row>
      <v-row dense justify="center" class="mb-8">
        <v-col
          cols="12"
          sm="6"
          md="3"
          v-for="(benefit, idx) in features"
          :key="idx"
        >
          <v-card
            class="rounded-lg h-100"
            style="border: 1px solid #e0e0e0"
            elevation="1"
          >
            <v-card-text class="text-center pa-6">
              <div
                class="d-flex align-center justify-center rounded-circle mx-auto mb-4"
                style="width: 60px; height: 60px; background: #e8f5e9"
              >
                <v-icon :size="30" color="green-darken-2">{{ benefit.icon }}</v-icon>
              </div>
              <h4
                class="text-body-1 font-weight-bold mb-2"
                style="color: #111827"
              >
                {{ benefit.title }}
              </h4>
              <p class="text-caption" style="color: #374151; line-height: 1.5">
                {{ benefit.desc }}
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </DefaultLayout>
</template>

<script setup lang="ts">
import DefaultLayout from "./Layout.vue";
import { ref } from "vue";

// Menggunakan layout blank karena halaman depan memiliki desain tersendiri
definePageMeta({ layout: "blank" });

const features = ref([
  {
    icon: "mdi-scale-balance",
    title: "Penilaian Objektif",
    desc: "Sistem memberikan rekomendasi prioritas berdasarkan kriteria dan bobot yang telah ditetapkan.",
  },
  {
    icon: "mdi-calculator-variant",
    title: "Metode TOPSIS",
    desc: "Menggunakan algoritma TOPSIS yang terbukti akurat dalam penyelesaian masalah multikriteria.",
  },
  {
    icon: "mdi-file-document-check-outline",
    title: "Terdokumentasi",
    desc: "Seluruh data usulan, pagu anggaran, dan hasil perankingan tersimpan aman di dalam sistem.",
  },
  {
    icon: "mdi-speedometer",
    title: "Efisien & Cepat",
    desc: "Mempercepat proses musyawarah desa dalam menetapkan keputusan pembangunan fisik.",
  },
]);
</script>