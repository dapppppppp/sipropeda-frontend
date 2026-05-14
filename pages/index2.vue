<script setup lang="ts">
import DefaultLayout from "./Layout.vue";
/*for Blank Layout*/
definePageMeta({
  layout: "blank",
});
import { ref, reactive } from 'vue'


// ===== State =====
const valid = ref(false)
const submitting = ref(false)
const showGuide = ref(false)
const formRef = ref<any>(null)


const institutions = ref<string[]>([
'Inspektorat Daerah',
'Dinas Komunikasi & Informatika',
'Kepolisian/Polres',
'Kejaksaan',
'Kantor Pajak',
'Ombudsman',
])


const categories = ref<string[]>([
'Amnesti Pajak',
'Pelayanan Publik',
'Infrastruktur',
'Lingkungan',
'Ketenagakerjaan',
'Korupsi/Gratifikasi',
'Lainnya',
])


const form  = reactive({
classification: 'PENGADUAN',
title: '',
body: '',
date: '',
location: '',
institution: null,
category: 'Amnesti Pajak',
attachments: [],
anonymous: false,
secret: false,
})


const rules = {
required: (v: any) => !!v || 'Wajib diisi',
}


// ===== Methods =====
async function onSubmit () {
const result = await formRef.value?.validate()
if (!result?.valid) return


submitting.value = true
try {

// Reset ringan (tetap pertahankan classification & category)
form.title = ''
form.body = ''
form.date = ''
form.location = ''
form.institution = null
form.attachments = []
} finally {
submitting.value = false
}
}
</script>


<style scoped>
ol { margin: 0; }

