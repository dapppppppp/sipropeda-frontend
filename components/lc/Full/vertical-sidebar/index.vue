<script setup>
import { shallowRef, ref, onMounted } from 'vue';
import { useCustomizerStore } from '@/stores/customizer';
import { useAuthStore } from '@/stores/auth'; 
import { useRuntimeConfig } from '#app';
import appConfigService from '@/services/app_config.service';

import NavGroup from './NavGroup/index.vue';
import NavItem from './NavItem/index.vue';
import NavCollapse from './NavCollapse/index.vue';

const customizer = useCustomizerStore();
const authStore = useAuthStore(); 
const config = useRuntimeConfig();

const systemName = ref('SIPROPEDA');
const tagline = ref('SPK Infrastruktur Desa');
const logoUrl = ref('');

onMounted(async () => {
  try {
    const res = await appConfigService().retrieveById("CONF01");
    if (res?.data) {
      if (res.data.namaSistem) {
        systemName.value = res.data.namaSistem;
      }
      if (res.data.tagline) {
        tagline.value = res.data.tagline;
      }
      if (res.data.logo) {
        logoUrl.value = `${config.public.apiUrl}/files?path=${res.data.logo}`;
      }
    }
  } catch (err) {
    console.error("Gagal memuat konfigurasi logo sidebar:", err);
  }
});
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
    <!-- Brand / Logo Area -->
    <div class="sidebar-brand-container d-flex align-center justify-center px-2 py-2" style="overflow: hidden;" :class="customizer.mini_sidebar ? 'justify-center' : ''">
      <template v-if="customizer.mini_sidebar">
        <v-icon color="primary" size="28" class="flex-shrink-0">mdi-domain</v-icon>
      </template>
      <template v-else>
        <!-- Dynamic Logo Image -->
        <div v-if="logoUrl" class="d-flex align-center justify-center w-100">
          <img :src="logoUrl" alt="Logo" style="width: 100%; max-width: 250px; max-height: 120px; object-fit: contain; margin-top: -15px; margin-bottom: -15px;" />
        </div>
        <!-- Fallback Text Logo -->
        <div v-else class="d-flex align-center">
          <v-icon color="primary" size="28" class="flex-shrink-0">mdi-domain</v-icon>
          <div class="ml-3 hide-menu brand-text">
            <div class="text-subtitle-1 font-weight-black textPrimary" style="letter-spacing: 1.5px; line-height: 1.1;">{{ systemName }}</div>
            <div class="text-caption textSecondary font-weight-medium" style="opacity: 0.8; font-size: 10px; letter-spacing: 0.5px;">{{ tagline }}</div>
          </div>
        </div>
      </template>
    </div>

    <perfect-scrollbar class="scrollnavbar">
      <v-list class="px-4" density="compact">
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

    <!-- Profile Card fixed at the bottom of the drawer -->
    <div class="px-4 py-4 userbottom hide-menu">
      <LcFullVerticalSidebarProfile />
    </div>
  </v-navigation-drawer>
</template>

<style lang="scss" scoped>
.sidebar-brand-container {
  min-height: 75px;
  background: transparent;
  .brand-text {
    overflow: hidden;
    white-space: nowrap;
  }
}
</style>
