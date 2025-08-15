# Project Docs

This project uses Astro for the site, and is deployed to Vercel.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Link this repo to Vercel

Before pulling env vars or deploying, link the repo to a Vercel project.

Interactive (local):

```bash
npx vercel login
npm run vercel:link
```

Non-interactive (CI or scripted):

```bash
# Required: VERCEL_TOKEN, optional: VERCEL_SCOPE (team slug)
export VERCEL_TOKEN=xxxxx
export VERCEL_SCOPE=my-team
npm run vercel:link:ci
```

Alternatively, commit a `.vercel/project.json` using the template in `.vercel/project.example.json` once you have your `orgId` and `projectId`.

## Vercel environment variables

Pull development env vars locally into .env.development.local:

```bash
npm run env:pull:dev
```

Notes:
- You must be logged in to Vercel (npx vercel login) and the project must be linked (npm run vercel:link), OR set the VERCEL_TOKEN env var and use the non-interactive link.
- The file .env.development.local is git-ignored by default.
- For preview/prod, you can use:
  - Preview: `npm run env:pull:preview`
  - Production: `npm run env:pull:prod`

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
