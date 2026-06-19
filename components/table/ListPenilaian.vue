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
            label="Cari Usulan ( Tekan Enter )"
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

        <template v-slot:[`item.status`]="{ item }">
          <v-chip
            size="small"
            :color="item.sudahDinilai ? 'success' : 'warning'"
            :variant="item.sudahDinilai ? 'flat' : 'tonal'"
            class="font-weight-bold"
          >
            <v-icon start size="small">
              {{ item.sudahDinilai ? 'mdi-check-circle' : 'mdi-clock-alert-outline' }}
            </v-icon>
            {{ item.sudahDinilai ? 'Sudah Dinilai' : 'Belum Dinilai' }}
          </v-chip>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-btn
            v-if="hasPermission('UPDATE')"
            icon
            variant="tonal"
            :color="item.sudahDinilai ? 'info' : 'success'"
            size="32"
            class="mr-1"
            @click="handleNilaiItem(item)"
          >
            <v-icon size="18">
              {{ item.sudahDinilai ? 'mdi-pencil' : 'mdi-clipboard-check' }}
            </v-icon>
            <v-tooltip activator="parent" location="bottom">
              {{ item.sudahDinilai ? 'Edit Nilai' : 'Beri Nilai' }}
            </v-tooltip>
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
    // Menyesuaikan format data object
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
      const number =
        parseInt(this.filter.pageNumber * this.itemsPerPage) -
        this.itemsPerPage;
      return number;
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
      this.$router.replace({
        path: this.$route.path,
        query: this.filter,
      });
    },
    handleRefreshItems() {
      const resetFilter = Object.assign({}, this.filter);
      resetFilter.q = "";
      resetFilter.pageNumber = 1;
      resetFilter.t = Date.now();
      this.filter = resetFilter;
      this.handleApplyFilter();
    },
    handleNilaiItem(item) {
      let a = JSON.parse(JSON.stringify(item));
      this.$emit("nilaiItem", a);
    },
    handlePageChanged(page) {
      this.filter.pageNumber = page;
      this.$router.replace({
        path: this.$route.path,
        query: this.filter,
      });
    },
    getItemPerPage(val) {
      this.itemsPerPage = +val;
      this.filter.pageSize = this.itemsPerPage;
      this.$router.replace({
        path: this.$route.path,
        query: this.filter,
      });
    },
    updateFilterQuery(query) {
      const filter = Object.assign(this.filter, query);
      filter.pageNumber = parseInt(filter.pageNumber) || 1;
      filter.pageSize = parseInt(
        filter.pageSize ? filter.pageSize : this.itemsPerPage
      );
      filter.t = Date.now();
      return filter;
    },
    handleSort() {
      if (this.sortBy.length > 0) {
        this.filter.sortBy = this.sortBy[0].key;
        this.filter.sortType = this.sortBy[0].order;
        this.$router.replace({
          path: this.$route.path,
          query: this.filter,
        });
      }
    },
    handleResetFilter() {
      this.filter = {
        pageNumber: 1,
        pageSize: this.itemsPerPage,
        q: "",
        sortBy: "createdAt",
        sortType: "desc",
        t: Date.now(),
      };
    },
    async handleClear() {
      this.handleResetFilter();
      this.$router.replace({
        path: this.$route.path,
        query: this.filter,
      });
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