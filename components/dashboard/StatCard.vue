<template>
  <v-card elevation="0" :class="`rounded-xl border border-opacity-20`" style="overflow: hidden;">
    <!-- Left accent bar -->
    <div
      class="position-absolute top-0 left-0 h-100"
      style="width: 4px; border-radius: 12px 0 0 12px;"
      :style="{ background: accentColor }"
    ></div>

    <v-card-text class="pa-4 pl-5" style="min-height: 90px;">

      <!-- Shimmer Loading -->
      <div v-if="loading" class="d-flex justify-space-between align-center">
        <div style="width: 70%;">
          <div class="shimmer-box mb-2" style="width: 55%; height: 10px; border-radius: 3px;"></div>
          <div class="shimmer-box mb-3" style="width: 85%; height: 28px; border-radius: 3px;"></div>
          <div class="shimmer-box" style="width: 60%; height: 9px; border-radius: 3px;"></div>
        </div>
        <div class="shimmer-circle" style="width: 42px; height: 42px;"></div>
      </div>

      <!-- Loaded State -->
      <div v-else class="fade-in">
        <div class="d-flex justify-space-between align-start">
          <div style="flex: 1; min-width: 0;">
            <div class="text-caption text-uppercase font-weight-medium text-medium-emphasis mb-1" style="letter-spacing: 0.5px;">
              {{ title }}
            </div>
            <div class="font-weight-bold mb-1" :style="{ fontSize: '22px', color: accentColor }">
              {{ isCurrency ? formatRupiah(value) : value }}
            </div>
          </div>
          <v-avatar :style="{ background: accentBg }" size="42" class="ml-3">
            <v-icon :style="{ color: accentColor }" size="22">{{ icon }}</v-icon>
          </v-avatar>
        </div>

        <!-- Trend badge -->
        <div v-if="trend" class="d-flex align-center mt-1 mb-2" style="gap: 4px;">
          <v-icon :color="trendColor" size="13">
            {{ trend > 0 ? 'mdi-trending-up' : trend < 0 ? 'mdi-trending-down' : 'mdi-minus' }}
          </v-icon>
          <span class="text-caption" :style="{ color: trendColor }">{{ trendLabel }}</span>
        </div>

        <!-- Progress bar -->
        <div v-if="progress !== undefined" class="mt-2">
          <div style="height: 3px; background: rgba(0,0,0,0.08); border-radius: 2px; overflow: hidden;">
            <div
              :style="{ width: `${Math.min(progress, 100)}%`, background: accentColor, height: '100%', borderRadius: '2px', transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }"
            ></div>
          </div>
          <div v-if="progressLabel" class="text-caption text-medium-emphasis mt-1" style="font-size: 10px;">
            {{ progressLabel }}
          </div>
        </div>
      </div>

    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  title:         { type: String, required: true },
  value:         { type: [Number, String], required: true },
  icon:          { type: String, required: true },
  color:         { type: String, default: 'primary' },
  isCurrency:    { type: Boolean, default: false },
  loading:       { type: Boolean, default: false },
  // Trend: positive number = naik, negative = turun, 0 = sama. Tipe string juga bisa untuk label custom.
  trend:         { type: Number, default: undefined },
  trendLabel:    { type: String, default: '' },
  // Progress bar 0–100
  progress:      { type: Number, default: undefined },
  progressLabel: { type: String, default: '' },
});

// Map Vuetify color names ke hex
const colorMap: Record<string, { accent: string; bg: string }> = {
  primary: { accent: '#1B5E20', bg: 'rgba(27, 94, 32, 0.08)' },
  success: { accent: '#2E7D32', bg: 'rgba(46, 125, 50, 0.08)' },
  warning: { accent: '#E65100', bg: 'rgba(230, 81, 0, 0.08)'  },
  info:    { accent: '#01579B', bg: 'rgba(1, 87, 155, 0.08)'  },
  error:   { accent: '#B71C1C', bg: 'rgba(183, 28, 28, 0.08)' },
};

const accentColor = computed(() => colorMap[props.color]?.accent ?? '#1B5E20');
const accentBg    = computed(() => colorMap[props.color]?.bg    ?? 'rgba(27,94,32,0.08)');

const trendColor = computed(() => {
  if (props.trend === undefined) return 'grey';
  if (props.trend > 0) return '#2E7D32';
  if (props.trend < 0) return '#B71C1C';
  return 'grey';
});

function formatRupiah(val: any) {
  const num = Number(val);
  if (isNaN(num) || !num) return 'Rp 0';
  if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(1)} Miliar`;
  if (num >= 1_000_000)     return `Rp ${(num / 1_000_000).toFixed(0)} Juta`;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(num);
}
</script>

<style scoped>
.shimmer-box,
.shimmer-circle {
  background: linear-gradient(
    90deg,
    rgba(0,0,0,0.06) 25%,
    rgba(0,0,0,0.12) 50%,
    rgba(0,0,0,0.06) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite ease-in-out;
}
.shimmer-circle { border-radius: 50%; }

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.fade-in {
  animation: fadeIn 0.35s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0);   }
}
</style>