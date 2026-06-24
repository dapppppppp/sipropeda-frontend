<template>
  <div>
    <SharedUiBreadcrumb
      :title="pages.title"
      :breadcrumbs="breadcrumbs"
    ></SharedUiBreadcrumb>

    <TableListPenilaian
      :headers="headers"
      :tableData="tableData"
      :loading="isLoading"
      :listTahun="listTahun"
      :listBidang="listBidang"
      :listSumberDana="listSumberDana"
      title="Daftar Usulan (Pilih untuk Dinilai)"
      permission="PENILAIAN"
      @fetchData="loadAll"
      @nilaiItem="openDialogPenilaian"
    >
    </TableListPenilaian>

    <DialogForm
      :show="dialog"
      :persistent="true"
      :reset="resetDialog"
      :formTitle="dialogTitle"
      :isLoading="isLoadingSave"
      @handleSave="handleSave"
      @handleClose="handleClose"
    >
      <v-alert
        v-if="listKriteria.length === 0"
        type="warning"
        variant="tonal"
        class="mb-4"
      >
        Belum ada data Kriteria! Silakan isi Master Kriteria terlebih dahulu.
      </v-alert>

      <div v-else>
        <v-alert
          type="info"
          variant="tonal"
          class="mb-4 text-body-2"
          icon="mdi-information-outline"
        >
          <strong class="text-subtitle-2">Panduan Pengisian Nilai:</strong>
          <ul class="ml-4 mt-1">
            <li><strong>Skala / Rentang Nilai:</strong> Ikuti petunjuk (hint) di bawah masing-masing kolom input. Jika tidak ada rentang khusus yang diminta, Anda bebas memasukkan Nilai Riil (misal: nominal RAB) atau Skala (1-10).</li>
            <li><strong><v-icon size="small" color="success">mdi-arrow-up</v-icon> Kriteria BENEFIT:</strong> Semakin <span class="text-success font-weight-bold">besar</span> nilainya, semakin baik (Prioritas naik).</li>
            <li><strong><v-icon size="small" color="error">mdi-arrow-down</v-icon> Kriteria COST:</strong> Semakin <span class="text-error font-weight-bold">kecil</span> nilainya, semakin baik (Prioritas naik).</li>
          </ul>
        </v-alert>

        <p class="mb-4 text-subtitle-2 text-medium-emphasis">
          Silakan masukkan nilai untuk usulan ini:
        </p>

        <v-row v-for="(kriteria, index) in listKriteria" :key="index" class="mb-1">
          <v-col cols="12">
            <v-label class="mb-2 font-weight-medium">
              {{ kriteria.kode }} - {{ kriteria.nama }} 
              <v-chip size="x-small" :color="kriteria.jenis === 'benefit' ? 'success' : 'error'" class="ml-2">
                {{ kriteria.jenis.toUpperCase() }}
              </v-chip>
            </v-label>
            <v-text-field
              v-model.number="formNilai[kriteria.id]"
              type="number"
              density="compact"
              variant="outlined"
              :rules="getValidationRules(kriteria)"
              :placeholder="`Masukkan nilai untuk ${kriteria.nama}`"
              :hint="getHint(kriteria)"
              persistent-hint
            ></v-text-field>
          </v-col>
        </v-row>
      </div>
    </DialogForm>
  </div>
</template>

<script setup lang="ts">
import usulanProyekService from "@/services/usulan_proyek.service";
import kriteriaService from "@/services/kriteria.service";
import penilaianService from "@/services/penilaian_usulan.service";
import sumberDanaService from "@/services/sumber_dana.service";
import bidangPembangunanService from "@/services/bidang_pembangunan.service";


definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

const pages = ref({ title: "Penilaian Usulan" });
const breadcrumbs = ref([
  { text: "Dashboard", disabled: false, href: "/dashboard" },
  { text: "Transaksi", disabled: true, href: "#" },
  { text: "Penilaian", disabled: true, href: "#" },
]);

const isLoading = ref(false);
const isLoadingSave = ref(false);
const dialog = ref(false);
const resetDialog = ref(true);
const dialogTitle = ref("Form Penilaian");

// Mengubah menjadi object terpaginasi
const tableData = ref<any>({
  items: [],
  meta: {
    totalItems: 0,
  },
});
const listKriteria = ref<any[]>([]);
const listSumberDana = ref<any[]>([]);
const listBidang = ref<any[]>([]); 

const currentYear = new Date().getFullYear();
const listTahun = ref([currentYear - 1, currentYear, currentYear + 1, currentYear + 2]);

const formNilai = ref<any>({});
const selectedUsulan = ref<any>(null);

const headers = ref([
  { title: "No", key: "no", width: "5%", align: "center", sortable: false },
  { title: "Tahun", key: "tahunAnggaran", width: "10%", align: "center" },
  { title: "Nama Kegiatan", key: "namaProyek" },
  { title: "Lokasi", key: "lokasi" },
  { title: "Status", key: "status", align: "center", width: "15%", sortable: false },
  { title: "Aksi", key: "actions", align: "center", width: "12%", sortable: false },
]);

