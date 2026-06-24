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
        <v-col cols="12" md="3">
          <v-autocomplete
            v-model="filter.tahun"
            :items="listTahun"
            label="Semua Tahun"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            @update:modelValue="handleApplyFilter"
          ></v-autocomplete>
        </v-col>
        <v-col cols="12" md="3">
          <v-autocomplete
            v-model="filter.bidangId"
            :items="listBidang"
            item-value="id"
            item-title="namaBidang"
            label="Semua Bidang Pembangunan"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            @update:modelValue="handleApplyFilter"
          ></v-autocomplete>
        </v-col>
        <v-col cols="12" md="3">
          <v-autocomplete
            v-model="filter.sumberDanaId"
            :items="listSumberDana"
            item-value="id"
            item-title="namaSumber"
            label="Semua Sumber Dana"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            @update:modelValue="handleApplyFilter"
          ></v-autocomplete>
        </v-col>
        <v-col cols="12" md="3">
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
            <template v-slot:append>
              
              <v-btn 
                v-if="hasPermission('CREATE')" 
                color="success" 
                icon 
                @click="triggerFileInput" 
                size="32" 
                variant="tonal"
                class="mr-2"
              >
                <v-icon size="18">mdi-file-excel</v-icon>
                <v-tooltip activator="parent" location="bottom">Import RKPDes</v-tooltip>
              </v-btn>
              
              <input 
                type="file" 
                ref="fileInput" 
                accept=".xlsx, .xls" 
                style="display: none" 
                @change="handleFileUpload" 
              />

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
        
        <template v-slot:[`item.statusSifat`]="{ item }">
          <v-chip :color="item.statusSifat === 'Mandatori' ? 'error' : 'info'" size="small" label>
            {{ item.statusSifat }}
          </v-chip>
        </template>

        <template v-slot:[`item.nilaiRab`]="{ item }">
          <span class="font-weight-bold text-success">{{ formatRupiah(item.nilaiRab) }}</span>
        </template>

        <template v-slot:[`item.statusTahapan`]="{ item }">
          <v-chip :color="getStatusColor(item.statusTahapan)" size="small" label class="font-weight-bold">
            {{ item.statusTahapan }}
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
    // Tipe props diubah menjadi Object untuk menampung format terpaginasi backend
    tableData: { 
      type: Object, 
      default: () => ({ items: [], meta: { totalItems: 0 } }) 
    },
    headers: { type: Array, default: () => [] },
    permission: { type: String, default: "" },
    loading: { type: Boolean, default: false },
    listTahun: { type: Array, default: () => [] },
    listBidang: { type: Array, default: () => [] },
    listSumberDana: { type: Array, default: () => [] },
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
        tahun: null,
        bidangId: null,
        sumberDanaId: null,
      },
    };
  },
  computed: {
    // Fungsi menghitung indeks awal penomoran baris data
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
    formatRupiah(value) {
      if (!value) return "Rp 0";
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(value);
    },
    getStatusColor(status) {
      if (!status) return "grey";
      switch (status.toUpperCase()) {
        case "RKP":
          return "warning"; 
        case "RAPBDES":
          return "info";    
        case "APBDES":
          return "success"; 
        default:
          return "grey";
      }
    },
    handleApplyFilter() {
      const filter = Object.assign({}, this.filter);
      this.filter = {
        q: filter.q,
        pageSize: this.itemsPerPage,
        pageNumber: 1,
        sortBy: this.sortBy[0]?.key || "createdAt",
        sortType: this.sortBy[0]?.order || "desc",
        tahun: filter.tahun,
        bidangId: filter.bidangId,
        sumberDanaId: filter.sumberDanaId,
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
      resetFilter.tahun = null;
      resetFilter.bidangId = null;
      resetFilter.sumberDanaId = null;
      resetFilter.pageNumber = 1;
      resetFilter.t = Date.now();
      this.filter = resetFilter;
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
        tahun: null,
        bidangId: null,
        sumberDanaId: null,
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

    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      this.$emit("importItem", file);
      event.target.value = null; 
    },
  },
  watch: {
    // Watcher mendeteksi perubahan URL untuk meminta data baru dari server
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