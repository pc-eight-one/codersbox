---
title: "Tailwind Design System - Part 1: Tokens and Utilities"
description: "Set up a scalable design system with Tailwind: color palette, spacing, and typography tokens."
publishDate: 2025-02-02
tags: ["Tailwind", "Design System", "CSS"]
difficulty: "intermediate"
series: "Tailwind Design System"
part: 1
estimatedTime: "60 minutes"
totalParts: 2
featured: false
---

# Tailwind Design System - Part 1: Tokens and Utilities

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#0f172a', 50: '#f8fafc', 900: '#0b1220' }
      },
      spacing: { 18: '4.5rem' },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] }
    }
  }
}
```

Use utilities consistently to keep UI coherent.