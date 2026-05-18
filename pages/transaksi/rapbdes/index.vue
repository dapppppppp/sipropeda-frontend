<template>
  <div>
    <SharedUiBreadcrumb :title="pages.title" :breadcrumbs="breadcrumbs"></SharedUiBreadcrumb>

    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-autocomplete
          v-model="selectedTahun"
          :items="listTahun"
          label="Tahun Anggaran"
          color="primary"
          variant="outlined"
          density="compact"
          hide-details
          @update:modelValue="loadData"
        ></v-autocomplete>
      </v-col>
    </v-row>

    <v-row class="mb-4" v-if="kartuKeuangan.length > 0">
      <v-col cols="12" md="4" v-for="(kartu, index) in kartuKeuangan" :key="index">
        <v-card :elevation="3" :class="kartu.sisa < 0 ? 'bg-error-lighten-4' : 'bg-white'">
          <v-card-text>
            <div class="text-subtitle-1 font-weight-bold mb-2">{{ kartu.namaSumber }}</div>
            <v-divider class="mb-2"></v-divider>
            <div class="d-flex justify-space-between text-body-2 mb-1">
              <span>Pagu Anggaran:</span>
              <span class="font-weight-bold text-primary">{{ formatRupiah(kartu.pagu) }}</span>
            </div>
            <div class="d-flex justify-space-between text-body-2 mb-1">
              <span>Total RAB Terpakai:</span>
              <span class="font-weight-bold text-warning">{{ formatRupiah(kartu.terpakai) }}</span>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="d-flex justify-space-between text-subtitle-2">
              <span>{{ kartu.sisa < 0 ? 'DEFISIT :' : 'SISA PAGU :' }}</span>
              <span :class="kartu.sisa < 0 ? 'text-error font-weight-black' : 'text-success font-weight-black'">
                {{ formatRupiah(kartu.sisa) }}
              </span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-alert v-else type="info" variant="tonal" class="mb-6">
      Pagu Anggaran untuk tahun {{ selectedTahun }} belum diatur. Silakan atur di menu Pagu Anggaran.
    </v-alert>

    <TableListRAPBDes
      :headers="headers"
      :tableData="tableData"
      :loading="isLoading"
      permission="RAPBDES"
      title="Daftar Usulan Sinkronisasi (RAPBDes)"
      @editItem="openEditDialog"
      @kembalikan="kembalikanKeRKP"
      @sahkan="sahkanKeAPBDes"
    >
    </TableListRAPBDes>

    <DialogForm
      :show="dialog"
      :persistent="true"
      :reset="resetDialog"
      formTitle="Revisi Sumber Dana & RAB"
      :isLoading="isLoadingSave"
      @handleSave="simpanRevisi"
      @handleClose="dialog = false"
    >
      <v-label class="mb-2 font-weight-medium">Sumber Dana</v-label>
      <v-autocomplete
        v-model="editedItem.sumberDanaId"
        :items="listSumberDana"
        item-value="id"
        item-title="namaSumber"
        color="primary"
        variant="outlined"
        density="compact"
        :rules="[(v) => !!v || 'Wajib diisi']"
        placeholder="Pilih Sumber Dana"
        hide-details="auto"
      ></v-autocomplete>

      <v-label class="mb-2 mt-3 font-weight-medium">Nilai RAB Baru (Rp)</v-label>
      <v-text-field
        v-model.number="editedItem.nilaiRab"
        type="number"
        density="compact"
        :rules="[(v) => !!v || 'Wajib diisi', (v) => v > 0 || 'RAB harus lebih dari 0']"
        hide-details="auto"
      ></v-text-field>
    </DialogForm>

  </div>
</template>

<script setup lang="ts">
import Swal from "sweetalert2";
import usulanProyekService from "@/services/usulan_proyek.service";
import paguAnggaranService from "@/services/pagu_anggaran.service";
import sumberDanaService from "@/services/sumber_dana.service";

definePageMeta({ layout: "admin", middleware: ["auth"] });

const pages = ref({ title: "Sinkronisasi RAPBDes" });
const breadcrumbs = ref([
  { text: "Dashboard", disabled: false, href: "/dashboard" },
  { text: "Transaksi", disabled: true, href: "#" },
  { text: "RAPBDes", disabled: true, href: "#" },
]);

const currentYear = new Date().getFullYear();
const listTahun = ref([currentYear - 1, currentYear, currentYear + 1]);
const selectedTahun = ref(currentYear);

const isLoading = ref(false);
const isLoadingSave = ref(false);
const dialog = ref(false);
const resetDialog = ref(true);

const tableData = ref<any[]>([]);
const listSumberDana = ref<any[]>([]);
const kartuKeuangan = ref<any[]>([]);
const editedItem = ref<any>({});

