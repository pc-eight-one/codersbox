---
title: "SQLite CRUD - Part 1: Setup and Queries"
description: "Use SQLite for lightweight persistence: create tables, insert, select, and parameterize queries."
publishDate: 2025-01-29
tags: ["SQLite", "Database", "Backend"]
difficulty: "beginner"
series: "SQLite CRUD"
part: 1
estimatedTime: "40 minutes"
totalParts: 2
featured: false
---

# SQLite CRUD - Part 1: Setup and Queries

```bash
npm i better-sqlite3
```

```ts
import Database from 'better-sqlite3';
const db = new Database('app.db');

db.exec(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, email TEXT UNIQUE);`);

const insert = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
insert.run('Ada', 'ada@example.com');

const all = db.prepare('SELECT * FROM users').all();
console.log(all);
```

Next: updates, deletes, and migrations.