import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import icon from 'astro-icon';
import mdx from '@astrojs/mdx';
import rehypeMermaid from 'rehype-mermaid';

// Configure rehype-mermaid with custom options
const rehypeMermaidConfig = {
  // Run mermaid in dark mode
  dark: false,
  // Use inline-svg strategy for better compatibility
  strategy: 'inline-svg',
  // Mermaid configuration
  mermaidConfig: {
    theme: 'default',
    themeVariables: {
      fontFamily: 'Inter, system-ui, sans-serif'
    }
  }
};

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
      rehypePlugins: [[rehypeMermaid, rehypeMermaidConfig]],
    }),
  ],
  site: 'https://codersbox.dev',
  output: 'static',
  srcDir: './src',
  publicDir: './public',
  
  // Performance optimizations
  build: {
    // Split chunks for better caching
    split: true,
  },
  
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
    // IMPORTANT: Syntax highlighting is disabled to allow rehype-mermaid to work.
    // rehype-mermaid requires code blocks with class="language-mermaid", but Shiki
    // transforms them into a different structure that rehype-mermaid can't recognize.
    // Alternative: Use client-side syntax highlighting library like Prism.js or highlight.js
    syntaxHighlight: false,
    // Add Mermaid support via rehype plugin
    rehypePlugins: [[rehypeMermaid, rehypeMermaidConfig]],
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