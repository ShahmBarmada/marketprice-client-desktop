// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  srcDir: 'src',
  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxt/image'],
  ui: {
    icons: ['carbon'],
  },
  image: {
    localServer: {
      baseURL: 'http://localhost:3100/images',
    },
  },
  css: ['~/assets/globals.css'],
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },
  eslint: {
    config: {
      stylistic: false,
    },
  },
})
