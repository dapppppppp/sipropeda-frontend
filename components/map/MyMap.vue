<template>
  <l-map :zoom="15" :center="center" style="height: 500px; width: 100%;">
    <l-tile-layer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution="&copy; OpenStreetMap contributors"
    />

    <l-polygon :lat-lngs="farmArea" color="green" />

    <l-marker
      v-for="(point, index) in testPoints"
      :key="index"
      :lat-lng="point.coords"
    >
      <l-popup>
        {{ point.label }} <br />
        {{ isInside(point.coords) ? '✅ Di dalam peternakan' : '❌ Di luar peternakan' }}
      </l-popup>
    </l-marker>
  </l-map>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import * as L from 'leaflet'

const center = ref([-6.914744, 107.609810])

const farmArea = ref([
  [-6.915, 107.609],
  [-6.915, 107.611],
  [-6.914, 107.611],
  [-6.914, 107.609],
])

const testPoints = ref([
  { label: 'Titik A', coords: [-6.9145, 107.6105] },
  { label: 'Titik B', coords: [-6.9160, 107.6100] },
])

const isInside = (point) => {
  const latLng = L.latLng(point)
  const polygon = L.polygon(farmArea.value)
  return polygon.getBounds().contains(latLng)
}

// Ambil socket dari plugin Nuxt
const { $socket } = useNuxtApp()

onMounted(() => {
  $socket.onmessage = (event) => {
    const data = JSON.parse(event.data)

    // Contoh format data: { label: "Titik C", coords: [-6.9142, 107.6095] }
    const existing = testPoints.value.find(p => p.label === data.label)
    if (existing) {
      existing.coords = data.coords // update posisi
    } else {
      testPoints.value.push(data) // tambah titik baru
    }
  }
})
</script>
