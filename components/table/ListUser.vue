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
            label="Role"
            v-model="filter.idRole"
            :items="listRole"
            item-value="id"
            item-title="name"
            color="primary"
            variant="outlined"
            density="compact"
            hide-details="auto"
            @update:modelValue="handleApplyFilter"
            clearable
          ></v-autocomplete>
        </v-col>
        <v-col cols="12" md="5"></v-col>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="filter.q"
            density="compact"
            label="Cari ( Tekan Enter )"
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
        :server-items-length="tableData.meta.totalItems"
        :items-per-page="itemsPerPage"
        :loading="loading"
        v-model:sort-by="sortBy"
        item-value="id"
        hide-default-footer
      >
        <!-- <template v-slot:loading>
          <v-skeleton-loader type="table-row@5"></v-skeleton-loader>
        </template> -->
        <template v-slot:[`item.no`]="{ item }">
          {{ numberInc + parseInt(tableData.items.indexOf(item)) + 1 }}.
        </template>
        <!-- <template
          v-for="header in headers.filter((header) =>
            header.hasOwnProperty('formatter')
          )"
          v-slot:[`item.${header.value}`]="{ value }"
        > -->
          <!-- v-slot:[`item.${header.value}`]="{ header, value }" -->
          <!-- {{ header.formatter(value) }}
        </template> -->
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
            <EditIcon class="text-warning" size="18" />
            <v-tooltip activator="parent" location="bottom">Edit</v-tooltip>
          </v-btn>

          <v-btn
            v-if="hasPermission('DELETE')"
            icon
            variant="tonal"
            color="warning"
            size="32"
            class="mr-1"
            @click="deleteItem(item)"
          >
            <TrashIcon class="text-error" size="18" />
            <v-tooltip activator="parent" location="bottom">Hapus</v-tooltip>
          </v-btn>

          <v-btn
            icon
            variant="tonal"
            color="teal"
            size="32"
            class="mr-1"
            @click="reset(item)"
          >
            <RefreshIcon class="text-error" size="18" />
            <v-tooltip activator="parent" location="bottom">Reset Password</v-tooltip>
          </v-btn>
        </template>
      </v-data-table>

      <!-- Custom Pagination -->
      <v-row class="mt-3">
        <v-col md="6" cols="12">
          <div class="d-flex" style="font-size: 15px;"
            >Tampilkan &nbsp;
            <div style="width:80px; margin-top:-8px;">
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
            &nbsp; dari {{ tableData.meta.totalItems }} data</div>
        </v-col>
        <v-col md="6" cols="12">
          <div style="float: right;">
            <SharedPagination
              class="mb-2"
              :items-per-page="itemsPerPage"
              :total-items="tableData.meta.totalItems"
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
    title: {
      type: String,
    },
    defaultSortBy: {
      type: String,
    },
    searchTitle: {
      type: String,
    },
    tableData: {
      type: Object,
      default: {
        items: [],
        meta: {
          total: 0,
        },
      },
    },
    headers: {
      type: Array,
      default: [],
    },
    itemFilter: {
      type: Array,
      default: () => [],
    },
    labelFilter: {
      type: String,
      default: () => "Filter",
    },
    permission: {
      type: String,
      default: "",
    },
    loading: {
      type: Boolean,
      default: false,
    },
    listRole: {
      type: Array,
      default: () => [],
    },
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
          key: this.defaultSortBy,
          order: "desc",
        },
      ],
      sortDesc: [true],
      filter: {
        q: "",
        pageSize: this.itemsPerPage,
        pageNumber: 1,
        sortBy: this.defaultSortBy,
        sortType: "desc",
        idRole: null,
        regionalId: null,
        kebunId: null,
        afdelingId: null,
      },
    };
  },
  computed: {
    numberInc() {
      var number = parseInt(this.filter.pageNumber - 1) * this.itemsPerPage;
      return number;
    },
  },
  mounted() {
    
  },
  methods: {
    hasPermission(val){
      const { hasPermission } = usePermission()
      const tag = `${this.permission}.${val}`
      return hasPermission(tag)
    },

    handleApplyFilter() {
      const filter = Object.assign({}, this.filter);
      this.filter = {
        q: filter.q,
        pageSize: this.itemsPerPage,
        pageNumber: 1,
        sortBy: this.sortBy[0].key,
        sortType: this.sortBy[0].order,
        t: Date.now(),
        idRole: filter.idRole,
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
      (resetFilter.t = Date.now()), (this.filter = resetFilter);
      this.handleApplyFilter();
    },
    handleAddItem() {
      this.$emit("addItem");
    },
    handleEditItem(item) {
      // copy item to a before edit
      let a = JSON.parse(JSON.stringify(item));
      this.$emit("editItem", a);
    },
    deleteItem(item) {
      this.$emit("deleteItem", item);
    },
    reset(item) {
      this.$emit("reset", item);
    },
    handlePageChanged(page) {
      this.filter.pageNumber = page;
      this.$router.replace({
        path: this.$route.path,
        query: this.filter,
      });
    },
    updateFilterQuery(query) {
      const filter = Object.assign(this.filter, query);
      filter.pageNumber = parseInt(filter.pageNumber);
      filter.pageSize = parseInt(
        filter.pageSize ? filter.pageSize : this.itemsPerPage
      );
      filter.t = Date.now();
      return filter;
    },
    async handleClear() {
      await this.handleResetFilter();
      this.filter.t = Date.now();
      this.$router.replace({
        path: this.$route.path,
        query: this.filter,
      });
    },
    handleResetFilter() {
      this.filter = {
        pageNumber: 1,
        pageSize: this.itemsPerPage,
        q: "",
        sortBy: this.defaultSortBy,
        sortType: "desc",
        t: Date.now(),
      };
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
    getItemPerPage(val) {
      this.itemsPerPage = +val;
      this.filter.pageSize = this.itemsPerPage;
      this.$router.replace({
        path: this.$route.path,
        query: this.filter,
      });
    },
  },
  watch: {
    "$route.query": {
      handler(query) {
        // this.filter = this.updateFilterQuery(query);
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

 .select {
    width: 60px;
  }
</style>
