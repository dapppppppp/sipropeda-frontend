<template>
  <v-card class="summary-card-gradient rounded-xl pa-0" elevation="10" height="100%">
    <div class="pa-6">
      <div class="d-flex align-center justify-space-between mb-2">
        <h4 class="text-h5 text-white font-weight-bold" style="z-index: 2; position: relative;">
          Total Komplain
        </h4>
        <v-avatar color="rgba(255,255,255,0.2)" size="40">
          <UiIcon item="FileDescriptionIcon" class="text-white" />
        </v-avatar>
      </div>

      <div class="d-flex align-end mb-6" style="z-index: 2; position: relative;">
        <h1 class="text-white font-weight-black" style="font-size: 4.5rem; line-height: 1;">
          {{ numberWithCommas(data.total) }}
        </h1>
        <span class="text-h6 text-white font-weight-regular ml-3 mb-2 opacity-90">
          Laporan <br/>
        </span>
      </div>
    </div>

    <div class="glass-stats-container px-6 py-4">
      <v-row dense>
        <v-col cols="3" class="text-center border-right-light">
          <div class="text-caption text-white opacity-80 mb-1">Open</div>
          <h3 class="text-h5 text-white font-weight-bold">{{ numberWithCommas(data.open) }}</h3>
        </v-col>

        <v-col cols="3" class="text-center border-right-light">
          <div class="text-caption text-white opacity-80 mb-1">Diteruskan</div>
          <h3 class="text-h5 text-white font-weight-bold">{{ numberWithCommas(data.diteruskan) }}</h3>
        </v-col>
        
        <v-col cols="3" class="text-center border-right-light">
          <div class="text-caption text-white opacity-80 mb-1">Ditanggapi</div>
          <h3 class="text-h5 text-white font-weight-bold">{{ numberWithCommas(data.ditanggapi) }}</h3>
        </v-col>

        <v-col cols="3" class="text-center">
          <div class="text-caption text-white opacity-80 mb-1">Selesai</div>
          <h3 class="text-h5 text-white font-weight-bold">{{ numberWithCommas(data.close) }}</h3>
        </v-col>
      </v-row>
    </div>

    <div class="circle-decoration-1"></div>
    <div class="circle-decoration-2"></div>
  </v-card>
</template>

<script setup lang="ts">
const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      total: 0,
      open: 0,
      diteruskan: 0,
      ditanggapi: 0,
      close: 0
    })
  }
});

const numberWithCommas = (x: any) => {
  if (x === null || x === undefined) return 0;
  return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
};
</script>

<style scoped>
.summary-card-gradient {
  background: linear-gradient(135deg, #43a047 0%, #66bb6a 100%);
  position: relative;
  overflow: hidden;
}

.glass-stats-container {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(5px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.border-right-light {
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.circle-decoration-1 {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 150px;
  height: 150px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  z-index: 1;
}

.circle-decoration-2 {
  position: absolute;
  bottom: 40px;
  left: -30px;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  z-index: 1;
}

.opacity-90 { opacity: 0.9; }
.opacity-80 { opacity: 0.8; }
</style>