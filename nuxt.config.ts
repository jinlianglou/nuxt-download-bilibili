// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  typescript: {
    typeCheck: true
  },
  plugins: [
    {src: '~/plugins/Icon.ts', ssr: false, mode: 'client'},
    {src: '~/plugins/IconConfigProvider.ts', ssr: false, mode: 'client'}
  ]
})
