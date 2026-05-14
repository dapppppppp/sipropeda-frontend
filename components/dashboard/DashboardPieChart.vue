<template>
  <v-card elevation="10" class="rounded-xl overflow-hidden" height="100%">
    <v-card-item class="py-4 px-6">
      <v-card-title class="text-h6 font-weight-bold">{{ title }}</v-card-title>
    </v-card-item>
    
    <v-card-text class="d-flex align-center justify-center">
      <ClientOnly>
        <apexchart
          type="pie"
          height="350"
          width="100%"
          :options="chartOptions"
          :series="series"
        ></apexchart>
      </ClientOnly>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from "vue";
import { useTheme } from "vuetify";

const props = defineProps({
  title: { type: String, default: "" },
  series: { type: Array, default: () => [] },
  labels: { type: Array, default: () => [] },
  colors: { type: Array, default: () => null }
});

const theme = useTheme();

const chartOptions = computed(() => {
  const isDark = theme.global.name.value === "dark";
  
  const chartColors = props.colors && props.colors.length > 0 
    ? props.colors 
    : ["#fc4b6c", "#1e88e5", "#26c6da", "#ffb22b", "#7460ee"];

  return {
    chart: {
      type: "pie",
      fontFamily: "inherit",
      toolbar: { show: false },
    },
    plotOptions: {
      pie: {
        offsetY: 20,
        dataLabels: {
          offset: -10,
        } 
      }
    },
    labels: props.labels,
    colors: chartColors, 
    legend: {
      show: true,
      position: "bottom",
      offsetY: 0,
      labels: {
        colors: isDark ? "#fff" : "#455a64",
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val, opts) {
        return opts.w.config.series[opts.seriesIndex];
      },
      style: {
        fontSize: "13px",
        fontWeight: "bold",
        colors: ["#fff"],
      },
      dropShadow: { enabled: false }
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: {
        formatter: function(val) {
          return val;
        }
      }
    },
    stroke: {
      show: true,
      colors: isDark ? ["#1e1e1e"] : ["#fff"],
      width: 2,
    },
  };
});
</script>