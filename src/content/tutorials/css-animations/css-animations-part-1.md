---
title: "CSS Animations - Part 1: Transitions and Keyframes"
description: "Master smooth UI effects with CSS transitions and keyframes."
publishDate: 2025-01-23
tags: ["CSS", "Animations", "UI"]
difficulty: "beginner"
series: "CSS Animations"
part: 1
estimatedTime: "40 minutes"
totalParts: 2
featured: false
---

# CSS Animations - Part 1: Transitions and Keyframes

```html
<button class="btn">Hover me</button>
```

```css
.btn {
  padding: .75rem 1rem;
  background: black; color: white; border-radius: .5rem;
  transition: transform .2s ease, box-shadow .2s ease;
}
.btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,.15); }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.card { animation: fadeInUp .4s ease both; }
```

In Part 2, we’ll build a reusable motion system and respect reduced motion.