// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',
    devtools: {enabled: true},
    srcDir: './src',

    modules: [
      '@nuxt/content',
      '@nuxt/fonts',
      '@nuxt/icon',
      '@nuxt/image',
      '@nuxtjs/sitemap',
      '@nuxtjs/robots',
      '@nuxtjs/tailwindcss',
    ],

    // Nuxt icon configuration when using tailwindcss 4+
    icon: {
        mode: 'css',
        cssLayer: 'base'
    },

    // Nuxt sitemap configuration for SEO
    site: {
        url: 'https://codersbox.dev',
        name: 'codersbox',
        description: 'A blog about programming, technology, and software development.',
    },
})