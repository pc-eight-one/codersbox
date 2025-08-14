---
title: "Next.js Routing in 2025: App Router Essentials"
description: "Understand file-based routing, layouts, loading states, and dynamic routes using the App Router."
publishDate: 2025-08-10
tags: ["Next.js", "React", "Routing", "Frontend"]
readTime: "12 min read"
featured: true
---

# Next.js Routing in 2025: App Router Essentials

The App Router simplifies nested layouts and data fetching.

## File Structure Basics

```
app/
  layout.tsx
  page.tsx
  blog/
    layout.tsx
    page.tsx
    [slug]/
      page.tsx
```

## Loading and Error UI

```tsx
// app/blog/loading.tsx
export default function Loading() {
  return <p>Loading blog…</p>
}

// app/blog/error.tsx
export default function Error({ error }: { error: Error }) {
  return <p>Something went wrong: {error.message}</p>
}
```

## Dynamic Routes

```tsx
// app/blog/[slug]/page.tsx
import { notFound } from 'next/navigation'
export default async function Post({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)
  if (!post) return notFound()
  return <article>{post.title}</article>
}
```

## Metadata

```tsx
export const metadata = { title: 'Blog' }
```

## Conclusion

Leverage nested layouts and server components for clean, fast apps.