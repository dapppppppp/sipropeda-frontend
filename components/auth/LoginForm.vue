<script setup lang="ts">
import { ref } from "vue";
import { Form } from "vee-validate";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();

const showPassword = ref(false);
const password = ref("");
const username = ref("");

const passwordRules = ref([(v: string) => !!v || "Password wajib diisi"]);
const usernameRules = ref([(v: string) => !!v || "Username wajib diisi"]);

async function onSubmit() {
  try {
    await authStore.login({
      username: username.value,
      password: password.value,
    });
  } catch (err: any) {
    console.error("Gagal Login:", err);
  }
}
</script>

<template>
  <Form @submit="onSubmit" v-slot="{ errors, isSubmitting }" class="mt-5">
    <v-label class="text-subtitle-1 font-weight-semibold pb-2 text-lightText">
      Username
    </v-label>
    <CustomBaseInput
      type="input"
      v-model="username"
      :rules="usernameRules"
      label=""
      placeholder="Masukkan Username Anda"
      variant="outlined"
      density="compact"
      hide-details="auto"
    ></CustomBaseInput>

    <v-label
      class="text-subtitle-1 font-weight-semibold pb-2 text-lightText mt-4"
    >
      Password
    </v-label>
    <CustomBaseInput
      type="input"
      v-model="password"
      :rules="passwordRules"
      label=""
      placeholder="Masukkan Password"
      variant="outlined"
      density="compact"
      hide-details="auto"
      :jenis="showPassword ? 'text' : 'password'"
      :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
      @click:append-inner="showPassword = !showPassword"
    ></CustomBaseInput>

    <v-btn
      class="mt-8"
      size="large"
      :loading="isSubmitting"
      color="primary"
      :disabled="!password || !username"
      block
      type="submit"
      flat
    >
      Masuk ke SIPROPEDA
    </v-btn>

    <div v-if="errors.apiError" class="mt-2">
      <v-alert type="error" density="compact" variant="tonal">{{
        errors.apiError
      }}</v-alert>
    </div>
  </Form>
</template>