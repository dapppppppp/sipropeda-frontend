<script setup>
const props = defineProps({ item: Object | String, level: Number, size: Number });
</script>

<template>
  <component
    :is="item"
    :size="size"
    stroke-width="1.5"
    class="iconClass"
  ></component>
</template>
