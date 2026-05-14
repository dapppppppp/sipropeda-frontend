<template>
  <DefaultLayout>
    <div
      class="position-relative d-flex align-center justify-center text-white overflow-hidden"
      style="min-height: 500px"
    >
      <div
        class="position-absolute top-0 left-0 right-0 bottom-0"
        style="background: linear-gradient(135deg, #43a047, #81c784)"
      ></div>

      <v-container class="position-relative text-center py-12 py-md-16 px-4">
        <v-row align="center" justify="center">
          <v-col cols="12" md="8">
            <h1 class="text-h2 text-md-h1 font-weight-bold mb-4">
              Tracking Laporan
            </h1>

            <p class="text-subtitle-1 text-md-h6 font-weight-medium mb-4">
              Lacak status laporan aspirasi Anda dengan mudah dan cepat.
            </p>

            <p
              class="text-body-1 mx-auto"
              style="max-width: 600px; opacity: 0.95"
            >
              Masukkan nomor yang Anda terima saat mengirim laporan untuk
              melihat pembaruan status terkini dan tindakan yang diambil oleh
              tim kami.
            </p>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <v-container class="max-width-1218">
      <v-row justify="center">
        <v-col cols="12" md="10" lg="9">
          
          <v-card class="rounded-lg" elevation="0">
            <v-card-text class="pa-6">
              <v-form
                ref="formRef"
                v-model="valid"
                :lazy-validation="true"
                @submit.prevent="onSubmit"
              >
                <v-row class="mt-12 gap-2 flex-column flex-sm-row">
                  <CustomBaseInput
                    type="input"
                    v-model="form.nomorComplaint"
                    :rules="[rules.required]"
                    label=""
                    placeholder="Masukkan Nomor Laporan Anda"
                    variant="outlined"
                    density="default"
                    :hide-details="false"
                  />
                  <v-btn
                    :disabled="!valid"
                    class="px-8"
                    :loading="submitting"
                    color="primary"
                    type="submit"
                    variant="flat"
                    size="x-large"
                  >
                    Lacak
                  </v-btn>
                </v-row>

                <div class="mt-12 mb-8" v-if="komplainHistory.length > 0">
                  <v-timeline
                    :direction="timelineDirection"
                    :side="timelineSide"
                    align="center"
                  >
                  <v-timeline-item
                    v-for="(item, index) in komplainHistory"
                    :key="item.id"
                    :dot-color="getStatusColor(item.statusKomplain)"
                    :icon="getStatusIcon(item.status)"
                    icon-color="white"
                    fill-dot
                    size="default"
                  >
                    <div class="text-center px-2">
                      
                      <div class="text-body-1 font-weight-bold mb-2">
                        {{ getHistoryName(item) }}
                      </div>

                      <div 
                        class="text-h5 font-weight-black text-uppercase mb-2"
                        :class="`text-${getStatusColor(item.status)}`"
                        style="line-height: 1.3;"
                      >
                        {{ item.statusKomplain }}
                      </div>

                      <div 
                        v-if="item.statusKomplain === 'DITERUSKAN' && item.namaInstansi"
                        class="text-body-2 font-weight-bold text-grey-darken-2 mb-2"
                      >
                        ke {{ item.namaInstansi }}
                      </div>

                      <div 
                        v-if="item.tanggapan" 
                        class="text-body-2 font-italic text-grey-darken-1 mb-2 mx-auto"
                        style="line-height: 1.4; max-width: 300px;"
                      >
                        "{{ item.tanggapan }}"
                      </div>

                      <div class="text-body-2 text-medium-emphasis mt-2">
                        {{
                          new Date(item.createdAt).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        }}
                      </div>
                    </div>
                  </v-timeline-item>
                  </v-timeline>
                </div>
                <div v-else class="mt-12 mb-16 text-center"></div>
              </v-form>
            </v-card-text>
          </v-card>

          <v-expand-transition>
            <v-card
              v-if="komplainHistory.length > 0 && isStatusClose"
              class="rounded-lg mt-6 border"
              elevation="0"
            >
              <v-card-text class="pa-6 text-center">

                <div v-if="existingRating">
                  <h3 class="text-h5 font-weight-bold mb-2 text-amber-darken-2">
                    Ulasan Anda
                  </h3>
                  <div class="d-flex justify-center mb-2">
                    <v-rating
                      :model-value="existingRating.rating"
                      color="amber-darken-2"
                      active-color="amber-darken-2"
                      readonly
                      size="large"
                      half-increments
                    ></v-rating>
                  </div>
                  <p class="text-body-1 font-italic text-grey-darken-2 mb-4">
                    "{{ existingRating.komentar || '-' }}"
                  </p>
                  <v-alert type="success" variant="tonal" density="compact" class="d-inline-flex">
                    Terima kasih atas masukan Anda.
                  </v-alert>
                </div>

                <div v-else-if="!reviewSubmitted">
                  <h3 class="text-h5 font-weight-bold mb-2">
                    Bagaimana layanan kami?
                  </h3>
                  <p class="text-body-2 text-medium-emphasis mb-6">
                    Bantu kami meningkatkan kualitas layanan dengan memberikan ulasan Anda.
                  </p>

                  <v-form ref="reviewFormRef" @submit.prevent="onSubmitReview">
                    <div class="d-flex justify-center mb-4">
                      <v-rating
                        v-model="ratingForm.stars"
                        color="amber-darken-1"
                        active-color="amber-darken-1"
                        hover
                        size="large"
                        half-increments
                      ></v-rating>
                    </div>

                    <v-textarea
                      v-model="ratingForm.comment"
                      variant="outlined"
                      :placeholder="dynamicLabel"
                      rows="3"
                      auto-grow
                      hide-details="auto"
                      class="mb-4"
                    ></v-textarea>

                    <v-btn
                      color="primary"
                      variant="flat"
                      size="large"
                      :loading="submittingReview"
                      :disabled="ratingForm.stars === 0"
                      @click="onSubmitReview"
                    >
                      Kirim Ulasan
                    </v-btn>
                  </v-form>
                </div>

                <div v-else class="py-8">
                  <v-icon
                    icon="mdi-check-circle-outline"
                    color="success"
                    size="64"
                    class="mb-4"
                  ></v-icon>
                  <h3 class="text-h5 font-weight-bold text-success mb-2">
                    Terima Kasih!
                  </h3>
                  <p class="text-body-1">
                    Ulasan Anda sangat berharga bagi kami.
                  </p>
                </div>

              </v-card-text>
            </v-card>
          </v-expand-transition>

        </v-col>
      </v-row>
    </v-container>
  </DefaultLayout>
