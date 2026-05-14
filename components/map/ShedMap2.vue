<template>
  <l-map
    ref="mapRef"
    v-model:zoom="zoom"
    :center="center"
    :max-zoom="25"
    style="height: calc(100vh - 70px); width: 100%;"
    @ready="onMapReady"
  >
    <l-tile-layer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution="&copy; OpenStreetMap contributors"
    />

    <!-- Polygon area -->
    <l-polygon
      v-if="farmArea.length"
      :lat-lngs="farmArea"
      color="green"
      :weight="1"
      @click="zoomToPolygon"
    />

    <!-- Marker test point -->
    <l-marker
      v-for="(point, index) in testPoints"
      :key="index"
      :lat-lng="point.coords"
      @click="focusOnMarker(point.coords)"
    >
      <l-popup>
        {{ point.label }} <br />
        LatLng: {{ point.coords }} <br />
        {{ isInside(point.coords) ? '✅ Di dalam peternakan' : '❌ Di luar' }}
      </l-popup>
    </l-marker>
  </l-map>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useNuxtApp } from '#app'
import * as L from 'leaflet'

const center = ref([-7.998999, 112.500808])
const zoom = ref(15)

const mapRef = ref(null)
// const farmArea = ref([]) // LatLng[]
const farmArea = ref([
  [-7.999509, 112.500100],
  [-7.999477, 112.501409],
  [-7.999243, 112.501398],
  [-7.999275, 112.500057],
])
const rawPolygonPoints = ref([]) // [{x, y}]
const testPoints = ref([])
const markerPoints = ref([
    {x:6815762.827764622, y:4381302.6304361615},
    {x:6815760.078165334, y:4381312.136815454},
])

const leafletMap = ref(null)
const mapReady = ref(false)

const { $socket } = useNuxtApp()

const onMapReady = () => {
  // Tunggu beberapa tick untuk memastikan DOM siap
  setTimeout(() => {
    if (mapRef.value?.leafletObject) {
      leafletMap.value = mapRef.value.leafletObject
      mapReady.value = true
    } else {
      console.warn("❌ leafletObject belum tersedia")
    }
  }, 0)
}

// Konversi point(x,y) ke LatLng
const convertXYToLatLng = () => {
  if (!leafletMap.value) return
  farmArea.value = rawPolygonPoints.value.map((pt) => {
    const projected = L.point(pt.x, pt.y)
    const latlng = leafletMap.value.unproject(projected)
    return [latlng.lat, latlng.lng]
  })
}

// Deteksi apakah titik di dalam area
const isInside = (point) => {
  const latLng = L.latLng(point)
  const polygon = L.polygon(farmArea.value)
  return polygon.getBounds().contains(latLng)
}

// Klik marker → fokus
const focusOnMarker = (coords) => {
  if (leafletMap.value) {
    leafletMap.value.setView(coords, 17, { animate: true })
  }
}

const zoomToPolygon = () => {
  if (!leafletMap.value || farmArea.value.length === 0) return

  const bounds = L.latLngBounds(farmArea.value)
  const center = bounds.getCenter()

  leafletMap.value.setView(center, 20, { animate: true }) // langsung zoom ke dalam
}

// Auto-fit bounds ke semua marker
// watch(testPoints, (points) => {
//   if (!leafletMap.value || points.length === 0) return
//   const latLngs = points.map(p => p.coords)
//   const bounds = L.latLngBounds(latLngs)
//   leafletMap.value.fitBounds(bounds, { padding: [50, 50] })
// }, { deep: true })

watch(mapReady, (ready) => {
  if (ready) {
    console.log('✅ Map is ready and leafletMap is set')
  }
})

// Socket listener
onMounted(() => {
//   $socket.onmessage = (event) => {
//     const data = JSON.parse(event.data)

//     console.log(data)
//     console.log(mapReady.value)
//     console.log(leafletMap.value)
//     // Tunggu map siap
//     if (!mapReady.value || !leafletMap.value) return

//     if (data.type === 'polygon') {
//       rawPolygonPoints.value = data.points
//       convertXYToLatLng()
//     }

//     if (data.type === 'marker') {
//       console.log("tes")
//       const point = L.point(data.xy.x, data.xy.y)
//       const latlng = leafletMap.value.unproject(point)
//       console.log("l", latlng)
//       const coords = [latlng.lat, latlng.lng]

//       const existing = testPoints.value.find(p => p.label === data.label)
//       if (existing) {
//         existing.coords = coords
//       } else {
//         testPoints.value.push({ label: data.label, coords })
//       }
//     }
//   }

    setTimeout(() => {
        if (!leafletMap.value) return

        const zoomLevel = leafletMap.value.getZoom()
        markerPoints.value.forEach((el) => {
            let point = L.point(el.x, el.y)
            let latlng = leafletMap.value.unproject(point, zoomLevel)
            let coords = [latlng.lat, latlng.lng]
            testPoints.value.push({ label: 'Kandang A', coords })
            console.log('✅ Tes marker muncul di:', coords)
        });
        zoom.value = 17

        // use
        // const latlng2 = L.latLng(-7.999403, 112.500690)

        // Konversi ke pixel
        // const point2 = leafletMap.value.project(latlng2, leafletMap.value.getZoom())
        // console.log("s", point2);
    }, 1000)
})
</script>
