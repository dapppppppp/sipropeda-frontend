<template>
  <div>
    <v-card>
      <v-toolbar color="white" flat style="background-color: white;">
        <v-btn @click="$router.go(-1)" icon>
          <v-icon color="black">mdi-arrow-left</v-icon>
        </v-btn>
        <v-toolbar-title class="subheading" style="margin-left: -8px; color: black">
          {{ formTitle }}
        </v-toolbar-title>
      </v-toolbar>
      <v-divider></v-divider>
        <v-card-text class="pt-1">
          <v-form
            onSubmit="return false"
            ref="form"
            v-model="valid"
            lazy-validation
          >
            <slot></slot>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="tonal" @click.prevent="handleClose"
            >Batal</v-btn
          >
          <v-btn color="primary" :loading="isLoading" variant="flat" @click.prevent="handleSave"
            >Simpan</v-btn
          >
        </v-card-actions>
      </v-card>
  </div>
</template>

<script>
export default {
  props: {
    formTitle: {
      type: String,
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
      this.$router.go(-1)
      this.$emit("handleClose");
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