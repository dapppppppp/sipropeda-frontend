<template>
  <v-card elevation="10">
    <v-row class="ma-sm-n2 ma-n1">
      <v-col cols="12" md="4">
        <v-card elevation="10" class="h-100">
          <v-card-item>
            <h5 class="text-h5">Foto Profil</h5>
            <div class="text-subtitle-1 text-medium-emphasis mt-2">
              Ubah foto profil Anda
            </div>
            <div class="text-center mt-6 mb-6">
              <v-avatar size="120" color="lightprimary">
                <img
                  v-if="previewPhoto"
                  :src="previewPhoto"
                  height="120"
                  alt="Foto Profil"
                  cover
                  @error="onImageError"
                />
                <span v-else class="text-h3 font-weight-bold text-primary">
                  {{ editedUserData?.nama?.charAt(0) || 'U' }}
                </span>
              </v-avatar>
            </div>
            <div class="d-flex justify-center">
              <v-btn color="primary" class="mx-2" flat @click="openFilePicker" :loading="isLoadingUpload">Upload</v-btn>
              <v-btn v-if="selectedFile" color="success" class="mx-2" variant="flat" @click="saveImage" :loading="isLoadingUpload">Simpan</v-btn>
              <v-btn v-if="selectedFile" color="error" class="mx-2" variant="flat" @click="resetImage">Batal</v-btn>
              <input type="file" accept="image/jpeg, image/jpg, image/png" ref="fileInputRef" @change="onFileSelected" style="display: none" />
            </div>
          </v-card-item>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card elevation="10" class="h-100">
          <v-card-item>
            <h5 class="text-h5">Detail Personal</h5>
            <div class="text-subtitle-1 text-medium-emphasis mt-2">
              Informasi Akun Pribadi Anda
            </div>
            <div class="mt-5">
              <v-row>
                <v-col cols="12" md="6">
                  <v-label class="mb-2 font-weight-medium">Nama</v-label>
                  <v-text-field color="primary" variant="outlined" density="compact" v-model="editedUserData.nama" :readonly="!isEditing" hide-details />
                </v-col>
                <v-col cols="12" md="6">
                  <v-label class="mb-2 font-weight-medium">Username</v-label>
                  <v-text-field color="primary" variant="outlined" density="compact" v-model="editedUserData.username" :readonly="!isEditing" hide-details />
                </v-col>
                <v-col cols="12" md="6">
                  <v-label class="mb-2 font-weight-medium">Email</v-label>
                  <v-text-field color="primary" variant="outlined" density="compact" v-model="editedUserData.email" :readonly="!isEditing" hide-details />
                </v-col>
                <v-col cols="12" md="6">
                  <v-label class="mb-2 font-weight-medium">Role</v-label>
                  <v-text-field color="primary" variant="outlined" density="compact" :value="displayRole" readonly hide-details bg-color="grey-lighten-4"></v-text-field>
                </v-col>
              </v-row>

              <div class="d-flex justify-end mt-5">
                <v-btn v-if="!isEditing" color="primary" class="me-2" @click="startEditing" flat>Edit Profil</v-btn>
                <v-btn v-if="isEditing" color="success" class="me-2" @click="saveProfile" :loading="isLoadingSave" flat>Simpan</v-btn>
                <v-btn v-if="isEditing" color="secondary" @click="cancelEditing" flat>Batal</v-btn>
              </div>
            </div>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import userService from "@/services/user.service";
import Swal from "sweetalert2";
import { useToast } from "@/composables/useToast";
import { useRuntimeConfig } from "nuxt/app";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const VALID_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const authStore = useAuthStore();
const config = useRuntimeConfig();

const userData = computed(() => authStore.dataUser);
const displayRole = computed(
  () => userData.value?.roleName || userData.value?.role?.name || userData.value?.role || "-"
);

const isEditing = ref(false);
const isLoadingSave = ref(false);

// KITA UBAH 'name' MENJADI 'nama' SESUAI GOLANG
const editedUserData = ref({
  id: "",
  nama: "", 
  username: "",
  email: "",
  foto: "",
  roleId: "",
});

