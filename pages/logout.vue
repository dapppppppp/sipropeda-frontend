<template>
  <div />
</template>
<script>
import { useAuthStore } from "@/stores/auth";
export default {
  created() {
    this.handleLogout()
  },
  methods : {
    handleLogout(){
        const { logout } = useAuthStore();
        return logout()
    }
  }
}
</script>
