<template>
  <v-card elevation="10" class="rounded-xl overflow-hidden" height="100%">
    <v-card-item class="py-4 px-6">
      <div class="d-sm-flex align-center justify-space-between">
        <v-card-title class="text-h6 font-weight-bold">{{ title }}</v-card-title>
        <slot name="action"></slot>
      </div>
    </v-card-item>
    
    <v-card-text class="pt-0">
      <ClientOnly>
        <apexchart
          type="bar"
          height="350"
          width="100%"
          :options="computedChartOptions"
          :series="series"
        ></apexchart>
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
  horizontal: { type: Boolean, default: false },
  colors: { type: Array, default: null }
});

const theme = useTheme();

const computedChartOptions = computed(() => {
  const primaryColor = getPrimary.value;
  const isDark = theme.global.name.value === "dark";
  
  const targetColors = props.colors && props.colors.length > 0 ? props.colors : [primaryColor];
  
  const isDistributed = targetColors.length > 1;

  return {
    chart: {
      type: "bar",
      height: 350,
      toolbar: { show: false },
      fontFamily: "inherit",
      zoom: { enabled: false }
    },
    plotOptions: {
      bar: {
        horizontal: props.horizontal,
        columnWidth: "45%", 
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
        style: {
          colors: isDark ? "#fff" : "#455a64",
          fontSize: "12px",
          fontWeight: 600
        },
        formatter: function (val) {
          if (typeof val === 'string' && val.length > 12) {
            return val.substring(0, 12) + '...';
          }
          return val;
        }
      },
    },
    yaxis: {
      labels: {
        style: { 
          colors: isDark ? "#fff" : "#455a64",
          fontSize: "12px", 
          fontWeight: 500 
        }
      },
    },
    grid: {
      show: true,
      borderColor: isDark ? "#333" : "#e0e0e0",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },   
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 0, bottom: 0, left: 10 }
    },
    colors: targetColors,
    legend: { show: false },
    tooltip: {
      theme: isDark ? "dark" : "light",
      x: {
        show: true,
        formatter: function(val) {
          return val;
        }
      },
      y: {
        formatter: function (val) {
          return val; 
        },
        title: {
          formatter: (seriesName) => props.horizontal ? '' : seriesName + ':', 
        },
      },
    }
  };
});
</script>