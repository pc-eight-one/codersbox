---
title: "Astro Portfolio - Part 2: Pages, Collections, and Deploy"
description: "Create pages, add a blog collection, and deploy to a static host."
publishDate: 2025-02-01
tags: ["Astro", "Content", "Deployment"]
difficulty: "beginner"
series: "Astro Portfolio"
part: 2
estimatedTime: "60 minutes"
totalParts: 2
featured: false
---

# Astro Portfolio - Part 2: Pages, Collections, and Deploy

## Pages
Create /about and /projects Astro pages with a shared layout.

## Content collections
```ts
// src/content/config.ts (Astro)
import { defineCollection, z } from 'astro:content';
const posts = defineCollection({
  type: 'content',
  schema: z.object({ title: z.string(), date: z.date(), tags: z.array(z.string()).optional() })
});
export const collections = { posts };
```

## Deploy
- Build: `npm run build`
- Host on Netlify, Vercel, or GitHub Pages

Your Astro portfolio is ready to share!