.segmented {
  display: flex;
  border: 1.5px solid #2fd32f;
  border-radius: 12px;
  overflow: hidden;
}
.seg-btn {
  flex: 1;
  padding: 12px 16px;
  justify-content: center;
  font-weight: 700;
  letter-spacing: .2px;
}
.seg-btn + .seg-btn { border-left: 1px solid #f3b5b5; }
.seg-btn.active { background: #2fd32f; color: #fff; }

.upload-btn { border-color: #2fd32f !important; color: #2fd32f !important; }
</style>

<template>
  <DefaultLayout>
    <!-- <TextBannerCard caption="Portfolio" title="Explore Our Latest Works" />
    <GalleryBox />
    <Purchase /> -->
    <div class="overflow-hidden bg-lightprimary pt-sm-12 pt-0 pb-sm-16 pb-8">
        <v-container class="max-width-1218 text-center py-12">
          <v-card class="rounded-lg" elevation="2">
    <!-- SIMPLE HEADER -->
    <v-card-title class="py-4 px-6">
      <div class="w-100 text-center text-h5 font-weight-bold">
        Sampaikan Laporan Anda
      </div>
    </v-card-title>

    <v-card-text class="px-6 pt-6 pb-2">
      <v-form ref="formRef" v-model="valid" :lazy-validation="true">
        <div class="text-body-2 text-center mb-5">
          Perhatikan Cara Menyampaikan Pengaduan Yang Baik dan Benar
          <v-btn variant="text" size="small" class="ml-1 px-1" @click="showGuide = true">
            Lihat Panduan
          </v-btn>
        </div>

        <!-- KLASIFIKASI -->
        <!-- <div class="mb-6">
          <div class="text-subtitle-2 font-weight-bold mb-2">Pilih Klasifikasi Laporan</div>
          <div class="segmented">
            <v-btn
              class="seg-btn"
              :class="{ active: form.classification==='PENGADUAN' }"
              @click="form.classification='PENGADUAN'"
              rounded="0"
              variant="text"
            >
              <v-icon size="18" class="mr-2">{{ form.classification==='PENGADUAN' ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank' }}</v-icon>
              PENGADUAN
            </v-btn>
            <v-btn
              class="seg-btn"
              :class="{ active: form.classification==='ASPIRASI' }"
              @click="form.classification='ASPIRASI'"
              rounded="0"
              variant="text"
            >
              <v-icon size="18" class="mr-2">{{ form.classification==='ASPIRASI' ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank' }}</v-icon>
              ASPIRASI
            </v-btn>
            <v-btn
              class="seg-btn"
              :class="{ active: form.classification==='PERMINTAAN' }"
              @click="form.classification='PERMINTAAN'"
              rounded="0"
              variant="text"
            >
              <v-icon size="18" class="mr-2">{{ form.classification==='PERMINTAAN' ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank' }}</v-icon>
              PERMINTAAN INFORMASI
            </v-btn>
          </div>
        </div> -->

        <!-- JUDUL -->
        <div class="mb-3">
          <v-text-field
            v-model="form.title"
            :rules="[rules.required]"
            label="Judul Laporan"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-text"
            hide-details="auto"
            color="primary"
          />
        </div>

        <!-- ISI LAPORAN -->
        <div class="mb-3">
          <v-textarea
            v-model="form.body"
            :rules="[rules.required, v => (v && v.length >= 20) || 'Minimal 20 karakter']"
            label="Isi Laporan"
            auto-grow
            rows="5"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-note-text"
            hide-details="auto"
            color="primary"
          />
        </div>

        <!-- TANGGAL KEJADIAN -->
        <div class="mb-3">
          <v-text-field
            v-model="form.date"
            :rules="[rules.required]"
            label="Tanggal Kejadian"
            type="date"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-calendar"
            hide-details="auto"
            color="primary"
          />
        </div>

        <!-- LOKASI & INSTANSI -->
        <v-row class="mb-1" dense>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.location"
              :rules="[rules.required]"
              label="Lokasi Kejadian"
              placeholder="Ketik lokasi kejadian.."
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-map-marker"
              hide-details="auto"
              color="primary"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-autocomplete
              v-model="form.institution"
              :rules="[rules.required]"
              :items="institutions"
              label="Instansi Tujuan"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-office-building"
              hide-details="auto"
              color="primary"
              clearable
            />
          </v-col>
        </v-row>

        <!-- KATEGORI -->
        <div class="mb-3">
          <v-select
            v-model="form.category"
            :items="categories"
            :rules="[rules.required]"
            label="Kategori Laporan"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-shape"
            hide-details="auto"
            color="primary"
          />
        </div>

        <!-- LAMPIRAN -->
        <!-- <div class="mb-3">
          <input ref="fileRef" type="file" class="d-none" multiple @change="onFilesSelected" />
          <v-btn
            class="upload-btn"
            variant="outlined"
            color="error"
            @click="fileRef?.click()"
            prepend-icon="mdi-paperclip"
          >
            Upload Lampiran
          </v-btn>
          <div class="mt-2" v-if="form.attachments && form.attachments.length">
            <v-chip
              v-for="(f, i) in form.attachments"
              :key="i"
              class="ma-1"
              closable
              @click:close="removeAttachment(i)"
              size="small"
              variant="tonal"
            >
              {{ f.name }}
            </v-chip>
          </div>
        </div> -->

        <!-- CHECKBOXES -->
        <v-row class="mb-2" dense>
          <v-col cols="12" md="2">
            <v-checkbox v-model="form.anonymous" label="Anonim" hide-details="auto" />
          </v-col>
          <v-col cols="12" md="2">
            <v-checkbox v-model="form.secret" label="Rahasia" hide-details="auto" />
          </v-col>
          <v-col cols="12" md="8">
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>

    <v-divider class="mt-2" />

    <!-- ACTIONS -->
    <v-card-actions class="px-6 py-4">
      <v-btn
        :loading="submitting"
        color="primary"
        @click="onSubmit"
        variant="elevated"
        size="large"
        block
      >
        Lapor
      </v-btn>
    </v-card-actions>

    <!-- DIALOG PANDUAN -->
    <v-dialog v-model="showGuide" max-width="680">
      <v-card class="rounded-xl">
        <v-card-title class="text-h6 font-weight-bold">Panduan Penyampaian Laporan</v-card-title>
        <v-card-text>
          <ol class="pl-5">
            <li>Tulis judul yang ringkas namun jelas.</li>
            <li>Jelaskan kronologi secara berurutan (apa, siapa, kapan, di mana).</li>
            <li>Unggah bukti pendukung (foto, dokumen). Hapus informasi sensitif bila perlu.</li>
            <li>Pilih instansi paling relevan dan kategori yang tepat.</li>
            <li>Centang <b>Anonim</b> bila tidak ingin menampilkan identitas.</li>
          </ol>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" variant="elevated" @click="showGuide = false">Tutup</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
        </v-container>
    </div>
  </DefaultLayout>
</template>
