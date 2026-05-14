<script setup lang="ts">
import { ref } from 'vue';
import userService from "@/services/user.service";

const { forgotPassword } = userService();

const email = ref('');
const errorMsg = ref<string | null>(null);
const successMsg = ref<string | null>(null);
const isLoading = ref(false);

const emailRules = ref([
  (v: string) => !!v || 'Email wajib diisi', 
  (v: string) => /.+@.+\..+/.test(v) || 'Email harus valid'
]);

async function handleForgotPassword() {
  errorMsg.value = null;
  successMsg.value = null;

  if (!email.value) {
    errorMsg.value = "Email tidak boleh kosong.";
    useToast("error", errorMsg.value);
    return;
  }
  
  const isValidEmail = emailRules.value.every(rule => rule(email.value) === true);
  if (!isValidEmail) {
     errorMsg.value = "Email harus valid.";
     useToast("error", errorMsg.value);
  }

  isLoading.value = true;
  
  try {
    const res: any = await forgotPassword({ email: email.value });

    if (res.data.success === false) {
      errorMsg.value = res.data.message || "Terjadi kesalahan";
      useToast("error", errorMsg.value);
    } else {
      successMsg.value = res.data.message || "Instruksi telah dikirim.";
      useToast("success", successMsg.value);
      email.value = "";
    }

  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || "Gagal terhubung ke server.";
    useToast("error", errorMsg.value);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="handleForgotPassword" class="mt-sm-13 mt-8">
    <v-label class="text-subtitle-1 font-weight-semibold pb-2 text-lightText">
      Email Address
    </v-label>
    <VTextField 
      v-model="email" 
      :rules="emailRules" 
      required 
      variant="outlined"
      density="compact"
      :disabled="isLoading"
      @keydown.enter="handleForgotPassword"
    ></VTextField>

    <v-alert
      v-if="errorMsg"
      type="error"
      density="compact"
      variant="tonal"
      class="mt-2 mb-4"
    >
      {{ errorMsg }}
    </v-alert>
    <v-alert
      v-if="successMsg"
      type="success"
      density="compact"
      variant="tonal"
      class="mt-2 mb-4"
    >
      {{ successMsg }}
    </v-alert>

    <v-btn 
      size="large" 
      color="primary" 
      block 
      type="submit" 
      flat
      :loading="isLoading"
      :disabled="isLoading"
    >
      Forgot Password
    </v-btn>
  </form>
</template>