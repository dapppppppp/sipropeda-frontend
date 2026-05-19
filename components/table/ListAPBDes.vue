<template>
  <v-card class="print-card">
    <div class="d-sm-flex align-center justify-space-between bg-primary hide-on-print">
      <v-card-title>{{ title }}</v-card-title>
    </div>
    <v-divider class="hide-on-print"></v-divider>
    <v-card-text class="pa-0 pa-md-4">
      <div class="show-on-print text-center mb-6">
        <h2 class="text-uppercase">Dokumen APBDes Murni</h2>
        <h3 class="text-uppercase">Tahun Anggaran {{ tahun }}</h3>
        <p>Pemerintah Desa (Nama Desa Anda)</p>
        <v-divider class="mt-4 border-opacity-100"></v-divider>
        <v-divider class="mt-1 mb-4 border-opacity-100" style="border-width: 2px;"></v-divider>
      </div>

      <v-data-table
        class="datatabels productlist"
        :headers="headers"
        :items="tableData"
        :loading="loading"
        item-value="id"
        hide-default-footer
        :items-per-page="-1"
        :group-by="[{ key: 'sumberDanaName' }]"
      >
        <template v-slot:group-header="{ item, columns, toggleGroup, isGroupOpen }">
          <tr>
            <td :colspan="columns.length" class="bg-grey-lighten-4 font-weight-bold">
              <v-btn
                variant="text"
                :icon="isGroupOpen(item) ? 'mdi-chevron-down' : 'mdi-chevron-right'"
                size="small"
                class="mr-2 hide-on-print"
                @click="toggleGroup(item)"
              ></v-btn>
              Sumber Dana: <span class="text-primary text-uppercase">{{ item.value || 'Belum Diset' }}</span>
            </td>
          </tr>
        </template>

        <template v-slot:[`item.no`]="{ index }">
          {{ index + 1 }}.
        </template>

        <template v-slot:[`item.nilaiRab`]="{ item }">
          <span>{{ formatRupiah(item.nilaiRab) }}</span>
        </template>
        
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: {
    title: { type: String, default: "Dokumen APBDes Final" },
    tableData: { type: Array, default: () => [] },
    headers: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    tahun: { type: Number, default: new Date().getFullYear() }
  },
  methods: {
    formatRupiah(value) {
      if (!value) return "Rp 0";
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    }
  }
};
</script>

<style scoped>
/* CSS Khusus untuk Cetak (Print) */
.show-on-print {
  display: none;
}

@media print {
  .hide-on-print {
    display: none !important;
  }
  .show-on-print {
    display: block !important;
  }
  .print-card {
    box-shadow: none !important;
    border: none !important;
  }
  /* Mengatur tabel agar lebih rapi saat diprint */
  :deep(.v-table) {
    border: 1px solid #000;
  }
  :deep(th), :deep(td) {
    border: 1px solid #000 !important;
    color: #000 !important;
  }
}
</style>