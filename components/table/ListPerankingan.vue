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
        <template v-slot:item.ranking="{ item }">
          <span class="font-weight-bold text-subtitle-1">
            {{ getRankNumber(item) }}
          </span>
        </template>
        
        <template v-slot:item.nilaiPreferensiV="{ item }">
          <span class="font-weight-bold">
            {{ Number((item.raw ? item.raw.nilaiPreferensiV : item.nilaiPreferensiV)).toFixed(4) }}
          </span>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            color="success"
            size="small"
            variant="tonal"
            prepend-icon="mdi-check-decagram"
            @click="$emit('promosikan', item.raw || item)"
          >
            Promosikan
            <v-tooltip activator="parent" location="bottom">Loloskan ke RAPBDes</v-tooltip>
          </v-btn>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: {
    title: { type: String, default: "Hasil Perankingan TOPSIS" },
    tableData: { type: Array, default: () => [] },
    headers: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
  },
  methods: {
    getRankIndex(item) {
      const dataAsli = item.raw || item; 
      return this.tableData.findIndex(x => x.id === dataAsli.id);
    },
    getRankNumber(item) {
      return this.getRankIndex(item) + 1;
    }
  }
};
</script>