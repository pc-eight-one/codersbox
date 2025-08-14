---
title: "Build a Next.js Blog - Part 2: Dynamic Routes and MDX"
description: "Add dynamic post pages, MDX-based content, and SEO to your Next.js blog."
publishDate: 2025-01-16
tags: ["Next.js", "MDX", "SEO", "Routing"]
difficulty: "beginner"
series: "Next.js Blog"
part: 2
estimatedTime: "75 minutes"
totalParts: 2
featured: false
---

# Build a Next.js Blog - Part 2: Dynamic Routes and MDX

Now we’ll add dynamic post pages with MDX and basic SEO.

## Install MDX
```bash
npm i @next/mdx @mdx-js/react gray-matter
```

## next.config.mjs
```js
import createMDX from '@next/mdx'
const withMDX = createMDX({ extension: /\.(md|mdx)$/ })

export default withMDX({
  pageExtensions: ['ts', 'tsx', 'md', 'mdx']
})
```

## Load posts from the filesystem
```ts
// src/lib/posts.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDir = path.join(process.cwd(), 'content', 'posts');

export function getAllPosts() {
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.mdx'));
  return files.map(file => {
    const slug = file.replace(/\.mdx$/, '');
    const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const { data } = matter(content);
    return { slug, ...data } as { slug: string; title: string; date: string; excerpt?: string };
  }).sort((a,b) => +new Date(b.date) - +new Date(a.date));
}
```

## Dynamic route
```tsx
// src/app/posts/[slug]/page.tsx
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';

export async function generateStaticParams() {
  const dir = path.join(process.cwd(), 'content', 'posts');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'));
  return files.map(f => ({ slug: f.replace(/\.mdx$/, '') }));
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const file = path.join(process.cwd(), 'content', 'posts', `${params.slug}.mdx`);
  if (!fs.existsSync(file)) return notFound();
  const source = fs.readFileSync(file, 'utf8');
  const { content, data } = matter(source);

  return (
    <article className="prose lg:prose-xl">
      <h1>{data.title}</h1>
      <p className="text-sm text-gray-500">{new Date(data.date).toLocaleDateString()}</p>
      <MDXRemote source={content} />
    </article>
  );
}
```

## Create a couple of MDX posts
```
content/posts/hello-world.mdx
---
title: Hello World
date: 2025-01-15
excerpt: The first post.
---

Welcome to your new blog!

content/posts/nextjs-tips.mdx
---
title: Next.js Tips
date: 2025-01-16
excerpt: Handy tips to improve your DX.
---

Here are some tips...
```

## Wire listing to filesystem
Update your posts listing to use getAllPosts() and link to /posts/[slug].

## SEO basics
- Add metadata on each page
- Unique titles and descriptions
- Open Graph tags

You now have a working blog with dynamic posts and MDX!