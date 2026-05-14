<template>
  <v-card elevation="10" class="withbg rounded-lg overflow-hidden">
    <v-card-item class="pa-0">
      <div class="pt-5 pl-5 pr-5">
        <div class="d-flex align-center justify-space-between mb-3">
          <div>
            <h6 class="text-h6 mb-1 font-weight-bold">{{ title }}</h6>
            <span class="text-caption text-medium-emphasis">Topik Laporan Real-time</span>
          </div>
        </div>

        <div class="d-flex flex-wrap gap-2 align-center">
          <div 
            v-for="(item, i) in legendItems" 
            :key="i"
            class="d-flex align-center mr-4"
          >
            <span 
              class="rounded-circle mr-2" 
              :style="{ backgroundColor: item.color, width: '10px', height: '10px', display: 'inline-block' }"
            ></span>
            <span class="text-caption font-weight-medium">{{ item.source }}</span>
          </div>
        </div>
      </div>
      
      <div class="cloud-wrapper mt-4 d-flex justify-center align-center">
        <div class="cloud-shape-dynamic">
          <ClientOnly>
            <vue-word-cloud
              :words="processedWords"
              :color="getColor"
              font-family="Oswald, sans-serif"
              :spacing="0.3" 
              :font-size-ratio="5"
              :rotation="rotationFunc"
              :animation-duration="1000"
            >
              <template #default="{ text, font, color, word }">
                <div 
                    class="word-item"
                    :style="{ color: color, fontFamily: font }"
                    :title="`${text}\nSumber: ${word[3]}\nJumlah: ${word[4]} Laporan`"
                >
                  {{ text }}
                </div>
              </template>
            
              <template #fallback>
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </template>
            </vue-word-cloud>
          </ClientOnly>
        </div>
      </div>
    </v-card-item>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import VueWordCloud from 'vuewordcloud';

const props = defineProps({
  title: { type: String, default: "Trending Topics" },
  words: { type: Array, default: () => [] }, 
});

// 1. LEGENDA: Mengambil unik Source dan Color dari data
const legendItems = computed(() => {
  const list = props.words as any[];
  if (!list || list.length === 0) return [];

  const uniqueMap = new Map();

  // list item: [Text, Weight, Color, Source]
  list.forEach((item) => {
    const source = item[3];
    const color = item[2];
    if (source && color && !uniqueMap.has(source)) {
      uniqueMap.set(source, color);
    }
  });

  return Array.from(uniqueMap, ([source, color]) => ({ source, color }));
});

// 2. DATA PROCESS: Menyimpan bobot asli di index ke-4
const processedWords = computed(() => {
  const list = props.words as any[]; 
  if (!list || list.length === 0) return [];
  
  return list.map((w) => {
    // w[0]: Text
    // w[1]: Original Weight
    // w[2]: Color
    // w[3]: Source
    
    // Hitung bobot skala untuk visualisasi
    const scaledWeight = Math.log2(w[1] + 5); 

    // Return array baru: 
    // [Text, ScaledWeight, Color, Source, OriginalWeight]
    return [w[0], scaledWeight, w[2], w[3], w[1]]; 
  });
});

// 3. Helper Color: Ambil dari index ke-2
const getColor = (word: any) => {
  return word[2] || '#263238'; 
};

const rotationFunc = () => {
  const rand = Math.random();
  if (rand < 0.4) return 0;    
  if (rand < 0.7) return 0.25; 
  return 0.75;                 
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap');

.cloud-wrapper {
  background-color: #fff;
  padding: 20px;
  min-height: 450px; 
}

.cloud-shape-dynamic {
  width: 100%;
  max-width: 650px;
  height: 450px; 
}

.word-item {
  text-transform: uppercase;
  font-weight: 700;
  line-height: 0.9;
  letter-spacing: -0.5px;
  cursor: pointer;
  text-shadow: 1px 1px 0px rgba(255,255,255, 0.5);
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.word-item:hover {
  z-index: 100;
  transform: scale(1.15);
  opacity: 0.9;
}
</style>