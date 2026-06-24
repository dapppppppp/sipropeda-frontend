<template>
  <div>
    <SharedUiBreadcrumb :title="pages.title" :breadcrumbs="breadcrumbs" />

    <!-- ===== HEADER & FILTER TAHUN ===== -->
    <v-row class="mb-4 mt-2 align-center justify-space-between">
      <v-col cols="12" md="6">
        <h2 class="text-h5 font-weight-bold text-grey-darken-3 mb-1">
          Ringkasan Eksekutif
        </h2>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Pantau statistik dan status usulan prioritas pembangunan.
        </p>
      </v-col>
      <v-col cols="12" md="3">
        <v-autocomplete
          v-model="selectedTahun"
          :items="listTahun"
          label="Tahun Anggaran"
          color="primary"
          variant="outlined"
          density="compact"
          hide-details
          prepend-inner-icon="mdi-calendar-blank"
          @update:modelValue="loadDashboardData"
          class="bg-white rounded-lg"
        />
      </v-col>
    </v-row>

    <!-- ===== STAT CARDS ===== -->
    <v-row class="mb-2">
      <v-col cols="12" sm="6" md="3">
        <StatCard
          title="Total Usulan Proyek"
          :value="stats.totalUsulan"
          icon="mdi-folder-open"
          color="primary"
          :loading="isLoading"
          :trend="stats.trendUsulan"
          :trend-label="stats.trendUsulanLabel"
          :progress="stats.progressUsulan"
          :progress-label="stats.progressUsulanLabel"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          title="Disahkan (APBDes)"
          :value="stats.usulanApbdes"
          icon="mdi-check-decagram"
          color="success"
          :loading="isLoading"
          :trend="stats.trendApbdes"
          :trend-label="stats.trendApbdesLabel"
          :progress="stats.progressApbdes"
          progress-label="dari total usulan"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          title="Kriteria Aktif"
          :value="stats.totalKriteria"
          icon="mdi-format-list-checks"
          color="warning"
          :loading="isLoading"
          :trend="0"
          trend-label="Tidak berubah"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          title="Total Pagu Desa"
          :value="stats.totalPagu"
          icon="mdi-cash-multiple"
          color="info"
          :is-currency="true"
          :loading="isLoading"
          :trend="stats.trendPagu"
          :trend-label="stats.trendPaguLabel"
        />
      </v-col>
    </v-row>

    <!-- ===== CHARTS ROW ===== -->
    <v-row class="mb-2">
      <!-- Status Perankingan -->
      <v-col cols="12">
        <v-card elevation="2" class="rounded-lg h-100">
          <v-card-title class="d-flex align-center pa-4 pb-2 text-body-1 font-weight-medium">
            <v-icon class="mr-2 text-primary" size="18">mdi-progress-check</v-icon>
            Status perankingan
          </v-card-title>
          <v-card-text class="pt-0">
            <div class="status-list mt-2">
              <div v-for="item in statusItems" :key="item.label" class="mb-4">
                <div class="d-flex justify-space-between align-center mb-1">
                  <span class="text-caption font-weight-medium text-grey-darken-2">{{ item.label }}</span>
                  <span class="text-caption font-weight-bold" :class="`text-${item.color}`">{{ item.value }} Usulan</span>
                </div>
                <v-progress-linear
                  :model-value="item.pct"
                  :color="item.color"
                  bg-color="grey-lighten-4"
                  rounded
                  height="8"
                  striped
                />
              </div>
            </div>

            <v-alert
              v-if="stats.belumRanking > 0"
              type="warning"
              variant="tonal"
              density="compact"
              class="mt-3 text-caption"
              icon="mdi-alert-circle-outline"
            >
              {{ stats.belumRanking }} usulan belum dihitung TOPSIS.
              <router-link to="/perankingan" class="font-weight-medium">Hitung sekarang →</router-link>
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import dashboardService from '@/services/dashboard.service';
import StatCard from '@/components/dashboard/StatCard.vue';

definePageMeta({ layout: 'admin', middleware: ['auth'] });

// ===== INTERFACES =====
interface TopUsulan {
  ranking: number;
  namaProyek: string;
  lokasi: string;
  kategori?: string;
  nilaiPreferensiV: number;
}

interface DashboardStats {
  totalUsulan: number;
  usulanApbdes: number;
  totalKriteria: number;
  totalPagu: number;
  belumRanking: number;

  trendUsulan?: number;
  trendUsulanLabel?: string;
  progressUsulan?: number;
  progressUsulanLabel?: string;

  trendApbdes?: number;
  trendApbdesLabel?: string;
  progressApbdes?: number;

  trendPagu?: number;
  trendPaguLabel?: string;

  top5Usulan: TopUsulan[];
}

// ===== SETUP =====
const authStore     = useAuthStore();
const pages         = ref({ title: 'Dashboard' });
const breadcrumbs   = ref([{ text: 'Dashboard Utama', disabled: true, href: '#' }]);

const currentYear   = new Date().getFullYear();
const listTahun     = ref([currentYear - 1, currentYear, currentYear + 1]);
const selectedTahun = ref(currentYear);
const isLoading     = ref(true);

const stats = ref<DashboardStats>({
  totalUsulan: 0,
  usulanApbdes: 0,
  totalKriteria: 0,
  totalPagu: 0,
  belumRanking: 0,
  top5Usulan: [],
});

const headersTop5 = ref<any[]>([
  { title: 'Peringkat',          key: 'ranking',          align: 'center', width: '90px',  sortable: false },
  { title: 'Nama Usulan Proyek', key: 'namaProyek',                                        sortable: false },
  { title: 'Lokasi / Dusun',    key: 'lokasi',                                             sortable: false },
  { title: 'Nilai TOPSIS (V)',   key: 'nilaiPreferensiV', align: 'center', width: '130px', sortable: false },
]);

// ===== COMPUTED: status perankingan =====
const statusItems = computed(() => {
  const total = stats.value.totalUsulan || 1;
  return [
    {
      label: 'Sudah diranking',
      value: stats.value.usulanApbdes,
      pct:   Math.round((stats.value.usulanApbdes    / total) * 100),
      color: 'success',
    },
    {
      label: 'Belum diranking',
      value: stats.value.belumRanking,
      pct:   Math.round((stats.value.belumRanking    / total) * 100),
      color: 'warning',
    },
    {
      label: 'APBDes ditetapkan',
      value: stats.value.usulanApbdes,
      pct:   Math.round((stats.value.usulanApbdes    / total) * 100),
      color: 'primary',
    },
  ];
});

// ===== HELPERS =====
function rankColor(rank: number): string {
  if (rank === 1) return 'amber-darken-2';
  if (rank === 2) return 'grey';
  if (rank === 3) return 'brown-lighten-1';
  return 'grey-lighten-3';
}

// ===== LOAD DATA =====
onMounted(() => loadDashboardData());

async function loadDashboardData() {
  isLoading.value = true;
  try {
    const response: any = await dashboardService().getStatistik(selectedTahun.value);
    if (response?.data) stats.value = response.data;
  } catch (err) {
    console.error('Gagal memuat statistik dashboard', err);
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.custom-table-hover ::v-deep(tbody tr) {
  transition: all 0.2s ease-in-out;
}
.custom-table-hover ::v-deep(tbody tr:hover) {
  background-color: rgba(27, 94, 32, 0.04) !important;
  transform: scale(1.002);
  cursor: default;
}
</style>