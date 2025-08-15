/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'one-dark': {
          bg: '#282c34',
          fg: '#abb2bf',
          cursor: '#528bff',
          selection: '#3e4451',
          gray: '#5c6370',
          red: '#e06c75',
          green: '#98c379',
          yellow: '#e5c07b',
          blue: '#61afef',
          purple: '#c678dd',
          cyan: '#56b6c2',
          white: '#828997',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'rgb(55 65 81)', // gray-700
            lineHeight: '1.75',
            fontSize: '1.125rem', // 18px
            
            // Headings
            'h1, h2, h3, h4, h5, h6': {
              fontWeight: '700',
              letterSpacing: '-0.025em',
              marginTop: '2em',
              marginBottom: '1em',
              color: 'rgb(17 24 39)', // gray-900
            },
            h1: {
              fontSize: '2.25rem', // 36px
              lineHeight: '1.2',
              marginTop: '0',
              marginBottom: '1.5rem',
            },
            h2: {
              fontSize: '1.875rem', // 30px
              lineHeight: '1.25',
              marginTop: '2.5em',
              marginBottom: '1.25em',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid rgb(229 231 235)', // gray-200
            },
            h3: {
              fontSize: '1.5rem', // 24px
              lineHeight: '1.3',
              marginTop: '2em',
              marginBottom: '1em',
            },
            h4: {
              fontSize: '1.25rem', // 20px
              lineHeight: '1.4',
              marginTop: '1.75em',
              marginBottom: '0.75em',
            },
            h5: {
              fontSize: '1.125rem', // 18px
              lineHeight: '1.5',
              marginTop: '1.5em',
              marginBottom: '0.5em',
            },
            h6: {
              fontSize: '1rem', // 16px
              lineHeight: '1.5',
              marginTop: '1.5em',
              marginBottom: '0.5em',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: '600',
            },
            
            // Paragraphs
            p: {
              marginTop: '1.5em',
              marginBottom: '1.5em',
              lineHeight: '1.75',
            },
            
            // Lists
            'ul, ol': {
              marginTop: '1.5em',
              marginBottom: '1.5em',
              paddingLeft: '1.5em',
            },
            li: {
              marginTop: '0.5em',
              marginBottom: '0.5em',
              lineHeight: '1.6',
            },
            'li > p': {
              marginTop: '0.75em',
              marginBottom: '0.75em',
            },
            
            // Code
            code: {
              color: 'rgb(239 68 68)', // red-500
              backgroundColor: 'rgb(243 244 246)', // gray-100
              padding: '0.125rem 0.375rem',
              borderRadius: '0.25rem',
              fontSize: '0.875em',
              fontWeight: '500',
              fontFamily: 'JetBrains Mono, Fira Code, Consolas, Monaco, Courier New, monospace',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            
            // Code blocks
            pre: {
              backgroundColor: 'rgb(17 24 39)', // gray-900
              color: 'rgb(243 244 246)', // gray-100
              overflow: 'auto',
              fontSize: '0.875em',
              lineHeight: '1.5',
              marginTop: '2em',
              marginBottom: '2em',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              border: '1px solid rgb(55 65 81)', // gray-700
            },
            'pre code': {
              backgroundColor: 'transparent',
              color: 'inherit',
              fontSize: 'inherit',
              fontWeight: 'inherit',
              padding: '0',
              borderRadius: '0',
            },
            
            // Blockquotes
            blockquote: {
              fontWeight: '500',
              fontStyle: 'italic',
              color: 'rgb(75 85 99)', // gray-600
              borderLeftWidth: '0.25rem',
              borderLeftColor: 'rgb(59 130 246)', // blue-500
              quotes: '"\\201C""\\201D""\\2018""\\2019"',
              marginTop: '2em',
              marginBottom: '2em',
              paddingLeft: '1.5em',
              backgroundColor: 'rgb(248 250 252)', // gray-50
              padding: '1.5rem',
              borderRadius: '0.5rem',
            },
            
            // Links
            a: {
              color: 'rgb(59 130 246)', // blue-500
              textDecoration: 'none',
              fontWeight: '500',
              borderBottom: '1px solid transparent',
              transition: 'all 0.2s ease',
            },
            'a:hover': {
              color: 'rgb(37 99 235)', // blue-600
              borderBottomColor: 'rgb(37 99 235)',
            },
            
            // Tables
            table: {
              fontSize: '0.875em',
              lineHeight: '1.6',
              marginTop: '2em',
              marginBottom: '2em',
              width: '100%',
              borderCollapse: 'collapse',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              border: '1px solid rgb(229 231 235)', // gray-200
            },
            thead: {
              backgroundColor: 'rgb(249 250 251)', // gray-50
            },
            'thead th': {
              color: 'rgb(17 24 39)', // gray-900
              fontWeight: '600',
              textAlign: 'left',
              padding: '0.75rem 1rem',
              borderBottom: '1px solid rgb(229 231 235)',
            },
            'tbody td': {
              padding: '0.75rem 1rem',
              borderBottom: '1px solid rgb(243 244 246)', // gray-100
            },
            'tbody tr:last-child td': {
              borderBottomWidth: '0',
            },
            
            // Images
            img: {
              marginTop: '2em',
              marginBottom: '2em',
              borderRadius: '0.5rem',
              border: '1px solid rgb(229 231 235)',
            },
            
            // Horizontal rules
            hr: {
              borderColor: 'rgb(229 231 235)',
              borderTopWidth: '1px',
              marginTop: '3em',
              marginBottom: '3em',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}