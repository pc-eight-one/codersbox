---
title: "TypeScript Basics - Part 1: Types, Functions, and Interfaces"
description: "Get productive with TypeScript: primitives, unions, generics, and interfaces."
publishDate: 2025-01-25
tags: ["TypeScript", "JavaScript", "Types"]
difficulty: "beginner"
series: "TypeScript Basics"
part: 1
estimatedTime: "60 minutes"
totalParts: 2
featured: false
---

# TypeScript Basics - Part 1: Types, Functions, and Interfaces

```ts
// types.ts
export type ID = string | number;

export interface User { id: ID; name: string; email?: string }

export function toTitle(s: string): string {
  return s.replace(/\b\w/g, c => c.toUpperCase());
}

export function wrap<T>(value: T) { return { value } }
```

Compile with `tsc` and enable strict mode.