<template>
  <v-dialog :model-value="dialog" @update:model-value="closeDialog" max-width="900">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center bg-primary">
        <div class="text-h5 text-white ps-2">
          <v-icon class="me-2" color="white">mdi-timeline-clock-outline</v-icon>
          {{ title }}
        </div>
        <v-btn icon="mdi-close" variant="text" color="white" @click="closeDialog"></v-btn>
      </v-card-title>

      <v-card-text class="pa-6">
        <div v-if="loading" class="text-center pa-10">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <div class="mt-4 text-grey-darken-1">Memuat data timeline...</div>
        </div>

        <div v-else-if="items.length > 0" class="timeline-container">
          <div
            v-for="(item, index) in items"
            :key="index"
            class="timeline-item d-flex"
            :class="{ 'last-item': index === items.length - 1 }"
          >
            <div class="timeline-dot-container">
              <div
                class="timeline-dot"
                :style="{
                  backgroundColor: item.color,
                  borderColor: item.color,
                }"
              >
                <v-icon :color="item.iconColor || 'white'" size="20">{{ item.icon }}</v-icon>
              </div>

              <div
                v-if="index !== items.length - 1"
                class="timeline-line"
              ></div>
            </div>

            <div class="timeline-content flex-grow-1 ms-4">
              <v-card
                class="timeline-card"
                elevation="2"
                :style="{ '--border-color': item.color }"
              >
                <v-card-title class="pa-4 pb-2">
                  <div class="d-flex justify-space-between align-center">
                    <h3 class="text-h6 font-weight-medium text-grey-darken-3">
                      {{ item.title }}
                    </h3>
                    <v-chip
                      size="small"
                      :color="item.color"
                      :text-color="item.textColor || 'white'"
                      class="font-weight-bold"
                    >
                      {{ item.statusLabel }}
                    </v-chip>
                  </div>
                </v-card-title>
                <v-card-text class="pa-4 pt-0">
                  <div class="timeline-details">
                    <div class="d-flex align-center mb-2 text-body-2">
                      <v-icon size="16" class="me-2 text-grey-darken-1">mdi-calendar</v-icon>
                      <span class="text-grey-darken-2 font-weight-medium">
                        {{ formatDateTimeline(item.date) }}
                      </span>
                    </div>
                    <div class="d-flex align-center mb-2 text-body-2" v-if="item.by">
                      <v-icon size="16" class="me-2 text-grey-darken-1">mdi-account</v-icon>
                      <span class="text-grey-darken-2 font-weight-medium">
                        <span class="font-weight-regular text-grey me-1">Oleh:</span>{{ item.by }}
                      </span>
                    </div>
                    <div class="d-flex align-start mb-2 text-body-2" v-if="item.notes && item.notes !== 'null'">
                      <v-icon size="16" class="me-2 text-grey-darken-1">mdi-note-text</v-icon>
                      <span class="text-grey-darken-2" style="white-space: pre-wrap">{{ item.notes }}</span>
                    </div>
                </div>
                </v-card-text>
              </v-card>
            </div>
          </div>
        </div>

        <v-row v-else justify="center" class="py-8">
          <v-col cols="auto">
            <v-icon size="80" color="grey-lighten-1">mdi-timeline-help-outline</v-icon>
          </v-col>
          <v-col cols="12" class="text-center">
            <h3 class="text-h5 text-grey-darken-1 mb-2">Tidak ada data timeline</h3>
            <p class="text-body-1 text-grey">{{ emptyMessage }}</p>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="pt-0">
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="text" @click="closeDialog">Kembali</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  dialog: { type: Boolean, default: false },
  title: { type: String, default: "Timeline" },
  items: { type: Array as () => any[], default: () => [] },
  loading: { type: Boolean, default: false },
  emptyMessage: { type: String, default: "Timeline untuk item ini belum tersedia." },
});

const emit = defineEmits(["update:dialog", "close"]);

function closeDialog() {
  emit("update:dialog", false);
  emit("close");
}

function formatDateTimeline(dateString: any) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  return date.toLocaleDateString("id-ID", options);
}
</script>

<style scoped>
.timeline-container {
  position: relative;
  padding-left: 8px;
}

.timeline-item {
  position: relative;
  padding-bottom: 24px;
  align-items: stretch;
}

.timeline-item.last-item {
  padding-bottom: 0;
}

.timeline-dot-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
  min-width: 48px;
}

.timeline-dot {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 3px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 3;
}

.timeline-line {
  width: 3px;
  background-color: #e0e0e0;
  flex-grow: 1;
  
  margin-top: -2px;
  margin-bottom: -26px;
  
  position: relative;
  z-index: 1;
}

.timeline-card {
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
  background: #fafafa;
  border-left-color: var(--border-color) !important;
}

.timeline-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.timeline-details .v-icon {
  opacity: 0.8;
}
</style>