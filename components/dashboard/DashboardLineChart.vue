<template>
  <v-card elevation="10" class="rounded-xl overflow-hidden">
    <v-card-item class="py-4 px-6">
      <div class="d-sm-flex align-center justify-space-between">
        <v-card-title class="text-h6 font-weight-bold">{{ title }}</v-card-title>
        <slot name="action"></slot>
      </div>
    </v-card-item>
    
    <v-card-text class="pt-0">
      <ClientOnly>
        <apexchart
          width="100%"
          height="350"
          type="area" 
          :options="computedChartOptions"
          :series="computedChartSeries"
        >
        </apexchart>
      </ClientOnly>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from "vue";
import { useTheme } from "vuetify";
import { getPrimary } from "@/utils/UpdateColors";

const props = defineProps({
  title: { type: String, default: "" },
  series: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
  breakdown: { type: Array, default: () => [] },
  colors: { type: Array, default: () => null } 
});

const theme = useTheme();

const computedChartSeries = computed(() => [
  {
    name: "Total Laporan",
    data: props.series,
  },
]);

const createRow = (label, value, color = "#333") => {
  if (value === undefined || value === null) return "";
  return `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
      <span style="font-size: 12px; color: #555; margin-right: 12px;">${label}</span>
      <span style="font-size: 12px; font-weight: 700; color: ${color};">${value}</span>
    </div>
  `;
};

const computedChartOptions = computed(() => {
  const primaryColor = getPrimary.value;
  const isDark = theme.global.name.value === "dark";
  const chartColor = props.colors && props.colors.length > 0 ? props.colors[0] : primaryColor;

  return {
    chart: {
      type: "area",
      height: 350,
      fontFamily: "inherit",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.6,
        opacityTo: 0.1,
        stops: [0, 100],
        colorStops: [
          { offset: 0, color: chartColor, opacity: 0.6 },
          { offset: 100, color: chartColor, opacity: 0.1 }
        ]
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: 3,
      colors: [chartColor],
    },
    grid: {
      show: true,
      borderColor: isDark ? "#333" : "#e0e0e0",
      strokeDashArray: 0,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }, 
      padding: { top: 0, right: 0, bottom: 0, left: 10 },
    },
    colors: [chartColor],
    markers: {
      size: 0,
      colors: [chartColor],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 6 },
    },
    xaxis: {
      categories: props.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "#455a64",
          fontSize: "12px",
          fontWeight: 500
        },
      },
    },
    yaxis: {
      labels: {
        style: { colors: "#455a64", fontSize: "12px" },
        formatter: (val) => Math.floor(val),
      },
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: {
        formatter: (val, opts) => {
          const { dataPointIndex } = opts;
          const item = props.breakdown[dataPointIndex];
          let html = `<div style="padding: 6px;">`;
          html += `<div style="font-weight: 800; color: ${chartColor}; margin-bottom: 6px; border-bottom: 1px solid #eee; padding-bottom: 4px;">Total: ${val}</div>`;
          
          if (item) {
            if(item.open > 0) html += createRow("Open", item.open, "#d32f2f");
            if(item.diteruskan > 0) html += createRow("Diteruskan", item.diteruskan, "#f57c00");
            if(item.ditanggapi > 0) html += createRow("Ditanggapi", item.ditanggapi, "#0288d1");
            if(item.close > 0) html += createRow("Selesai", item.close, "#388e3c");
          }
          html += `</div>`;
          return html;
        },
        title: { formatter: () => "" },
      },
    },
  };
});
</script>