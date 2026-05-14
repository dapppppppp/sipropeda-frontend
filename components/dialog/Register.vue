<template>
  <v-dialog
    v-model="dialog"
    max-width="500"
    transition="dialog-top-transition"
    persistent
    scrollable
  >
    <v-card class="rounded-xl" elevation="8">
      <v-card-title class="pa-0">
        <v-sheet 
          class="w-100 d-flex align-center px-6 py-4 rounded-t-xl" 
          style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        >
          <div class="d-flex align-center">
            <v-icon color="white" size="28" class="mr-3">mdi-account-plus</v-icon>
            <span class="text-white font-weight-bold" style="font-size: 20px">Daftar Akun Baru</span>
          </div>
          <v-spacer/>
          <v-btn 
            icon 
            @click="dialog = false" 
            color="white" 
            variant="text"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-sheet>
      </v-card-title>

      <v-card-text class="px-6 pt-6 pb-2">
        <v-form ref="formRef" v-model="valid" :lazy-validation="true">
          <v-alert
            type="info"
            variant="tonal"
            density="compact"
            class="mb-5 text-body-2"
            border="start"
          >
            Silahkan lengkapi data diri Anda untuk mendaftar
          </v-alert>
          <div class="mb-3">
            <v-text-field
              v-model="nik"
              :rules="[rulesNik.required, rulesNik.must16Digit]"
              label="NIK"
              maxlength="16"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-card-account-details"
              @keypress="allowOnlyNumber"
              hide-details="auto"
              color="primary"
            />
          </div>
          <div class="mb-3">
            <v-text-field
              v-model="name"
              :rules="[v => !!v || 'Nama User wajib diisi !']"
              label="Nama Lengkap"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-account"
              hide-details="auto"
              color="primary"
            />
          </div>
          <div class="mb-3">
            <v-text-field
              v-model="username"
              :rules="[v => !!v || 'Username wajib diisi !']"
              label="Username"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-at"
              hide-details="auto"
              color="primary"
            />
          </div>
          <div class="mb-3">
            <v-text-field
              v-model="email"
              :rules="emailRules"
              label="Email"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-email"
              hide-details="auto"
              color="primary"
              type="email"
            />
          </div>
          <div class="mb-3">
            <v-text-field
              v-model="no_hp"
              :rules="[v => !!v || 'No. HP wajib diisi !']"
              label="No. HP"
              maxlength="13"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-phone"
              @keypress="allowOnlyNumber"
              hide-details="auto"
              color="primary"
            />
          </div>
          <div class="mb-1">
            <v-text-field
              v-model="password"
              :rules="[v => !!v || 'Password wajib diisi !']"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              label="Password"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-lock"
              hide-details="auto"
              color="primary"
            />
          </div>
        </v-form>
      </v-card-text>

      <v-divider class="mt-4"/>
      <v-card-actions class="px-6 py-4">
        <v-spacer/>
        <v-btn
          variant="outlined"
          color="grey-darken-1"
          @click="dialog = false"
          :disabled="submitting"
          class="mr-2"
        >
          Batal
        </v-btn>
        <v-btn
          :loading="submitting"
          color="primary"
          @click="onSubmit"
          variant="elevated"
          size="large"
          min-width="120"
        >
          <v-icon left class="mr-2">mdi-account-check</v-icon>
          Daftar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import Swal from 'sweetalert2'
import { ref } from 'vue'
import userService from '@/services/user.service'

const dialog = ref(false)
const valid = ref(false)
const submitting = ref(false)
const formRef = ref<any>(null)

const nik = ref('')
const name = ref('')
const username = ref('')
const email = ref('')
const no_hp = ref('')
const password = ref('')
const showPassword = ref(false)

const rulesNik = {
  required: (v: string) => !!v || 'NIK Wajib Diisi !',
  must16Digit: (v: string) => (!!v && v.length === 16) || 'NIK harus 16 digit',
}
const emailRules = [
  (v: string) => !!v || 'Email wajib diisi !',
  (v: string) => /.+@.+\..+/.test(v) || 'Format Email Salah !',
]

function allowOnlyNumber(e: KeyboardEvent) {
  const k = e.key
  if (!/[0-9]/.test(k)) e.preventDefault()
}

function resetForm() {
  nik.value = ''
  name.value = ''
  username.value = ''
  email.value = ''
  no_hp.value = ''
  password.value = ''
  formRef.value?.resetValidation?.()
}

async function onSubmit() {
  const { valid: isValid } = await formRef.value?.validate()
  if (!isValid) return

  submitting.value = true
  try {
    const postBody = {
      nik: nik.value,
      name: name.value,
      username: username.value,
      email: email.value,
      noHp: no_hp.value,
      password: password.value,
    }

    const resp: any = await userService().register(postBody)

    const user = resp?.data
    const success = !!user?.id

    const needsVerify = success && user?.active === false
    const message =
      resp?.message ??
      (needsVerify
        ? 'Registrasi berhasil. Silakan cek email untuk verifikasi akun.'
        : success
        ? 'Registrasi berhasil.'
        : 'Registrasi gagal.')

    await Swal.fire({
      title: success ? 'Berhasil' : 'Maaf',
      text: message,
      icon: success ? 'success' : 'error',
    })

    if (success) {
      resetForm()
      dialog.value = false
    }
  } catch (err: any) {
    await Swal.fire({
      title: 'Maaf',
      text: err?.data?.message || err?.message || 'Terjadi kesalahan.',
      icon: 'error',
    })
  } finally {
    submitting.value = false
  }
}

function open() { dialog.value = true }
function close() { dialog.value = false }
defineExpose({ open, close })
</script>