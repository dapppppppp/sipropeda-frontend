<template>
  <v-navigation-drawer
    left
    v-model="customizer.Sidebar_drawer"
    elevation="0"
    rail-width="75"
    app
    class="leftSidebar"
    :rail="customizer.mini_sidebar"
    expand-on-hover
    width="270"
  >
    <div class="pa-5 d-flex align-center justify-center text-primary">
        <v-icon size="32" class="mr-2">mdi-domain</v-icon>
        <h2 v-if="!customizer.mini_sidebar" class="font-weight-bold mb-0">SIPROPEDA</h2>
    </div>

    <perfect-scrollbar class="scrollnavbar">
      <v-list class="pa-4" density="compact">
        <template v-for="item in computedMenus" :key="item.name">
          <LcFullVerticalSidebarNavGroup :item="item" v-if="item.header" />
          <LcFullVerticalSidebarNavCollapse
            class="leftPadding"
            :item="item"
            :level="0"
            v-else-if="item.children"
          />
          <LcFullVerticalSidebarNavItem
            :item="item"
            v-else
            class="leftPadding"
          />
          </template>
      </v-list>
      <div class="pa-6 userbottom">
        <LcFullVerticalSidebarProfile />
      </div>
    </perfect-scrollbar>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useCustomizerStore } from "@/stores/customizer";
import { useAuthStore } from "@/stores/auth";

const customizer = useCustomizerStore();
const authStore = useAuthStore();

const computedMenus = computed(() => authStore.dataMenus);
</script>