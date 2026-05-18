<template>
  <v-card>
    <div class="d-sm-flex align-center justify-space-between bg-primary">
      <v-card-title>{{ title }}</v-card-title>
    </div>
    <v-divider></v-divider>
    <v-card-text>
      <v-data-table
        class="datatabels productlist mt-3"
        :headers="headers"
        :items="tableData"
        :loading="loading"
        item-value="id"
        hide-default-footer
        :items-per-page="-1" 
      >
        <template v-slot:[`item.no`]="{ index }">
          {{ index + 1 }}.
        </template>
        
        <template v-slot:[`item.sumberDanaName`]="{ item }">
          <v-chip v-if="item.sumberDanaName" color="success" size="small" label>
            {{ item.sumberDanaName }}
          </v-chip>
          <v-chip v-else color="error" size="small" label variant="outlined">
            Belum Diset
          </v-chip>
        </template>

        <template v-slot:[`item.nilaiRab`]="{ item }">
          <span class="font-weight-bold">{{ formatRupiah(item.nilaiRab) }}</span>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-btn
            v-if="hasPermission('UPDATE')"
            color="warning"
            size="small"
            variant="tonal"
            class="mr-1"
            icon
            @click="$emit('editItem', item)"
          >
            <v-icon size="18">mdi-pencil</v-icon>
            <v-tooltip activator="parent" location="bottom">Revisi RAB / Sumber Dana</v-tooltip>
          </v-btn>

          <v-btn
            v-if="hasPermission('UPDATE')"
            color="error"
            size="small"
            variant="tonal"
            class="mr-1"
            icon
            @click="$emit('kembalikan', item)"
          >
            <v-icon size="18">mdi-arrow-u-left-top</v-icon>
            <v-tooltip activator="parent" location="bottom">Kembalikan ke RKP</v-tooltip>
          </v-btn>

          <v-btn
            v-if="hasPermission('UPDATE')"
            color="success"
            size="small"
            variant="flat"
            icon
            @click="$emit('sahkan', item)"
          >
            <v-icon size="18">mdi-check-all</v-icon>
            <v-tooltip activator="parent" location="bottom">Sahkan ke APBDes</v-tooltip>
          </v-btn>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: {
    title: { type: String, default: "Daftar Usulan RAPBDes" },
    tableData: { type: Array, default: () => [] },
    headers: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    permission: { type: String, default: "" },
  },
  methods: {
    hasPermission(val) {
      const { hasPermission } = usePermission();
      return hasPermission(`${this.permission}.${val}`);
    },
    formatRupiah(value) {
      if (!value) return "Rp 0";
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    }
  }
};
</script>