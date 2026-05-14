<script setup>
import { computed } from 'vue';
// Import SEMUA icon dari library
import * as TablerIcons from 'vue-tabler-icons';

const props = defineProps({ 
  item: Object, 
  level: Number 
});

// Fungsi untuk mengonversi string nama icon dari database menjadi Komponen Vue aktual
const IconComponent = computed(() => {
  // Jika item.icon ada nilainya dan namanya cocok dengan yang ada di library, render icon tersebut.
  // Jika tidak ditemukan, render 'PointIcon' atau 'CircleIcon' sebagai default.
  return TablerIcons[props.item?.icon] || TablerIcons['PointIcon'];
});
</script>

<template>
  <component 
    :is="IconComponent" 
    stroke-width="1.5" 
    size="20" 
  />
</template>