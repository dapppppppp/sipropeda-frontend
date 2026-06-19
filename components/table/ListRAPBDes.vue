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
        class="datatabels productlist mt-3"
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
          <span class="font-weight-bold">{{ numberInc + index + 1 }}.</span>
        </template>
        
        <template v-slot:[`item.nilaiPreferensiV`]="{ item }">
          <span class="font-weight-bold text-primary">
            {{ item.nilaiPreferensiV || (item.raw && item.raw.nilaiPreferensiV) ? Number((item.raw ? item.raw.nilaiPreferensiV : item.nilaiPreferensiV)).toFixed(4) : '-' }}
          </span>
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
            @click="$emit('editItem', item.raw || item)"
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
            @click="$emit('kembalikan', item.raw || item)"
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
            @click="$emit('sahkan', item.raw || item)"
          >
            <v-icon size="18">mdi-check-all</v-icon>
            <v-tooltip activator="parent" location="bottom">Sahkan ke APBDes</v-tooltip>
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
    title: { type: String, default: "Daftar Usulan RAPBDes" },
    tableData: { 
      type: Object, 
      default: () => ({ items: [], meta: { totalItems: 0 } }) 
    },
    headers: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    permission: { type: String, default: "" },
  },
  data() {
    return {
      itemsPerPage: 10,
      itemsPerPageOptions: [
        { value: 10, title: "10" },
        { value: 20, title: "20" },
        { value: 50, title: "50" },
      ],
      sortBy: [
        {
          key: "nilaiPreferensiV",
          order: "desc",
        },
      ],
      filter: {
        q: "",
        pageSize: 10,
        pageNumber: 1,
        sortBy: "nilaiPreferensiV",
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
      return hasPermission(`${this.permission}.${val}`);
    },
    formatRupiah(value) {
      if (!value) return "Rp 0";
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    },
    handleApplyFilter() {
      const filter = Object.assign({}, this.filter);
      this.filter = {
        q: filter.q,
        pageSize: this.itemsPerPage,
        pageNumber: 1,
        sortBy: this.sortBy[0]?.key || "nilaiPreferensiV",
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