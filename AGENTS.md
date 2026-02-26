# AGENTS.md

## Cursor Cloud specific instructions

### Overview

OkuAnla is a Turkish educational web app (vanilla HTML/CSS/JS frontend + Express backend) that generates AI-powered reading comprehension texts, math problems, and English passages for elementary students using Google Gemini.

### Running the dev server

```bash
node server.js
```

Starts Express on port 3000. Serves three pages: `/` (Turkish reading), `/math`, `/english`.

### Important notes

- **No linter or test framework** is configured in this repo. There are no automated tests to run.
- **`package.json` scripts are misleading**: the `dev`/`build`/`start` scripts reference Next.js, but the app does **not** use Next.js. Always use `node server.js` to run locally.
- **`GEMINI_API_KEY`** must be set in `.env` for content generation to work. The key shipped in the repo is suspended. Add a valid key as a secret named `GEMINI_API_KEY`.
- The app has no database, no Docker dependencies, and no build step. It is purely a static-serving Express server with API proxy endpoints to Gemini.
- Production deploys to Vercel (serverless function in `api/generate-text.js` + static HTML). Local dev uses `server.js` (Express) which is a different code path.
