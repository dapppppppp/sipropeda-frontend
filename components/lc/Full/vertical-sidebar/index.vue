<script setup>
import { shallowRef } from 'vue';
import { useCustomizerStore } from '@/stores/customizer';
import { useAuthStore } from '@/stores/auth'; // 1. Import Auth Store

import NavGroup from './NavGroup/index.vue';
import NavItem from './NavItem/index.vue';
import NavCollapse from './NavCollapse/index.vue';

const customizer = useCustomizerStore();
const authStore = useAuthStore(); // 2. Inisialisasi Auth Store

// Pastikan import sidebarItem.ts sudah DIHAPUS
</script>

<template>
  <v-navigation-drawer 
    left
    v-model="customizer.Sidebar_drawer"
    >
    <v-list class="px-4">
      <template v-for="(item, i) in authStore.dataMenus" :key="i">
        
        <NavGroup :item="item" v-if="item.header" :key="item.title" />

        <NavCollapse 
          class="leftPadding" 
          :item="item" 
          :level="0" 
          v-else-if="item.children && item.children.length > 0" 
        />

        <NavItem :item="item" v-else />

      </template>
    </v-list>
  </v-navigation-drawer>
</template>