---
title: "TypeScript Basics - Part 2: Narrowing, Modules, and Tooling"
description: "Confidently narrow types, organize modules, and configure tsconfig for DX."
publishDate: 2025-01-26
tags: ["TypeScript", "Types", "Tooling"]
difficulty: "intermediate"
series: "TypeScript Basics"
part: 2
estimatedTime: "55 minutes"
totalParts: 2
featured: false
---

# TypeScript Basics - Part 2: Narrowing, Modules, and Tooling

```ts
function isString(x: unknown): x is string { return typeof x === 'string' }

function formatId(id: string | number) {
  if (isString(id)) return id.toUpperCase();
  return `#${id}`;
}
```

tsconfig tips:
- "strict": true
- "noUncheckedIndexedAccess": true
- "moduleResolution": "bundler"

Use ESLint + Prettier for a smooth workflow.