<template>
  <div>
    <v-text-field
      v-bind="$attrs"
      v-model="textVal"
      autocomplete="off"
      prepend-inner-icon="mdi-map-marker"
      @change="textChange"
      @click:prepend-inner="textPrependInnerClick"
    />

    <v-dialog v-model="dialog" :fullscreen="xs" :max-width="1000" scrollable>
      <v-card>
        <ClientOnly>
          <LMap
            v-if="dialog"
            ref="lmap"
            :center="map.center"
            :options="map.options"
            :zoom="18"
            style="height: 600px"
            @ready="onMapReady"
            @moveend="mapDrag"
          >
            <LTileLayer :url="map.tileLayer.url" />

            <LControl position="topleft">
              <div class="map-search-wrap">
                <v-autocomplete
                  v-model:search="map.search.s"
                  :items="map.search.items"
                  :loading="map.search.loading"
                  bg-color="white"
                  density="compact"
                  hide-no-data
                  item-title="label"
                  label=""
                  return-object
                  variant="solo"
                  :menu-props="{
                    location: 'bottom',
                    offset: 4,
                    zIndex: 4000,
                    maxHeight: 320,
                  }"
                  @update:modelValue="mapSearchChange"
                />
              </div>
            </LControl>

            <LControl position="topright">
              <v-btn
                icon
                size="small"
                color="white"
                elevation="2"
                @click="openFullscreen"
              >
                <v-icon>mdi-fullscreen</v-icon>
              </v-btn>
            </LControl>

            <LMarker :lat-lng="[map.marker.latitude, map.marker.longitude]" />

            <LControl position="bottomleft">
              <v-btn
                :loading="isLoading"
                color="primary"
                @click="mapConfirmClick"
              >
                Confirm
              </v-btn>
            </LControl>

            <LControlZoom position="bottomright" />

            <LControl position="bottomright">
              <v-btn icon size="small" @click="mapGpsClick">
                <v-icon>mdi-crosshairs-gps</v-icon>
              </v-btn>
            </LControl>
          </LMap>
        </ClientOnly>
      </v-card>
    </v-dialog>

    <!-- Dialog Fullscreen -->
    <v-dialog v-model="isFs" fullscreen transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar dark color="primary">
          <v-toolbar-title>Pilih Lokasi</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon dark @click="closeFullscreen">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <ClientOnly>
          <LMap
            v-if="isFs"
            ref="lmapFullscreen"
            :center="map.center"
            :options="map.options"
            :zoom="18"
            style="height: calc(100vh - 64px); width: 100%"
            @ready="onMapFullscreenReady"
            @moveend="mapDrag"
          >
            <LTileLayer :url="map.tileLayer.url" />

            <LControl position="topleft">
              <div class="map-search-wrap">
                <v-autocomplete
                  v-model:search="map.search.s"
                  :items="map.search.items"
                  :loading="map.search.loading"
                  bg-color="white"
                  density="compact"
                  hide-no-data
                  item-title="label"
                  label=""
                  return-object
                  variant="solo"
                  :menu-props="{
                    location: 'bottom',
                    offset: 4,
                    zIndex: 4000,
                    maxHeight: 320,
                  }"
                  @update:modelValue="mapSearchChange"
                />
              </div>
            </LControl>

            <LMarker :lat-lng="[map.marker.latitude, map.marker.longitude]" />

            <LControl position="bottomleft">
              <v-btn
                :loading="isLoading"
                color="primary"
                @click="mapConfirmClickFullscreen"
              >
                Confirm
              </v-btn>
            </LControl>

            <LControlZoom position="bottomright" />

            <LControl position="bottomright">
              <v-btn icon size="small" @click="mapGpsClick">
                <v-icon>mdi-crosshairs-gps</v-icon>
              </v-btn>
            </LControl>
          </LMap>
        </ClientOnly>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, nextTick, onMounted } from "vue";
import { useNuxtApp } from "#app";
import { useDisplay } from "vuetify";
import {
  LMap,
  LTileLayer,
  LMarker,
  LControl,
  LControlZoom,
} from "@vue-leaflet/vue-leaflet";

const props = defineProps({
  modelValue: { type: String, default: "0,0" },
});
const emit = defineEmits(["update:modelValue", "listen"]);

const { xs } = useDisplay();
const dialog = ref(false);
const isLoading = ref(false);
const lmap = ref(null);
const lmapFullscreen = ref(null);
const nuxtApp = useNuxtApp();

const textVal = ref(props.modelValue);

