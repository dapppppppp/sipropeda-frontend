import { createVuetify } from "vuetify";
import "@mdi/font/css/materialdesignicons.css";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

import PerfectScrollbar from "vue3-perfect-scrollbar";
import VueTablerIcons from "vue-tabler-icons";

import "@/assets/scss/style.scss";

import {
  BLUE_THEME, AQUA_THEME, PURPLE_THEME, GREEN_THEME,
  CYAN_THEME, ORANGE_THEME, RED_THEME,
} from "@/theme/LightTheme";
import {
  DARK_BLUE_THEME, DARK_AQUA_THEME, DARK_ORANGE_THEME,
  DARK_PURPLE_THEME, DARK_GREEN_THEME, DARK_CYAN_THEME, DARK_RED_THEME,
} from "@/theme/DarkTheme";

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: false,
    components: {
      ...components,
    },
    directives,
    theme: {
      defaultTheme: "CYAN_THEME",
      themes: {
        BLUE_THEME, AQUA_THEME, PURPLE_THEME, GREEN_THEME, CYAN_THEME, ORANGE_THEME, RED_THEME,
        DARK_BLUE_THEME, DARK_AQUA_THEME, DARK_ORANGE_THEME, DARK_PURPLE_THEME, DARK_GREEN_THEME, DARK_CYAN_THEME, DARK_RED_THEME,
      },
    },
    defaults: {
      VCard: { rounded: "md", elevation: 10 },
      VTextField: { variant: "outlined", density: "comfortable", color: "primary" },
      VTextarea: { variant: "outlined", density: "comfortable", color: "primary" },
      VSelect: { variant: "outlined", density: "comfortable", color: "primary" },
      VListItem: { minHeight: "45px" },
      VTooltip: { location: "top" },
      VBtn: { style: "text-transform: capitalize", rounded: "md" },
    },
  });

  nuxtApp.vueApp.use(vuetify);
  nuxtApp.vueApp.use(PerfectScrollbar);
  nuxtApp.vueApp.use(VueTablerIcons);
});