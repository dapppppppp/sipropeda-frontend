<template>
  <v-card elevation="10" height="400">
    <v-card-item>
      <v-card-title class="text-h6">Peta Persebaran</v-card-title>
    </v-card-item>
    <v-divider></v-divider>
    <div class="d-flex align-center justify-center" style="height: 350px; background: #f0f0f0;">
      <div class="text-center text-grey">
        <v-icon size="50" icon="mdi-map-marker"></v-icon>
        <p>Peta Lokasi (Leaflet)</p>
        <small>Lat: {{ center[0] }}, Lng: {{ center[1] }}</small>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
defineProps({
  markers: { type: Array, default: () => [] },
  center: { type: Array, default: () => [-7.8, 112.0] }
});
</script>