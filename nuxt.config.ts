// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@nuxt/ui',
  ],
  ssr: false,
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    apiKey: '',
    public: {
      weatherApiBase: '',
      weatherIcon: '',
    },
  },
  compatibilityDate: '2025-07-15',
});
