<script lang="ts" setup>
import moment from "moment";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

var date: any = ref(null);
var textfield: any = ref("");
var autocomplete: any = ref("");
var textarea: any = ref("");
var checkbox: any = ref([]);
var list = ref([
  {
    id: 1,
    name: "Item 1",
  },
  {
    id: 2,
    name: "Item 2",
  },
  {
    id: 3,
    name: "Item 3",
  },
]);

onMounted(() => {
  date.value = moment().format("YYYY-MM-DD");
});
</script>
<template>
  <v-row justify="center">
    <v-col cols="12" md="4">
      <v-card>
        <v-card-title>Custom Form Component</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-form>
            <CustomDatePicker
              v-model="date"
              label="Date Picker"
              variant="outlined"
              density="compact"
              :hide-details="false"
              :hide-header="true"
            ></CustomDatePicker>
            <CustomBaseInput
              type="input"
              v-model="textfield"
              :rules="[(v:any) => !!v || 'Wajib diisi!']"
              label="TextField"
              variant="outlined"
              density="compact"
              :hide-details="false"
            ></CustomBaseInput>
            <CustomBaseInput
              type="autocomplete"
              v-model="autocomplete"
              :rules="[(v:any) => !!v || 'Wajib diisi!']"
              :items="list"
              item-title="name"
              item-value="id"
              label="Autocomplete"
              variant="outlined"
              density="compact"
              :hide-details="false"
            ></CustomBaseInput>
            <CustomBaseInput
              type="textarea"
              v-model="textarea"
              :rules="[(v:any) => !!v || 'Wajib diisi!']"
              label="Textarea"
              :rows="5"
              variant="outlined"
              density="compact"
              :hide-details="false"
            ></CustomBaseInput>
            <v-label>Checkbox</v-label>
            <div class="d-flex justify-space-between">
              <CustomBaseInput
                type="checkbox"
                v-model="checkbox"
                :rules="[(v:any) => !!v || 'Wajib diisi!']"
                label="Checkbox 1"
                value="Check 1"
                :rows="5"
                variant="outlined"
                density="compact"
                :hide-details="false"
              ></CustomBaseInput>
              <CustomBaseInput
                type="checkbox"
                v-model="checkbox"
                :rules="[(v:any) => !!v || 'Wajib diisi!']"
                label="Checkbox 2"
                value="Check 2"
                :rows="5"
                variant="outlined"
                density="compact"
                :hide-details="false"
              ></CustomBaseInput>
              <CustomBaseInput
                type="checkbox"
                v-model="checkbox"
                :rules="[(v:any) => !!v || 'Wajib diisi!']"
                label="Checkbox 3"
                value="Check 3"
                :rows="5"
                variant="outlined"
                density="compact"
                :hide-details="false"
              ></CustomBaseInput>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
