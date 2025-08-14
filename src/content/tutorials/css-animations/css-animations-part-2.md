---
title: "CSS Animations - Part 2: Motion System and Accessibility"
description: "Build a consistent motion system and account for prefers-reduced-motion."
publishDate: 2025-01-24
tags: ["CSS", "Animations", "Accessibility"]
difficulty: "intermediate"
series: "CSS Animations"
part: 2
estimatedTime: "45 minutes"
totalParts: 2
featured: false
---

# CSS Animations - Part 2: Motion System and Accessibility

```css
:root {
  --easing-standard: cubic-bezier(.2,.8,.2,1);
  --dur-fast: 150ms;
  --dur-normal: 250ms;
}

.motion-fade-in { animation: fadeIn var(--dur-normal) var(--easing-standard) both; }
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

Use tokens and utilities to keep animation consistent and accessible.