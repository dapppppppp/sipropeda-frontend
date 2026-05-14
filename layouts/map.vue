<template>
  <!-----RTL LAYOUT------->
  <v-locale-provider v-if="customizer.setRTLLayout" rtl>
    <v-app
      :theme="customizer.actTheme"
      :class="[
        customizer.actTheme,
        customizer.mini_sidebar ? 'mini-sidebar' : '',
        customizer.setHorizontalLayout ? 'horizontalLayout' : 'verticalLayout',
        customizer.setBorderCard ? 'cardBordered' : '',
      ]"
    >
      <!---Customizer location left side--->
      <ClientOnly>
        <v-navigation-drawer
          app
          temporary
          elevation="10"
          location="left"
          v-model="customizer.Customizer_drawer"
          width="320"
          class="left-customizer"
        >
          <LcFullCustomizer />
        </v-navigation-drawer>
        <LcFullVerticalSidebar v-if="!customizer.setHorizontalLayout" />
        <LcFullVerticalHeader v-if="!customizer.setHorizontalLayout" />
        <LcFullHorizontalHeader v-if="customizer.setHorizontalLayout" />
        <LcFullHorizontalSidebar v-if="customizer.setHorizontalLayout" />
      </ClientOnly>
      <v-main>
        <v-container fluid class="page-wrapper">
          <div :class="customizer.boxed ? 'maxWidth' : ''">
            <NuxtPage />
            <v-btn
              class="customizer-btn"
              size="large"
              icon
              variant="flat"
              color="primary"
              @click.stop="
                customizer.SET_CUSTOMIZER_DRAWER(!customizer.Customizer_drawer)
              "
            >
              <SettingsIcon />
            </v-btn>
          </div>
        </v-container>
      </v-main>
    </v-app>
  </v-locale-provider>

  <!-----LTR LAYOUT------->
  <v-locale-provider v-else>
    <v-app
      :theme="customizer.actTheme"
      :class="[
        customizer.actTheme,
        customizer.mini_sidebar ? 'mini-sidebar' : '',
        customizer.setHorizontalLayout ? 'horizontalLayout' : 'verticalLayout',
        customizer.setBorderCard ? 'cardBordered' : '',
      ]"
    >
      <!---Customizer location right side--->
      <ClientOnly>
        <v-navigation-drawer
          app
          temporary
          elevation="10"
          location="right"
          v-model="customizer.Customizer_drawer"
          width="320"
        >
          <LcFullCustomizer />
        </v-navigation-drawer>
        <LcFullVerticalSidebar v-if="!customizer.setHorizontalLayout" />
        <LcFullVerticalHeader v-if="!customizer.setHorizontalLayout" />
        <LcFullHorizontalHeader v-if="customizer.setHorizontalLayout" />
        <LcFullHorizontalSidebar v-if="customizer.setHorizontalLayout" />
      </ClientOnly>
      <v-main>
        <v-container fluid class="page-wrapper" style="padding:0px !important;">
          <div :class="customizer.boxed ? 'maxWidth' : ''">
            <NuxtPage />
            <v-btn
              class="customizer-btn"
              size="large"
              icon
              variant="flat"
              color="primary"
              @click.stop="
                customizer.SET_CUSTOMIZER_DRAWER(!customizer.Customizer_drawer)
              "
            >
              <SettingsIcon />
            </v-btn>
          </div>
        </v-container>
      </v-main>
    </v-app>
  </v-locale-provider>
</template>
<script setup lang="ts">
import { useCustomizerStore } from "@/stores/customizer";
// import { pl, zhHans } from "vuetify/locale";
import { useAuthStore } from "@/stores/auth";
const customizer = useCustomizerStore();
const authStore = useAuthStore();

onBeforeMount(() => {
  loadMenu()
})

async function loadMenu(){
  const roleID = authStore.user.roleId
  const commodityId = authStore.user.commodityId
  await authStore
    .loadAuthMenu({
      roleId: roleID,
      commodityId: commodityId,
    })
    .catch((err: any) => {
      console.log("err log : ", err);
    }); 
}
</script>

<style scoped>
.page-wrapper{
  background: #f2f5f8 !important;
}
.btn-actions {
  height: 28px !important;
  padding: 0px !important;
  min-width: 31px !important;
}
</style>