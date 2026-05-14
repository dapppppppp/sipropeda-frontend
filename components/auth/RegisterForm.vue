<script setup lang="ts">
import { ref } from "vue";
import { Form } from "vee-validate";
import Swal from "sweetalert2";
import userService from "@/services/user.service";

const router = useRouter();
const showPassword = ref(false);

const nik = ref("");
const name = ref("");
const username = ref("");
const email = ref("");
const noHp = ref("");
const password = ref("");

const nikRules = ref([
  (v: string) => !!v || "NIK wajib diisi",
  (v: string) => (v && v.length === 16) || "NIK harus terdiri dari 16 digit",
]);
const nameRules = ref([(v: string) => !!v || "Name wajib diisi"]);
const usernameRules = ref([(v: string) => !!v || "Username wajib diisi"]);
const emailRules = ref([
  (v: string) => !!v || "Email wajib diisi",
  (v: string) => /.+@.+\..+/.test(v) || "Email tidak valid",
]);
const noHpRules = ref([(v: string) => !!v || "No HP wajib diisi"]);
const passwordRules = ref([
  (v: string) => !!v || "Password wajib diisi",
  (v: string) =>
    (v && v.length >= 8) || "Password minimal terdiri dari 8 karakter",
]);

function allowOnlyNumber(e: KeyboardEvent) {
  const k = e.key;
  if (!/\d/.test(k)) e.preventDefault();
}

async function onSubmit() {
  try {
    const response: any = await userService().register({
      nik: nik.value,
      name: name.value,
      username: username.value,
      email: email.value,
      noHp: noHp.value,
      password: password.value,
    });

    if (response.data && response.data.success === false) {
      useToast("error", response.data.message || "Pendaftaran gagal. Silakan periksa data Anda.");
      
    } else {
      useToast("success", "Registrasi Berhasil! Silakan cek email untuk verifikasi.");
      router.push("/login");
    }

  } catch (err: any) {
    const errorMessage = err.response?.data?.message || "Gagal terhubung ke server.";
    useToast("error", errorMessage);
  }
}
</script>

<template>
  <Form @submit="onSubmit" v-slot="{ errors, isSubmitting }" class="mt-5">
    <v-label class="text-subtitle-1 font-weight-semibold pb-2 text-lightText">
      NIK
    </v-label>
    <CustomBaseInput
      type="input"
      v-model="nik"
      :rules="nikRules"
      label=""
      placeholder="Masukkan NIK"
      variant="outlined"
      density="compact"
      hide-details="auto"
      @keypress="allowOnlyNumber"
    ></CustomBaseInput>

    <v-label
      class="text-subtitle-1 font-weight-semibold pb-2 text-lightText mt-2"
    >
      Nama Lengkap
    </v-label>
    <CustomBaseInput
      type="input"
      v-model="name"
      :rules="nameRules"
      label=""
      placeholder="Masukkan Nama Lengkap"
      variant="outlined"
      density="compact"
      hide-details="auto"
    ></CustomBaseInput>

    <v-label
      class="text-subtitle-1 font-weight-semibold pb-2 text-lightText mt-2"
    >
      Username
    </v-label>
    <CustomBaseInput
      type="input"
      v-model="username"
      :rules="usernameRules"
      label=""
      placeholder="Masukkan Username"
      variant="outlined"
      density="compact"
      hide-details="auto"
    ></CustomBaseInput>

    <v-label
      class="text-subtitle-1 font-weight-semibold pb-2 text-lightText mt-2"
    >
      Email
    </v-label>
    <CustomBaseInput
      type="input"
      v-model="email"
      :rules="emailRules"
      label=""
      placeholder="Masukkan Email"
      variant="outlined"
      density="compact"
      hide-details="auto"
    ></CustomBaseInput>

    <v-label
      class="text-subtitle-1 font-weight-semibold pb-2 text-lightText mt-2"
    >
      No. HP
    </v-label>
    <CustomBaseInput
      type="input"
      v-model="noHp"
      :rules="noHpRules"
      label=""
      placeholder="Masukkan No. HP"
      variant="outlined"
      density="compact"
      hide-details="auto"
      @keypress="allowOnlyNumber"
    ></CustomBaseInput>

    <v-label
      class="text-subtitle-1 font-weight-semibold pb-2 text-lightText mt-2"
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

    <div class="my-3 text-left">
      <span class="text-body-1 text-medium-emphasis">Sudah memiliki akun?</span>
      <NuxtLink
        to="/login"
        class="text-primary font-weight-bold ms-1 hover-link"
      >
        <span class="text-body-1 text-medium-emphasis">Masuk di sini</span>
      </NuxtLink>
    </div>

    <v-btn
      size="large"
      :loading="isSubmitting"
      color="primary"
      :disabled="!password"
      block
      type="submit"
      flat
    >
      Register
    </v-btn>

    <div v-if="errors.apiError" class="mt-2">
      <v-alert color="error">{{ errors.apiError }}</v-alert>
    </div>
  </Form>
</template>
