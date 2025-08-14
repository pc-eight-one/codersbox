---
title: "Fullstack CRUD - Part 1: SQLite + Express + React Setup"
description: "Bootstrap a fullstack CRUD app using SQLite, Express API, and a React frontend."
publishDate: 2025-02-04
tags: ["Fullstack", "React", "Express", "SQLite"]
difficulty: "intermediate"
series: "Fullstack CRUD"
part: 1
estimatedTime: "80 minutes"
totalParts: 2
featured: false
---

# Fullstack CRUD - Part 1: SQLite + Express + React Setup

- Create Express API with endpoints: GET/POST /items
- Configure CORS
- Create React app (Vite) to list and add items

```bash
# API
npm i express better-sqlite3 cors
# Web
npm create vite@latest web -- --template react
```

Wire the frontend to the API using fetch and display the list.