<template>
  <v-card>
    <div
      class="d-flex flex-row flex-wrap align-center justify-space-between bg-primary"
    >
      <v-card-title class="text-white">{{ title }}</v-card-title>
      <div class="d-flex align-center flex-wrap justify-end px-2">
        <v-btn variant="text" icon @click="handleRefreshItems">
          <v-icon color="white">mdi-refresh</v-icon>
          <v-tooltip activator="parent" location="bottom">Refresh</v-tooltip>
        </v-btn>
      </div>
    </div>

    <v-divider></v-divider>

    <v-card-text>
      <v-row justify="end">
        <v-col cols="12" lg="3">
          <CustomDatePicker
            v-model="filter.startDate"
            @update:model-value="handleApplyFilter"
            :placeholder="'Tanggal Mulai'"
            variant="outlined"
            density="compact"
            :hide-header="true"
            :clearable="true"
          />
        </v-col>
        <v-col cols="12" lg="3">
          <CustomDatePicker
            v-model="filter.endDate"
            @update:model-value="handleApplyFilter"
            :placeholder="'Tanggal Selesai'"
            variant="outlined"
            density="compact"
            :hide-header="true"
            :clearable="true"
          />
        </v-col>

        <v-col cols="12" lg="3">
          <CustomBaseInput
            type="autocomplete"
            v-model="filter.jenisKomplainId"
            @update:model-value="handleApplyFilter"
            @click:clear="
              () => {
                filter.jenisKomplainId = null;
                handleApplyFilter();
              }
            "
            :items="listJenisKomplain"
            item-title="nama"
            item-value="id"
            :placeholder="'Pilih Jenis Komplain'"
            variant="outlined"
            density="compact"
            clearable
          />
        </v-col>

        <v-col cols="12" lg="3">
          <CustomBaseInput
            type="autocomplete"
            v-model="filter.sumberKomplainId"
            @update:model-value="handleApplyFilter"
            @click:clear="
              () => {
                filter.sumberKomplainId = null;
                handleApplyFilter();
              }
            "
            :items="listSumberKomplain"
            item-title="nama"
            item-value="id"
            :placeholder="'Pilih Sumber Komplain'"
            variant="outlined"
            density="compact"
            clearable
          />
        </v-col>
      </v-row>

      <v-row class="align-center mt-1">
        <v-col cols="12" lg="8" class="d-flex justify-start align-center">
          <v-chip-group
            v-model="filter.statusKomplainId"
            @update:model-value="handleApplyFilter"
            column
            selected-class="text-primary"
          >
            <v-chip
              v-for="status in listStatusKomplain"
              :key="status.id"
              :value="status.id"
              :style="{
                borderColor:
                  statusConstants[status.nama]?.color + ' !important',
                color: statusConstants[status.nama]?.color + ' !important',
                backgroundColor:
                  filter.statusKomplainId === status.id
                    ? statusConstants[status.nama]?.color + '20'
                    : 'transparent',
              }"
              filter
              size="default"
              variant="outlined"
              class="px-6 mx-1"
            >
              {{ status.nama }}
            </v-chip>
          </v-chip-group>
        </v-col>

        <v-col cols="12" lg="4">
          <v-text-field
            v-model="filter.q"
            density="compact"
            label="Cari (Tekan Enter)"
            @keyup.enter="handleApplyFilter"
            @click:clear="handleClear"
            hide-details
            single-line
            clearable
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
          >
          </v-text-field>
        </v-col>
      </v-row>

      <v-row class="mt-2">
        <v-col cols="12">
          <v-data-table
            class="datatabels productlist"
            :headers="roleId === 'HA03' ? headers : headersKomplainDiteruskan"
            :items="tableData.items"
            :server-items-length="tableData.meta.totalItems"
            :items-per-page="itemsPerPage"
            :loading="loading"
            v-model:sort-by="sortBy"
            item-value="id"
            hide-default-footer
          >
            <template v-slot:[`item.no`]="{ item, index }">
              {{ numberInc + index + 1 }}.
            </template>
            <template
              v-for="header in headers.filter((header) =>
                header.hasOwnProperty('formatter')
              )"
              v-slot:[`item.${header.value}`]="{ value }"
            >
              {{ header.formatter(value) }}
            </template>
            <template v-slot:[`item.namaStatusKomplain`]="{ item }">
              <div class="text-center">
                <v-chip
                  :color="statusConstants[item.namaStatusKomplain]?.color"
                  variant="flat"
                  size="small"
                  class="text-white font-weight-semibold"
                >
                  {{ statusConstants[item.namaStatusKomplain]?.name }}
                </v-chip>
              </div>
            </template>
            <template v-slot:[`item.alamatKomplain`]="{ item }">
              {{ stringLimit(item.alamatKomplain, 60) }}
            </template>

            <template v-slot:[`item.tanggalKomplain`]="{ item }">
              {{ minimal_date_format_no_timezone(item.tanggalKomplain) }}
            </template>
            <template v-slot:[`item.actions`]="{ item }">
              <v-btn
                v-if="hasPermission('VIEW')"
                icon
                variant="tonal"
                color="#3b82f6"
                size="32"
                class="mr-1"
                @click="handleDetailItem(item)"
              >
                <v-icon class="text-blue" size="18">mdi-eye</v-icon>
                <v-tooltip activator="parent" location="bottom">
                  Detail Komplain
                </v-tooltip>
              </v-btn>

              <v-btn
                v-if="hasPermission('VIEW')"
                icon
                variant="tonal"
                color="info"
                size="32"
                class="mr-1"
                @click="handleTimelineItem(item)"
              >
                <v-icon class="text-info" size="18"
                  >mdi-timeline-text-outline</v-icon
                >
                <v-tooltip activator="parent" location="bottom">
                  Timeline Komplain
                </v-tooltip>
              </v-btn>
              <v-btn
                v-if="
                  roleId === 'HA03' &&
                  item.namaStatusKomplain === statusConstants.DITERUSKAN.id
                "
                icon
                variant="tonal"
                color="success"
                size="32"
                class="mr-1"
                @click="handleTanggapi(item)"
              >
                <BrandWechatIcon class="text-success" size="18" />
                <v-tooltip activator="parent" location="bottom"
                  >Tanggapi</v-tooltip
                >
              </v-btn>

              <v-btn
                v-if="
                  roleId === 'HA03' &&
                  item.namaStatusKomplain === statusConstants.DITANGGAPI.id
                "
                icon
                variant="tonal"
                color="error"
                size="32"
                class="mr-1"
                @click="handleCloseKomplain(item)"
              >
                <v-icon class="text-error" size="18">mdi-close</v-icon>
                <v-tooltip activator="parent" location="bottom"
                  >Close Komplain</v-tooltip
                >
              </v-btn>
            </template>
          </v-data-table>
        </v-col>
      </v-row>

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
            &nbsp; dari {{ tableData.meta.totalItems }} data
          </div>
        </v-col>
        <v-col md="6" cols="12">
          <div style="float: right">
            <SharedPagination
              class="mb-2"
              :value="filter.pageNumber"
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
import dayjs from "dayjs";
import { tanggal } from "@/mixins/tanggal";
import { Status } from "@/constants";

