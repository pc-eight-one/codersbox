---
title: "SQLite CRUD - Part 2: Updates, Deletes, and Migrations"
description: "Perform updates/deletes safely and add simple SQL migrations."
publishDate: 2025-08-29
tags: ["SQLite", "Database", "Migrations"]
difficulty: "beginner"
series: "SQLite CRUD"
part: 2
estimatedTime: "40 minutes"
totalParts: 2
featured: false
---

# SQLite CRUD - Part 2: Updates, Deletes, and Migrations

```ts
// Updates
const update = db.prepare('UPDATE users SET email = ? WHERE id = ?');
update.run('ada@lovelace.dev', 1);

// Deletes
const del = db.prepare('DELETE FROM users WHERE id = ?');
del.run(1);
```

## Simple migrations table
```ts
// migrations table
 db.exec(`CREATE TABLE IF NOT EXISTS migrations (id INTEGER PRIMARY KEY, name TEXT UNIQUE);`);

function migrated(name: string) {
  db.prepare('INSERT OR IGNORE INTO migrations (name) VALUES (?)').run(name);
}
```

Track applied migrations to keep schema changes predictable.