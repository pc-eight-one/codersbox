---
title: "Node.js REST API - Part 2: Validation, Services, and Pagination"
description: "Add input validation with Zod, a service/data layer, and pagination to your Express API."
publishDate: 2025-01-18
tags: ["Node.js", "Express", "Zod", "API"]
difficulty: "intermediate"
series: "Node.js REST API"
part: 2
estimatedTime: "80 minutes"
totalParts: 2
featured: false
---

# Node.js REST API - Part 2: Validation, Services, and Pagination

## Zod validators
```ts
// src/schemas/user.schema.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});
```

## Service layer
```ts
// src/services/users.service.ts
interface User { id: number; name: string; email: string }
const db: User[] = [];

export const UsersService = {
  list: (page = 1, limit = 10) => {
    const start = (page - 1) * limit;
    return { data: db.slice(start, start + limit), total: db.length, page, limit };
  },
  create: (u: Omit<User, 'id'>) => { const user = { id: db.length + 1, ...u }; db.push(user); return user; },
};
```

## Controller with validation
```ts
// src/controllers/users.controller.ts
import { Request, Response } from 'express';
import { createUserSchema } from '../schemas/user.schema';
import { UsersService } from '../services/users.service';

export const listUsers = (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  return res.json(UsersService.list(page, limit));
};

export const createUser = (req: Request, res: Response) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const created = UsersService.create(parsed.data);
  return res.status(201).json(created);
};
```

## Wire routes
```ts
// src/routes/users.ts
import { Router } from 'express';
import { listUsers, createUser } from '../controllers/users.controller';
const router = Router();
router.get('/', listUsers);
router.post('/', createUser);
export default router;
```

Your API now has validation, a basic data layer, and pagination!