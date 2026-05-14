<template>
  <v-text-field
    v-if="type === 'input'"
    :ref="name"
    :modelValue="modelValue"
    @update:modelValue="handleInput"
    :rules="rules"
    :label="label"
    :placeholder="placeholder"
    :type="jenis || 'text'"
    :autofocus="isFocus"
    :required="isRequired"
    :variant="variant"
    :density="density"
    :hide-details="hideDetails"
    :readonly="readonly"
    :append-inner-icon="appendInnerIcon"
    @click:append-inner="$emit('click:append-inner')"
  ></v-text-field>
  <v-textarea
    v-else-if="type === 'textarea'"
    :ref="name"
    :modelValue="modelValue"
    @update:modelValue="handleInput"
    :rules="rules"
    :label="label"
    :placeholder="placeholder"
    :rows="rows"
    :autofocus="isFocus"
    :required="isRequired"
    :variant="variant"
    :density="density"
    :hide-details="hideDetails"
    :readonly="readonly"
  >
  </v-textarea>
  <v-checkbox
    v-else-if="type === 'checkbox'"
    :ref="name"
    :id="name"
    :modelValue="modelValue"
    :value="value"
    @update:modelValue="handleInput"
    :rules="rules"
    :label="label"
    :placeholder="placeholder"
    :autofocus="isFocus"
    :required="isRequired"
    :variant="variant"
    :density="density"
    :hide-details="hideDetails"
    :readonly="readonly"
  ></v-checkbox>
  <v-autocomplete
    v-else-if="type === 'autocomplete'"
    :ref="name"
    :id="name"
    :modelValue="modelValue"
    @update:modelValue="handleInput"
    :rules="rules"
    :items="items"
    :item-title="itemTitle"
    :item-value="itemValue"
    :closeOnSelect="true"
    :label="label"
    :placeholder="placeholder"
    :autofocus="isFocus"
    :clearable="clearable"
    :required="isRequired"
    :variant="variant"
    :density="density"
    :hide-details="hideDetails"
    :readonly="readonly"
  >
  </v-autocomplete>
  <v-select
    v-else-if="type === 'select'"
    :ref="name"
    :id="name"
    :modelValue="modelValue"
    @update:modelValue="handleInput"
    :rules="rules"
    :items="items"
    :item-title="itemTitle"
    :item-value="itemValue"
    :label="label"
    :placeholder="placeholder"
    :autofocus="isFocus"
    :required="isRequired"
    :variant="variant"
    :density="density"
    :hide-details="hideDetails"
    :readonly="readonly"
  ></v-select>
</template>

<script lang="ts" setup>
const emit = defineEmits(["update:modelValue", "click:append-inner"]);
const refs: any = ref(null);

var props: any = defineProps({
  type: {
    type: String,
  },
  jenis: {
    type: String,
  },
  label: {
    type: String,
  },
  placeholder: {
    type: String,
  },
  name: {
    type: String,
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
  modelValue: {
    type: [String, Date, Number, Boolean, Array],
    default: null,
  },
  rules: {
    type: Array as PropType<((value: any) => boolean | string)[]>,
    default: [],
  },
  isRequired: {
    type: Boolean,
    default: false,
  },
  isFocus: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  items: {
    type: Array,
  },
  itemTitle: {
    type: String,
    default: "name",
  },
  itemValue: {
    type: [String, Function] as PropType<string | ((item: any) => any)>,
    default: "id",
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  rows: {
    type: Number,
    default: 3,
  },
  value: {
    type: [String, Date, Number, Boolean],
    default: null,
  },
  appendInnerIcon: {
    type: String,
    default: undefined,
  },
});

function handleInput(e: any) {
  emit("update:modelValue", e);
}
</script>
