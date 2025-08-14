---
title: "Docker for Developers - Part 1: Images and Containers"
description: "Learn Docker fundamentals: images, containers, Dockerfile basics, and the workflow to containerize apps."
publishDate: 2025-01-21
tags: ["Docker", "DevOps", "Containers"]
difficulty: "beginner"
series: "Docker for Developers"
part: 1
estimatedTime: "45 minutes"
totalParts: 2
featured: false
---

# Docker for Developers - Part 1: Images and Containers

## Install & verify
```bash
docker --version
docker run hello-world
```

## Create a Dockerfile
```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["node", "server.js"]
```

## Build and run
```bash
docker build -t my-node-app .
docker run -p 3000:3000 my-node-app
```

In Part 2, we’ll add docker-compose and multi-stage builds.