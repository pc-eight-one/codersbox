This folder holds Vercel project linking metadata.

How to link this repo to a Vercel project:

1) Interactive (local):
   - Ensure you are logged in: `npx vercel login`
   - From the repo root, run: `npm run vercel:link`
   - Follow the prompts to choose the scope (team) and project (or create a new one).
   - This creates `.vercel/project.json` locally. Commit that file so CI is linked too.

2) Non-interactive (CI or scripted):
   - Provide a `VERCEL_TOKEN` (Personal Token) and optionally `--scope <team_slug>`.
   - If the project already exists on Vercel: `npx vercel link --yes --project codersbox --scope <team_slug> --token $VERCEL_TOKEN`
   - Or set env vars and deploy without linking by committing `.vercel/project.json` using the template below.

Template for committing the link:
- Copy `project.example.json` to `project.json` and fill the values:

{
  "orgId": "team_XXXXXXXXXXXXXX",
  "projectId": "prj_YYYYYYYYYYYYYY"
}

Notes:
- It’s safe (and recommended) to commit `.vercel/project.json` to keep the repo permanently linked.
- Do not commit tokens; only commit the static IDs shown above.
