---
title: "Astro Portfolio - Part 1: Project Setup and Islands"
description: "Build a blazing-fast personal site with Astro. Set up the project and add interactive islands."
publishDate: 2025-01-31
tags: ["Astro", "Frontend", "Islands"]
difficulty: "beginner"
series: "Astro Portfolio"
part: 1
estimatedTime: "55 minutes"
totalParts: 2
featured: false
---

# Astro Portfolio - Part 1: Project Setup and Islands

```bash
npm create astro@latest astro-portfolio
cd astro-portfolio
npm run dev
```

Add a simple interactive component:
```tsx
// src/components/Counter.jsx
import { useState } from 'react'
export default function Counter() {
  const [n, setN] = useState(0)
  return <button onClick={() => setN(n+1)}>Count: {n}</button>
}
```

Use it as an island:
```astro
---
import Counter from "../components/Counter.jsx";
---
<Counter client:load />
```