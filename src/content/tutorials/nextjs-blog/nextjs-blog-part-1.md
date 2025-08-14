---
title: "Build a Next.js Blog - Part 1: Project Setup and Pages"
description: "Kick off a modern blog with Next.js 14 and the App Router. In Part 1, set up the project, pages, layout, and basic styling."
publishDate: 2025-01-15
tags: ["Next.js", "React", "TypeScript", "Blog"]
difficulty: "beginner"
series: "Next.js Blog"
part: 1
estimatedTime: "60 minutes"
totalParts: 2
featured: false
---

# Build a Next.js Blog - Part 1: Project Setup and Pages

In this series, we’ll build a clean, fast blog with Next.js 14, the App Router, TypeScript, and Tailwind CSS.

## What we’ll cover
- Create a Next.js app with TypeScript
- Configure Tailwind CSS
- Add a site-wide layout and navigation
- Create Home and Posts pages

## Create the project
```bash
npx create-next-app@latest nextjs-blog --ts --eslint --app --src-dir --tailwind
cd nextjs-blog
npm run dev
```

## Project structure highlights
```
src/
├─ app/
│  ├─ layout.tsx    # Root layout
│  ├─ page.tsx      # Home page
│  └─ posts/
│     └─ page.tsx   # Posts listing
└─ styles/globals.css
```

## Root layout
```tsx
// src/app/layout.tsx
import "../styles/globals.css";
import Link from "next/link";

export const metadata = {
  title: "Next.js Blog",
  description: "A modern blog built with Next.js 14",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="border-b bg-white">
          <nav className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-6">
            <Link href="/" className="font-semibold">Home</Link>
            <Link href="/posts" className="text-gray-600 hover:text-gray-900">Posts</Link>
          </nav>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-10">{children}</main>
      </body>
    </html>
  );
}
```

## Home page
```tsx
// src/app/page.tsx
export default function Home() {
  return (
    <section>
      <h1 className="text-3xl font-bold mb-2">Welcome</h1>
      <p className="text-gray-600">This is a minimal Next.js blog you will extend in Part 2.</p>
    </section>
  );
}
```

## Posts listing page
```tsx
// src/app/posts/page.tsx
import Link from "next/link";

const posts = [
  { slug: "hello-world", title: "Hello World", excerpt: "Your first post." },
  { slug: "nextjs-tips", title: "Next.js Tips", excerpt: "Useful tricks." },
];

export default function PostsPage() {
  return (
    <section>
      <h1 className="text-2xl font-bold mb-6">Posts</h1>
      <ul className="space-y-4">
        {posts.map(p => (
          <li key={p.slug} className="p-4 bg-white border rounded hover:shadow">
            <Link href={`/posts/${p.slug}`} className="font-medium">{p.title}</Link>
            <p className="text-sm text-gray-600">{p.excerpt}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

## Next steps
In Part 2, we’ll add dynamic routes, MDX content, and SEO improvements.