</template>

<script setup lang="ts">
import DefaultLayout from "@/pages/Layout.vue";
import { useDisplay } from "vuetify";
import Swal from "sweetalert2";
import handlingKomplainService from "@/services/handlingKomplain.service";
import komplainUlasanService from "@/services/komplainUlasan.service"; 
import { Status } from "@/constants";

definePageMeta({ layout: "blank" });

const form = ref<any>({});
const valid = ref(false);
const submitting = ref(false);
const komplainHistory = ref<any[]>([]);
const idKomplainFound = ref(""); 

const isStatusClose = ref(false);

const rules = {
  required: (v: any) => !!v || "Wajib diisi",
};

const reviewFormRef = ref<any>(null);
const submittingReview = ref(false);
const reviewSubmitted = ref(false);
const ratingForm = ref({
  stars: 0,
  comment: "",
});
const existingRating = ref<any>(null);

const authStore = useAuthStore();
const dataUser = computed(() => authStore.dataUser);

const { xs } = useDisplay();

const timelineDirection = computed(() =>
  xs.value ? "vertical" : "horizontal"
);

const timelineSide = computed(() => {
  return xs.value ? "end" : undefined; 
});

const getStatusColor = (statusId: number) => {
  const status = Object.values(Status).find((s) => s.id === statusId);
  return status ? status.color : "primary";
};

