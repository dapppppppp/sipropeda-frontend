<template>
  <div>
    <v-card class="mx-auto" width="800">
      <v-card-title class="text-center bg-primary"
        >Konfigurasi Sistem
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-form ref="form" :disabled="loadSave || loading">
          <v-row>
            <v-col cols="12">
              <div class="d-flex align-center">
                <v-icon class="mr-3" color="#B388FF">mdi-web</v-icon>
                <h3 class="my-2">Informasi Umum</h3>
              </div>
              <v-divider></v-divider>

              <v-label class="mb-2 mt-6">ID Sistem</v-label>
              <CustomBaseInput
                type="input"
                v-model="editedItem.id"
                :rules="[(v) => !!v || 'Wajib diisi!']"
                variant="outlined"
                density="comfortable"
                disabled
              />
              <v-label class="mb-2 mt-3">Nama Sistem</v-label>
              <CustomBaseInput
                type="input"
                v-model="editedItem.namaSistem"
                :rules="[(v) => !!v || 'Wajib diisi!']"
                variant="outlined"
                density="comfortable"
              />
              <v-label class="mb-2 mt-3">Tagline</v-label>
              <CustomBaseInput
                type="input"
                v-model="editedItem.tagline"
                variant="outlined"
                density="comfortable"
              />
              <v-label class="mb-2 mt-3">URL Root</v-label>
              <CustomBaseInput
                type="input"
                v-model="editedItem.urlRoot"
                :rules="[(v) => !!v || 'Wajib diisi!']"
                variant="outlined"
                density="comfortable"
              />
              <v-label class="mb-2 mt-3">Status Sistem</v-label>
              <CustomBaseInput
                type="input"
                v-model="editedItem.status"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12">
              <div class="d-flex align-center">
                <v-icon class="mr-3" color="primary"
                  >mdi-office-building-outline</v-icon
                >
                <h3 class="my-2">Informasi Instansi</h3>
              </div>
              <v-divider></v-divider>

              <v-label class="mb-2 mt-6">Nama Instansi</v-label>
              <CustomBaseInput
                type="input"
                v-model="editedItem.instansi"
                :rules="[(v) => !!v || 'Wajib diisi!']"
                variant="outlined"
                density="comfortable"
              />
              <v-label class="mb-2 mt-3">Email Instansi</v-label>
              <CustomBaseInput
                type="input"
                v-model="editedItem.emailInstansi"
                :rules="emailRules"
                variant="outlined"
                density="comfortable"
              />

              <v-label class="mb-2 mt-3">Jalan</v-label>
              <CustomBaseInput
                type="textarea"
                v-model="editedItem.jalan"
                variant="outlined"
                density="comfortable"
                :rows="2"
              />
              <v-row>
                <v-col cols="6">
                  <v-label class="mb-2 mt-3">Kelurahan</v-label>
                  <CustomBaseInput
                    type="input"
                    v-model="editedItem.kelurahan"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="6">
                  <v-label class="mb-2 mt-3">Kecamatan</v-label>
                  <CustomBaseInput
                    type="input"
                    v-model="editedItem.kecamatan"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="6">
                  <v-label class="mb-2 mt-3">Kabupaten/Kota</v-label>
                  <CustomBaseInput
                    type="input"
                    v-model="editedItem.kabupaten"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="6">
                  <v-label class="mb-2 mt-3">Provinsi</v-label>
                  <CustomBaseInput
                    type="input"
                    v-model="editedItem.provinsi"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="6">
                  <v-label class="mb-2 mt-3">Kode Pos</v-label>
                  <CustomBaseInput
                    type="input"
                    v-model="editedItem.kodePos"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
              </v-row>
              <v-label class="mb-2 mt-3">Telepon</v-label>
              <CustomBaseInput
                type="input"
                v-model="editedItem.telp"
                variant="outlined"
                density="comfortable"
              />
              <v-label class="mb-2 mt-3">Fax</v-label>
              <CustomBaseInput
                type="input"
                v-model="editedItem.fax"
                variant="outlined"
                density="comfortable"
              />

              <v-label class="mb-2 mt-3">Logo Sistem</v-label>
              <div
                @click="uploadLogo('Logo Sistem')"
                style="width: 140px; height: 140px; border: 1px dashed #aaa"
              >
                <v-img
                  :src="`/api/files?path=${editedItem.logo}`"
                  width="100%"
                  height="100%"
                ></v-img>
              </div>

              <v-label class="mb-2 mt-3">Logo Instansi</v-label>
              <div
                @click="uploadLogo('Logo Instansi')"
                style="width: 140px; height: 140px; border: 1px dashed #aaa"
              >
                <v-img
                  :src="`/api/files?path=${editedItem.childLogo}`"
                  width="100%"
                  height="100%"
                ></v-img>
              </div>

              <v-label class="mb-2 mt-3">Favicon</v-label>
              <div
                @click="uploadLogo('Favicon')"
                style="width: 140px; height: 140px; border: 1px dashed #aaa"
              >
                <v-img
                  :src="`/api/files?path=${editedItem.favicon}`"
                  width="100%"
                  height="100%"
                ></v-img>
              </div>
            </v-col>

            <v-col cols="12">
              <div class="d-flex align-center">
                <v-icon class="mr-3" color="info">mdi-email-outline</v-icon>
                <h3 class="my-2">Konfigurasi SMTP</h3>
              </div>
              <v-divider></v-divider>

              <v-label class="mb-2 mt-3">Port</v-label>
              <CustomBaseInput
                type="input"
                v-model="editedItem.portSmtp"
                @keypress="isNumber"
                :rules="[(v) => !!v || 'Wajib diisi!']"
                variant="outlined"
                density="comfortable"
              />
              <v-label class="mb-2 mt-3">Email</v-label>
              <CustomBaseInput
                type="input"
                v-model="editedItem.emailSmtp"
                :rules="emailRules"
                variant="outlined"
                density="comfortable"
              />
              <v-label class="mb-2 mt-3">Password</v-label>
              <CustomBaseInput
                v-model="editedItem.passSmtp"
                :rules="[(v) => !!v || 'Wajib diisi!']"
                variant="outlined"
                density="comfortable"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                @click:append-inner="showPassword = !showPassword"
              />
            </v-col>

            <v-col cols="12">
              <div class="d-flex align-center">
                <v-icon class="mr-3" color="success">mdi-api</v-icon>
                <h3 class="my-2">Info Lainnya</h3>
              </div>
              <v-divider></v-divider>

              <v-label class="mb-2 mt-6">Server API Firebase</v-label>
              <CustomBaseInput
                type="input"
                v-model="editedItem.serverApiFirebase"
                variant="outlined"
                density="comfortable"
              />
              <v-label class="mb-2 mt-3">Base URL</v-label>
              <CustomBaseInput
                type="input"
                v-model="editedItem.baseUrl"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="justify-center">
        <v-btn
          @click="handleCancel"
          variant="tonal"
          :disabled="loadSave || loading"
          >Batal</v-btn
        >
        <v-btn
          @click="handleSave"
          color="primary"
          variant="flat"
          :loading="loadSave"
          :disabled="loadSave || loading"
          >Simpan</v-btn
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
      <v-label class="mt-3 mb-2">{{ dialogTitle }}</v-label>
      <v-file-input
        v-model="file"
        accept="image/*"
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

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

const editedItem: any = ref({});
var loading: any = ref(false);
var loadSave: any = ref(false);
var showPassword = ref(false);
var form: any = ref(null);

var dialog = ref(false);
var dialogTitle = ref("Ubah Logo");
var loadingLogo = ref(false);
var file: any = ref(null);

const emailRules = ref([
  (v: string) => !!v || "Wajib diisi",
  (v: string) => /.+@.+\..+/.test(v) || "Format email salah",
]);

const { checkPermission } = usePermission();
onBeforeMount(() => {
  checkPermission("APPCONFIG.VIEW");
});

onMounted(() => {
  getConfig();
});

function isNumber(event: any) {
  const regex = /\d/;
  if (!regex.test(event.key)) {
    event.preventDefault();
  }
}

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

  if (payload.portSmtp !== null && payload.portSmtp !== undefined) {
    payload.portSmtp = parseInt(payload.portSmtp, 10);

    if (isNaN(payload.portSmtp)) {
      payload.portSmtp = null;
    }
  }

  Swal.fire({
    title: "Simpan",
    text: "Apakah anda yakin ingin menyimapan data ?",
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
