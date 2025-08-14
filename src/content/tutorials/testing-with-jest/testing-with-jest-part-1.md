---
title: "Testing with Jest - Part 1: Unit Tests and Mocking"
description: "Write fast, reliable unit tests with Jest. Learn matchers, mocks, and test structure."
publishDate: 2025-01-27
tags: ["Testing", "Jest", "JavaScript"]
difficulty: "beginner"
series: "Testing with Jest"
part: 1
estimatedTime: "45 minutes"
totalParts: 2
featured: false
---

# Testing with Jest - Part 1: Unit Tests and Mocking

```bash
npm i -D jest ts-jest @types/jest
npx ts-jest config:init
```

```ts
// sum.ts
export function sum(a: number, b: number) { return a + b }

// sum.test.ts
import { sum } from './sum'

test('adds two numbers', () => {
  expect(sum(2, 3)).toBe(5)
})
```

Use jest.fn() to mock dependencies and spy on calls.