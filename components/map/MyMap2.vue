<template>
  <l-map
    ref="mapRef"
    v-model:zoom="zoom"
    :center="center"
    style="height: 500px; width: 100%;"
    @ready="onMapReady"
  >
    <l-tile-layer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution="&copy; OpenStreetMap contributors"
    />

    <l-polygon :lat-lngs="farmArea" color="green" />

    <l-marker
      v-for="(point, index) in testPoints"
      :key="index"
      :lat-lng="point.coords"
      @click="focusOnMarker(point.coords)"
    >
      <l-popup>
        {{ point.label }} <br />
        {{ isInside(point.coords) ? '✅ Di dalam peternakan' : '❌ Di luar peternakan' }}
      </l-popup>
    </l-marker>
  </l-map>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useNuxtApp } from '#app'
import * as L from 'leaflet'

const center = ref([-6.914744, 107.609810])
const zoom = ref(15)

const farmArea = ref([
  [-6.915, 107.609],
  [-6.915, 107.611],
  [-6.914, 107.611],
  [-6.914, 107.609],
])

const testPoints = ref([])

const isInside = (point) => {
  const latLng = L.latLng(point)
  const polygon = L.polygon(farmArea.value)
  return polygon.getBounds().contains(latLng)
}

// WebSocket dari plugin
const { $socket } = useNuxtApp()

// Ref dan instansi peta
const mapRef = ref(null)
let leafletMap = null

const onMapReady = (e) => {
  leafletMap = e.target
}

// Fungsi untuk fokus ke marker saat diklik
const focusOnMarker = (coords) => {
  if (leafletMap) {
    leafletMap.setView(coords, 17, {
      animate: true,
      duration: 0.5
    })
  }
}

// Auto zoom semua marker ketika berubah
watch(testPoints, (points) => {
  if (!leafletMap || points.length === 0) return

  const latLngs = points.map(p => p.coords)
  const bounds = L.latLngBounds(latLngs)
  leafletMap.fitBounds(bounds, { padding: [50, 50] })
}, { deep: true })

// WebSocket listener
onMounted(() => {
  $socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    const existing = testPoints.value.find(p => p.label === data.label)

    const latlng = L.latLng(data.coords)
    // const point = leafletMap.latLngToContainerPoint(latlng)
    console.log(latlng) 

    if (existing) {
      existing.coords = data.coords
    } else {
      testPoints.value.push(data)
    }
  }
})
</script>
