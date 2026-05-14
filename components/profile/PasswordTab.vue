<template>
  <v-card elevation="10">
    <v-row class="ma-sm-n2 ma-n1">
      <v-col cols="12">
        <v-card elevation="10">
          <v-card-item>
            <h5 class="text-h5">Ganti Password</h5>
            <div class="text-subtitle-1 text-medium-emphasis mt-2">
              Untuk mengubah password, silahkan isi formulir di bawah
            </div>

            <v-form ref="formPassword" class="mt-5">
              <v-label class="mb-2 font-weight-medium"
                >Kata Sandi Lama</v-label
              >
              <v-text-field
                v-model="passwordForm.oldPassword"
                color="primary"
                variant="outlined"
                density="compact"
                :rules="passwordRules"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                placeholder="Masukkan Kata Sandi Lama"
                hide-details="auto"
                class="mb-4"
              />

              <v-label class="mb-2 font-weight-medium"
                >Kata Sandi Baru</v-label
              >
              <v-text-field
                v-model="passwordForm.newPassword"
                color="primary"
                variant="outlined"
                density="compact"
                :rules="passwordRules"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                placeholder="Masukkan Kata Sandi Baru"
                hide-details="auto"
                class="mb-4"
              />

              <v-label class="mb-2 font-weight-medium"
                >Konfirmasi Kata Sandi Baru</v-label
              >
              <v-text-field
                v-model="passwordForm.confirmPassword"
                color="primary"
                variant="outlined"
                density="compact"
                :rules="confirmPasswordRules"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                placeholder="Masukkan Konfirmasi Kata Sandi Baru"
                hide-details="auto"
              />
            </v-form>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>
    <div class="d-flex justify-end mt-5">
      <v-btn
        size="large"
        color="primary"
        class="mr-4"
        @click="handleChangePassword"
        :loading="isLoadingChangePassword"
        flat
        >Simpan</v-btn
      >
      <v-btn
        size="large"
        color="secondary"
        @click="resetForm"
        flat
        >Batal</v-btn
      >
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import userService from "@/services/user.service";
import Swal from "sweetalert2";
import { useToast } from "@/composables/useToast";

const authStore = useAuthStore();
const userData = computed(() => authStore.dataUser);

const formPassword: any = ref(null);
const isLoadingChangePassword = ref(false);
const showPassword = ref(false);

const passwordForm = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const passwordRules = [
  (v: any) => !!v || "Wajib Diisi",
  (v: string) => v.length >= 6 || "Password minimal 6 karakter",
];
const confirmPasswordRules = [
  (v: any) => !!v || "Wajib Diisi",
  (v: any) =>
    v === passwordForm.value.newPassword || "Konfirmasi password tidak cocok",
];

function getErrorMessage(err: any): string {
  return (
    err?.data?.message ||
    err?.message ||
    "Terjadi kesalahan yang tidak terduga"
  );
}

async function handleChangePassword() {
  if (!formPassword.value) return;
  const { valid } = await formPassword.value.validate();
  if (!valid) return;

  isLoadingChangePassword.value = true;
  try {
    await userService().changePassword({
      id: userData.value.id,
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword,
    });

    useToast("success", "Password berhasil diperbarui");
    resetForm();
  } catch (err: any) {
    Swal.fire({ icon: "error", title: "Gagal", text: getErrorMessage(err) });
  } finally {
    isLoadingChangePassword.value = false;
  }
}

function resetForm() {
  Object.assign(passwordForm.value, {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  formPassword.value?.resetValidation();
}
</script>

