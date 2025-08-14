---
title: "Database Indexing Basics"
description: "Understand how indexes work, when to add them, and common pitfalls across relational databases."
publishDate: 2025-08-07
tags: ["Database", "SQL", "Performance"]
readTime: "10 min read"
featured: false
---

# Database Indexing Basics

Indexes speed up read queries at the cost of write performance and storage.

## Index Types

| Type         | Use Case                         | Notes |
|--------------|----------------------------------|-------|
| B-Tree       | Range and equality queries       | Default in most RDBMS |
| Hash         | Exact equality lookups           | Not for range queries |
| GIN/GiST     | Full-text, arrays, jsonb (PG)    | Specialized use cases |
| Bitmap       | Data warehousing (read-heavy)    | Usually not for OLTP  |

## When to Add an Index

- Frequent filters/joins on the column
- High cardinality columns
- Avoid indexing low-selectivity booleans

## Composite Indexes

Order matters: (country, created_at) supports `WHERE country='US' AND created_at > now()-interval '7d'`, but not `WHERE created_at > ...` alone.

## Covering Indexes

Include selected columns to avoid table lookups (Postgres INCLUDE, MySQL generated columns).

## Maintenance

- Monitor bloat and fragmentation
- Periodically review unused indexes
- Balance write overhead

## Conclusion

Profile queries with EXPLAIN and add just enough indexes to serve critical paths.