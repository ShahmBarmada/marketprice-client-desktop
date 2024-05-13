// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  srcDir: "src",
  modules: ["@nuxt/eslint", "@nuxt/ui"],
  ui: {
    icons: ["carbon"],
  },
  eslint: { config: { stylistic: true } },
  css: ["~/assets/globals.css"],
});
