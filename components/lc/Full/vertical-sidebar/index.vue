<script setup>
import { shallowRef } from 'vue';
import { useCustomizerStore } from '@/stores/customizer';
import { useAuthStore } from '@/stores/auth'; 

import NavGroup from './NavGroup/index.vue';
import NavItem from './NavItem/index.vue';
import NavCollapse from './NavCollapse/index.vue';

const customizer = useCustomizerStore();
const authStore = useAuthStore(); 
</script>

<template>
  <v-navigation-drawer 
    left
    v-model="customizer.Sidebar_drawer"
    elevation="0"
    rail-width="75"
    mobile-breakpoint="960"
    app
    class="leftSidebar"
    :rail="customizer.mini_sidebar"
    expand-on-hover
    width="270"
  >
    <perfect-scrollbar class="scrollnavbar">
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
    </perfect-scrollbar>
  </v-navigation-drawer>
</template>