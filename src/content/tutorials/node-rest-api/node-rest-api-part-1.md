---
title: "Node.js REST API - Part 1: Express Setup and Routing"
description: "Spin up a robust REST API with Express. In Part 1, set up the server, routes, and error handling."
publishDate: 2025-01-17
tags: ["Node.js", "Express", "API", "Backend"]
difficulty: "intermediate"
series: "Node.js REST API"
part: 1
estimatedTime: "70 minutes"
totalParts: 2
featured: false
---

# Node.js REST API - Part 1: Express Setup and Routing

We’ll build a production-ready REST API with Express, structured routing, and centralized error handling.

## Initialize the project
```bash
mkdir node-rest-api && cd $_
npm init -y
npm i express morgan cors dotenv zod
npm i -D typescript ts-node-dev @types/express @types/node @types/cors @types/morgan
npx tsc --init
```

## Basic server
```ts
// src/server.ts
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API running on :${port}`));
```

## Routes structure
```
src/
├─ server.ts
├─ routes/
│  └─ users.ts
└─ controllers/
   └─ users.controller.ts
```

## Users route
```ts
// src/routes/users.ts
import { Router } from 'express';
const router = Router();

router.get('/', (_req, res) => res.json([{ id: 1, name: 'Ada' }]));
router.post('/', (req, res) => res.status(201).json({ id: 2, ...req.body }));

export default router;
```

In Part 2, we’ll add validation with Zod, a service layer, and pagination.