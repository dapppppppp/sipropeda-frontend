<template>
  <div>
    <v-card class="mx-auto" max-width="1100">
      <v-card-title class="text-center bg-primary py-4"
        >Konfigurasi Sistem
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pa-6">
        <v-form ref="form" :disabled="loadSave || loading">
          <v-row>
            <v-col cols="12" md="7" class="pr-md-6">
              <div class="d-flex align-center mb-4">
                <v-icon class="mr-3" color="#B388FF" size="30">mdi-web</v-icon>
                <h3 class="mb-0">Informasi Umum</h3>
              </div>
              <v-divider class="mb-4"></v-divider>

              <v-label class="mb-2 font-weight-medium">Nama Sistem</v-label>
              <CustomBaseInput
                type="input"
                v-model="editedItem.namaSistem"
                :rules="[(v) => !!v || 'Wajib diisi!']"
                variant="outlined"
                density="comfortable"
              />

              <v-label class="mb-2 mt-3 font-weight-medium">Tagline</v-label>
              <CustomBaseInput
                type="input"
                v-model="editedItem.tagline"
                variant="outlined"
                density="comfortable"
              />

              <v-label class="mb-2 mt-3 font-weight-medium">URL Root (Base URL)</v-label>
              <CustomBaseInput
                type="input"
                v-model="editedItem.urlRoot"
                :rules="[(v) => !!v || 'Wajib diisi!']"
                variant="outlined"
                density="comfortable"
              />

              <div class="d-flex align-center mt-6 mb-4">
                <v-icon class="mr-3" color="primary" size="30"
                  >mdi-office-building-outline</v-icon
                >
                <h3 class="mb-0">Informasi Pemerintah Desa</h3>
              </div>
              <v-divider class="mb-4"></v-divider>

              <v-label class="mb-2 font-weight-medium">Nama Desa / Instansi</v-label>
              <CustomBaseInput
                type="input"
                v-model="editedItem.instansi"
                :rules="[(v) => !!v || 'Wajib diisi!']"
                variant="outlined"
                density="comfortable"
              />

              <v-label class="mb-2 mt-3 font-weight-medium">Alamat Balai Desa</v-label>
              <CustomBaseInput
                type="textarea"
                v-model="editedItem.jalan"
                variant="outlined"
                density="comfortable"
                :rows="2"
              />

              <v-row>
                <v-col cols="6">
                  <v-label class="mb-2 mt-3 font-weight-medium">Desa / Kelurahan</v-label>
                  <CustomBaseInput
                    type="input"
                    v-model="editedItem.kelurahan"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="6">
                  <v-label class="mb-2 mt-3 font-weight-medium">Kecamatan</v-label>
                  <CustomBaseInput
                    type="input"
                    v-model="editedItem.kecamatan"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="6">
                  <v-label class="mb-2 mt-3 font-weight-medium">Kabupaten / Kota</v-label>
                  <CustomBaseInput
                    type="input"
                    v-model="editedItem.kabupaten"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="6">
                  <v-label class="mb-2 mt-3 font-weight-medium">Provinsi</v-label>
                  <CustomBaseInput
                    type="input"
                    v-model="editedItem.provinsi"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="6">
                  <v-label class="mb-2 mt-3 font-weight-medium">Kode Pos</v-label>
                  <CustomBaseInput
                    type="input"
                    v-model="editedItem.kodePos"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="6">
                  <v-label class="mb-2 mt-3 font-weight-medium">Telepon</v-label>
                  <CustomBaseInput
                    type="input"
                    v-model="editedItem.telp"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
              </v-row>
            </v-col>

            <v-col cols="12" md="5">
              <div class="d-flex align-center mb-4">
                <v-icon class="mr-3" color="info" size="30"
                  >mdi-image-outline</v-icon
                >
                <h3 class="mb-0">Branding & Logo</h3>
              </div>
              <v-divider class="mb-4"></v-divider>

              <v-label class="mb-2 mt-3 font-weight-medium">Logo Sistem (SIPROPEDA)</v-label>
              <div
                @click="uploadLogo('Logo Sistem')"
                class="d-flex justify-center align-center rounded mb-4"
                style="width: 100%; height: 180px; border: 2px dashed #aaa; cursor: pointer; background-color: #f9f9f9;"
              >
                <v-img
                  v-if="editedItem.logo"
                  :src="getFileUrl(editedItem.logo)"
                  max-width="150"
                  max-height="150"
                ></v-img>
                <div v-else class="text-center text-grey">
                  <v-icon size="40">mdi-cloud-upload</v-icon>
                  <p class="mt-2 mb-0">Klik untuk Upload Logo Sistem</p>
                </div>
              </div>

              <v-label class="mb-2 mt-4 font-weight-medium">Logo Instansi (Kabupaten / Desa)</v-label>
              <div
                @click="uploadLogo('Logo Instansi')"
                class="d-flex justify-center align-center rounded mb-4"
                style="width: 100%; height: 180px; border: 2px dashed #aaa; cursor: pointer; background-color: #f9f9f9;"
              >
                <v-img
                  v-if="editedItem.childLogo"
                  :src="getFileUrl(editedItem.childLogo)"
                  max-width="150"
                  max-height="150"
                ></v-img>
                <div v-else class="text-center text-grey">
                  <v-icon size="40">mdi-cloud-upload</v-icon>
                  <p class="mt-2 mb-0">Klik untuk Upload Logo Desa</p>
                </div>
              </div>

              <v-label class="mb-2 mt-4 font-weight-medium">Favicon (Ikon Tab Browser)</v-label>
              <div
                @click="uploadLogo('Favicon')"
                class="d-flex justify-center align-center rounded"
                style="width: 100%; height: 120px; border: 2px dashed #aaa; cursor: pointer; background-color: #f9f9f9;"
              >
                <v-img
                  v-if="editedItem.favicon"
                  :src="getFileUrl(editedItem.favicon)"
                  max-width="80"
                  max-height="80"
                ></v-img>
                <div v-else class="text-center text-grey">
                  <v-icon size="30">mdi-cloud-upload</v-icon>
                  <p class="mt-1 mb-0 text-caption">Klik untuk Upload Favicon</p>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="justify-end pa-4">
        <v-btn
          @click="handleCancel"
          variant="tonal"
          :disabled="loadSave || loading"
          class="mr-2"
          >Batal</v-btn
        >
        <v-btn
          @click="handleSave"
          color="primary"
          variant="flat"
          :loading="loadSave"
          :disabled="loadSave || loading"
          >Simpan Konfigurasi</v-btn
        >
      </v-card-actions>
    </v-card>

    <DialogForm
      :show="dialog"
      :persistent="true"
      :reset="true"
      :formTitle="'Ubah ' + dialogTitle"
      :isLoading="loadingLogo"
      @handleSave="handleSaveLogo"
      @handleClose="handleCloseLogo"
    >
      <v-label class="mt-3 mb-2 font-weight-medium">{{ dialogTitle }}</v-label>
      <v-file-input
        v-model="file"
        accept="image/png, image/jpeg, image/jpg"
        :placeholder="dialogTitle"
        prepend-icon=""
        variant="outlined"
      >
        <template v-slot:prepend-inner>
          <v-icon class="mdi-rotate-90">mdi-attachment</v-icon>
        </template>
      </v-file-input>
    </DialogForm>
  </div>
