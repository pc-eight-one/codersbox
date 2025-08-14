---
title: "Web Accessibility Checklist (2025)"
description: "A concise checklist to improve a11y across apps with examples and quick tests."
publishDate: 2025-08-09
tags: ["Accessibility", "Frontend", "Best Practices", "UI"]
readTime: "9 min read"
featured: false
---

# Web Accessibility Checklist (2025)

Accessibility is essential. Use this checklist to catch common issues.

## Quick Checklist

| Category      | Item                                 | Check |
|---------------|--------------------------------------|-------|
| Semantics     | Landmarks: header/main/nav/footer    | ☐     |
| Semantics     | Headings in logical order            | ☐     |
| Keyboard      | All actions keyboard reachable       | ☐     |
| Focus         | Visible focus states                 | ☐     |
| Contrast      | Text contrast ≥ 4.5:1 (body)         | ☐     |
| Forms         | Inputs have labels/aria-labelledby   | ☐     |
| Media         | Images have alt text                 | ☐     |
| Motion        | Respects prefers-reduced-motion      | ☐     |

## Example: Skip Link

```html
<a class="skip-link" href="#main">Skip to content</a>
<main id="main">…</main>
```

## Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

## Tools

- Axe DevTools
- Lighthouse
- Screen readers (NVDA/VoiceOver)

## Conclusion

Bake a11y into your workflow; small steps add up.