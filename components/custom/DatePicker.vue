<script lang="ts" setup>
import moment from "moment";
var props: any = defineProps({
  modelValue: {
    type: [String, Date, Number],
    default: null,
  },
  label: {
    type: String,
  },
  placeholder: {
    type: String,
  },
  minDate: {
    type: String,
    default: "",
  },
  maxDate: {
    type: String,
    default: "",
  },
  rules: {
    type: Array as PropType<((value: any) => boolean | string)[]>,
    default: [],
  },
  variant: {
    type: String as PropType<
      | "outlined"
      | "filled"
      | "plain"
      | "underlined"
      | "solo"
      | "solo-inverted"
      | "solo-filled"
      | undefined
    >,
    default: "outlined",
  },
  density: {
    type: String as PropType<"compact" | "comfortable" | "default" | undefined>,
    default: "compact",
  },
  hideDetails: {
    type: [String, Boolean] as PropType<boolean | "auto" | undefined>,
    default: "auto",
  },
  hideHeader: {
    type: Boolean,
    default: false,
  },
  clearable: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["listen", "update:modelValue"]);
var menuModel: any = ref(false);

var computedDate = computed(() => {
  return props.modelValue
    ? moment(props.modelValue).format("DD-MM-YYYY")
    : null;
});

function updateData(val: any) {
  menuModel.value = false;
  emit("update:modelValue", val ? moment(val).format("YYYY-MM-DD") : null);
}
</script>

<template>
  <v-menu
    v-model="menuModel"
    transition="scale-transition"
    :close-on-content-click="false"
  >
    <template v-slot:activator="{ props }">
      <v-text-field
        v-model="computedDate"
        v-bind="props"
        :label="label"
        :placeholder="placeholder"
        :rules="rules"
        prepend-inner-icon="mdi-calendar"
        :hide-details="hideDetails"
        :variant="variant"
        :density="density"
        :clearable="clearable"
        @update:modelValue="updateData"
        readonly
      />
    </template>
    <v-date-picker
      :model-value="modelValue ? new Date(modelValue) : null"
      @update:modelValue="updateData"
      :hide-header="hideHeader"
      color="primary"
      show-adjacent-months
    ></v-date-picker>
  </v-menu>
</template>
