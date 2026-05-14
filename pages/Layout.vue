<script setup lang="ts">
import AnnounceBar from "@/components/frontpages/layout/AnnounceBar.vue";
import Footer from "@/components/frontpages/layout/Footer.vue";
import Header from "@/components/frontpages/layout/Header.vue";
</script>
<template>
  <div class="front-wraper">
    <AnnounceBar />
    <Header />
    <main style="padding-top: 80px">
      <slot />
    </main>
    <Footer />
  </div>
</template>
