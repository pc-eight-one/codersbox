---
title: "Docker for Developers - Part 2: Compose and Multi-stage Builds"
description: "Use docker-compose for local dev and multi-stage builds for smaller images."
publishDate: 2025-01-22
tags: ["Docker", "Compose", "Optimization"]
difficulty: "beginner"
series: "Docker for Developers"
part: 2
estimatedTime: "50 minutes"
totalParts: 2
featured: false
---

# Docker for Developers - Part 2: Compose and Multi-stage Builds

## docker-compose.yml
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
```

## Multi-stage Dockerfile
```dockerfile
# Stage 1 - build
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2 - runtime
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=build /app/dist ./dist
CMD ["node", "dist/server.js"]
```

Compose simplifies local dev; multi-stage keeps images small for production.