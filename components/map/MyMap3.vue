<template>
  <l-map
    ref="mapRef"
    v-model:zoom="zoom"
    :center="center"
    :max-zoom="20"
    style="height: 600px; width: 100%;"
    @ready="onMapReady"
  >
    <l-tile-layer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />

    <!-- Polygon Area -->
    <l-polygon :lat-lngs="farmArea" color="green" />

    <!-- Markers inside Polygon -->
    <l-marker
      v-for="(point, index) in testPoints"
      :key="index"
      :lat-lng="point.coords"
    >
      <l-popup>{{ point.label }}</l-popup>
    </l-marker>
  </l-map>

  <button @click="zoomToPolygon" class="zoom-btn">Zoom ke Area Peternakan</button>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as L from 'leaflet'

const mapRef = ref(null)
const leafletMap = ref(null)
const zoom = ref(16)
const center = ref([-7.998999, 112.500808])
const farmArea = ref([])
const testPoints = ref([])

const rawPolygonPoints = ref([
  { x: 11956050, y: -671600 },
  { x: 11956150, y: -671600 },
  { x: 11956150, y: -671700 },
  { x: 11956050, y: -671700 },
])

const onMapReady = () => {
  setTimeout(() => {
    if (mapRef.value?.leafletObject) {
      leafletMap.value = mapRef.value.leafletObject
      convertXYToLatLng()
      generateRandomMarkersInsidePolygon()
      zoomToPolygon()
    }
  }, 0)
}

const convertXYToLatLng = () => {
  if (!leafletMap.value) return

  farmArea.value = rawPolygonPoints.value.map(pt => {
    const latlng = leafletMap.value.unproject(L.point(pt.x, pt.y), leafletMap.value.getZoom())
    return [latlng.lat, latlng.lng]
  })
}

const zoomToPolygon = () => {
  if (!leafletMap.value || farmArea.value.length === 0) return
  const bounds = L.latLngBounds(farmArea.value)
  leafletMap.value.fitBounds(bounds, { padding: [5, 5], maxZoom: 18 })
}

// Generate markers inside polygon bounds
const generateRandomMarkersInsidePolygon = () => {
  if (!leafletMap.value || farmArea.value.length === 0) return
  const bounds = L.latLngBounds(farmArea.value)

  for (let i = 0; i < 50; i++) {
    const lat = bounds.getSouth() + Math.random() * (bounds.getNorth() - bounds.getSouth())
    const lng = bounds.getWest() + Math.random() * (bounds.getEast() - bounds.getWest())
    testPoints.value.push({ label: `Sapi ${i + 1}`, coords: [lat, lng] })
  }
}
</script>

<style scoped>
.zoom-btn {
  margin-top: 10px;
  padding: 10px 15px;
  font-weight: bold;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.zoom-btn:hover {
  background-color: #27ae60;
}
</style>
