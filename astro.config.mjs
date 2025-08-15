import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import icon from 'astro-icon';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind({
      // Keep Tailwind base styles
      applyBaseStyles: true,
    }),
    icon({
      // Optimize icon loading
      include: {
        'fa6-solid': ['*'],
        'fa6-brands': ['*'],
      },
    }),
    mdx({
      // Optimize MDX processing
      optimize: true,
      remarkPlugins: [],
      rehypePlugins: [],
    }),
    sitemap({
      // Generate comprehensive sitemap
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => !page.includes('/api/'),
    }),
  ],
  site: 'https://codersbox.dev',
  output: 'static',
  srcDir: './src',
  publicDir: './public',
  
  // Performance optimizations for Vercel
  build: {
    // Split chunks for better caching
    split: true,
    // Inline small assets for better performance
    assetsInlineLimit: 1024,
  },
  
  // Compression settings
  compressHTML: true,
  
  // Image optimization
  image: {
    // Enable image optimization
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
  
  // Vite optimizations
  vite: {
    build: {
      // Optimize chunk splitting
      rollupOptions: {
        output: {
          manualChunks: {
            // Separate vendor chunks
            'vendor': ['astro/assets'],
          },
        },
      },
      // CSS code splitting
      cssCodeSplit: true,
    },
    // Optimize dependencies
    optimizeDeps: {
      include: ['astro/assets'],
    },
  },
  
  // Markdown optimizations
  markdown: {
    // Optimize markdown processing
    shikiConfig: {
      // Use a lightweight theme
      theme: 'github-dark',
      // Only load needed languages
      langs: ['javascript', 'typescript', 'html', 'css', 'bash', 'json', 'markdown'],
    },
    // Enable syntax highlighting optimization
    syntaxHighlight: 'shiki',
  },
  
  // Server optimizations for development
  server: {
    port: 4321,
    host: true,
  },
  
  // Prefetch settings
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});