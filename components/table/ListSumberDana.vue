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
            label="Cari Sumber Dana ( Tekan Enter )"
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
        :items="tableData.items"
        :server-items-length="tableData.meta?.totalItems || 0"
        :items-per-page="itemsPerPage"
        :loading="loading"
        v-model:sort-by="sortBy"
        item-value="id"
        hide-default-footer
      >
        <template v-slot:[`item.no`]="{ index }">
          {{ numberInc + index + 1 }}.
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

      <v-row class="mt-3">
        <v-col md="6" cols="12">
          <div class="d-flex" style="font-size: 15px">
            Tampilkan &nbsp;
            <div style="width: 80px; margin-top: -8px">
              <v-select
                v-model="filter.pageSize"
                :items="itemsPerPageOptions"
                item-value="value"
                item-title="title"
                color="primary"
                variant="outlined"
                density="compact"
                hide-details="auto"
                @update:modelValue="getItemPerPage"
              ></v-select>
            </div>
            &nbsp; dari {{ tableData.meta?.totalItems || 0 }} data
          </div>
        </v-col>
        <v-col md="6" cols="12">
          <div style="float: right">
            <SharedPagination
              class="mb-2"
              :value="filter.pageNumber"
              :items-per-page="itemsPerPage"
              :total-items="tableData.meta?.totalItems || 0"
              @handlePaginate="handlePageChanged"
            />
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: {
    title: { type: String },
    tableData: { 
      type: Object, 
      default: () => ({ items: [], meta: { totalItems: 0 } }) 
    },
    headers: { type: Array, default: () => [] },
    permission: { type: String, default: "" },
    loading: { type: Boolean, default: false },
  },
  data() {
    return {
      itemsPerPage: 10,
      itemsPerPageOptions: [
        { value: 10, title: "10" },
        { value: 20, title: "20" },
        { value: 40, title: "40" },
        { value: 50, title: "50" },
      ],
      sortBy: [
        {
          key: "createdAt",
          order: "desc",
        },
      ],
      filter: {
        q: "",
        pageSize: 10,
        pageNumber: 1,
        sortBy: "createdAt",
        sortType: "desc",
      },
    };
  },
  computed: {
    numberInc() {
      return (parseInt(this.filter.pageNumber) * this.itemsPerPage) - this.itemsPerPage;
    },
  },
  methods: {
    hasPermission(val) {
      const { hasPermission } = usePermission();
      const tag = `${this.permission}.${val}`;
      return hasPermission(tag);
    },
    handleApplyFilter() {
      const filter = Object.assign({}, this.filter);
      this.filter = {
        q: filter.q,
        pageSize: this.itemsPerPage,
        pageNumber: 1,
        sortBy: this.sortBy[0]?.key || "createdAt",
        sortType: this.sortBy[0]?.order || "desc",
        t: Date.now(),
      };
      this.$router.replace({ path: this.$route.path, query: this.filter });
    },
    handleRefreshItems() {
      this.filter.q = "";
      this.filter.pageNumber = 1;
      this.filter.t = Date.now();
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
    handlePageChanged(page) {
      this.filter.pageNumber = page;
      this.$router.replace({ path: this.$route.path, query: this.filter });
    },
    getItemPerPage(val) {
      this.itemsPerPage = +val;
      this.filter.pageSize = this.itemsPerPage;
      this.$router.replace({ path: this.$route.path, query: this.filter });
    },
    updateFilterQuery(query) {
      const filter = Object.assign(this.filter, query);
      filter.pageNumber = parseInt(filter.pageNumber) || 1;
      filter.pageSize = parseInt(filter.pageSize ? filter.pageSize : this.itemsPerPage);
      return filter;
    },
    handleSort() {
      if (this.sortBy.length > 0) {
        this.filter.sortBy = this.sortBy[0].key;
        this.filter.sortType = this.sortBy[0].order;
        this.$router.replace({ path: this.$route.path, query: this.filter });
      }
    },
    async handleClear() {
      this.filter.q = "";
      this.filter.pageNumber = 1;
      this.$router.replace({ path: this.$route.path, query: this.filter });
    },
  },
  watch: {
    "$route.query": {
      handler(query) {
        this.filter = this.updateFilterQuery(query);
        this.$emit("fetchData");
      },
      immediate: true,
    },
    sortBy() {
      this.handleSort();
    },
  },
};
</script>

<style scoped>
.dt-table > td {
  border: 1px solid #d8dbe0 !important;
  border-collapse: collapse;
}
</style>