<template>
  <v-card>
    <div class="d-sm-flex align-center justify-space-between bg-primary">
      <v-card-title>{{ title }}</v-card-title>
      <v-btn variant="text" icon @click="handleRefreshItems">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </div>
    <v-divider></v-divider>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="8"></v-col>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="filter.q"
            density="compact"
            label="Cari Kriteria ( Tekan Enter )"
            @keyup.enter="handleApplyFilter"
            @click:clear="handleClear"
            hide-details
            single-line
            clearable
          >
            <template v-slot:append-inner>
              <v-tooltip location="bottom">
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" icon="mdi-magnify" @click="handleApplyFilter"></v-icon>
                </template>
                Cari
              </v-tooltip>
            </template>
            <template v-slot:append>
              <v-btn v-if="hasPermission('CREATE')" color="primary" icon @click="handleAddItem" size="32" variant="tonal">
                <v-icon left dark> mdi-plus-circle-outline</v-icon>
                <v-tooltip activator="parent" location="bottom">Tambah</v-tooltip>
              </v-btn>
            </template>
          </v-text-field>
        </v-col>
      </v-row>

      <br />
      <v-data-table
        class="datatabels productlist"
        :headers="headers"
        :items="tableData"
        :loading="loading"
        item-value="id"
        hide-default-footer
      >
        <template v-slot:[`item.no`]="{ index }">
          {{ index + 1 }}.
        </template>
        <template v-slot:[`item.jenis`]="{ item }">
          <v-chip :color="item.jenis === 'benefit' ? 'success' : 'error'" size="small" label>
            {{ item.jenis.toUpperCase() }}
          </v-chip>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn
            v-if="hasPermission('UPDATE')"
            icon
            variant="tonal"
            color="warning"
            size="32"
            class="mr-1"
            @click="handleEditItem(item)"
          >
            <v-icon size="18">mdi-pencil</v-icon>
            <v-tooltip activator="parent" location="bottom">Edit</v-tooltip>
          </v-btn>

          <v-btn
            v-if="hasPermission('DELETE')"
            icon
            variant="tonal"
            color="error"
            size="32"
            class="mr-1"
            @click="deleteItem(item)"
          >
            <v-icon size="18">mdi-delete</v-icon>
            <v-tooltip activator="parent" location="bottom">Hapus</v-tooltip>
          </v-btn>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: {
    title: { type: String },
    tableData: { type: Array, default: () => [] },
    headers: { type: Array, default: () => [] },
    permission: { type: String, default: "" },
    loading: { type: Boolean, default: false },
  },
  data() {
    return {
      filter: {
        q: "",
      },
    };
  },
  methods: {
    hasPermission(val) {
      const { hasPermission } = usePermission();
      const tag = `${this.permission}.${val}`;
      return hasPermission(tag);
    },
    handleApplyFilter() {
      // Logic filter lokal (jika backend belum support pagination penuh untuk kriteria)
      this.$emit("fetchData", this.filter.q);
    },
    handleRefreshItems() {
      this.filter.q = "";
      this.handleApplyFilter();
    },
    handleAddItem() {
      this.$emit("addItem");
    },
    handleEditItem(item) {
      let a = JSON.parse(JSON.stringify(item));
      this.$emit("editItem", a);
    },
    deleteItem(item) {
      this.$emit("deleteItem", item);
    },
    async handleClear() {
      this.filter.q = "";
      this.handleApplyFilter();
    },
  },
  mounted() {
    this.$emit("fetchData", "");
  }
};
</script>