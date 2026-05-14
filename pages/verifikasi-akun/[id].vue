<!-- /pages/verifikasi/[id_user].vue -->
<template>
    <v-app id="verifikasi">
      <!-- Background -->
      <v-main class="page-bg d-flex align-center justify-center">
        <v-container class="my-auto">
          <v-row>
            <v-col cols="12">
              <div class="text-center">
                <v-progress-circular
                  v-if="loading"
                  indeterminate
                  :size="60"
                  color="primary"
                />
                <template v-else>
                  <h4>Proses Verifikasi....</h4>
                </template>
              </div>
            </v-col>
          </v-row>
        </v-container>
  
        <!-- Fullscreen loading overlay yang estetis -->
        <v-overlay
          :model-value="loading"
          class="align-center justify-center overlay-blur"
          persistent
          :contained="false"
          scrim
        >
          <div class="overlay-card">
            <v-progress-circular indeterminate :size="64" />
            <div class="mt-4 text-justify">
              <div class="font-bold text-lg text-center">Memproses Verifikasi</div>
              <div class="text-sm opacity-80 mt-1 text-center">
                Mohon tunggu sebentar, kami sedang memvalidasi akun Anda…
              </div>
            </div>
          </div>
        </v-overlay>
      </v-main>
    </v-app>
  </template>
  
  <script setup lang="ts">
  definePageMeta({ layout: 'blank' })
  
  import Swal from 'sweetalert2'
  import { onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import userService from '@/services/user.service'
  
  const route = useRoute()
  const router = useRouter()
  const loading = ref(true)
  
  onMounted(async () => {
    const id_user = route.query.id as string
  
    try {
      const resp = await userService().verifikasiEmail({ id: id_user })
  
      // BE kamu kirim: {"data":"success"}
      const success =
        (resp as any)?.data === 'success' ||
        (resp as any)?.data === 'success' ||
        (resp as any)?.status === 'success' ||
        (typeof resp === 'string' && resp.trim().toLowerCase() === 'success')
  
      const message = success
        ? 'Verifikasi berhasil. Akun Anda sudah aktif.'
        : 'Verifikasi gagal. Silakan coba lagi atau hubungi admin.'
  
      const icon = success ? 'success' : 'error'
      const title = success ? 'Berhasil!' : 'Oops..!'
  
      setTimeout(async () => {
        await Swal.fire({
          title,
          text: message,
          icon: icon as any,
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Tutup',
        })
        router.push('/login')
      }, 1200)
    } catch (err: any) {
      await Swal.fire({
        title: 'Oops..!',
        text:
          err?.data?.message ||
          err?.message ||
          'Terjadi kesalahan saat verifikasi.',
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Tutup',
      })
      router.push('/login')
    } finally {
      loading.value = false
    }
  })
  </script>
  
  <style scoped>
  .page-bg {
    /* gradient lembut */
    background: radial-gradient(1200px 800px at 80% -10%, rgba(99, 102, 241, 0.18), transparent 60%),
                radial-gradient(900px 600px at 0% 120%, rgba(16, 185, 129, 0.18), transparent 60%),
                linear-gradient(180deg, #0f172a 0%, #0b1220 100%);
    min-height: 100vh;
    color: #e5e7eb;
  }
  
  .overlay-blur :deep(.v-overlay__scrim) {
    /* scrim lebih halus */
    backdrop-filter: blur(4px);
    background-color: rgba(15, 23, 42, 0.45);
  }
  
  .overlay-card {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    padding: 28px 32px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
    width: min(420px, 92vw);
  }
  
  .font-bold { font-weight: 700; }
  .text-lg { font-size: 1.125rem; }
  .text-sm { font-size: 0.875rem; }
  .opacity-80 { opacity: 0.8; }
  .text-center { text-align: center; }
  .mt-4 { margin-top: 1rem; }
  .my-auto { margin-top: auto; margin-bottom: auto; }
  </style>
  