const headers = ref([
  { title: "No", key: "no", width: "5%", align: "center", sortable: false },
  { title: "Nama Usulan Proyek", key: "namaProyek" },
  { title: "Sumber Dana", key: "sumberDanaName", align: "center" },
  { title: "Nilai RAB", key: "nilaiRab", align: "right" },
  { title: "Aksi", key: "actions", align: "center", width: "15%", sortable: false },
]);

const { checkPermission } = usePermission();

onBeforeMount(() => {
  checkPermission("RAPBDES.VIEW");
});

onMounted(() => {
  loadMasterSumberDana();
  loadData();
});

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);
}

async function loadMasterSumberDana() {
  try {
    const res: any = await sumberDanaService().retrieve();
    listSumberDana.value = res.data || [];
  } catch (err) { console.error(err); }
}

async function loadData() {
  isLoading.value = true;
  try {
    // 1. Tarik Pagu Anggaran
    const resPagu: any = await paguAnggaranService().retrieve();
    const paguTahunIni = (resPagu.data || []).filter((p: any) => p.tahun === selectedTahun.value);

    // 2. Tarik Semua Usulan Proyek
    const resUsulan: any = await usulanProyekService().retrieve();
    const semuaUsulan = resUsulan.data || [];

    // Filter usulan khusus tahap RAPBDes untuk tabel
    tableData.value = semuaUsulan.filter((u: any) => u.tahunAnggaran === selectedTahun.value && u.statusTahapan === 'RAPBDes');
    
    // Usulan yang ikut menguras pagu adalah yang statusnya RAPBDes ATAU APBDes
    const usulanMengurasPagu = semuaUsulan.filter((u: any) => u.tahunAnggaran === selectedTahun.value && (u.statusTahapan === 'RAPBDes' || u.statusTahapan === 'APBDes'));

    // 3. Kalkulasi Kartu Keuangan
    kartuKeuangan.value = paguTahunIni.map((pagu: any) => {
      // Hitung total RAB usulan yang memakai sumber dana ini
      const terpakai = usulanMengurasPagu
        .filter((u: any) => u.sumberDanaId === pagu.sumberDanaId)
        .reduce((sum: number, u: any) => sum + Number(u.nilaiRab), 0);
      
      return {
        sumberDanaId: pagu.sumberDanaId,
        namaSumber: pagu.sumberDanaName,
        pagu: Number(pagu.jumlahPagu),
        terpakai: terpakai,
        sisa: Number(pagu.jumlahPagu) - terpakai
      };
    });

  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}

function openEditDialog(item: any) {
  resetDialog.value = false;
  editedItem.value = JSON.parse(JSON.stringify(item));
  dialog.value = true;
}

async function simpanRevisi() {
  isLoadingSave.value = true;
  try {
    await usulanProyekService().save(editedItem.value);
    useToast("success", "Revisi berhasil disimpan!");
    dialog.value = false;
    loadData(); // Refresh data dan kartu keuangan
  } catch (err) {
    console.error(err);
  } finally {
    isLoadingSave.value = false;
  }
}

async function kembalikanKeRKP(item: any) {
  Swal.fire({
    title: "Kembalikan ke RKP?",
    text: `Usulan [${item.namaProyek}] akan ditarik mundur ke tahap RKP.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    confirmButtonText: "Ya, Kembalikan",
    cancelButtonText: "Batal"
  }).then(async (result) => {
    if (result.isConfirmed) {
      item.statusTahapan = 'RKP';
      await usulanProyekService().save(item);
      useToast("success", "Usulan dikembalikan ke RKP");
      loadData();
    }
  });
}

async function sahkanKeAPBDes(item: any) {
  // Validasi 1: Harus punya sumber dana
  if (!item.sumberDanaId) {
    Swal.fire("Gagal", "Silakan set Sumber Dana terlebih dahulu lewat tombol Edit (Revisi)!", "error");
    return;
  }

  // Validasi 2: Cek Defisit di Kartu Keuangan (UR-F18)
  const kartu = kartuKeuangan.value.find(k => k.sumberDanaId === item.sumberDanaId);
  if (kartu && kartu.sisa < 0) {
    Swal.fire("Anggaran Defisit!", `Tidak dapat mengesahkan karena anggaran ${kartu.namaSumber} sedang defisit. Silakan revisi RAB atau kembalikan usulan lain ke RKP.`, "error");
    return;
  }

  Swal.fire({
    title: "Sahkan ke APBDes?",
    text: `Usulan [${item.namaProyek}] akan ditetapkan final sebagai APBDes.`,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#28a745",
    confirmButtonText: "Ya, Sahkan!"
  }).then(async (result) => {
    if (result.isConfirmed) {
      item.statusTahapan = 'APBDes';
      await usulanProyekService().save(item);
      useToast("success", "Usulan resmi masuk APBDes!");
      loadData();
    }
  });
}
</script>