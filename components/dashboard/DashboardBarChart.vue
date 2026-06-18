<template>
  <v-card elevation="10" class="rounded-xl overflow-hidden" height="100%">
    <v-card-item class="py-4 px-6">
      <div class="d-sm-flex align-center justify-space-between">
        <v-card-title class="text-h6 font-weight-bold">{{ title }}</v-card-title>
        <slot name="action"></slot>
      </div>
    </v-card-item>

    <v-card-text class="pt-0">
      <!-- Shimmer saat loading -->
      <div v-if="loading" class="shimmer-chart" :style="{ height: height + 'px' }"></div>

      <!-- Empty state -->
      <div
        v-else-if="!series.length || series.every((s: any) => !s.data?.length)"
        class="d-flex flex-column align-center justify-center text-medium-emphasis"
        :style="{ height: height + 'px' }"
      >
        <v-icon size="40" color="grey-lighten-2" class="mb-2">mdi-chart-bar-stacked</v-icon>
        <span class="text-caption">Belum ada data untuk ditampilkan</span>
      </div>

      <!-- Chart -->
      <ClientOnly v-else>
        <apexchart
          type="bar"
          :height="height"
          width="100%"
          :options="computedChartOptions"
          :series="series"
        />
      </ClientOnly>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from 'vuetify';
import { getPrimary } from '@/utils/UpdateColors';

const props = defineProps({
  title:      { type: String,   default: '' },
  series:     { type: Array,    default: () => [] },
  categories: { type: Array,    default: () => [] },
  horizontal: { type: Boolean,  default: false },
  colors:     { type: Array,    default: null },
  height:     { type: Number,   default: 350 },
  loading:    { type: Boolean,  default: false },

  // Format tooltip nilai y — 'number' | 'currency' | 'custom'
  yFormat:    { type: String,   default: 'number' },
  // Suffix untuk format 'number', misal ' usulan'
  yUnit:      { type: String,   default: '' },
});

const theme = useTheme();

function formatY(val: number): string {
  if (props.yFormat === 'currency') {
    if (val >= 1_000_000_000) return `Rp ${(val / 1_000_000_000).toFixed(1)} M`;
    if (val >= 1_000_000)     return `Rp ${(val / 1_000_000).toFixed(0)} Jt`;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(val);
  }
  return `${val}${props.yUnit}`;
}

const computedChartOptions = computed(() => {
  const primaryColor = getPrimary.value;
  const isDark = theme.global.name.value === 'dark';

  const targetColors =
    props.colors && (props.colors as string[]).length > 0
      ? (props.colors as string[])
      : [primaryColor];

  const isDistributed = targetColors.length > 1;

  const axisLabelColor = isDark ? '#fff' : '#455a64';

  return {
    chart: {
      type: 'bar',
      height: props.height,
      toolbar: { show: false },
      fontFamily: 'inherit',
      zoom: { enabled: false },
      animations: { enabled: true, speed: 500 },
    },
    plotOptions: {
      bar: {
        horizontal: props.horizontal,
        columnWidth: '45%',
        borderRadius: 4,
        borderRadiusApplication: 'end',
        distributed: isDistributed,
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: props.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        rotate: -45,
        rotateAlways: false,
        hideOverlappingLabels: false,
        trim: false,
        style: { colors: axisLabelColor, fontSize: '12px', fontWeight: 600 },
        formatter: (val: string) =>
          typeof val === 'string' && val.length > 12
            ? val.substring(0, 12) + '…'
            : val,
      },
    },
    yaxis: {
      labels: {
        style: { colors: axisLabelColor, fontSize: '12px', fontWeight: 500 },
        formatter: (val: number) => formatY(val),
      },
    },
    grid: {
      show: true,
      borderColor: isDark ? '#333' : '#e0e0e0',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 0, bottom: 0, left: 10 },
    },
    colors: targetColors,
    legend: { show: isDistributed },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      x: { show: true, formatter: (val: string) => val },
      y: {
        formatter: (val: number) => formatY(val),
        title: {
          formatter: (seriesName: string) =>
            props.horizontal ? '' : seriesName + ':',
        },
      },
    },
  };
});
</script>

<style scoped>
.shimmer-chart {
  width: 100%;
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.05) 25%,
    rgba(0, 0, 0, 0.1)  50%,
    rgba(0, 0, 0, 0.05) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite ease-in-out;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>