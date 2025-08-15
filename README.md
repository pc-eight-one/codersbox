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

## Vercel environment variables

Pull development env vars locally into .env.development.local:

```bash
npm run env:pull:dev
```

Notes:
- You must be logged in to Vercel (npx vercel login) and the project must be linked (npx vercel link), OR set the VERCE L_TOKEN env var.
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