const map = reactive({
  center: [0, 0],
  marker: { latitude: 0, longitude: 0 },
  options: { zoomControl: false },
  search: { debounce: null, items: [], loading: false, s: "" },
  tileLayer: { url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" },
  location: {},
});

const isFs = ref(false);

function openFullscreen() {
  isFs.value = true;
}

function closeFullscreen() {
  isFs.value = false;
}

function onMapFullscreenReady() {
  nextTick(() => {
    const m =
      lmapFullscreen.value?.leafletObject || lmapFullscreen.value?.mapObject;
    if (m) {
      setTimeout(() => {
        m.invalidateSize();
      }, 100);
    }
  });
}

function toggleFullscreen() {
  isFs.value = !isFs.value;
  nextTick(() => {
    const m = lmap.value?.leafletObject || lmap.value?.mapObject;
    if (m) {
      m.invalidateSize();
    }
  });
}

function onMapReady() {
  nextTick(() => {
    const m = lmap.value?.leafletObject || lmap.value?.mapObject;
    if (m) {
      setTimeout(() => {
        m.invalidateSize();
      }, 100);
    }
  });
}

function setFromValue(val) {
  const [latS, lonS] = (val || "").split(",");
  const latitude = parseFloat(latS) || 0;
  const longitude = parseFloat(lonS) || 0;
  map.center = [latitude, longitude];
  map.marker.latitude = latitude;
  map.marker.longitude = longitude;
}

onMounted(() => {
  setFromValue(props.modelValue);
});

watch(
  () => props.modelValue,
  (v) => {
    textVal.value = v;
    setFromValue(v);
  }
);

// Map handlers
function mapDrag(e) {
  const center = e?.target?.getCenter?.();
  if (center) {
    map.marker.latitude = center.lat;
    map.marker.longitude = center.lng;
  }
}

function mapGpsClick() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition((pos) => {
    map.center = [pos.coords.latitude, pos.coords.longitude];
    map.marker.latitude = pos.coords.latitude;
    map.marker.longitude = pos.coords.longitude;
  });
}

async function mapConfirmClick() {
  try {
    isLoading.value = true;
    const lat = map.marker.latitude;
    const lon = map.marker.longitude;
    let response;
    try {
      response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "id,en;q=0.8",
            "User-Agent": "NuxtApp/1.0 (contact: admin@example.com)",
          },
        }
      ).then((r) => r.json());
    } catch (e) {
      response = { display_name: "", address: {} };
    }

    map.location = response;

    emit("update:modelValue", `${lat},${lon}`);
    emit("listen", map.location);

    dialog.value = false;
  } finally {
    isLoading.value = false;
  }
}

async function mapConfirmClickFullscreen() {
  try {
    isLoading.value = true;
    const lat = map.marker.latitude;
    const lon = map.marker.longitude;
    let response;
    try {
      response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "id,en;q=0.8",
            "User-Agent": "NuxtApp/1.0 (contact: admin@example.com)",
          },
        }
      ).then((r) => r.json());
    } catch (e) {
      response = { display_name: "", address: {} };
    }

    map.location = response;

    emit("update:modelValue", `${lat},${lon}`);
    emit("listen", map.location);

    isFs.value = false;
    dialog.value = false;
  } finally {
    isLoading.value = false;
  }
}

// Search (debounced)
watch(
  () => map.search.s,
  (val) => {
    map.search.loading = true;
    if (map.search.debounce) clearTimeout(map.search.debounce);
    map.search.debounce = setTimeout(async () => {
      await mapSearchItemsFetch(val);
      map.search.loading = false;
    }, 600);
  }
);

async function mapSearchItemsFetch(value) {
  let results = [];
  const provider = nuxtApp?.$leafletGeosearch?.provider;
  if (value) {
    if (provider?.search) {
      results = await provider.search({ query: value });
    } else {
      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            value
          )}&addressdetails=1&limit=8`,
          {
            headers: {
              "Accept-Language": "id,en;q=0.8",
              "User-Agent": "NuxtApp/1.0 (contact: admin@example.com)",
            },
          }
        ).then((x) => x.json());
        results = (r || []).map((it) => ({
          label: it.display_name,
          x: parseFloat(it.lon),
          y: parseFloat(it.lat),
        }));
      } catch (e) {
        results = [];
      }
    }
  }
  map.search.items = results;
}

function mapSearchChange(payload) {
  if (!payload) return;
  map.center = [payload.y, payload.x];
  map.marker.latitude = payload.y;
  map.marker.longitude = payload.x;
}

function textChange(value) {
  emit("update:modelValue", value);
}

async function textPrependInnerClick() {
  dialog.value = true;
  await nextTick();
  const m = lmap.value?.leafletObject || lmap.value?.mapObject;
  if (m) {
    setTimeout(() => {
      m.invalidateSize();
    }, 200);
  }
}

// Expose method so parent can call via ref
defineExpose({ textPrependInnerClick });
</script>

<style scoped>
.leaflet-container .leaflet-control {
  z-index: 1000;
}
.leaflet-control * {
  pointer-events: auto;
}

.map-search-wrap {
  width: 340px;
  max-width: min(92vw, 420px);
}
.leaflet-top .leaflet-control {
  margin-top: 12px;
  margin-left: 12px;
}
</style>
