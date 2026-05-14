<script setup>
const props = defineProps({
  title: {
    type: String,
    default: ""
  },
  icon: {
    type: String,
    default: "ClockIcon"
  },
  count: {
    type: [Number, String],
    default: 0
  },
  unit: {
    type: String,
    default: "Hari" 
  },
  description: {
    type: String,
    default: "" 
  }
});
</script>

<template>
  <v-card class="summary-card-gradient rounded-xl pa-0 overflow-hidden" elevation="10" height="100%">
    <div class="pa-6 d-flex flex-column" style="height: 100%; position: relative; z-index: 2;">
      
      <div class="d-flex align-center justify-space-between mb-4">
        <h4 class="text-h5 text-white font-weight-bold">
          {{ props.title }}
        </h4>
        <v-avatar color="rgba(255,255,255,0.2)" size="40">
          <UiIcon :item="props.icon" class="text-white" />
        </v-avatar>
      </div>

      <div class="mt-2">
        <div class="d-flex align-end">
          <h1 class="text-white font-weight-black mb-0 lh-1" style="font-size: 5rem;">
            {{ props.count }}
          </h1>
          <span class="text-h4 text-white font-weight-regular ml-3 mb-2 opacity-90">
            {{ props.unit }}
          </span>
        </div>

        <div v-if="props.description" class="mt-3">
           <p class="text-h6 text-white font-weight-regular opacity-90" style="line-height: 1.3;">
             {{ props.description }}
           </p>
        </div>
      </div>
      
    </div>

    <div class="circle-decoration-1"></div>
    <div class="circle-decoration-2"></div>
  </v-card>
</template>

<style scoped>
.summary-card-gradient {
  background: linear-gradient(135deg, #43a047 0%, #66bb6a 100%);
  position: relative;
  overflow: hidden; 
}

/* Utilities */
.lh-1 { line-height: 1; }
.opacity-90 { opacity: 0.9; }

/* Dekorasi Lingkaran */
.circle-decoration-1 {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 150px;
  height: 150px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  z-index: 1;
}

.circle-decoration-2 {
  position: absolute;
  bottom: 40px;
  left: -30px;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  z-index: 1;
}
</style>