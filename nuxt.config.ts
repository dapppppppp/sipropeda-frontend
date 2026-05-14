import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

export default defineNuxtConfig({
  ssr: false,

  experimental: {
    appManifest: false,
  },

  // TAMBAHKAN BLOK INI: Agar Nuxt bisa membaca .env
  runtimeConfig: {
    public: {
      tokenKey: process.env.TOKEN_KEY || 'sipropeda_rahasia_2026',
      apiUrl: process.env.VITE_API_URL || 'http://localhost:8080/v1',
    }
  },

  app: {
    head: {
      title: "SIPROPEDA - Sistem Pendukung Keputusan",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
    },
  },

  build: {
    transpile: ["vuetify"],
  },

  modules: [
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
  ],

  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },

  compatibilityDate: "2026-05-13",
});