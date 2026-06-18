<template>
  <div>
    <SharedUiBreadcrumb :title="pages.title" :breadcrumbs="breadcrumbs" />

    <!-- ===== WELCOME BANNER ===== -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card class="rounded-xl pa-6" style="background: #1B5E20;" elevation="0">
          <div class="d-flex align-center justify-space-between flex-wrap gap-3">
            <div>
              <h2 class="text-h5 font-weight-bold text-white mb-1">
                Selamat datang, {{ authStore.user?.nama || 'Admin Desa' }}! 👋
              </h2>
              <p class="text-body-2 mb-0" style="color: rgba(255,255,255,0.75); max-width: 560px; line-height: 1.6;">
                Sistem Pendukung Keputusan Prioritas Pembangunan Infrastruktur Desa menggunakan metode TOPSIS dengan pembobotan dinamis.
              </p>
            </div>
            <div class="d-flex gap-2">
              <v-btn
                variant="outlined"
                color="white"
                size="small"
                prepend-icon="mdi-calculator-variant"
                to="/perankingan"
                class="text-white"
              >
                Hitung TOPSIS
              </v-btn>
              <v-btn
                variant="tonal"
                color="white"
                size="small"
                prepend-icon="mdi-plus"
                to="/usulan/tambah"
              >
                Tambah Usulan
              </v-btn>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- ===== FILTER TAHUN ===== -->
    <v-row class="mb-1 align-center">
      <v-col cols="12" md="8">
        <h3 class="text-h6 font-weight-bold text-primary">
          Ringkasan eksekutif tahun {{ selectedTahun }}
        </h3>
      </v-col>
      <v-col cols="12" md="4">
        <v-autocomplete
          v-model="selectedTahun"
          :items="listTahun"
          label="Tahun anggaran"
          color="primary"
          variant="outlined"
          density="compact"
          hide-details
          prepend-inner-icon="mdi-calendar"
          @update:modelValue="loadDashboardData"
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
      <!-- Distribusi per Kategori — pakai BarChart component -->
      <v-col cols="12" md="7">
        <BarChart
          title="Distribusi Usulan per Kategori"
          :series="chartKategoriSeries"
          :categories="chartKategoriCategories"
          :colors="chartKategoriColors"
          :height="280"
          :loading="isLoading"
          y-unit=" usulan"
        />
      </v-col>

      <!-- Status Perankingan -->
      <v-col cols="12" md="5">
        <v-card elevation="2" class="rounded-lg h-100">
          <v-card-title class="d-flex align-center pa-4 pb-2 text-body-1 font-weight-medium">
            <v-icon class="mr-2 text-primary" size="18">mdi-progress-check</v-icon>
            Status perankingan
          </v-card-title>
          <v-card-text>
            <div class="status-list">
              <div v-for="item in statusItems" :key="item.label" class="mb-3">
                <div class="d-flex justify-space-between mb-1">
                  <span class="text-caption text-medium-emphasis">{{ item.label }}</span>
                  <span class="text-caption font-weight-medium">{{ item.value }}</span>
                </div>
                <v-progress-linear
                  :model-value="item.pct"
                  :color="item.color"
                  bg-color="grey-lighten-4"
                  rounded
                  height="6"
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

    <!-- ===== TOP 5 TABLE ===== -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" class="rounded-lg">
          <v-card-title
            class="d-flex align-center pa-4 text-body-1 font-weight-medium text-white"
            style="background: #1B5E20;"
          >
            <v-icon class="mr-2" color="white" size="18">mdi-podium-gold</v-icon>
            Top 5 prioritas pembangunan tahun {{ selectedTahun }}
          </v-card-title>
          <v-divider />

          <v-card-text class="pa-0">
            <v-data-table
              :headers="headersTop5"
              :items="stats.top5Usulan"
              :loading="isLoading"
              hide-default-footer
              class="elevation-0"
            >
              <template #no-data>
                <div class="pa-8 text-center">
                  <v-icon size="48" color="grey-lighten-2" class="mb-3">mdi-folder-open-outline</v-icon>
                  <p class="text-body-2 text-medium-emphasis mb-3">
                    Belum ada data perankingan untuk tahun ini.
                  </p>
                  <v-btn
                    color="primary"
                    size="small"
                    variant="tonal"
                    prepend-icon="mdi-calculator-variant"
                    to="/perankingan"
                  >
                    Lakukan perhitungan TOPSIS
                  </v-btn>
                </div>
              </template>

              <template #item.ranking="{ item }: any">
                <v-avatar
                  :color="rankColor(item.ranking)"
                  size="32"
                  class="font-weight-bold text-body-2"
                  :class="item.ranking <= 3 ? 'text-white' : 'text-medium-emphasis'"
                >
                  {{ item.ranking }}
                </v-avatar>
              </template>

              <template #item.namaProyek="{ item }: any">
                <div class="font-weight-medium text-body-2">{{ item.namaProyek }}</div>
                <div v-if="item.kategori" class="text-caption text-medium-emphasis">{{ item.kategori }}</div>
              </template>

              <template #item.nilaiPreferensiV="{ item }: any">
                <v-chip color="success" size="small" variant="tonal" class="font-weight-bold">
                  {{ Number(item.nilaiPreferensiV).toFixed(4) }}
                </v-chip>
              </template>
            </v-data-table>
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
import BarChart from '@/components/dashboard/DashboardBarChart.vue';

definePageMeta({ layout: 'admin', middleware: ['auth'] });

// ===== INTERFACES =====
interface TopUsulan {
  ranking: number;
  namaProyek: string;
  lokasi: string;
  kategori?: string;
  nilaiPreferensiV: number;
}

interface DistribusiItem {
  label: string;
  count: number;
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

  distribusiKategori?: DistribusiItem[];

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

// ===== COMPUTED: data untuk BarChart =====
const chartKategoriCategories = computed<string[]>(() =>
  (stats.value.distribusiKategori ?? []).map(d => d.label)
);

const chartKategoriSeries = computed(() => [
  {
    name: 'Jumlah Usulan',
    data: (stats.value.distribusiKategori ?? []).map(d => d.count),
  },
]);

// Warna per-bar berbeda — distributed mode aktif otomatis karena lebih dari 1 warna
const chartKategoriColors = ['#1B5E20', '#2E7D32', '#388E3C', '#43A047', '#66BB6A', '#A5D6A7'];

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