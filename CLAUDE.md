# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Astro blog/portfolio site called "codersbox" built with TypeScript, TailwindCSS, and Astro components. The site features articles, tutorials, and projects with a clean, modern design.

## Development Commands

- `npm run dev` - Start development server on http://localhost:4321
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm install` - Install dependencies

## Architecture

### Directory Structure
- `src/` - All source code (configured via `srcDir` in astro.config.mjs)
- `src/components/` - Astro components (ArticleCard, TutorialCard, ProjectCard, Navigation, etc.)
- `src/layouts/` - Astro layouts (BaseLayout, HomeLayout, ArticlesLayout)
- `src/pages/` - File-based routing pages with dynamic routes for articles/tutorials/projects
- `src/types/` - TypeScript type definitions
- `src/assets/css/` - Tailwind CSS configuration
- `public/` - Static assets

### Key Features
- File-based routing with dynamic [slug] routes for content
- Multiple layouts system using Astro layout components
- Static site generation with Astro
- Icon system using astro-icon with FontAwesome
- Tailwind CSS for styling with custom font (Inter)
- TypeScript support throughout

### Component System
- Card-based components for displaying content (ArticleCard, TutorialCard, ProjectCard)
- Navigation component with NavItem type definition
- Layout components for different page types
- Newsletter and Footer components for common sections
- All components are .astro files with frontmatter for props and logic

### Configuration
- TypeScript paths configured with `@/*` alias pointing to `src/*`
- Site configured for https://codersbox.dev
- Astro integrations: TailwindCSS, astro-icon
- Static output mode for optimal performance

### Styling
- TailwindCSS with Inter font family
- Gray-based color scheme with hover effects
- Responsive grid layouts for content cards
- Clean, minimal design with consistent spacing

### Key Differences from Previous Nuxt Version
- Uses Astro components (.astro) instead of Vue components (.vue)
- Static site generation by default
- No client-side JavaScript unless explicitly added
- Props are defined in component frontmatter
- Layouts are imported and used as wrapper components