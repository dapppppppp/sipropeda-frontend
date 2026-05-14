<script setup lang="ts">
const props = defineProps({
  title: String,
  breadcrumbs: Array as any,
  icon: String,
});
</script>

<template>
  <div class="mb-5" style="margin-top: -5px">
    <v-breadcrumbs
      :items="breadcrumbs"
      class="text-h6 font-weight-medium pa-0 ml-n1"
    >
      <template v-slot:divider>
        <h6 class="text-medium-emphasis text-subtitle-1">/</h6>
      </template>
      <template v-slot:item="{ item }">
        <router-link
          v-if="!item.disabled && item.to"
          :to="item.to"
          class="text-decoration-none"
        >
          <h6 class="text-medium-emphasis text-subtitle-1">
            {{ item.text }}
          </h6>
        </router-link>
        <h6 v-else class="text-medium-emphasis text-subtitle-1">
          {{ item.text }}
        </h6>
      </template>
    </v-breadcrumbs>
  </div>
</template>

<style lang="scss">
.page-breadcrumb {
  .v-toolbar {
    background: transparent;
  }
}
</style>
