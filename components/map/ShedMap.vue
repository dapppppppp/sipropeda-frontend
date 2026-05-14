<!-- pages/index.vue -->
<template>
  <LMap
    :zoom="17"
    :center="[-7.998416046683731, 112.50127845489426]"
    style="height: calc(100vh - 70px)"
  >
    <LTileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution="&copy; OpenStreetMap contributors"
    />

    <LPolygon :lat-lngs="farmArea" :color="'green'">
       <LPopup :max-width="400">
        tes
       </LPopup>
    </LPolygon>

    <!-- <LMarker 
      v-for="(marker, index) in markers"
      :key="index"
      :lat-lng="[marker.lat, marker.long]"
    >
      <LPopup>
        {{ isInside(marker) ? '✅ Di dalam peternakan' : '❌ Di luar peternakan' }}
      </LPopup>
    </LMarker> -->

    <LMarker
      v-for="(marker, index) in data"
      :key="index"
      :lat-lng="[marker.lat, marker.long]"
    >
      <LPopup :max-width="400">
        <div>
          <img
            src="/images/photo/kandang.jpg"
            alt="Foto Sapi"
            style="width: 100%; max-height: 250px"
          />
          <div class="text-center mt-2">
            <h1>{{ marker.name }}</h1>
          </div>
          <v-divider class="mt-3 mb-1"></v-divider>
          <v-table>
            <tbody>
              <tr>
                <td>Temperature</td>
                <td>:</td>
                <td class="text-center">23.2 °C</td>
                <td class="text-right">25-02-11 14:03:11</td>
              </tr>
              <tr>
                <td>Humidity</td>
                <td>:</td>
                <td class="text-center">60 %</td>
                <td class="text-right">25-02-11 14:03:11</td>
              </tr>
              <tr>
                <td>NH3</td>
                <td>:</td>
                <td class="text-center">9 ppm</td>
                <td class="text-right">25-02-11 14:03:11</td>
              </tr>
              <tr>
                <td>Co2</td>
                <td>:</td>
                <td class="text-center">500 ppm</td>
                <td class="text-right">25-02-11 14:03:11</td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </LPopup>
    </LMarker>
  </LMap>
</template>

<script setup>
import * as L from 'leaflet'

const props = defineProps({
  data: {
    type: Array,
    default: [],
  },
});
const farmArea = ref([
  [-7.999509, 112.500100],
  [-7.999477, 112.501409],
  [-7.999243, 112.501398],
  [-7.999275, 112.500057],
])
const markers = [
  { lat: -7.998978, long: 112.500722, title: "Kandang A" },
  { lat: -7.999392, long: 112.500733, title: "Kandang B" },
];

// Titik untuk dites apakah di dalam area (misalnya lokasi pengguna)
const testPoint = ref([-7.998978, 112.500722])

// Fungsi cek apakah titik berada di dalam polygon
// Fungsi cek apakah satu titik ada di dalam polygon
const isInside = (point) => {
  const latLng = L.latLng([point.lat, point.long])
  const polygon = L.polygon(farmArea.value)
  return polygon.getBounds().contains(latLng)
}
</script>
