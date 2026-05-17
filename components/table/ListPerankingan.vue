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
        <template v-slot:[`item.ranking`]="{ item }">
          <v-avatar
            :color="item.ranking === 1 ? 'warning' : item.ranking === 2 ? 'grey-lighten-1' : item.ranking === 3 ? 'brown-lighten-1' : 'primary'"
            size="32"
            class="text-white font-weight-bold"
          >
            {{ item.ranking }}
          </v-avatar>
        </template>
        
        <template v-slot:[`item.nilaiPreferensiV`]="{ item }">
          <span class="font-weight-bold">{{ Number(item.nilaiPreferensiV).toFixed(4) }}</span>
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
  }
};
</script>