const { checkPermission } = usePermission();
const route = useRoute();

onBeforeMount(() => {
  checkPermission("PENILAIAN.VIEW");
});

onMounted(() => {
  loadMasterKriteria();
  loadMasterSumberDana();
  loadMasterBidang();
});

async function loadMasterBidang() {
  try {
    const res: any = await bidangPembangunanService().retrieve();
    listBidang.value = res.data || [];
  } catch (err) {
    console.error("Gagal load bidang pembangunan", err);
  }
}

async function loadMasterSumberDana() {
  try {
    const res: any = await sumberDanaService().retrieve();
    listSumberDana.value = res.data || [];
  } catch (err) {
    console.error("Gagal load sumber dana", err);
  }
}

async function loadMasterKriteria() {
  try {
    const res: any = await kriteriaService().retrieve();
    listKriteria.value = res.data || [];
  } catch (err) {
    console.error("Gagal load kriteria", err);
  }
}

// Logic loadAll menggunakan parameter route dan membaca meta pagination
async function loadAll() {
  const { pageNumber, pageSize, q, sortBy, sortType, tahun, bidangId, sumberDanaId } = route.query;
  isLoading.value = true;
  try {
    const res: any = await usulanProyekService().retrieve({
      q: q || "",
      pageSize: pageSize ?? 10,
      pageNumber: pageNumber ?? 1,
      sortBy: sortBy || "createdAt",
      sortType: sortType || "desc",
      tahun: tahun || "",
      bidangId: bidangId || "",
      sumberDanaId: sumberDanaId || ""
    });

    const payload = res.data?.data || res.data || {};
    const items = payload.items || (Array.isArray(payload) ? payload : []);
    const meta = payload.meta || {};
    const total = meta.totalItems ?? meta.totalData ?? meta.total_items ?? meta.total ?? items.length ?? 0;

    tableData.value = {
      items: items,
      meta: {
        totalItems: total,
      },
    };
  } catch (err) {
    console.error("Gagal menarik data usulan:", err);
    tableData.value = { items: [], meta: { totalItems: 0 } };
  } finally {
    isLoading.value = false;
  }
}

function getValidationRules(kriteria: any) {
  return [
    (v: any) => v !== null && v !== '' && v >= 0 || 'Wajib diisi angka (Min: 0)',
    (v: any) => {
      const val = Number(v);
      if (val === 0) return true; // 0 selalu diperbolehkan jika tidak masuk kategori ini
      
      if (kriteria.kode === 'K1' && (val < 75 || val > 100)) return 'Nilai K1 harus 0 atau antara 75-100';
      if (kriteria.kode === 'K2' && (val < 50 || val > 74)) return 'Nilai K2 harus 0 atau antara 50-74';
      if (kriteria.kode === 'K3' && (val < 25 || val > 49)) return 'Nilai K3 harus 0 atau antara 25-49';
      if (kriteria.kode === 'K4' && (val < 1 || val > 24)) return 'Nilai K4 harus 0 atau antara 1-24';
      
      return true;
    }
  ];
}

function getHint(kriteria: any) {
  if (kriteria.kode === 'K1') return "Isi 75-100 (atau 0 jika bukan kategori ini)";
  if (kriteria.kode === 'K2') return "Isi 50-74 (atau 0 jika bukan kategori ini)";
  if (kriteria.kode === 'K3') return "Isi 25-49 (atau 0 jika bukan kategori ini)";
  if (kriteria.kode === 'K4') return "Isi 1-24 (atau 0 jika bukan kategori ini)";
  return kriteria.jenis === 'benefit' ? 'Nilai besar lebih baik' : 'Nilai kecil lebih baik';
}

async function openDialogPenilaian(usulan: any) {
  resetDialog.value = false;
  selectedUsulan.value = usulan;
  dialogTitle.value = `Nilai Usulan: ${usulan.namaProyek}`;
  
  formNilai.value = {};
  isLoading.value = true;
  try {
    const res: any = await penilaianService().getByUsulanId(usulan.id);
    if (res && res.data) {
      res.data.forEach((item: any) => {
        formNilai.value[item.kriteriaId] = item.nilaiInput;
      });
    }
  } catch (err) {
    console.error("Gagal menarik riwayat penilaian", err);
  } finally {
    isLoading.value = false;
    dialog.value = true;
  }
}

function handleSave() {
  isLoadingSave.value = true;

  const dataPenilaian = listKriteria.value.map((k) => {
    return {
      kriteriaId: k.id,
      nilaiInput: Number(formNilai.value[k.id]) || 0
    };
  });

  const payload = {
    usulanId: selectedUsulan.value.id,
    data: dataPenilaian
  };

  penilaianService()
    .saveBulk(payload)
    .then(() => {
      handleClose();
      loadAll(); 
      useToast("success", "Penilaian Berhasil Disimpan");
    })
    .catch(() => {
      isLoadingSave.value = false;
    });
}

function handleClose() {
  isLoadingSave.value = false;
  resetDialog.value = true;
  formNilai.value = {};
  selectedUsulan.value = null;
  dialog.value = false;
}
</script>