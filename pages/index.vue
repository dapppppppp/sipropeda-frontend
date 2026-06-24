<script setup lang="ts">
definePageMeta({ layout: "blank" });

// Redirect langsung ke halaman login
await navigateTo("/login", { replace: true });
</script>