const getStatusIcon = (statusId: number) => {
  const status = Object.values(Status).find((s) => s.id === statusId);
  return status ? status.icon : "mdi-circle";
};

const getHistoryName = (item: any) => {
  if (item.statusKomplain === 'DITANGGAPI' && item.namaInstansi) {
    return item.namaInstansi;
  }
  
  return item.createdByName || "System";
};

const dynamicLabel = computed(() => {
  const stars = ratingForm.value.stars;
  switch (stars) {
    case 1:
      return "Mohon maaf atas ketidaknyamanan ini. Apa yang membuat Anda kecewa?";
    case 2:
      return "Apa kekurangan layanan kami? Masukan Anda sangat berarti.";
    case 3:
      return "Apa yang perlu kami tingkatkan agar layanan lebih baik?";
    case 4:
      return "Terima kasih! Apa yang Anda sukai dari layanan kami?";
    case 5:
      return "Wow, terima kasih! Apa yang paling berkesan bagi Anda?";
    default:
      return "Tulis ulasan Anda (Opsional)";
  }
});

async function checkExistingRating(idKomplain: string) {
  try {
    const response = await komplainUlasanService().resolveById(idKomplain);
    const found = response?.data;

    if (found && found.id && found.id !== '00000000-0000-0000-0000-000000000000') {
      console.log("Ulasan ditemukan:", found);
      existingRating.value = found;
    } else {
      existingRating.value = null;
    }
  } catch (error) {
    existingRating.value = null;
  }
}

async function onSubmit() {
  submitting.value = true;
  
  reviewSubmitted.value = false;
  ratingForm.value = { stars: 0, comment: "" };
  idKomplainFound.value = ""; 
  komplainHistory.value = [];
  existingRating.value = null;
  isStatusClose.value = false;

  try {
    const response = await handlingKomplainService().searchKomplain(
      form.value.nomorComplaint
    );
    
    const data = response.data || [];
    komplainHistory.value = data;

    if (data.length > 0) {
      const firstItem = data[0];
      
      isStatusClose.value = data.some((item: any) => item.statusKomplain === 'CLOSE');

      idKomplainFound.value = 
        firstItem.trxId ||       
        firstItem.trx_id ||     
        firstItem.idKomplain || 
        firstItem.id;           
        
      console.log("ID Komplain Valid (trxId):", idKomplainFound.value);
      if (idKomplainFound.value && isStatusClose.value) {
        await checkExistingRating(idKomplainFound.value);
      }
    }

  } catch (error) {
    console.error("Gagal tracking:", error);
    komplainHistory.value = [];
    idKomplainFound.value = "";
  } finally {
    submitting.value = false;
  }
}

async function onSubmitReview() {
  if (ratingForm.value.stars === 0) {
     await Swal.fire("Perhatian", "Mohon berikan bintang rating terlebih dahulu.", "warning");
     return;
  }

  if (!idKomplainFound.value) {
     await Swal.fire("Error", "Data komplain tidak valid. Silakan lakukan pelacakan ulang.", "error");
     return;
  }

  submittingReview.value = true;
  
  try {
    const payload = {
       idKomplain: idKomplainFound.value,
       idUser: dataUser.value?.id || null, 
       rating: ratingForm.value.stars, 
       komentar: ratingForm.value.comment || "-"
    };

    const response = await komplainUlasanService().createUlasan(payload);
    
    if (response) {
      reviewSubmitted.value = true;
      await Swal.fire({
        title: "Terima Kasih!",
        text: "Ulasan Anda berhasil dikirim.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
    }
  } catch (error: any) {
    console.error("Gagal mengirim ulasan", error);
    await Swal.fire({
      title: "Gagal",
      text: error?.response?.data?.error || error?.message || "Gagal mengirim ulasan.",
      icon: "error"
    });
  } finally {
    submittingReview.value = false;
  }
}
</script>