const startEditing = () => {
  // Ambil data dari state
  editedUserData.value = {
    id: userData.value.id || userData.value.ID,
    nama: userData.value.nama || userData.value.name || "",
    username: userData.value.username || "",
    email: userData.value.email || "",
    foto: userData.value.foto || "",
    roleId: userData.value.roleId || userData.value.role_id || "",
  };
  isEditing.value = true;
};

const cancelEditing = () => {
  isEditing.value = false;
  // Kembalikan seperti semula
  editedUserData.value = {
    id: userData.value.id || userData.value.ID,
    nama: userData.value.nama || userData.value.name || "",
    username: userData.value.username || "",
    email: userData.value.email || "",
    foto: userData.value.foto || "",
    roleId: userData.value.roleId || userData.value.role_id || "",
  };
};

const saveProfile = async () => {
  isLoadingSave.value = true;
  try {
    const payload = {
      id: editedUserData.value.id,
      nama: editedUserData.value.nama, // Sesuai struct request Golang
      username: editedUserData.value.username,
      email: editedUserData.value.email,
      roleId: editedUserData.value.roleId,
    };

    await userService().update(payload);
    
    // Paksa ambil ulang dari server setelah update
    await authStore.fetchUser();

    useToast("success", "Profil berhasil diperbarui");
    isEditing.value = false;
  } catch (err: any) {
    Swal.fire({ icon: "error", title: "Gagal", text: err?.data?.message || err?.message || "Gagal menyimpan" });
  } finally {
    isLoadingSave.value = false;
  }
};

const isLoadingUpload = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const previewPhoto = ref<string | null>(null);
const selectedFile = ref<File | null>(null);

function getPhotoUrl(foto: string | null) {
  if (!foto) return null;
  const baseUrl = config.public.apiUrl || "http://localhost:8080/v1";
  const normalized = foto.replace(/^[\/\\]+/, "").replace(/\\/g, "/");
  return `${baseUrl}/files?path=${encodeURIComponent("/" + normalized)}`;
}

function onImageError() { previewPhoto.value = null; }

const openFilePicker = () => {
  fileInputRef.value?.click();
};

const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    return Swal.fire({ icon: "error", title: "Format Tidak Valid", text: "Format file harus JPG, JPEG, atau PNG." });
  }
  if (file.size > MAX_FILE_SIZE) {
    return Swal.fire({ icon: "error", title: "Ukuran Terlalu Besar", text: "Ukuran file maksimal 2MB." });
  }

  selectedFile.value = file;
  previewPhoto.value = URL.createObjectURL(file);
};

const saveImage = async () => {
  if (!selectedFile.value) return;
  isLoadingUpload.value = true;

  const formData = new FormData();
  formData.append("file", selectedFile.value);
  formData.append("id", userData.value.id || userData.value.ID);

  try {
    await userService().updateFoto(formData);
    // Paksa ambil data terbaru setelah foto diupdate
    await authStore.fetchUser();
    useToast("success", "Foto berhasil diperbarui");
    selectedFile.value = null; 
    previewPhoto.value = getPhotoUrl(authStore.dataUser?.foto);
  } catch (err: any) {
    Swal.fire({ icon: "error", title: "Gagal", text: "Gagal upload foto" });
  } finally {
    isLoadingUpload.value = false;
  }
};

const resetImage = () => {
    selectedFile.value = null;
    previewPhoto.value = getPhotoUrl(userData.value.foto);
    if (fileInputRef.value) fileInputRef.value.value = "";
}

onMounted(async () => {
  try {
    // Kita panggil manual authStore.fetchUser() di sini agar MESTI nembak GET ke backend
    // Ini mengabaikan pengecekan id seperti di CHM, jadi selalu dapat data paling segar
    await authStore.fetchUser();
    
    // Masukkan data dari backend (yang sudah kita tarik barusan) ke form
    editedUserData.value = {
      id: userData.value.id || userData.value.ID,
      nama: userData.value.nama || userData.value.name || "",
      username: userData.value.username || "",
      email: userData.value.email || "",
      foto: userData.value.foto || "",
      roleId: userData.value.roleId || userData.value.role_id || "",
    };
    
    previewPhoto.value = getPhotoUrl(userData.value.foto);
  } catch (err) {
    console.error("Gagal memuat data pengguna:", err);
  }
});
</script>