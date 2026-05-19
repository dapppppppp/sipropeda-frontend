<script setup>
import { computed } from 'vue';
// Import SEMUA icon dari library
import * as TablerIcons from 'vue-tabler-icons';

const props = defineProps({ 
  item: String, // <-- UBAH JADI STRING (Karena yang diterima adalah teks nama icon-nya)
  level: Number 
});

// Fungsi untuk mengonversi string nama icon dari database menjadi Komponen Vue aktual
const IconComponent = computed(() => {
  // Hapus .icon di sini, langsung baca props.item
  // Jika props.item ada di library, render. Jika tidak, render 'PointIcon'
  return TablerIcons[props.item] || TablerIcons['PointIcon'];
});
</script>

<template>
  <component 
    :is="IconComponent" 
    stroke-width="1.5" 
    size="20" 
  />
</template>