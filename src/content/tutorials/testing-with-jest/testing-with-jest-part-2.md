---
title: "Testing with Jest - Part 2: Async, Snapshots, and Coverage"
description: "Test async code, use snapshots for UI, and analyze code coverage."
publishDate: 2025-01-28
tags: ["Testing", "Jest", "Coverage"]
difficulty: "intermediate"
series: "Testing with Jest"
part: 2
estimatedTime: "50 minutes"
totalParts: 2
featured: false
---

# Testing with Jest - Part 2: Async, Snapshots, and Coverage

```ts
// async.test.ts
async function fetchUser() { return { id: 1, name: 'Ada' } }

test('fetches user', async () => {
  await expect(fetchUser()).resolves.toMatchObject({ id: 1 })
})
```

```bash
# Snapshot + coverage
jest --updateSnapshot
jest --coverage
```

Use snapshots sparingly for stable UI and ensure critical paths have coverage.