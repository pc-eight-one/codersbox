---
title: "Docker Basics for Developers"
description: "A gentle introduction to Docker images, containers, networking, and volumes with practical examples."
publishDate: 2025-08-11
tags: ["Docker", "DevOps", "Containers"]
readTime: "9 min read"
featured: false
---

# Docker Basics for Developers

Get up and running quickly with Docker for local development.

## Key Concepts

- Image: blueprint for containers
- Container: a running instance of an image
- Volume: persistent data storage
- Network: communication between containers

## Common Commands

```bash
# build and run
docker build -t myapp .
docker run --rm -p 3000:3000 myapp

# volumes and networks
docker volume create data
docker network create app-net
```

## Example Dockerfile

```Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

## Troubleshooting

- Check logs: `docker logs <container>`
- Inspect network: `docker network inspect app-net`
- Clean up: `docker system prune`

## Conclusion

Start simple, add complexity as needed, and keep images small.