</template>

<script setup lang="ts">
import Swal from "sweetalert2";
import appConfigService from "@/services/app_config.service";
import { useToast } from "@/composables/useToast";
import { usePermission } from "@/composables/usePermission";
import { useRuntimeConfig } from "#app";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

const config = useRuntimeConfig();

// Fungsi untuk menggabungkan URL API dengan parameter path dari database
function getFileUrl(path: string) {
  if (!path) return "";
  
  // Kita tembak langsung ke root /files
  return `${config.public.apiUrl}/files?path=${path}`;
}

const editedItem: any = ref({});
var loading: any = ref(false);
var loadSave: any = ref(false);
var form: any = ref(null);

var dialog = ref(false);
var dialogTitle = ref("Ubah Logo");
var loadingLogo = ref(false);
var file: any = ref(null);

const { checkPermission } = usePermission();
onBeforeMount(() => {
  checkPermission("APPCONFIG.VIEW");
});

onMounted(() => {
  getConfig();
});

function getConfig() {
  loading.value = true;
  appConfigService()
    .retrieveById("CONF01")
    .then((res) => {
      editedItem.value = res.data;
      loading.value = false;
    })
    .catch((er) => {
      loading.value = false;
      useToast("error", "Gagal mengambil data konfigurasi.");
    });
}

function handleCancel() {
  getConfig();
}

async function handleSave() {
  const isValid = await form.value.validate();
  if (!isValid.valid) {
    return;
  }

  loadSave.value = true;
  const payload = { ...editedItem.value };

  Swal.fire({
    title: "Simpan",
    text: "Apakah anda yakin ingin menyimpan data ?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#95a5a6",
    confirmButtonText: "Ya",
    cancelButtonText: "Batal",
    showLoaderOnConfirm: true,
    allowOutsideClick: false,
  })
    .then((result: any) => {
      if (result.isConfirmed) {
        appConfigService()
          .update(payload)
          .then((res) => {
            getConfig();
            loadSave.value = false;
            useToast("success", "Data berhasil disimpan");
          })
          .catch((err) => {
            loadSave.value = false;
            useToast("error", "Gagal menyimpan data.");
          });
      } else {
        loadSave.value = false;
      }
    })
    .catch((err) => {
      loadSave.value = false;
    });
}

function uploadLogo(title: string) {
  dialogTitle.value = title;
  dialog.value = true;
}

function handleSaveLogo() {
  if (!file.value) {
    useToast("error", "Silakan pilih file terlebih dahulu.");
    return;
  }

  loadingLogo.value = true;
  var fd = new FormData();

  const fileToUpload = Array.isArray(file.value) ? file.value[0] : file.value;

  if (!fileToUpload) {
    useToast("error", "File tidak valid.");
    loadingLogo.value = false;
    return;
  }

  fd.append("file", fileToUpload);

  appConfigService()
    .uploadFile(fd)
    .then((res) => {
      if (dialogTitle.value == "Logo Sistem") {
        editedItem.value.logo = res.data;
      } else if (dialogTitle.value == "Logo Instansi") {
        editedItem.value.childLogo = res.data;
      } else if (dialogTitle.value == "Favicon") {
        editedItem.value.favicon = res.data;
      }

      useToast("success", "Logo berhasil diunggah");
      loadingLogo.value = false;
      handleCloseLogo();
    })
    .catch((err) => {
      useToast("error", "Gagal mengunggah logo.");
      loadingLogo.value = false;
    });
}

function handleCloseLogo() {
  file.value = null;
  dialog.value = false;
}
</script>