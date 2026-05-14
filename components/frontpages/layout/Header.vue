<script setup lang="ts">
import { ref } from "vue";
import { useCustomizerStore } from "@/stores/customizer";
import Navigations from "./Navigation.vue";
import { Menu2Icon } from "vue-tabler-icons";

const appsdrawer = ref(false);
const customizer = useCustomizerStore();
const stickyHeader = ref(true);
</script>

<template>
  <div>
    <div class="bg-lightprimary">
      <v-app-bar
        height="80"
        class="front-lp-header position-relative"
        flat
        app
        :class="stickyHeader ? 'sticky-header' : ''"
      >
        <v-container class="py-0 max-content">
          <v-toolbar class="d-flex align-center">
            
            <div class="logo">
              <NuxtLink to="/" class="text-decoration-none text-primary d-flex align-center">
                <v-icon size="36" class="mr-2">mdi-domain</v-icon>
                <h2 class="font-weight-bold mb-0">SIPROPEDA</h2>
              </NuxtLink>
            </div>

            <div class="navigation mx-8 d-lg-flex d-none flex-grow-1 justify-center">
              <Navigations />
            </div>

            <div class="d-flex">
              <NuxtLink to="/login" class="text-decoration-none">
                <v-btn
                  class="custom-hover-primary bg-primary me-lg-0 me-3 d-md-flex d-none text-white h-43 px-5 transform-none"
                  flat
                  ><span class="text-white">Masuk Sistem</span></v-btn
                >
              </NuxtLink>
              <v-btn
                variant="text"
                class="hidden-lg-and-up"
                icon
                @click.stop="appsdrawer = !appsdrawer"
              >
                <Menu2Icon size="22" stroke-width="1.5" />
              </v-btn>
            </div>
          </v-toolbar>
        </v-container>
      </v-app-bar>
    </div>

    <v-navigation-drawer
      class="lp-drawer"
      v-model="appsdrawer"
      location="left"
      temporary
    >
      <Navigations />
    </v-navigation-drawer>
  </div>
</template>

<style lang="scss" scoped>
.v-container {
  max-width: 1200px !important;
}

.front-lp-header {
  transition: all 0.3s ease;

  .logo {
    flex-shrink: 0;
    width: auto;
  }

  .navigation {
    flex-grow: 1;
  }
}

.sticky-header {
  background-color: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>