export default {
  props: {
    title: { type: String },
    defaultSortBy: { type: String },
    searchTitle: { type: String },
    tableData: {
      type: Object,
      default: { items: [], meta: { total: 0 } },
    },
    headers: { type: Array, default: [] },
    headersKomplainDiteruskan: { type: Array, default: [] },
    itemFilter: { type: Array, default: () => [] },
    labelFilter: { type: String, default: () => "Filter" },
    permission: { type: String, default: "" },
    loading: { type: Boolean, default: false },
    listStatusKomplain: { type: Array, default: () => [] },
    listJenisKomplain: { type: Array, default: () => [] },
    listSumberKomplain: { type: Array, default: () => [] },
  },

  mixins: [tanggal],
  data() {
    const today = dayjs().format("YYYY-MM-DD");
    const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD");
    return {
      itemsPerPage: 10,
      itemsPerPageOptions: [
        { value: 10, title: "10" },
        { value: 20, title: "20" },
        { value: 40, title: "40" },
        { value: 50, title: "50" },
      ],
      sortBy: [{ key: this.defaultSortBy, order: "desc" }],
      sortDesc: [true],
      filter: {
        q: "",
        pageSize: this.itemsPerPage,
        pageNumber: 1,
        sortBy: this.defaultSortBy,
        sortType: "desc",

        startDate: startOfMonth,
        endDate: today,

        statusKomplainId: null,
        jenisKomplainId: null,
        sumberKomplainId: null,
      },
      roleId: null,
    };
  },

  mounted() {
    const authStore = useAuthStore();
    const dataUser = authStore.dataUser;
    this.roleId = dataUser.role.id;
  },

  computed: {
    numberInc() {
      return (
        parseInt(this.filter.pageNumber * this.itemsPerPage) - this.itemsPerPage
      );
    },
    statusConstants() {
      return Status;
    },
  },
  methods: {
    stringLimit(alamat, limit = 60) {
      if (!alamat) return "";
      if (alamat.length <= limit) return alamat;
      return alamat.slice(0, limit) + "...";
    },
    hasPermission(val) {
      const { hasPermission } = usePermission();
      const tag = `${this.permission}.${val}`;
      return hasPermission(tag);
    },

    handleApplyFilter() {
      const filter = Object.assign({}, this.filter);

      const queryParams = {
        q: filter.q || "",
        pageSize: this.itemsPerPage,
        pageNumber: 1,
        sortBy: this.sortBy[0].key,
        sortType: this.sortBy[0].order,
        t: Date.now(),

        tanggalMulai: filter.startDate,
        tanggalSelesai: filter.endDate,

        statusKomplainId: filter.statusKomplainId,
        jenisKomplainId: filter.jenisKomplainId,
        sumberKomplainId: filter.sumberKomplainId,
      };

      this.$router.replace({
        path: this.$route.path,
        query: queryParams,
      });
    },

    updateFilterQuery(query) {
      const filterFromUrl = { ...query };

      if (filterFromUrl.tanggalMulai) {
        this.filter.startDate = filterFromUrl.tanggalMulai;
      }
      if (filterFromUrl.tanggalSelesai) {
        this.filter.endDate = filterFromUrl.tanggalSelesai;
      }

      this.filter.statusKomplainId = filterFromUrl.statusKomplainId
        ? parseInt(filterFromUrl.statusKomplainId)
        : null;

      this.filter.jenisKomplainId = filterFromUrl.jenisKomplainId || null;
      this.filter.sumberKomplainId = filterFromUrl.sumberKomplainId || null;

      this.filter.q = filterFromUrl.q || "";
      this.filter.pageNumber = parseInt(filterFromUrl.pageNumber || 1);
      this.filter.pageSize = parseInt(
        filterFromUrl.pageSize || this.itemsPerPage
      );

      if (this.itemsPerPage !== this.filter.pageSize) {
        this.itemsPerPage = this.filter.pageSize;
      }

      return this.filter;
    },

    handleRefreshItems() {
      const today = dayjs().format("YYYY-MM-DD");
      const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD");

      this.filter.q = "";
      this.filter.pageNumber = 1;
      this.filter.startDate = startOfMonth;
      this.filter.endDate = today;
      this.filter.statusKomplainId = null;
      this.filter.jenisKomplainId = null;
      this.filter.sumberKomplainId = null;

      this.handleApplyFilter();
    },

    handleClear() {
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
    handleTanggapi(item) {
      let a = JSON.parse(JSON.stringify(item));
      this.$emit("tanggapiItem", a);
    },
    handleTeruskan(item) {
      let a = JSON.parse(JSON.stringify(item));
      this.$emit("teruskanItem", a);
    },
    handleDetailItem(item) {
      let a = JSON.parse(JSON.stringify(item));
      this.$emit("detailItem", a);
    },
    handleTimelineItem(item) {
      let a = JSON.parse(JSON.stringify(item));
      this.$emit("timelineItem", a);
    },
    deleteItem(item) {
      this.$emit("deleteItem", item);
    },
    handleCloseKomplain(item) {
      this.$emit("closeKomplainItem", item);
    },
    handlePageChanged(page) {
      this.filter.pageNumber = page;
      const currentQuery = { ...this.$route.query };
      currentQuery.pageNumber = page;
      this.$router.replace({
        path: this.$route.path,
        query: currentQuery,
      });
    },
    handleSort() {
      if (this.sortBy.length > 0) {
        this.filter.sortBy = this.sortBy[0].key;
        this.filter.sortType = this.sortBy[0].order;
        this.handleApplyFilter();
      }
    },
    getItemPerPage(val) {
      this.itemsPerPage = +val;
      this.handleApplyFilter();
    },
  },
  watch: {
    "$route.query": {
      handler(query) {
        this.updateFilterQuery(query);
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

/* Override warna chip filter agar mengikuti constant */
:deep(.v-chip.v-chip--variant-outlined) {
  border-width: 1px !important;
}

:deep(.v-chip.v-chip--selected) {
  background-color: transparent !important;
  opacity: 1 !important;
}

:deep(.v-chip.v-chip--variant-outlined .v-chip__content) {
  color: inherit !important;
}
</style>
