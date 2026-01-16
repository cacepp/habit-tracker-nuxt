// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@nuxt/ui',
  ],
  devtools: { enabled: true },
  compatibilityDate: '2025-07-15',
});
