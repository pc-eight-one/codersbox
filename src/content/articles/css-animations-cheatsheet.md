---
title: "CSS Animations Cheat Sheet"
description: "A practical cheat sheet for creating smooth CSS animations and transitions."
publishDate: 2025-08-13
tags: ["CSS", "Animations", "Frontend", "UI"]
readTime: "8 min read"
featured: false
---

# CSS Animations Cheat Sheet

Use this quick reference to craft performant and delightful animations.

## Basics

```css
.box {
  transition: transform 300ms ease, opacity 150ms linear;
}
.box:hover { transform: translateY(-2px); opacity: 0.9; }
```

## Timing Functions Table

| Name       | Cubic-bezier                      | Best For                |
|------------|-----------------------------------|-------------------------|
| ease       | cubic-bezier(.25,.1,.25,1)        | General purpose         |
| ease-in    | cubic-bezier(.42,0,1,1)           | Elements entering       |
| ease-out   | cubic-bezier(0,0,.58,1)           | Elements leaving        |
| ease-in-out| cubic-bezier(.42,0,.58,1)         | Symmetric animations    |
| custom     | cubic-bezier(.2,.8,.2,1)          | Micro-interactions      |

## Prefer Transforms

- translate, scale, rotate over top/left
- opacity for fades
- avoid triggering layout/paint when possible

## Keyframes Example

```css
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
.button--pulse { animation: pulse 1.2s ease-in-out infinite; }
```

## Performance Tips

- Use will-change sparingly
- Reduce layers and overdraw
- Prefer shorter durations on mobile

## Conclusion

Animations should inform, not distract. Start subtle, test on low-end devices.