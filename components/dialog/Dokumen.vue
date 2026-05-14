<template>
  <div>
    <v-dialog
      v-model="dialog"
      :scrollable="scrollable"
      :width="width"
      :persistent="persistent"
    >
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="text-h5 text-medium-emphasis ps-2">
            {{ formTitle }}
          </div>
          <v-btn icon="mdi-close" variant="text" @click="handleClose"></v-btn
        ></v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-1">
         <div class="text-center" style="height: 100vh">
              <img
                v-if="file.split('.').pop() != 'pdf'"
                width="100%"
                :src="file"
                alt=""
              />
              <iframe
                v-if="file.split('.').pop() == 'pdf'"
                width="100%"
                height="100%"
                :src="file"
                frameborder="0"
              ></iframe>
            </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="tonal" @click.prevent="handleClose"
            >TUTUP</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
    },
    file: {
        type: String,
        default: "",
      },
    formTitle: {
      type: String,
    },
    width: {
      type: String,
      default: "900px",
    },
    persistent: {
      type: Boolean,
      default: false,
    },
    scrollable: {
      type: Boolean,
      default: true,
    },
    reset: {
      type: Boolean,
      default: true,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    show: {
      immediate: true,
      handler() {
        this.dialog = this.show;
        this.resetForm = this.reset;
      },
    },
    dialog(nv) {
      if (!nv) {
        this.handleClose();
      }
    },
  },
  data() {
    return {
      valid: false,
      dialog: false,
      resetForm: true,
    };
  },
  created() {},
  methods: {
    handleSave() {
      if (this.$refs.form.validate()) {
        if (this.valid) {
          this.$emit("handleSave", {});
          if (this.reset) {
            this.handleReset();
          }
        }
      }
    },
    handleClose() {
      this.dialog = false;
      this.$emit("handleCloseDokumen", this.dialog);
      this.handleReset();
    },
    handleReset() {
      if (this.$refs.form) {
        this.$refs.form.reset();
        this.$refs.form.resetValidation();
      }
    },
  },
};
</script>
<style scoped>
.v-card .v-card-actions {
  padding: 10px 24px 10px !important;
}
</style>